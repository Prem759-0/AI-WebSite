"use client";

import { useState, useRef, useEffect } from "react";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Image as ImageIcon } from "lucide-react";

export const ChatBox = ({ chatId }: { chatId?: string }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    if (chatId) {
      fetch(`/api/chat/${chatId}`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []))
        .catch(() => console.error("Failed to load history"));
    } else {
      setMessages([]);
    }
  }, [chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const executeChat = async (mode: "text" | "image" = "text") => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: "user" as const, content: input };
    const currentMsgs = [...messages, userMsg];
    
    setMessages(currentMsgs);
    setInput("");
    setIsLoading(true);

    // Add a temporary empty assistant message to the screen
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      if (mode === "image") {
        const res = await fetch("/api/image", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMsg.content }) 
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image API failed");
        
        // PROPER REACT STATE UPDATE (Creates a new object so React redraws)
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastIndex = newMsgs.length - 1;
          newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: `![Image](${data.url})` };
          return newMsgs;
        });

      } else {
        const res = await fetch("/api/ai", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: currentMsgs }) 
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP Error ${res.status}`);
        }
        
        if (!res.body) throw new Error("No readable stream from AI.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the stream chunk
          fullContent += decoder.decode(value, { stream: true });
          
          // PROPER REACT STATE UPDATE for streaming
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastIndex = newMsgs.length - 1;
            newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: fullContent };
            return newMsgs;
          });
        }
      }
    } catch (e: any) {
      console.error("Chat Error:", e);
      // Show the exact error on the screen
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIndex = newMsgs.length - 1;
        newMsgs[lastIndex] = { 
          ...newMsgs[lastIndex], 
          content: `❌ Error: ${e.message}. Check console or API keys.` 
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 relative">
      
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-2 text-gray-200">How can I help you today?</h2>
            <p className="text-sm">Type a message to start chatting, or click the Image icon.</p>
          </div>
        ) : (
          messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} />)
        )}
      </div>

      {/* Input Area */}
      <div className="w-full relative bg-[#212121] pb-4 pt-2">
        <div className="clean-input flex flex-col rounded-2xl p-2 shadow-lg">
          <textarea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Message AI..." 
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-[15px] text-white placeholder-gray-500 min-h-[50px] max-h-40 outline-none"
            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeChat(); }}}
          />
          <div className="flex justify-between items-center px-2 pb-1 mt-2">
            <Button size="icon" variant="ghost" onClick={() => executeChat("image")} className="text-gray-400 hover:text-white rounded-lg" title="Generate Image">
              <ImageIcon size={20} />
            </Button>
            
            <Button onClick={() => executeChat()} disabled={isLoading || !input.trim()} className="rounded-xl h-10 px-4 bg-white text-black hover:bg-gray-200 font-medium transition-colors">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">AI can make mistakes. Verify important info.</p>
      </div>
    </div>
  );
};
