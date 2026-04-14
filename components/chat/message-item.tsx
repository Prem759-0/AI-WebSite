"use client";

import { cn } from "@/lib/utils";
import { User, Cpu } from "lucide-react";
import { motion } from "framer-motion";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageItem = ({ role, content }: MessageItemProps) => {
  const isUser = role === "user";

  // Check if content is an image markdown: ![Generated Image](https://...)
  const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-4 mb-8 items-start px-2 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center border transition-all duration-500",
        isUser 
          ? "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400 shadow-lg shadow-blue-600/20" 
          : "glass-panel border-white/10 shadow-xl"
      )}>
        {isUser ? <User size={18} className="text-white" /> : <Cpu size={18} className="text-blue-400" />}
      </div>
      
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[75%] rounded-3xl text-[14.5px] leading-relaxed tracking-wide transition-all",
        isUser 
          ? "bg-blue-600 text-white rounded-tr-sm shadow-2xl shadow-blue-900/10 px-5 py-4" 
          : "glass-panel text-gray-100 rounded-tl-sm border border-white/5",
        !isUser && !imageMatch && "px-5 py-4",
        imageMatch && "p-2 bg-transparent border-none shadow-none" // Remove padding for raw images
      )}>
        
        {/* Loading State */}
        {!isUser && content === "" && (
          <div className="flex gap-1.5 py-1 items-center h-5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
          </div>
        )}

        {/* Image Rendering */}
        {imageMatch && (
          <motion.img 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            src={imageMatch[1]} 
            alt="AI Generated" 
            className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl shadow-blue-900/20 object-cover"
          />
        )}

        {/* Text Rendering (If not an image) */}
        {!imageMatch && content !== "" && (
          <div className="whitespace-pre-wrap">{content}</div>
        )}
      </div>
    </motion.div>
  );
};
