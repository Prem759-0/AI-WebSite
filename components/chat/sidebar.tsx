"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2, LogOut, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SidebarProps {
  currentChatId?: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar = ({ currentChatId, onSelectChat, onNewChat }: SidebarProps) => {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/chat").then(res => res.json()).then(data => Array.isArray(data) && setChats(data));
  }, []);

  return (
    <div className="w-72 h-full glass-panel border-r border-white/5 flex flex-col p-4 relative z-20">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">Nexus AI</span>
      </div>

      <Button 
        onClick={onNewChat}
        className="w-full mb-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-6 flex items-center gap-2 group transition-all"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
        <span className="font-semibold">New Interaction</span>
      </Button>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {chats.map((chat) => (
          <motion.div
            key={chat._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onSelectChat(chat._id)}
            className={cn(
              "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
              currentChatId === chat._id 
                ? "bg-blue-600/10 border border-blue-500/20 text-blue-400" 
                : "hover:bg-white/5 border border-transparent text-white/50 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3 truncate">
              <MessageSquare size={16} />
              <span className="text-sm truncate font-medium">{chat.title || "Untitled Chat"}</span>
            </div>
            <Trash2 size={14} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/5 text-white/40 hover:text-red-400 transition-all">
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
