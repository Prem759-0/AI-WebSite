"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatBox } from "@/components/chat/chat-box";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="flex h-screen w-full bg-[#050508] text-white overflow-hidden font-sans">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="h-full z-30"
          >
            <Sidebar 
              currentChatId={activeChatId} 
              onSelectChat={setActiveChatId} 
              onNewChat={() => setActiveChatId(undefined)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative z-10">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">AI Nexus Cluster</span>
              <span className="text-[10px] text-blue-500 font-mono">STATUS: OPTIMIZED</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-medium text-white/60">
               Tier: Enterprise
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20" />
          </div>
        </header>
        
        <section className="flex-1 overflow-hidden">
          <ChatBox chatId={activeChatId} />
        </section>
      </div>
    </main>
  );
}
