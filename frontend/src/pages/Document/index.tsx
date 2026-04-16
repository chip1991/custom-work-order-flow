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
    return text.split("\n").map((line, index) => {
      if (!line.trim()) return null;

      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 md:mt-10 mb-4 md:mb-6">
            {line.replace("# ", "")}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl md:text-2xl font-semibold text-gray-800 mt-6 md:mt-8 mb-3 md:mb-4">
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
      <div className="flex flex-col md:flex-row w-full max-w-6xl md:my-10 bg-white shadow-sm md:rounded-lg overflow-hidden border-0 md:border border-gray-100">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0">
          <div className="p-4 md:p-6 pb-2">
            <h3 className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 md:mb-4">
              法律与协议
            </h3>
          </div>
          <nav className="flex flex-row md:flex-col px-4 space-x-2 md:space-x-0 md:space-y-1 pb-4 md:pb-6 overflow-x-auto whitespace-nowrap">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/docs/${doc.id}`}
                className={`block px-4 py-2.5 md:py-3 rounded-md text-sm transition-colors ${
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
        <main className="flex-1 px-6 md:px-12 py-8 md:py-10 overflow-y-auto">
          <article className="max-w-3xl mx-auto md:mx-0">
            {renderMarkdown(currentDoc.content)}
          </article>
        </main>

      </div>
    </div>
  );
}
