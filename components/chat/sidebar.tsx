"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentChatId?: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar = ({ currentChatId, onSelectChat, onNewChat }: SidebarProps) => {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (Array.isArray(data)) setChats(data);
    } catch (err) {
      console.error("Failed to fetch chats");
    }
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/chat/${id}`, { method: "DELETE" });
    setChats(chats.filter((c) => c._id !== id));
  };

  return (
    <div className="w-64 h-full glass-card border-y-0 border-l-0 flex flex-col p-4">
      <Button 
        onClick={onNewChat}
        className="w-full flex items-center gap-2 justify-start bg-white/5 border border-white/10 hover:bg-white/10 mb-6 rounded-xl"
      >
        <Plus size={18} />
        <span>New Chat</span>
      </Button>

      <div className="flex-1 overflow-y-auto space-y-2">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-2">Recent Chats</p>
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat._id)}
            className={cn(
              "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
              currentChatId === chat._id ? "bg-blue-600/20 border border-blue-500/30" : "hover:bg-white/5 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3 truncate">
              <MessageSquare size={16} className={currentChatId === chat._id ? "text-blue-400" : "text-white/40"} />
              <span className="text-sm truncate font-medium">{chat.title}</span>
            </div>
            <Trash2 
              size={14} 
              className="text-white/0 group-hover:text-white/40 hover:text-red-400 transition-all" 
              onClick={(e) => deleteChat(chat._id, e)}
            />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
