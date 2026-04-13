"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Mic, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ChatBox = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetch(`/api/chat/${chatId}`).then(res => res.json()).then(data => setMessages(data.messages || []));
    }
  }, [chatId]);

  const handleVoice = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
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
        const res = await fetch("/api/image", {
          method: "POST",
          body: JSON.stringify({ prompt: userMsg.content }),
        });
        const data = await res.json();
        const aiMsg = { role: "assistant" as const, content: `![gen](${data.url})` };
        setMessages(prev => [...prev, aiMsg]);
        if (chatId) await fetch(`/api/chat/${chatId}`, { method: "PATCH", body: JSON.stringify({ messages: [...messages, userMsg, aiMsg] }) });
      } else {
        const res = await fetch("/api/ai", {
          method: "POST",
          body: JSON.stringify({ messages: [...messages, userMsg] }),
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        let fullContent = "";
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          fullContent += decoder.decode(value);
          setMessages(prev => {
            const last = [...prev];
            last[last.length - 1].content = fullContent;
            return last;
          });
        }
        if (chatId) await fetch(`/api/chat/${chatId}`, { method: "PATCH", body: JSON.stringify({ messages: [...messages, userMsg, { role: "assistant", content: fullContent }] }) });
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        {messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} />)}
      </div>
      <div className="glass-card p-2 rounded-2xl flex flex-col gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Type message or image prompt..." 
          className="bg-transparent border-none focus-visible:ring-0"
        />
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={handleVoice} className={isListening ? "text-red-500" : ""}>
              <Mic size={18} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => executeChat("image")}>
              <ImageIcon size={18} />
            </Button>
          </div>
          <Button onClick={() => executeChat("text")} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
