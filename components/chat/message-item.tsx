import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { motion } from "framer-motion";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageItem = ({ role, content }: MessageItemProps) => {
  const isUser = role === "user";

  return (
    <motion.div 
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex w-full gap-4 mb-6 items-start",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
        isUser ? "bg-blue-600 border-blue-400" : "glass-card border-white/10"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
      </div>
      
      <div className={cn(
        "relative max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
        isUser 
          ? "bg-blue-600 text-white rounded-tr-none shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
          : "glass-card text-gray-100 rounded-tl-none"
      )}>
        {content || <span className="animate-pulse">...</span>}
      </div>
    </motion.div>
  );
};
