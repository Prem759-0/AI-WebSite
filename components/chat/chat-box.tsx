"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Mic, Image as ImageIcon, Paperclip, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectIntent } from "@/lib/ai-router";

export const ChatBox = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetch(`/api/chat/${chatId}`).then(res => res.json()).then(data => setMessages(data.messages || []));
    } else { setMessages([]); }
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const executeChat = async (mode: "text" | "image" = "text") => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user" as const, content: input };
    const currentMsgs = [...messages, userMsg];
    setMessages(currentMsgs);
    setInput("");
    setIsLoading(true);

    try {
      if (mode === "image") {
        const res = await fetch("/api/image", { method: "POST", body: JSON.stringify({ prompt: userMsg.content }) });
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: `![gen](${data.url})` }]);
      } else {
        const res = await fetch("/api/ai", { method: "POST", body: JSON.stringify({ messages: currentMsgs }) });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        let full = "";
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value);
          setMessages(prev => {
            const last = [...prev];
            last[last.length - 1].content = full;
            return last;
          });
        }
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-6 relative">
      {/* Dynamic Glow following mouse or static */}
      <div className="bg-glow top-1/4 left-1/4" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 mb-6"
            >
              <Cpu size={48} className="text-blue-500 animate-pulse" />
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">How can I help you?</h2>
            <p className="text-white/40 max-w-sm mb-12">Ask about coding, science, or generate breathtaking art.</p>
            <div className="grid grid-cols-2 gap-3 max-w-xl w-full">
              {["Debug my code", "Write a poem", "Analyze SEO", "Render a 3D Cyberpunk city"].map(s => (
                <button key={s} onClick={() => setInput(s)} className="glass-panel p-4 rounded-2xl text-sm font-medium hover:bg-white/5 text-white/60 hover:text-white transition-all text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} />)}
          </AnimatePresence>
        )}
      </div>

      <div className="relative group max-w-4xl mx-auto w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
        <div className="relative glass-panel rounded-3xl p-3 flex flex-col gap-3">
          <div className="flex gap-2 px-2">
            <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg border border-blue-400/20 uppercase tracking-widest">
              Engine: {detectIntent(input || (messages[messages.length-1]?.content || ""))}
            </span>
          </div>
          
          <div className="flex items-end gap-2">
            <textarea 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Message Nexus..." 
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-white placeholder:text-white/20 min-h-[48px] max-h-48 overflow-y-auto"
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeChat(); }}}
            />
            <div className="flex gap-1 pb-1">
              <Button size="icon" variant="ghost" className="h-10 w-10 text-white/20 hover:text-white rounded-xl"><Paperclip size={20} /></Button>
              <Button size="icon" variant="ghost" onClick={() => executeChat("image")} className="h-10 w-10 text-white/20 hover:text-blue-400 rounded-xl"><ImageIcon size={20} /></Button>
              <Button onClick={() => executeChat()} disabled={isLoading || !input.trim()} className="h-10 px-5 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
