"use client";

import { useState } from "react";
import { ChatBox } from "@/components/chat/chat-box";
import { Sidebar } from "@/components/chat/sidebar";

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | undefined>();

  const handleNewChat = () => {
    setActiveChatId(undefined);
    // Logic to clear chat box will be handled via activeChatId prop in ChatBox
  };

  return (
    <main className="flex h-screen bg-[#0b0b0f] text-white overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      
      <Sidebar 
        currentChatId={activeChatId} 
        onSelectChat={setActiveChatId} 
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/80">AI Nexus</span>
            <span className="text-white/20">/</span>
            <span className="text-sm text-white/40">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/40 font-mono">SYSTEM READY</span>
          </div>
        </header>
        
        <section className="flex-1 overflow-hidden relative">
          <ChatBox chatId={activeChatId} />
        </section>
      </div>
    </main>
  );
}
