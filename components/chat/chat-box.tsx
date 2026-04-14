"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Image as ImageIcon, ChevronDown, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectIntent } from "@/lib/ai-router";

const MODES = [
  { id: "auto", name: "Smart Auto", desc: "Detects intent automatically" },
  { id: "text", name: "Creative", desc: "Best for writing & chat" },
  { id: "code", name: "Coding", desc: "Pro-level developer model" },
  { id: "science", name: "Deep Think", desc: "Complex logic & tech" }
];

export const ChatBox = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Dropdown State
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) { setMessages([]); return; }
      try {
        setError(null);
        const res = await fetch(`/api/chat/${chatId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch { setError("Failed to load history."); }
    };
    loadChat();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const executeChat = async (forceMode?: "image") => {
    if (!input.trim() || isLoading) return;
    setIsDropdownOpen(false);
    setError(null);
    
    const userMsg = { role: "user" as const, content: input };
    const currentMsgs = [...messages, userMsg];
    
    setMessages(currentMsgs);
    setInput("");
    setIsLoading(true);

    try {
      if (forceMode === "image") {
        const res = await fetch("/api/image", { 
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMsg.content }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        const aiMsg = { role: "assistant" as const, content: `![Generated Image](${data.url})` };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // If "Auto" use the router logic, else append system prompt flag for specific models
        let finalInput = userMsg.content;
        if (selectedMode.id !== "auto") finalInput = `[FORCE MODE: ${selectedMode.id}] ${finalInput}`;
        
        const res = await fetch("/api/ai", { 
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, { role: "user", content: finalInput }] }) 
        });
        
        if (res.status === 401) throw new Error("Session expired. Please login.");
        if (!res.body) throw new Error("No response from AI.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value);
          setMessages(prev => {
            const last = [...prev];
            last[last.length - 1].content = fullContent;
            return last;
          });
        }
      }
    } catch (e: any) {
      setError(e.message);
      setMessages(currentMsgs); 
    } finally {
      setIsLoading(false);
    }
  };

  // Determine active display mode
  const displayMode = selectedMode.id === "auto" 
    ? detectIntent(input || (messages[messages.length-1]?.content || "")) 
    : selectedMode.name;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-4 lg:p-8 relative">
      <div className="bg-mesh" />

      {/* Header / Model Selector */}
      <div className="flex justify-center mb-6 relative z-20">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/5 transition-all text-sm font-semibold tracking-wide"
          >
            {selectedMode.name}
            <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-12 left-1/2 -translate-x-1/2 w-56 glass-dropdown rounded-2xl p-2 z-50"
              >
                {MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => { setSelectedMode(mode); setIsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-600/20 text-left transition-all group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{mode.name}</div>
                      <div className="text-[10px] text-white/40">{mode.desc}</div>
                    </div>
                    {selectedMode.id === mode.id && <Check size={16} className="text-blue-500" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="glass-panel p-10 rounded-[2.5rem] max-w-lg border-white/10 shadow-2xl animate-float"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Limitless AI</h2>
              <p className="text-sm text-white/50 mb-8 leading-relaxed">
                Powered by a dynamic intelligence cluster. Ask complex questions, write code, or generate hyper-realistic images.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Build a React Hook", "Generate Cyberpunk Art", "Explain Quantum Physics", "Translate to Spanish"].map(s => (
                  <Button key={s} variant="ghost" onClick={() => setInput(s)} className="text-[11px] h-12 border border-white/5 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/30 transition-all font-medium text-white/70 hover:text-white">
                    {s}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} />)}
          </AnimatePresence>
        )}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium">
          <AlertCircle size={14} /> {error}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="relative group max-w-4xl mx-auto w-full z-20">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700" />
        <div className="relative glass-panel rounded-[2rem] p-3 flex flex-col gap-2 shadow-2xl">
          <textarea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder={selectedMode.id === "code" ? "Ask a coding question..." : "Type a message..."} 
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-[15px] text-white placeholder:text-white/30 min-h-[56px] max-h-40"
            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeChat(); }}}
          />
          <div className="flex justify-between items-center px-2 pb-1">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => executeChat("image")} className="text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl h-10 w-10 transition-colors group/img" title="Generate Image">
                <ImageIcon size={20} className="group-hover/img:scale-110 transition-transform" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {input.trim() && (
                <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest animate-in fade-in zoom-in">
                  {displayMode}
                </span>
              )}
              <Button onClick={() => executeChat()} disabled={isLoading || !input.trim()} className="rounded-xl h-10 px-5 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside listener for dropdown */}
      {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />}
    </div>
  );
};
