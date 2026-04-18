"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Compass, Book, Folder, Clock, Download, 
  Settings, Mic, Paperclip, Send, Loader2, Image as ImageIcon, 
  Lightbulb, Sparkles, LogOut, PanelLeftClose, PanelLeft, Copy, Check, Volume2, 
  Trash2, Edit2, X, RefreshCw, StopCircle, ChevronDown, Globe, FileText, AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Safely extracted types to prevent Next.js compiler crashes
type Message = { role: "user" | "assistant", content: string };
type ChatInfo = { _id: string, title: string, updatedAt: string };
type Toast = { msg: string, type: "success" | "error" } | null;
type ViewMode = "chat" | "settings" | "profile" | "explore";
type AttachedFile = { name: string, content: string } | null;

const MODELS = [
  { id: "auto", name: "Cortex Auto", desc: "Best for everyday tasks" },
  { id: "qwen/qwen-2.5-coder-32b-instruct:free", name: "Cortex Developer", desc: "Advanced coding & logic" },
  { id: "google/gemma-3-27b-it:free", name: "Cortex Creative", desc: "Writing & brainstorming" }
];

export default function ChatApp() {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({ name: "User", email: "" });
  const [copied, setCopied] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("chat");
  
  // Advanced Features State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showModels, setShowModels] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [editingMsgIndex, setEditingMsgIndex] = useState<number | null>(null);
  const [editMsgContent, setEditMsgContent] = useState("");
  
  // Ultra Premium Features
  const [toast, setToast] = useState<Toast>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const t = getToken();
    if (!t) { router.push("/login"); return; }
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchChats();
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [router]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chat", { headers: { Authorization: `Bearer ${getToken()}` } });
      const d = await res.json();
      if (Array.isArray(d)) setChats(d);
    } catch(e) {}
  };

  useEffect(() => {
    if (activeId) {
      fetch(`/api/chat/${activeId}`).then(r => r.json()).then(d => setMessages(d.messages || []));
    } else {
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const autoResizeInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => { autoResizeInput(); }, [input]);

  const newChat = () => { setActiveId(null); setMessages([]); setView("chat"); setAttachedFile(null); if (window.innerWidth < 768) setSidebarOpen(false); };

  const deleteChat = async (id: string) => {
    if (!confirm("Delete this chat permanently?")) return;
    try {
      await fetch(`/api/chat/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      setChats(chats.filter(c => c._id !== id));
      if (activeId === id) newChat();
      showToast("Chat deleted successfully");
    } catch (e) { showToast("Failed to delete chat", "error"); }
  };

  const saveRename = async (id: string) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    try {
      await fetch(`/api/chat/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ title: editTitle }) });
      setChats(chats.map(c => c._id === id ? { ...c, title: editTitle } : c));
      setEditingId(null);
      showToast("Chat renamed");
    } catch (e) {}
  };

  const handleCopy = (text: string, i: number) => { 
    navigator.clipboard.writeText(text); 
    setCopied(i); 
    showToast("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000); 
  };
  
  const speak = (text: string) => { window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""))); };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return showToast("Voice not supported in this browser", "error");
    const r = new SR();
    showToast("Listening...");
    r.onresult = (e: any) => setInput(prev => prev + " " + e.results[0][0].transcript);
    r.start();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); 
    r.onload = ev => {
      if (typeof ev.target?.result === 'string') {
        setAttachedFile({ name: f.name, content: ev.target.result });
        showToast("File attached");
      }
    }; 
    r.readAsText(f);
    e.target.value = ''; 
  };

  const exportChat = () => {
    if (messages.length === 0) return showToast("No messages to export", "error");
    const textContent = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cortex_Export_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Chat exported successfully");
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      showToast("Generation stopped");
    }
  };

  const regenerate = async (index: number) => {
    const previousMessages = messages.slice(0, index);
    const lastUserMsg = previousMessages[previousMessages.length - 1];
    if (lastUserMsg) {
      setMessages(previousMessages);
      await send("text", lastUserMsg.content, previousMessages.slice(0, -1));
    }
  };

  const saveEditedMessage = async () => {
    if (editingMsgIndex === null || !editMsgContent.trim()) return;
    const previousMessages = messages.slice(0, editingMsgIndex);
    setEditingMsgIndex(null);
    setMessages(previousMessages);
    await send("text", editMsgContent, previousMessages);
  };

  const send = async (mode: "text" | "image" = "text", forcedInput?: string, overrideMessages?: Message[]) => {
    const txt = forcedInput || input;
    if ((!txt.trim() && !attachedFile) || loading) return;
    
    let finalPrompt = txt;
    if (attachedFile && !overrideMessages) {
      finalPrompt = `[Context from attached file: ${attachedFile.name}]\n${attachedFile.content}\n\n[User Request]\n${txt}`;
      setAttachedFile(null); 
    }

    abortControllerRef.current = new AbortController();
    const token = getToken();
    let cId: string | null = activeId;
    
    if (!cId) {
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: txt.substring(0, 30) || "New Document Chat" }) });
        if (res.ok) {
          const n = await res.json();
          if (n && n._id) { cId = n._id; setActiveId(cId); setChats(prev => [{ _id: n._id, title: n.title, updatedAt: new Date().toISOString() }, ...prev]); }
        }
      } catch (err) {}
    }

    const baseMessages = overrideMessages || messages;
    const currentMessages = [...baseMessages, { role: "user" as const, content: finalPrompt }];
    setMessages(currentMessages); 
    setInput(""); 
    setLoading(true);

    try {
      if (mode === "image") {
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        const res = await fetch("/api/image", { 
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: finalPrompt }),
          signal: abortControllerRef.current.signal 
        });
        const d = await res.json();
        if (!res.ok || d.error) throw new Error(d.error || "Image generation failed");
        
        const aiMsg = { role: "assistant" as const, content: `![Generated Image](${d.url})` };
        setMessages([...currentMessages, aiMsg]);
        if (cId) await fetch(`/api/chat/${cId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...currentMessages, aiMsg] }) });
      } else {
        const res = await fetch("/api/ai", { 
          method: "POST", headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ messages: currentMessages, forceModel: selectedModel.id, webSearch: webSearchEnabled }),
          signal: abortControllerRef.current.signal
        });
        
        const reader = res.body?.getReader();
        if (!reader) throw new Error("Failed to read stream.");
        
        const decoder = new TextDecoder();
        setMessages([...currentMessages, { role: "assistant", content: "" }]);
        let full = "";
        
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          full += decoder.decode(value, { stream: true });
          setMessages([...currentMessages, { role: "assistant", content: full }]);
        }
        
        if (cId) await fetch(`/api/chat/${cId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...currentMessages, { role: "assistant", content: full }] }) });
      }
    } catch (e: any) { 
      if (e.name !== 'AbortError') {
        setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: `❌ Error: ${e.message}` }]); 
        showToast("Error generating response", "error");
      }
    } finally { 
      setLoading(false); 
      abortControllerRef.current = null;
    }
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-screen w-full bg-[#f4f3f7] p-2 md:p-4 flex gap-4 overflow-hidden font-sans text-gray-900 relative">
      
      {/* Premium Toast Notification System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full shadow-lg border flex items-center gap-2 font-medium text-sm backdrop-blur-md
              ${toast.type === 'success' ? 'bg-white/90 text-gray-800 border-gray-200' : 'bg-red-50 text-red-600 border-red-100'}`}
          >
            {toast.type === 'success' ? <Check size={16} className="text-green-500" /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm transition-all" onClick={() => setSidebarOpen(false)} />}

      <AnimatePresence>
        {(sidebarOpen) && (
          <motion.aside layout initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} 
            className={`w-[260px] bg-[#f8f7fa] rounded-3xl flex flex-col shrink-0 z-50 fixed md:relative h-[calc(100vh-1rem)] md:h-full border border-gray-200 shadow-2xl md:shadow-none overflow-hidden`}
          >
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                <div className="bg-gradient-to-br from-cortex-purple to-purple-400 p-1.5 rounded-xl shadow-sm"><Sparkles size={18} className="text-white"/></div> Cortex
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-black"><PanelLeftClose size={20}/></button>
            </div>
            
            <div className="px-4 mb-4">
              <button onClick={newChat} className="w-full bg-black text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-medium hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-md shadow-gray-300/50">
                <Plus size={18}/> New chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 mt-2">Recent</p>
              <AnimatePresence>
                {filteredChats.map(c => (
                  <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={c._id} className="relative group mb-1">
                    {editingId === c._id ? (
                      <div className="flex items-center gap-1 bg-white border border-cortex-purple shadow-sm rounded-xl p-1.5 mx-1">
                        <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') saveRename(c._id)}} className="flex-1 text-[13px] outline-none px-1 bg-transparent text-black" />
                        <button onClick={()=>saveRename(c._id)} className="text-green-500 p-1 bg-green-50 rounded-md"><Check size={14}/></button>
                        <button onClick={()=>{setEditingId(null); setEditTitle("");}} className="text-red-500 p-1 bg-red-50 rounded-md"><X size={14}/></button>
                      </div>
                    ) : (
                      <div onClick={() => {setActiveId(c._id); setView("chat"); if(window.innerWidth<768) setSidebarOpen(false);}} 
                        className={`flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-all ${activeId === c._id && view==="chat" ? "bg-white shadow-sm border border-gray-100 text-cortex-purple font-medium" : "hover:bg-black/5"}`}>
                        <span className="truncate flex-1 text-[13.5px] pr-2">{c.title}</span>
                        <div className="hidden group-hover:flex items-center gap-1 opacity-80">
                          <button onClick={(e)=>{e.stopPropagation(); setEditingId(c._id); setEditTitle(c.title);}} className="text-gray-400 hover:text-cortex-purple p-1"><Edit2 size={14}/></button>
                          <button onClick={(e)=>{e.stopPropagation(); deleteChat(c._id);}} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-4 bg-white/50 border-t border-gray-200 backdrop-blur-md">
              <div onClick={()=>setView("profile")} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-white rounded-2xl transition shadow-sm border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm shadow-inner">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                  <div className="flex flex-col"><span className="text-sm font-bold">{user.name}</span><span className="text-[11px] text-gray-500 truncate w-24">{user.email}</span></div>
                </div>
                <button onClick={(e)=>{e.stopPropagation(); localStorage.clear(); router.push("/login");}} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-2 rounded-lg hover:bg-red-50"><LogOut size={16}/></button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 bg-white rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
        
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3 relative">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition"><PanelLeft size={20}/></button>}
            
            {/* Model Selector Dropdown */}
            <div className="relative">
              <button onClick={() => setShowModels(!showModels)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition group">
                <span className="font-semibold text-[15px] group-hover:text-cortex-purple transition">{selectedModel.name}</span>
                <ChevronDown size={14} className="text-gray-400 group-hover:text-cortex-purple transition" />
              </button>
              
              <AnimatePresence>
                {showModels && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                    {MODELS.map(m => (
                      <div key={m.id} onClick={() => { setSelectedModel(m); setShowModels(false); }} className={`p-3 rounded-xl cursor-pointer transition ${selectedModel.id === m.id ? 'bg-purple-50 text-cortex-purple' : 'hover:bg-gray-50'}`}>
                        <div className="font-semibold text-sm flex justify-between items-center">{m.name} {selectedModel.id === m.id && <Check size={14}/>}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{m.desc}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={exportChat} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition hidden sm:flex">
              <Download size={14}/> Export
            </button>
            <button className="bg-gradient-to-r from-gray-900 to-black text-white px-5 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-all shadow-md">Upgrade</button>
          </div>
        </header>

        <div className="flex-1 flex flex-col relative h-[calc(100%-4rem)] bg-[#fcfcfd]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar pb-40">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto flex flex-col items-center mt-10 md:mt-20 text-center">
                <div className="cortex-orb mb-10 animate-[pulse_4s_ease-in-out_infinite] shadow-2xl" />
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">How can I help you?</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
                  {[{i:<ImageIcon/>,t:"Generate Image",d:"A cyberpunk city at night", m:"image"}, {i:<Lightbulb/>,t:"Write Code",d:"Create a React login form", m:"text"}, {i:<Globe/>,t:"Web Search",d:"Latest AI news today", m:"text", w:true}].map((c,i)=>(
                    <motion.div whileHover={{ y: -5 }} key={i} onClick={()=>{ if(c.w) setWebSearchEnabled(true); send(c.m as "text" | "image", c.d); }} className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-cortex-purple hover:shadow-[0_8px_30px_rgb(168,127,251,0.12)] cursor-pointer transition-all duration-300 group">
                      <div className="text-gray-400 mb-3 group-hover:text-cortex-purple transition bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-cortex-purple/10">{c.i}</div>
                      <div className="font-bold text-[14px]">{c.t}</div>
                      <div className="text-[12px] text-gray-500 mt-1">{c.d}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8">
                <AnimatePresence>
                  {messages.map((m, i) => (
                    <motion.div layout initial={{opacity:0,y:10, scale: 0.98}} animate={{opacity:1,y:0, scale: 1}} key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"} group`}>
                      {m.role==="assistant" && <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cortex-purple to-purple-500 flex items-center justify-center shrink-0 mr-4 mt-1 shadow-md shadow-purple-200"><Sparkles size={16} className="text-white"/></div>}
                      
                      <div className={`relative max-w-[85%] ${m.role==="user" ? "bg-[#f3f4f6] text-gray-900 rounded-3xl rounded-tr-sm px-6 py-3.5" : "bg-white text-gray-900 w-full rounded-3xl rounded-tl-sm px-6 py-5 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100"}`}>
                        
                        {editingMsgIndex === i && m.role === "user" ? (
                          <div className="flex flex-col gap-3">
                            <textarea value={editMsgContent} onChange={e=>setEditMsgContent(e.target.value)} className="w-full bg-white p-3 rounded-xl border border-gray-200 outline-none text-sm resize-none" rows={3}/>
                            <div className="flex justify-end gap-2">
                              <button onClick={()=>setEditingMsgIndex(null)} className="px-4 py-1.5 text-sm font-medium rounded-xl hover:bg-gray-200 transition">Cancel</button>
                              <button onClick={saveEditedMessage} className="px-4 py-1.5 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition">Save & Submit</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {m.content==="" && m.role==="assistant" ? (
                              <div className="flex gap-1.5 py-2"><span className="w-2.5 h-2.5 bg-cortex-purple rounded-full animate-bounce"/><span className="w-2.5 h-2.5 bg-cortex-purple rounded-full animate-bounce [animation-delay:0.2s]"/><span className="w-2.5 h-2.5 bg-cortex-purple rounded-full animate-bounce [animation-delay:0.4s]"/></div>
                            ) : m.content.startsWith("![") ? (
                              <div className="mt-1"><img src={m.content.match(/\((.*?)\)/)?.[1]} alt="Generated" className="rounded-2xl w-full max-w-md shadow-lg border border-gray-100" /></div>
                            ) : (
                              <div className="text-[15.5px] leading-relaxed [&>p]:mb-4 last:[&>p]:mb-0 [&>pre]:bg-[#1a1b26] [&>pre]:text-gray-100 [&>pre]:p-5 [&>pre]:rounded-2xl [&>pre]:overflow-x-auto [&>pre]:my-4 [&>pre]:shadow-inner [&>code]:bg-purple-50 [&>code]:text-cortex-purple [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:font-medium [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4">
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                              </div>
                            )}

                            {!loading && m.content !== "" && (
                              <div className={`absolute ${m.role === 'user' ? 'bottom-[-30px] right-2' : 'bottom-[-35px] left-0'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                {m.role === "user" ? (
                                  <button onClick={() => { setEditingMsgIndex(i); setEditMsgContent(m.content); }} className="p-1.5 text-gray-500 hover:text-cortex-purple rounded-lg bg-white border border-gray-100 shadow-sm transition"><Edit2 size={14}/></button>
                                ) : (
                                  <>
                                    <button onClick={()=>handleCopy(m.content,i)} className="p-1.5 text-gray-500 hover:text-cortex-purple rounded-lg bg-white border border-gray-100 shadow-sm transition" title="Copy">{copied===i?<Check size={14} className="text-green-500"/>:<Copy size={14}/>}</button>
                                    <button onClick={()=>regenerate(i)} className="p-1.5 text-gray-500 hover:text-cortex-purple rounded-lg bg-white border border-gray-100 shadow-sm transition" title="Regenerate"><RefreshCw size={14}/></button>
                                  </>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator for Loading State */}
                {loading && messages[messages.length-1]?.role==="user" && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="flex justify-start items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cortex-purple to-purple-500 flex items-center justify-center shrink-0 shadow-md"><Sparkles size={16} className="text-white"/></div>
                    <div className="flex gap-1.5 px-5 py-4 bg-white rounded-3xl rounded-tl-sm border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)]">
                      <span className="w-2 h-2 bg-cortex-purple/60 rounded-full animate-pulse"/><span className="w-2 h-2 bg-cortex-purple/80 rounded-full animate-pulse [animation-delay:0.2s]"/><span className="w-2 h-2 bg-cortex-purple rounded-full animate-pulse [animation-delay:0.4s]"/>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Premium Input Bar with File Preview & Animated Glow */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20">
            <motion.div layout className={`bg-white border shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-2 flex flex-col gap-2 backdrop-blur-2xl bg-white/90 transition-all duration-500 ${loading ? 'border-cortex-purple/50 shadow-[0_0_30px_rgb(168,127,251,0.2)]' : 'border-gray-200 hover:border-gray-300 focus-within:border-cortex-purple/40 focus-within:ring-4 focus-within:ring-cortex-purple/10'}`}>
              
              {/* File Attachment Pill UI */}
              <AnimatePresence>
                {attachedFile && (
                  <motion.div initial={{ opacity: 0, height: 0, scale: 0.9 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.9 }} className="px-3 pt-2">
                    <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl p-3 w-max max-w-xs shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-white p-2 rounded-lg text-cortex-purple shadow-sm"><FileText size={18}/></div>
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-gray-800 truncate">{attachedFile.name}</span>
                          <span className="text-[10px] text-gray-500">Document ready</span>
                        </div>
                      </div>
                      <button onClick={() => setAttachedFile(null)} className="ml-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition"><X size={14}/></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-2 w-full">
                <div className="flex flex-col flex-1 bg-gray-50/50 rounded-3xl px-4 py-2 border border-transparent transition-all duration-300">
                  <textarea 
                    ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} 
                    placeholder="Ask Cortex anything..." className="w-full bg-transparent resize-none outline-none text-[15.5px] min-h-[44px] max-h-40 py-2.5 custom-scrollbar text-gray-800 placeholder:text-gray-400 font-medium" 
                  />
                  <div className="flex items-center gap-2 mt-1 pb-1">
                    <button onClick={handleVoice} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-cortex-purple hover:bg-purple-50 transition" title="Voice Input"><Mic size={18}/></button>
                    <button onClick={()=>send("image")} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-cortex-purple hover:bg-purple-50 transition" title="Generate Image"><ImageIcon size={18}/></button>
                    <label htmlFor="fileup" className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-cortex-purple hover:bg-purple-50 transition cursor-pointer" title="Attach File"><Paperclip size={18}/></label>
                    <input type="file" id="fileup" className="hidden" accept=".txt,.md,.csv" onChange={handleFile} />
                    
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <button onClick={()=>setWebSearchEnabled(!webSearchEnabled)} className={`px-3 h-8 flex items-center gap-1.5 text-xs font-bold rounded-full transition ${webSearchEnabled ? 'text-blue-600 bg-blue-50 border border-blue-100' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-transparent'}`} title="Toggle Web Search">
                      <Globe size={14}/> {webSearchEnabled ? 'Search On' : 'Search'}
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <button onClick={stopGenerating} className="w-12 h-12 mb-1 shrink-0 bg-gray-900 text-white rounded-[1.2rem] flex items-center justify-center hover:bg-black transition-all shadow-lg hover:scale-105 active:scale-95">
                    <StopCircle size={20} className="text-red-400" />
                  </button>
                ) : (
                  <button onClick={()=>send()} disabled={(!input.trim() && !attachedFile)} className="w-12 h-12 mb-1 shrink-0 bg-black disabled:bg-gray-200 disabled:shadow-none text-white rounded-[1.2rem] flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg shadow-gray-300 hover:scale-105 active:scale-95">
                    <Send size={20} className="-ml-0.5" />
                  </button>
                )}
              </div>
            </motion.div>
            <div className="text-center mt-3"><span className="text-[11px] text-gray-400 font-semibold flex items-center justify-center gap-1.5"><Check size={12} className="text-green-500"/> End-to-end encrypted • Cortex Advanced 1.0</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
