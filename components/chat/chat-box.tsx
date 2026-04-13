"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Mic, Image as ImageIcon, Paperclip, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { detectIntent } from "@/lib/ai-router";

export const ChatBox = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Correctly fetching chat history inside useEffect
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) {
        setMessages([]);
        return;
      }
      try {
        setError(null);
        const res = await fetch(`/api/chat/${chatId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (e) {
        setError("Failed to load chat history.");
      }
    };
    loadChat();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const executeChat = async (mode: "text" | "image" = "text") => {
    if (!input.trim() || isLoading) return;
    
    setError(null);
    const userMsg = { role: "user" as const, content: input };
    const currentMsgs = [...messages, userMsg];
    
    setMessages(currentMsgs);
    setInput("");
    setIsLoading(true);

    try {
      if (mode === "image") {
        const res = await fetch("/api/image", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMsg.content }) 
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Image generation failed.");
        
        const aiMsg = { role: "assistant" as const, content: `![Generated Image](${data.url})` };
        setMessages(prev => [...prev, aiMsg]);

        if (chatId) {
          await fetch(`/api/chat/${chatId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [...currentMsgs, aiMsg] })
          });
        }
      } else {
        const res = await fetch("/api/ai", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: currentMsgs }) 
        });
        
        if (res.status === 401) throw new Error("Please login to continue.");
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

        if (chatId) {
          await fetch(`/api/chat/${chatId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [...currentMsgs, { role: "assistant", content: fullContent }] })
          });
        }
      }
    } catch (e: any) {
      setError(e.message);
      // Optional: keep user message but remove failed AI placeholder
      setMessages(currentMsgs); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-4 lg:p-6 relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 rounded-3xl max-w-md">
              <Sparkles size={32} className="text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Nexus Intelligence</h2>
              <p className="text-sm text-white/40 mb-8">Ready for your next great idea. Try a suggestion below.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Fix my React code", "Anime landscape art", "Explain Web3"].map(s => (
                  <Button key={s} variant="ghost" onClick={() => setInput(s)} className="text-xs border border-white/5 rounded-full hover:bg-white/5 transition-all">
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
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="relative group max-w-4xl mx-auto w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500" />
        <div className="relative glass-panel rounded-2xl p-2 flex flex-col gap-2 shadow-2xl">
          <textarea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask AI or generate image..." 
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm text-white placeholder:text-white/20 min-h-[44px] max-h-32"
            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeChat(); }}}
          />
          <div className="flex justify-between items-center px-2 pb-1">
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="text-white/30 hover:text-white rounded-lg"><Paperclip size={18} /></Button>
              <Button size="icon" variant="ghost" onClick={() => executeChat("image")} className="text-white/30 hover:text-blue-400 rounded-lg"><ImageIcon size={18} /></Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-blue-500/50 uppercase tracking-widest">{detectIntent(input)}</span>
              <Button onClick={() => executeChat()} disabled={isLoading || !input.trim()} className="rounded-xl h-9 px-4 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
