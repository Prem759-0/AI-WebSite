"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Mic, Image as ImageIcon, Paperclip, Plus, MessageSquare, Trash2, LogOut, Menu } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };
type ChatInfo = { _id: string; title: string };

export default function App() {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load Chats on mount
  useEffect(() => {
    fetch("/api/chat").then(res => {
      if (res.status === 401) router.push("/login");
      return res.json();
    }).then(data => Array.isArray(data) && setChats(data));
  }, [router]);

  // Load Messages when chat changes
  useEffect(() => {
    if (activeChatId) {
      fetch(`/api/chat/${activeChatId}`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []));
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleNewChat = async () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/chat/${id}`, { method: "DELETE" });
    setChats(chats.filter(c => c._id !== id));
    if (activeChatId === id) handleNewChat();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setInput(`Summarize this document:\n\n${event.target?.result}`);
    reader.readAsText(file);
  };

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support voice input.");
    const recognition = new SpeechRecognition();
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const executeChat = async (mode: "text" | "image" = "text") => {
    if (!input.trim() || isLoading) return;
    
    let currentChatId = activeChatId;
    // Create chat if first message
    if (!currentChatId) {
      const res = await fetch("/api/chat", { 
        method: "POST", 
        body: JSON.stringify({ title: input.substring(0, 30) }) 
      });
      const newChat = await res.json();
      currentChatId = newChat._id;
      setActiveChatId(newChat._id);
      setChats([{ _id: newChat._id, title: newChat.title }, ...chats]);
    }

    const userMsg: Message = { role: "user", content: input };
    const currentMsgs = [...messages, userMsg];
    setMessages(currentMsgs);
    setInput("");
    setIsLoading(true);

    try {
      if (mode === "image") {
        setMessages(prev => [...prev, { role: "assistant", content: "Generating image..." }]);
        const res = await fetch("/api/image", { 
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMsg.content }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        const aiMsg: Message = { role: "assistant", content: `![Generated Image](${data.url})` };
        setMessages(prev => [...prev.slice(0, -1), aiMsg]);
        await fetch(`/api/chat/${currentChatId}`, { method: "PATCH", body: JSON.stringify({ messages: [...currentMsgs, aiMsg] }) });
      } else {
        const res = await fetch("/api/ai", { 
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: currentMsgs }) 
        });
        
        if (!res.body) throw new Error("No response");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value);
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: "assistant", content: fullContent };
            return newMsgs;
          });
        }
        await fetch(`/api/chat/${currentChatId}`, { method: "PATCH", body: JSON.stringify({ messages: [...currentMsgs, { role: "assistant", content: fullContent }] }) });
      }
    } catch (e: any) {
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: `❌ Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-[#0b0c10]">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="w-72 h-full glass-panel flex flex-col z-20 border-r border-white/5">
            <div className="p-4 flex items-center justify-between">
               <span className="font-bold text-lg text-white">AI Nexus</span>
               <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50"><Menu size={20}/></button>
            </div>
            <div className="px-4 mb-4">
              <button onClick={handleNewChat} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 text-sm font-medium transition">
                <Plus size={16} /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {chats.map(chat => (
                <div key={chat._id} onClick={() => setActiveChatId(chat._id)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${activeChatId === chat._id ? "bg-blue-600/20 text-blue-400" : "hover:bg-white/5 text-white/60 hover:text-white"}`}>
                  <div className="flex items-center gap-3 truncate">
                    <MessageSquare size={16} />
                    <span className="text-sm truncate">{chat.title}</span>
                  </div>
                  <button onClick={(e) => handleDeleteChat(chat._id, e)} className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5">
              <button onClick={() => { document.cookie = "auth-token=; Max-Age=0; path=/;"; router.push("/login"); }} className="w-full flex items-center gap-3 text-sm text-white/50 hover:text-red-400 transition p-2">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-14 flex items-center px-4 border-b border-white/5 bg-[#0b0c10]/80 backdrop-blur-md z-10">
          {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="mr-4 text-white/50 hover:text-white"><Menu size={20}/></button>}
          <span className="text-sm font-semibold text-white/80">{chats.find(c => c._id === activeChatId)?.title || "Start a new conversation"}</span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">How can I help?</h2>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {["Draft an email", "Analyze code", "Generate Sci-Fi Art"].map(s => (
                  <button key={s} onClick={() => setInput(s)} className="glass-panel px-4 py-2 rounded-full text-sm hover:bg-white/5 transition">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} w-full`}>
                <div className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-3xl ${m.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "glass-panel text-gray-200 rounded-tl-sm"}`}>
                  {m.role === "assistant" && m.content === "" ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : m.content.startsWith("![") ? (
                    <img src={m.content.match(/\((.*?)\)/)?.[1]} alt="Generated" className="rounded-xl w-full max-w-md object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.insertAdjacentHTML('afterend', '<span class="text-red-400 text-sm">Image blocked by browser policies.</span>')}} />
                  ) : (
                    <ReactMarkdown className="prose prose-invert max-w-none text-[15px] leading-relaxed">{m.content}</ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-gradient-to-t from-[#0b0c10] to-transparent w-full max-w-4xl mx-auto">
          <div className="glass-panel rounded-[2rem] p-2 flex flex-col shadow-2xl">
            <textarea 
              value={input} onChange={e => setInput(e.target.value)} 
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeChat(); }}}
              placeholder="Ask anything..." 
              className="w-full bg-transparent border-none resize-none py-3 px-4 text-white outline-none placeholder:text-white/30 min-h-[50px] max-h-32"
            />
            <div className="flex justify-between items-center px-2 pb-1">
              <div className="flex gap-1 items-center">
                <input type="file" id="file" className="hidden" accept=".txt,.md,.js,.ts" onChange={handleFileUpload} />
                <label htmlFor="file" className="p-2 text-white/40 hover:text-white cursor-pointer rounded-xl hover:bg-white/5 transition"><Paperclip size={18}/></label>
                <button onClick={handleVoice} className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition"><Mic size={18}/></button>
                <button onClick={() => executeChat("image")} className="p-2 text-white/40 hover:text-blue-400 rounded-xl hover:bg-white/5 transition flex items-center gap-2">
                  <ImageIcon size={18}/> <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:block">Img Gen</span>
                </button>
              </div>
              <button onClick={() => executeChat()} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl h-10 px-5 flex items-center justify-center transition shadow-lg shadow-blue-600/20">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
