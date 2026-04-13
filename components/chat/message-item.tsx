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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-4 mb-8 items-start px-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500",
        isUser 
          ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/20" 
          : "glass-panel border-white/10 shadow-xl"
      )}>
        {isUser ? <User size={18} /> : <Cpu size={18} className="text-blue-400" />}
      </div>
      
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-2xl text-[14.5px] leading-relaxed tracking-wide transition-all",
        isUser 
          ? "bg-blue-600 text-white rounded-tr-none shadow-2xl shadow-blue-900/10" 
          : "glass-panel text-gray-100 rounded-tl-none border border-white/5"
      )}>
        {!isUser && content === "" ? (
          <div className="flex gap-1.5 py-2 items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {content}
          </div>
        )}
        
        {/* Subtle timestamp or role label */}
        <div className={cn(
          "absolute -bottom-5 text-[9px] font-bold uppercase tracking-widest text-white/20",
          isUser ? "right-0" : "left-0"
        )}>
          {isUser ? "Identity Verified" : "Nexus Neural Stream"}
        </div>
      </div>
    </motion.div>
  );
};
