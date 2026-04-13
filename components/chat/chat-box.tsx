"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Mic, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ChatBox = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetch(`/api/chat/${chatId}`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []));
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support voice input.");
    
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const executeChat = async (mode: "text" | "image" = "text") => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: "user" as const, content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      if (mode === "image") {
        const res = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMsg.content }),
        });
        const data = await res.json();
        const aiMsg = { role: "assistant" as const, content: `![Generated Image](${data.url})` };
        setMessages(prev => [...prev, aiMsg]);
        
        if (chatId) {
          await fetch(`/api/chat/${chatId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [...updatedMessages, aiMsg] })
          });
        }
      } else {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        
        let fullContent = "";
        while (reader) {
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
            body: JSON.stringify({ messages: [...updatedMessages, { role: "assistant", content: fullContent }] })
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        {/* Empty State UI moved here */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 pt-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center"
            >
              <Sparkles className="text-white w-8 h-8" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Nexus Intelligence</h2>
            <p className="text-white/40 mb-8 max-w-sm">
              The most powerful AI tools at your fingertips. How can we accelerate your workflow today?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {[
                "Write a Python script to scrape data",
                "Generate a futuristic city wallpaper",
                "Explain quantum computing simply",
                "Analyze this business strategy"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="glass-card p-4 rounded-xl text-sm text-left hover:bg-white/5 transition-all border border-white/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((m, i) => (
              <MessageItem key={i} role={m.role} content={m.content} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="glass-card p-2 rounded-2xl flex flex-col gap-2 relative z-10">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && executeChat()}
          placeholder="Type message or image prompt..." 
          className="bg-transparent border-none focus-visible:ring-0 placeholder:text-white/20"
        />
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={handleVoice} className={isListening ? "text-red-500" : "text-white/40"}>
              <Mic size={18} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => executeChat("image")} className="text-white/40 hover:text-blue-400">
              <ImageIcon size={18} />
            </Button>
          </div>
          <Button onClick={() => executeChat("text")} disabled={isLoading || !input.trim()} className="rounded-xl h-10 w-10">
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
