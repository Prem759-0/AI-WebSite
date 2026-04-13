"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Mic, Image as ImageIcon, Paperclip } from "lucide-react";
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

  const handleVoice = () => {
    const SpeechRec = (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    const recognition = new SpeechRec();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const executeChat = async (mode: "text" | "image" = "text") => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      if (mode === "image") {
        const res = await fetch("/api/image", { method: "POST", body: JSON.stringify({ prompt: userMsg.content }) });
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: `![gen](${data.url})` }]);
      } else {
        const res = await fetch("/api/ai", { method: "POST", body: JSON.stringify({ messages: [...messages, userMsg] }) });
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
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <Sparkles size={40} className="mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold">Nexus Intelligence</h2>
            <div className="grid grid-cols-2 gap-2 mt-8">
              {["Fix my code", "Write a story", "Explain Quantum", "Translate to Hindi"].map(s => (
                <button key={s} onClick={() => setInput(s)} className="glass-card p-3 rounded-xl text-xs hover:bg-white/5">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} />)
        )}
      </div>

      <div className="glass-card p-2 rounded-2xl flex flex-col gap-2">
        <div className="px-2 flex gap-2">
           <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">
             Mode: {detectIntent(input || (messages[messages.length-1]?.content || ""))}
           </span>
        </div>
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && executeChat()} placeholder="Ask anything..." className="bg-transparent border-none focus-visible:ring-0" />
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={handleVoice} className={isListening ? "text-red-500" : "text-white/40"}><Mic size={18} /></Button>
            <Button size="icon" variant="ghost" onClick={() => executeChat("image")} className="text-white/40"><ImageIcon size={18} /></Button>
          </div>
          <Button onClick={() => executeChat()} disabled={isLoading} className="rounded-xl bg-blue-600 px-4 h-10">
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
