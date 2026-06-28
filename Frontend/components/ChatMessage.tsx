import ReactMarkdown from "react-markdown";
import { Message } from "@/hooks/useChat";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[75%]
          w-fit
          rounded-2xl
          px-5
          py-3
          shadow-md
          break-words
          ${
            isUser
              ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
              : "bg-white border border-slate-200 text-slate-800"
          }
        `}
      >
        {isUser ? (
          message.text
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}