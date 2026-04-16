import { useParams, Link } from "react-router-dom";
import { policyContent, privacyContent } from "./content";

export default function DocumentPage() {
  const { type } = useParams<{ type: string }>();

  // Map route param to specific document content
  const documents = [
    { id: "policy", title: "用户服务协议", content: policyContent },
    { id: "privacy", title: "隐私保护指引", content: privacyContent },
  ];

  const currentDoc = documents.find((doc) => doc.id === type) || documents[0];

  // A very basic markdown-to-html renderer for headers and paragraphs
  const renderMarkdown = (text: string) => {
    return text.split("\\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-900 mt-10 mb-6">
            {line.replace("# ", "")}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            {line.replace("## ", "")}
          </h2>
        );
      }
      // Handle bold text (e.g. **bold**)
      let parsedLine = line;
      if (parsedLine.includes("**")) {
        const parts = parsedLine.split("**");
        return (
          <p key={index} className="text-gray-700 leading-loose mb-4">
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
          </p>
        );
      }

      return (
        <p key={index} className="text-gray-700 leading-loose mb-4">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="flex w-full max-w-6xl my-10 bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gray-50/50 border-r border-gray-100 flex-shrink-0">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              法律与协议
            </h3>
          </div>
          <nav className="px-4 space-y-1 pb-6">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/docs/${doc.id}`}
                className={`block px-4 py-3 rounded-md text-sm transition-colors ${
                  currentDoc.id === doc.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {doc.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-12 py-10 overflow-y-auto">
          <article className="max-w-3xl">
            {renderMarkdown(currentDoc.content)}
          </article>
        </main>

      </div>
    </div>
  );
}
