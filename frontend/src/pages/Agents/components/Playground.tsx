import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, Bot, User, RefreshCw, Loader2 } from 'lucide-react';

interface PlaygroundProps {
  agentId?: string;
  workflow?: { nodes: any[]; edges: any[] };
  onNodeStart?: (nodeId: string) => void;
  onNodeFinish?: (nodeId: string, output: any) => void;
  onWorkflowFinish?: (results: any) => void;
}

export default function Playground({ agentId, workflow, onNodeStart, onNodeFinish, onWorkflowFinish }: PlaygroundProps) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '你好！我是你的智能体，有什么可以帮你的吗？', traces: [] as any[] }
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isExecuting) return;
    
    const userMessage = { role: 'user', content: input, traces: [] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsExecuting(true);
    
    const assistantMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '', traces: [] }]);

    try {
      const response = await fetch(agentId ? `/api/agents/${agentId}/execute` : '/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: userMessage.content,
          stream: true,
          workflow
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute workflow');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  break;
                }
                try {
                  const data = JSON.parse(dataStr);
                  
                  if (data.type === 'node_start') {
                    if (onNodeStart) onNodeStart(data.nodeId);
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[assistantMessageIndex].traces.push({ type: 'start', nodeId: data.nodeId });
                      return newMsgs;
                    });
                  } else if (data.type === 'node_finish') {
                    if (onNodeFinish) onNodeFinish(data.nodeId, data.output);
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[assistantMessageIndex].traces.push({ type: 'finish', nodeId: data.nodeId, output: data.output });
                      // If it's an end node, we might want to set the content
                      if (data.output && data.output.output) {
                         const contentStr = typeof data.output.output === 'string' ? data.output.output : JSON.stringify(data.output.output);
                         // Append to content or overwrite if it's the final output
                         // For simplicity, we just set the content to the last node's output
                         newMsgs[assistantMessageIndex].content = contentStr;
                      }
                      return newMsgs;
                    });
                  } else if (data.type === 'workflow_finish') {
                    if (onWorkflowFinish) onWorkflowFinish(data.results);
                    // Find the end node result if any
                    const endNodeId = Object.keys(data.results).find(key => data.results[key]?.output);
                    if (endNodeId && data.results[endNodeId].output) {
                      const finalOutput = data.results[endNodeId].output;
                      setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[assistantMessageIndex].content = typeof finalOutput === 'string' ? finalOutput : JSON.stringify(finalOutput, null, 2);
                        return newMsgs;
                      });
                    }
                  } else if (data.type === 'workflow_error') {
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[assistantMessageIndex].content = `Error: ${data.error}`;
                      return newMsgs;
                    });
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e, dataStr);
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[assistantMessageIndex].content = `执行失败: ${error.message}`;
        return newMsgs;
      });
    } finally {
      setIsExecuting(false);
      if (onWorkflowFinish) onWorkflowFinish(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-800">测试 / 预览</h2>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'assistant', content: '你好！我是你的智能体，有什么可以帮你的吗？', traces: [] }])}
          disabled={isExecuting}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="重置对话"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] flex flex-col gap-2`}>
              <div className={`rounded-lg p-3 text-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}>
                {msg.content || (isExecuting && idx === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : '')}
              </div>
              
              {/* Traces */}
              {msg.traces && msg.traces.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded border border-gray-200 max-h-32 overflow-y-auto font-mono">
                  {msg.traces.map((trace, i) => (
                    <div key={i} className="truncate">
                      {trace.type === 'start' ? `▶ 开始节点: ${trace.nodeId}` : `✓ 完成节点: ${trace.nodeId}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isExecuting ? "执行中..." : "输入测试消息..."}
            disabled={isExecuting}
            className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none disabled:bg-gray-50"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={isExecuting || !input.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}