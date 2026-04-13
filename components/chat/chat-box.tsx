"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Mic, Image as ImageIcon, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatBox = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice Input Logic
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support speech recognition.");

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const sendMessage = async (type: "text" | "image" = "text") => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const endpoint = type === "image" ? "/api/image" : "/api/ai";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: type === "text" ? [...messages, userMessage] : undefined,
          prompt: type === "image" ? input : undefined,
          modelType: "text"
        }),
      });

      if (type === "image") {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: `![Generated Image](${data.url})` }]);
      } else {
        // ... (Existing streaming logic from Phase 6)
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        
        let content = "";
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = content;
            return updated;
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 pb-6">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-8 pb-4 space-y-2 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <Sparkles size={40} className="mb-4 text-blue-500" />
            <h2 className="text-lg font-medium">Nexus Intelligence</h2>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} />)}
        </AnimatePresence>
      </div>

      <div className="mt-auto relative max-w-3xl mx-auto w-full group">
        <div className="relative glass-card rounded-2xl p-2 flex flex-col gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask or generate an image..."
            className="glass-input border-none ring-0 focus-visible:ring-0 min-h-[44px]"
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => {}} className="w-8 h-8 text-white/40 hover:text-white">
                <Paperclip size={18} />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleVoiceInput} className={isListening ? "text-red-500" : "text-white/40"}>
                <Mic size={18} />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => sendMessage("image")} className="text-white/40 hover:text-blue-400">
                <ImageIcon size={18} />
              </Button>
            </div>
            <Button onClick={() => sendMessage()} disabled={isLoading} className="rounded-xl h-10 px-4 bg-blue-600">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
