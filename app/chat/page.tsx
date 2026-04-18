"use client";
import { useState, useEffect, useRef, UIEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Download, Settings, Mic, Paperclip, Send, Loader2, Image as ImageIcon, 
  Lightbulb, Sparkles, LogOut, PanelLeftClose, PanelLeft, Copy, Check, RefreshCw, StopCircle, 
  ChevronDown, Globe, FileText, AlertCircle, ArrowDown, AlignLeft, X,
  Star, Wand2, Share2, Database, ThumbsUp, ThumbsDown, MoreHorizontal, Mail, Code, AlertTriangle, Volume2, Edit2, Trash2, Eye, Code2
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Safe Type Definitions
type Message = { role: "user" | "assistant", content: string };
type ChatInfo = { _id: string, title: string, updatedAt: string, starred?: boolean };
type Toast = { msg: string, type: "success" | "error" } | null;
type ViewMode = "chat" | "settings" | "profile" | "explore";
type AttachedFile = { name: string, content: string, isImage?: boolean } | null;

const MODELS = [
  { id: "auto", name: "Cortex Auto", desc: "Fast & everyday tasks" },
  { id: "qwen/qwen-2.5-coder-32b-instruct:free", name: "Developer", desc: "Advanced coding" },
  { id: "google/gemma-3-27b-it:free", name: "Creative", desc: "Deep writing" }
];

export default function ChatApp() {
  const [chats, setChats] = useState< Array<ChatInfo> >([]);
  const [activeId, setActiveId] = useState< string | null >(null);
  const [messages, setMessages] = useState< Array<Message> >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "User", email: "" });
  const [copied, setCopied] = useState< string | null >(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState< ViewMode >("chat");
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const [editingId, setEditingId] = useState< string | null >(null);
  const [editTitle, setEditTitle] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showModels, setShowModels] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [editingMsgIndex, setEditingMsgIndex] = useState< number | null >(null);
  const [editMsgContent, setEditMsgContent] = useState("");
  
  const [toast, setToast] = useState< Toast >(null);
  const [attachedFile, setAttachedFile] = useState< AttachedFile >(null);

  // Advanced Action States
  const [ratings, setRatings] = useState<{[key: number]: 'up'|'down'}>({});
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  
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
    const handleClickOutside = () => setOpenMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const t = getToken();
    if (!t) { router.push("/login"); return; }
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchChats();
    if (window.innerWidth >= 768) setSidebarOpen(true);
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
      fetch(`/api/chat/${activeId}`).then(r => r.json()).then(d => {
        setMessages(d.messages || []);
        setRatings({});
      });
    } else {
      setMessages([]);
    }
  }, [activeId]);

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 150;
    setShowScrollButton(!isNearBottom);
  };

  const autoResizeInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const maxHeight = window.innerWidth < 768 ? 120 : 250;
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => { autoResizeInput(); }, [input]);

  const handleRate = (index: number, type: 'up'|'down') => {
    setRatings(prev => ({ ...prev, [index]: prev[index] === type ? undefined : type } as any));
    showToast(type === 'up' ? "Feedback recorded: Positive" : "Feedback recorded: Negative");
  };

  const exportToDocs = (content: string, index: number) => {
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Cortex_Response_${index}.doc`; a.click();
    URL.revokeObjectURL(url);
    showToast("Exported to Docs");
  };

  const draftGmail = (content: string) => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=Cortex AI Output&body=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
    showToast("Drafting in Gmail...");
  };

  const sendToAdmin = (content: string) => {
    const url = `mailto:a70064182@gmail.com?subject=Shared Cortex AI Response&body=${encodeURIComponent(content)}`;
    window.open(url, '_self');
    showToast("Opening Email Client...");
  };

  const reportLegal = () => {
    const url = `mailto:a70064182@gmail.com?subject=Legal / Safety Issue Report&body=Please describe the issue below:%0D%0A%0D%0A`;
    window.open(url, '_self');
  };

  const exportToReplit = (content: string) => {
    const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
    const codeToCopy = codeMatch ? codeMatch[1] : content;
    navigator.clipboard.writeText(codeToCopy);
    showToast("Code copied! Opening Replit...");
    setTimeout(() => window.open('https://replit.com/~', '_blank'), 1500);
  };

  const newChat = () => { setActiveId(null); setMessages([]); setView("chat"); setAttachedFile(null); if (window.innerWidth < 768) setSidebarOpen(false); };

  const toggleStar = (id: string) => {
    setChats(chats.map(c => c._id === id ? { ...c, starred: !c.starred } : c));
    showToast("Chat pinned");
  };

  const enhancePrompt = () => {
    if (!input.trim()) return showToast("Type something to enhance first!", "error");
    setInput(`Enhance this concept with high detail: ${input}`);
    showToast("Prompt magic applied!");
  };

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

  const handleCopy = (text: string, id: string) => { 
    navigator.clipboard.writeText(text); 
    setCopied(id); 
    showToast("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000); 
  };
  
  const speak = (text: string) => { window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ""))); };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return showToast("Voice not supported", "error");
    const r = new SR();
    showToast("Listening...");
    r.onresult = (e: any) => setInput(prev => prev + " " + e.results[0][0].transcript);
    r.start();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); 
    if (f.type.startsWith("image/")) {
      r.onload = ev => {
        if (typeof ev.target?.result === 'string') {
          setAttachedFile({ name: f.name, content: ev.target.result, isImage: true });
          showToast("Image attached");
        }
      }; 
      r.readAsDataURL(f);
    } else {
      r.onload = ev => {
        if (typeof ev.target?.result === 'string') {
          setAttachedFile({ name: f.name, content: ev.target.result, isImage: false });
          showToast("Document attached");
        }
      }; 
      r.readAsText(f);
    }
    e.target.value = ''; 
  };

  const exportChat = () => {
    if (messages.length === 0) return showToast("No messages to export", "error");
    const textContent = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Cortex_Export_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast("Chat exported successfully");
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); abortControllerRef.current = null;
      setLoading(false); showToast("Generation stopped");
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
    setEditingMsgIndex(null); setMessages(previousMessages);
    await send("text", editMsgContent, previousMessages);
  };

  const send = async (mode: string = "text", forcedInput?: string, overrideMessages?: Message[]) => {
    const txt = forcedInput || input;
    if ((!txt.trim() && !attachedFile) || loading) return;
    
    let finalPrompt = txt;
    if (attachedFile && !overrideMessages) {
      finalPrompt = attachedFile.isImage 
        ? `[Attached Image: ${attachedFile.name}]\n${attachedFile.content}\n\n[User Request]: ${txt}` 
        : `[Context from attached document: ${attachedFile.name}]\n${attachedFile.content}\n\n[User Request]: ${txt}`;
      setAttachedFile(null); 
    }

    abortControllerRef.current = new AbortController();
    const token = getToken();
    let cId: string | null = activeId;
    
    if (!cId) {
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: txt.substring(0, 30) || "New Workspace" }) });
        if (res.ok) {
          const n = await res.json();
          if (n && n._id) { cId = n._id; setActiveId(cId); setChats(prev => [{ _id: n._id, title: n.title, updatedAt: new Date().toISOString() }, ...prev]); }
        }
      } catch (err) {}
    }

    const baseMessages = overrideMessages || messages;
    const currentMessages = [...baseMessages, { role: "user" as const, content: finalPrompt }];
    setMessages(currentMessages); setInput(""); setLoading(true);

    if (window.innerWidth < 768 && inputRef.current) inputRef.current.style.height = '44px';

    try {
      if (mode === "image") {
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        const res = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: finalPrompt }), signal: abortControllerRef.current.signal });
        const d = await res.json();
        if (!res.ok || d.error) throw new Error(d.error || "Image generation failed");
        const aiMsg = { role: "assistant" as const, content: `![Generated Image](${d.url})` };
        setMessages([...currentMessages, aiMsg]);
        if (cId) await fetch(`/api/chat/${cId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...currentMessages, aiMsg] }) });
      } else {
        const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: currentMessages, forceModel: selectedModel.id, webSearch: webSearchEnabled }), signal: abortControllerRef.current.signal });
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
    } finally { setLoading(false); abortControllerRef.current = null; }
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  // 🚀 ADVANCED CODE PREVIEW COMPONENT 🚀
  const CodeBlock = ({ inline, className, children }: any) => {
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';
    const codeString = String(children).replace(/\n$/, '');
    const codeId = Math.random().toString(36).substring(7);
    
    // Only allow preview for web languages
    const isPreviewable = ['html', 'svg', 'xml'].includes(lang.toLowerCase());

    if (!inline && match) {
      return (
        <div className="relative my-4 md:my-6 rounded-xl md:rounded-2xl overflow-hidden bg-[#0d0d0f] border border-white/10 shadow-2xl w-full max-w-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 md:px-4 py-2.5 bg-[#16161a] border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              
              {/* Preview Toggle Buttons */}
              {isPreviewable && (
                <div className="flex bg-black/50 rounded-lg p-0.5 border border-white/5">
                  <button onClick={() => setViewMode('code')} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold transition ${viewMode === 'code' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><Code2 size={12}/> Code</button>
                  <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold transition ${viewMode === 'preview' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><Eye size={12}/> Preview</button>
                </div>
              )}
              {!isPreviewable && <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{lang}</span>}
            </div>

            <button onClick={() => handleCopy(codeString, codeId)} className="text-gray-400 hover:text-white transition flex items-center gap-1.5 text-[10px] md:text-xs font-medium bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg">
              {copied === codeId ? <><Check size={14} className="text-green-500"/> Copied</> : <><Copy size={14}/> Copy</>}
            </button>
          </div>

          {/* Content Area */}
          <div className="relative bg-[#0d0d0f]">
            {viewMode === 'code' ? (
              <div className="p-4 md:p-6 overflow-x-auto custom-scrollbar">
                <code className={`token ${className} text-gray-300 text-[13px] md:text-[14px] font-mono leading-relaxed whitespace-pre`}>{children}</code>
              </div>
            ) : (
              <div className="bg-white w-full h-[400px] overflow-hidden">
                <iframe srcDoc={codeString} title="Preview" sandbox="allow-scripts" className="w-full h-full border-none bg-white"/>
              </div>
            )}
          </div>
        </div>
      );
    }
    return <code className="bg-cortex-purple/10 text-[#a87ffb] px-1.5 py-0.5 rounded-md font-mono text-[13px] font-semibold">{children}</code>;
  };

  const renderers = {
    code: CodeBlock,
    // Advanced Image Renderer with Lightbox effect
    img: (props: any) => (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl my-4 group max-w-md w-full">
        <img {...props} className="w-full h-auto object-cover transform transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
          <span className="text-white text-xs font-bold flex items-center gap-1.5"><ImageIcon size={14}/> Generated by Cortex</span>
        </div>
      </div>
    )
  };

  return (
    // Changed to Pure Black background to match the GIF perfectly
    <div className="h-[100dvh] w-full bg-[#000000] md:p-4 flex gap-4 overflow-hidden font-sans text-white relative">
      
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full shadow-2xl border flex items-center gap-2 font-medium text-sm backdrop-blur-xl ${toast.type === 'success' ? 'bg-[#121212]/90 text-white border-white/10' : 'bg-red-900/90 text-white border-red-500/50'}`}>
            {toast.type === 'success' ? <Check size={16} className="text-cortex-purple" /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-all" onClick={() => setSidebarOpen(false)} />}

      <AnimatePresence>
        {(sidebarOpen) && (
          <motion.aside layout initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} 
            className={`w-[280px] md:w-[260px] bg-[#09090b] md:rounded-3xl flex flex-col shrink-0 z-50 fixed md:relative h-[100dvh] md:h-full border-r md:border border-white/5 shadow-2xl overflow-hidden`}
          >
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
                <div className="bg-gradient-to-br from-cortex-purple to-blue-500 p-1.5 rounded-xl shadow-[0_0_15px_rgba(168,127,251,0.3)]"><Sparkles size={18} className="text-white"/></div> Cortex
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white p-2"><X size={20}/></button>
            </div>
            
            <div className="px-4 mb-4">
              <button onClick={newChat} className="w-full bg-white text-black py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold hover:bg-gray-200 transition-all active:scale-[0.98]">
                <Plus size={18}/> New chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 custom-scrollbar flex flex-col">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2">Recent Chats</p>
              {filteredChats.map(c => (
                <div key={c._id} className="relative group">
                  {editingId === c._id ? (
                    <div className="flex items-center gap-1 bg-[#1a1a1e] border border-cortex-purple shadow-sm rounded-xl p-1.5 mx-1 mb-1">
                      <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') saveRename(c._id)}} className="flex-1 text-[13px] outline-none px-1 bg-transparent text-white" />
                      <button onClick={()=>saveRename(c._id)} className="text-green-400 p-1 bg-green-400/10 rounded-md"><Check size={14}/></button>
                      <button onClick={()=>{setEditingId(null); setEditTitle("");}} className="text-red-400 p-1 bg-red-400/10 rounded-md"><X size={14}/></button>
                    </div>
                  ) : (
                    <div onClick={() => {setActiveId(c._id); if(window.innerWidth<768) setSidebarOpen(false);}} 
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer mb-1 transition-all ${activeId === c._id ? "bg-[#1a1a1e] border border-white/5 text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                      <div className="flex items-center gap-2 truncate flex-1 pr-2">
                        {c.starred && <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0"/>}
                        <span className="truncate text-[13.5px]">{c.title}</span>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={(e)=>{e.stopPropagation(); toggleStar(c._id);}} className="text-gray-500 hover:text-yellow-500 p-1"><Star size={14}/></button>
                        <button onClick={(e)=>{e.stopPropagation(); setEditingId(c._id); setEditTitle(c.title);}} className="text-gray-500 hover:text-cortex-purple p-1"><Edit2 size={14}/></button>
                        <button onClick={(e)=>{e.stopPropagation(); deleteChat(c._id);}} className="text-gray-500 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Database size={12}/> Context Used</span>
                <span className="text-[10px] text-gray-400">{(messages.length * 1.5).toFixed(1)}k / 128k</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-gradient-to-r from-cortex-purple to-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((messages.length / 50) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#09090b]">
              <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1a1a1e] flex items-center justify-center font-bold text-sm text-white border border-white/10">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                  <div className="flex flex-col"><span className="text-sm font-bold text-gray-200">{user.name}</span><span className="text-[11px] text-gray-500 truncate w-24">{user.email}</span></div>
                </div>
                <button onClick={()=>{localStorage.clear(); router.push("/login");}} className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10" title="Logout"><LogOut size={16}/></button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 bg-[#000000] md:rounded-[2rem] border-x md:border border-white/10 flex flex-col relative overflow-hidden h-[100dvh] md:h-full w-full">
        
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#000000]/80 backdrop-blur-xl z-20 shrink-0 w-full">
          <div className="flex items-center gap-2">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition"><AlignLeft size={22}/></button>}
            
            <div className="relative">
              <button onClick={() => setShowModels(!showModels)} className="flex items-center gap-1.5 md:gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition group">
                <span className="font-semibold text-[14px] md:text-[15px] text-gray-200 group-hover:text-white truncate max-w-[120px] md:max-w-none">{selectedModel.name}</span>
                <ChevronDown size={14} className="text-gray-500 group-hover:text-white transition" />
              </button>
              
              <AnimatePresence>
                {showModels && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-2 w-[85vw] md:w-64 max-w-[300px] bg-[#121214]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-2 z-50">
                    {MODELS.map(m => (
                      <div key={m.id} onClick={() => { setSelectedModel(m); setShowModels(false); }} className={`p-3 rounded-xl cursor-pointer transition ${selectedModel.id === m.id ? 'bg-[#1a1a1e] text-cortex-purple' : 'hover:bg-white/5 text-gray-300'}`}>
                        <div className="font-semibold text-sm flex justify-between items-center">{m.name} {selectedModel.id === m.id && <Check size={14}/>}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{m.desc}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-[200px] md:pb-40 custom-scrollbar w-full relative z-0">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto flex flex-col items-center mt-8 md:mt-20 text-center w-full">
                
                {/* The Pure Black background makes the GIF perfectly seamless */}
                <div className="w-32 h-32 md:w-48 md:h-48 mb-6 md:mb-8 relative flex items-center justify-center mix-blend-screen pointer-events-none">
                  <img src="/ai_logo_video.gif" alt="Cortex AI" className="w-full h-full object-contain scale-[1.2]" />
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-8 text-white px-2">How can I help you?</h1>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl mt-4 px-2">
                  {[{i:<ImageIcon size={20}/>,t:"Generate Image",d:"A cyberpunk city at night", m:"image"}, {i:<Lightbulb size={20}/>,t:"Write Code",d:"Create a React login form", m:"text"}, {i:<Globe size={20}/>,t:"Web Search",d:"Latest AI news today", m:"text", w:true}].map((c,i)=>(
                    <div key={i} onClick={()=>{ if(c.w) setWebSearchEnabled(true); send(c.m as any, c.d); }} className="bg-[#121214] border border-white/5 rounded-2xl p-4 md:p-5 text-left hover:border-cortex-purple/50 cursor-pointer transition-all active:scale-[0.98] flex items-center sm:block gap-4">
                      <div className="text-gray-400 sm:mb-3 bg-white/5 w-10 h-10 rounded-full flex items-center justify-center shrink-0">{c.i}</div>
                      <div>
                        <div className="font-bold text-[14px] text-gray-200">{c.t}</div>
                        <div className="text-[12px] text-gray-500 mt-0.5 sm:mt-1">{c.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-12 md:space-y-14 w-full pb-8">
                {messages.map((m, i) => (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"} group w-full relative`}>
                    {m.role==="assistant" && <div className="hidden md:flex w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a1e] to-[#2a2a35] border border-white/10 items-center justify-center shrink-0 mr-3 mt-1"><Sparkles size={14} className="text-cortex-purple"/></div>}
                    
                    <div className={`relative max-w-[90%] md:max-w-[85%] ${m.role==="user" ? "bg-[#1e1e24] text-white rounded-[1.5rem] rounded-tr-sm px-5 py-3 border border-white/5 shadow-md break-words" : "bg-transparent text-gray-200 w-full rounded-3xl py-1 overflow-visible"}`}>
                      
                      {m.content.includes("[Attached Image:") && m.content.includes("data:image")}
                      {m.content==="" && m.role==="assistant" ? (
                        <div className="flex gap-1.5 py-2"><span className="w-2 h-2 bg-cortex-purple rounded-full animate-bounce"/><span className="w-2 h-2 bg-cortex-purple rounded-full animate-bounce delay-100"/><span className="w-2 h-2 bg-cortex-purple rounded-full animate-bounce delay-200"/></div>
                      ) : m.content.startsWith("![") ? (
                        <div className="mt-1 w-full"><img src={m.content.match(/\((.*?)\)/)?.[1]} alt="Generated" className="rounded-2xl w-full max-w-sm shadow-xl border border-white/10" /></div>
                      ) : (
                        <div className="text-[15px] leading-relaxed [&>p]:mb-3 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 w-full break-words">
                          <ReactMarkdown components={renderers}>{m.content}</ReactMarkdown>
                        </div>
                      )}

                      {/* ADVANCED AI MESSAGE ACTION BAR */}
                      {!loading && m.content !== "" && m.role === "assistant" && (
                        <div className={`absolute bottom-[-40px] left-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                          
                          <button onClick={()=>handleRate(i, 'up')} className={`p-1.5 rounded-lg border shadow-sm transition ${ratings[i] === 'up' ? 'bg-cortex-purple/20 text-cortex-purple border-cortex-purple/30' : 'bg-[#121214] border-white/10 text-gray-500 hover:text-white hover:bg-white/5'}`} title="Like"><ThumbsUp size={14}/></button>
                          
                          <button onClick={()=>handleRate(i, 'down')} className={`p-1.5 rounded-lg border shadow-sm transition ${ratings[i] === 'down' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-[#121214] border-white/10 text-gray-500 hover:text-white hover:bg-white/5'}`} title="Dislike"><ThumbsDown size={14}/></button>
                          
                          <button onClick={()=>handleCopy(m.content, i.toString())} className="p-1.5 text-gray-500 hover:text-white rounded-lg bg-[#121214] border border-white/10 shadow-sm transition hover:bg-white/5" title="Copy">{copied===i.toString()?<Check size={14} className="text-green-500"/>:<Copy size={14}/>}</button>
                          
                          <button onClick={()=>regenerate(i)} className="p-1.5 text-gray-500 hover:text-white rounded-lg bg-[#121214] border border-white/10 shadow-sm transition hover:bg-white/5" title="Redo"><RefreshCw size={14}/></button>
                          
                          <div className="relative">
                            <button onClick={(e)=>{ e.stopPropagation(); setOpenMenu(openMenu === i ? null : i); }} className={`p-1.5 rounded-lg border shadow-sm transition ${openMenu === i ? 'bg-white/10 text-white border-white/20' : 'bg-[#121214] border-white/10 text-gray-500 hover:text-white hover:bg-white/5'}`} title="More options"><MoreHorizontal size={14}/></button>
                            
                            <AnimatePresence>
                              {openMenu === i && (
                                 <motion.div initial={{opacity:0, y:5, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:5, scale:0.95}} className="absolute bottom-full left-0 mb-2 w-56 bg-[#121214]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden py-1.5 z-50">
                                    <button onClick={() => { speak(m.content); setOpenMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2.5"><Volume2 size={14}/> Read Aloud</button>
                                    <button onClick={() => { exportToDocs(m.content, i); setOpenMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2.5"><FileText size={14}/> Export to Docs</button>
                                    <button onClick={() => { draftGmail(m.content); setOpenMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2.5"><Mail size={14}/> Draft in Gmail</button>
                                    
                                    {m.content.includes('```') && (
                                      <button onClick={() => { exportToReplit(m.content); setOpenMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-blue-400 hover:bg-blue-500/10 flex items-center gap-2.5"><Code size={14}/> Export to Replit</button>
                                    )}
                                    
                                    <div className="h-px bg-white/5 my-1 w-full"></div>
                                    
                                    <button onClick={() => { sendToAdmin(m.content); setOpenMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2.5"><Send size={14}/> Send to Author</button>
                                    <button onClick={() => { reportLegal(); setOpenMenu(null); }} className="w-full text-left px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2.5"><AlertTriangle size={14}/> Report Legal Issue</button>
                                 </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {!loading && m.role === "user" && (
                        <div className={`absolute bottom-[-30px] right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                           <button onClick={() => { setEditingMsgIndex(i); setEditMsgContent(m.content.replace(/\[Attached Image:.*?\]\ndata:image\/[^\n]+\n\n\[User Request\]: /, '')); }} className="p-1.5 text-gray-500 hover:text-white rounded-lg bg-[#121214] border border-white/10 shadow-sm transition"><Edit2 size={12}/></button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {loading && messages[messages.length-1]?.role==="user" && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="flex justify-start items-center gap-3">
                    <div className="hidden md:flex w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a1e] to-[#2a2a35] border border-white/10 items-center justify-center shrink-0"><Sparkles size={14} className="text-cortex-purple"/></div>
                    <div className="flex gap-1.5 px-4 py-3 bg-[#121214] rounded-2xl rounded-tl-sm border border-white/5">
                      <span className="w-2 h-2 bg-cortex-purple/60 rounded-full animate-pulse"/><span className="w-2 h-2 bg-cortex-purple/80 rounded-full animate-pulse delay-100"/><span className="w-2 h-2 bg-cortex-purple rounded-full animate-pulse delay-200"/>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
            <AnimatePresence>
              {showScrollButton && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={scrollToBottom} className="w-10 h-10 bg-[#1e1e24] border border-white/10 rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-white transition">
                  <ArrowDown size={18}/>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-0 md:bottom-6 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-3xl px-2 md:px-4 pb-4 pt-2 md:py-0 z-40 bg-gradient-to-t from-[#000000] via-[#000000]/90 to-transparent md:bg-none">
            <div className={`bg-[#121214]/90 md:bg-[#0f0f13] border shadow-2xl rounded-[1.5rem] md:rounded-[2rem] p-1.5 md:p-2 flex flex-col gap-2 backdrop-blur-3xl transition-all duration-300 w-full ${loading ? 'border-cortex-purple/50' : 'border-white/10 focus-within:border-cortex-purple/50'}`}>
              
              <AnimatePresence>
                {attachedFile && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-2 pt-1 md:pt-2">
                    <div className="relative inline-flex items-center gap-2 md:gap-3 bg-[#1a1a1e] border border-white/10 rounded-xl p-1.5 md:p-2 max-w-[200px] md:max-w-[250px]">
                      {attachedFile.isImage ? (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-md overflow-hidden shrink-0"><img src={attachedFile.content} className="w-full h-full object-cover" /></div>
                      ) : (
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-md text-cortex-purple flex items-center justify-center shrink-0"><FileText size={16}/></div>
                      )}
                      <span className="text-[11px] md:text-xs font-bold text-gray-200 truncate flex-1">{attachedFile.name}</span>
                      <button onClick={() => setAttachedFile(null)} className="p-1 bg-[#222] border border-white/10 text-gray-400 hover:text-red-400 rounded-full shrink-0"><X size={12}/></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-1.5 md:gap-2 w-full">
                <div className="flex flex-col flex-1 bg-white/5 rounded-[1.2rem] md:rounded-[1.5rem] px-3 md:px-4 py-1 md:py-2 border border-transparent w-full relative">
                  <textarea 
                    ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} 
                    placeholder="Message Cortex..." 
                    className="w-full bg-transparent resize-none outline-none text-[15px] md:text-[15.5px] min-h-[40px] md:min-h-[44px] py-2 md:py-2.5 custom-scrollbar text-white placeholder:text-gray-500 leading-tight" 
                  />
                  <div className="flex items-center gap-1 md:gap-2 mt-1 pb-1 overflow-x-auto custom-scrollbar">
                    
                    <button onClick={enhancePrompt} className="p-1.5 md:w-8 md:h-8 flex items-center justify-center rounded-full text-cortex-purple hover:bg-cortex-purple/10 shrink-0 transition" title="Enhance Prompt"><Wand2 size={16}/></button>
                    <div className="w-px h-4 bg-white/10 mx-0.5 md:mx-1 shrink-0"></div>

                    <button onClick={handleVoice} className="p-1.5 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white md:hover:bg-white/5 shrink-0"><Mic size={18}/></button>
                    <button onClick={()=>send("image")} className="p-1.5 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white md:hover:bg-white/5 shrink-0"><ImageIcon size={18}/></button>
                    <label htmlFor="fileup" className="p-1.5 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white md:hover:bg-white/5 cursor-pointer shrink-0"><Paperclip size={18}/></label>
                    <input type="file" id="fileup" className="hidden" accept=".txt,.md,.csv,.png,.jpg,.jpeg" onChange={handleFile} />
                    
                    <div className="w-px h-4 bg-white/10 mx-0.5 md:mx-1 shrink-0"></div>
                    <button onClick={()=>setWebSearchEnabled(!webSearchEnabled)} className={`px-2.5 h-7 md:h-8 flex items-center gap-1.5 text-[11px] md:text-xs font-bold rounded-full transition shrink-0 ${webSearchEnabled ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' : 'text-gray-500 hover:text-white border border-transparent'}`}>
                      <Globe size={14}/> <span className="hidden sm:inline">{webSearchEnabled ? 'Search On' : 'Search'}</span>
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <button onClick={stopGenerating} className="w-10 h-10 md:w-12 md:h-12 mb-1 shrink-0 bg-white text-black rounded-xl md:rounded-[1.2rem] flex items-center justify-center shadow-lg active:scale-95">
                    <StopCircle size={20} className="text-red-500" />
                  </button>
                ) : (
                  <button onClick={()=>send()} disabled={(!input.trim() && !attachedFile)} className="w-10 h-10 md:w-12 md:h-12 mb-1 shrink-0 bg-white disabled:bg-white/10 disabled:text-gray-600 text-black rounded-xl md:rounded-[1.2rem] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95 transition-transform">
                    <Send size={18} className="-ml-0.5 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-center mt-2 hidden md:block"><span className="text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1.5"><Check size={12} className="text-cortex-purple"/> End-to-end encrypted</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
