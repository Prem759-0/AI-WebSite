"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatBox } from "@/components/chat/chat-box";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Function to handle switching chats securely
  const handleChatSelect = (id: string) => {
    setActiveChatId(id);
  };

  const handleNewChat = () => {
    setActiveChatId(undefined);
  };

  return (
    <main className="flex h-screen w-full bg-[#050508] text-white overflow-hidden selection:bg-blue-500/30">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="h-full z-40"
          >
            <Sidebar 
              currentChatId={activeChatId} 
              onSelectChat={handleChatSelect} 
              onNewChat={handleNewChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative z-10">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white border border-transparent hover:border-white/10"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white/90">AI Nexus Hub</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] text-blue-500/80 font-mono tracking-widest uppercase">Engine Live</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 text-[10px] font-bold text-blue-400">
               ULTRA v4.0
             </div>
             <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/10 shadow-lg shadow-blue-900/20" />
          </div>
        </header>
        
        <section className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChatId || "new"}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <ChatBox chatId={activeChatId} />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
