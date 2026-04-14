"use client";

import { cn } from "@/lib/utils";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageItem = ({ role, content }: MessageItemProps) => {
  const isUser = role === "user";
  const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);

  return (
    <div className={cn("flex w-full px-4 py-2", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed",
        isUser ? "bg-[#2f2f2f] text-white" : "bg-transparent text-gray-100"
      )}>
        
        {/* Loading Dots */}
        {!isUser && content === "" && (
          <div className="flex gap-1.5 py-1 items-center h-5">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
          </div>
        )}

        {/* Image Handling */}
        {imageMatch && (
          <img src={imageMatch[1]} alt="Generated" className="rounded-xl w-full max-w-md object-cover mt-2" />
        )}

        {/* Text Handling */}
        {!imageMatch && content !== "" && (
          <div className="whitespace-pre-wrap">{content}</div>
        )}

      </div>
    </div>
  );
};
