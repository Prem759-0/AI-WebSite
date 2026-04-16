"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Compass, Book, Folder, Clock, MoreHorizontal, Link, Download, Globe, Settings, Mic, Paperclip, Send, Loader2, Image as ImageIcon, Lightbulb, Sparkles, LogOut, PanelLeftClose, PanelLeft, Copy, Check, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant", content: string };
type ChatInfo = { _id: string, title: string, updatedAt: string };

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
  const [view, setView] = useState<"chat"|"settings"|"profile"|"explore">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const t = getToken();
    if (!t) return router.push("/login");
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    fetch("/api/chat", { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json()).then(d => Array.isArray(d) && setChats(d));
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [router]);

  useEffect(() => {
    if (activeId) fetch(`/api/chat/${activeId}`).then(r => r.json()).then(d => setMessages(d.messages || []));
    else setMessages([]);
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const newChat = () => { setActiveId(null); setMessages([]); setView("chat"); if (window.innerWidth < 768) setSidebarOpen(false); };

  const handleCopy = (text: string, i: number) => { navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 2000); };
  
  const speak = (text: string) => { const u = new SpeechSynthesisUtterance(text.replace(/[*#]/g, "")); window.speechSynthesis.speak(u); };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Voice not supported");
    const r = new SR();
    r.onresult = (e: any) => setInput(e.results[0][0].transcript);
    r.start();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setInput(`Context from file ${f.name}:\n${ev.target?.result}\n\n`);
    r.readAsText(f);
  };

  const send = async (mode: "text" | "image" = "text", forcedInput?: string) => {
    const txt = forcedInput || input;
    if (!txt.trim() || loading) return;
    
    let cId: string = activeId as string;
    
    if (!activeId) {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ title: txt.substring(0, 30) }) });
      const n = await res.json();
      cId = n._id as string;
      setActiveId(cId);
      setChats([{ _id: cId, title: n.title, updatedAt: new Date().toISOString() }, ...chats]);
    }

    const cur = [...messages, { role: "user" as const, content: txt }];
    setMessages(cur); setInput(""); setLoading(true);

    try {
      if (mode === "image") {
        setMessages([...cur, { role: "assistant", content: "" }]);
        const res = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: txt }) });
        const d = await res.json();
        const aiMsg = { role: "assistant" as const, content: `![Gen](${d.url})` };
        setMessages([...cur, aiMsg]);
        await fetch(`/api/chat/${cId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...cur, aiMsg] }) });
      } else {
        const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: cur }) });
        const reader = res.body?.getReader();
        
        // FIX: Explicitly check if reader exists to satisfy TypeScript strict null checks
        if (!reader) throw new Error("Failed to read response stream.");
        
        const decoder = new TextDecoder();
        setMessages([...cur, { role: "assistant", content: "" }]);
        let full = "";
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          full += decoder.decode(value, { stream: true });
          setMessages([...cur, { role: "assistant", content: full }]);
        }
        await fetch(`/api/chat/${cId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...cur, { role: "assistant", content: full }] }) });
      }
    } catch (e: any) { setMessages([...cur, { role: "assistant", content: `❌ Error: ${e.message}` }]); } 
    finally { setLoading(false); }
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-screen w-full bg-cortex-border p-2 md:p-4 flex gap-4 overflow-hidden">
      
      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", bounce: 0, duration: 0.3 }} 
            className={`w-[260px] bg-cortex-light rounded-2xl flex flex-col shrink-0 z-50 fixed md:relative h-[calc(100vh-1rem)] md:h-full border border-gray-200 shadow-xl md:shadow-none`}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cortex-purple font-semibold text-lg"><div className="bg-cortex-purple/10 p-1.5 rounded-lg"><Sparkles size={18}/></div> Cortex</div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500"><PanelLeftClose size={20}/></button>
            </div>
            
            <div className="px-4 mb-4">
              <button onClick={newChat} className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-black transition"><Plus size={16}/> New chat</button>
            </div>

            <div className="px-4 mb-4 relative">
              <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none focus:border-cortex-purple" />
            </div>

            <nav className="px-3 space-y-0.5 mb-4">
              {[{i:<Compass size={16}/>,l:"Explore",v:"explore"}, {i:<Book size={16}/>,l:"Library",v:"chat"}, {i:<Folder size={16}/>,l:"Files",v:"chat"}].map(n => (
                <button key={n.l} onClick={()=>setView(n.v as any)} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition ${view===n.v ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"}`}>{n.i} {n.l}</button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">History</p>
              {filteredChats.map(c => (
                <div key={c._id} onClick={() => {setActiveId(c._id); setView("chat"); if(window.innerWidth<768) setSidebarOpen(false);}} 
                  className={`truncate text-[13px] py-2 px-2.5 rounded-lg cursor-pointer transition mb-0.5 ${activeId === c._id && view==="chat" ? "bg-cortex-purple/10 text-cortex-purple font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
                  {c.title}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 mt-auto">
              <div onClick={()=>setView("profile")} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-gray-100 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm">{user.name[0]}</div>
                  <div className="flex flex-col"><span className="text-sm font-semibold text-gray-800">{user.name}</span><span className="text-[10px] text-gray-500 truncate w-24">{user.email}</span></div>
                </div>
                <button onClick={(e)=>{e.stopPropagation(); localStorage.clear(); router.push("/login");}} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><LogOut size={16}/></button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <main className="flex-1 bg-white rounded-2xl md:rounded-[1.5rem] shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
        
        <header className="h-14 flex items-center justify-between px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><PanelLeft size={20}/></button>}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 bg-white"><div className="w-4 h-4 bg-cortex-purple/20 text-cortex-purple rounded flex items-center justify-center"><Plus size={10}/></div> {view === "chat" ? "Cortex" : view}</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setView("settings")} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg hidden sm:block"><Settings size={18}/></button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 hidden sm:flex"><Download size={14}/> Export</button>
            <button className="bg-black text-white px-4 py-1.5 rounded-lg text-sm font-medium">Upgrade</button>
          </div>
        </header>

        {view !== "chat" ? (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 capitalize">{view}</h2>
            {view === "settings" && <div className="max-w-md space-y-4"><div className="p-4 border rounded-xl flex justify-between items-center"><span className="font-medium">Dark Mode</span><input type="checkbox" className="toggle"/></div><div className="p-4 border rounded-xl flex justify-between items-center"><span className="font-medium">Auto-save chats</span><input type="checkbox" defaultChecked className="toggle"/></div></div>}
            {view === "profile" && <div className="max-w-md p-6 border rounded-2xl text-center"><div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">{user.name[0]}</div><h3 className="font-bold text-xl">{user.name}</h3><p className="text-gray-500">{user.email}</p><button className="mt-4 w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Edit Profile</button></div>}
            {view === "explore" && <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-6 border rounded-2xl hover:border-cortex-purple cursor-pointer"><Lightbulb className="mb-3 text-yellow-500"/><h3 className="font-bold">Write Code</h3><p className="text-sm text-gray-500 mt-1">Generate functional React components instantly.</p></div><div className="p-6 border rounded-2xl hover:border-cortex-purple cursor-pointer"><ImageIcon className="mb-3 text-cortex-purple"/><h3 className="font-bold">Image Gen</h3><p className="text-sm text-gray-500 mt-1">Create stunning visuals from text.</p></div></div>}
          </div>
        ) : (
          <div className="flex-1 flex flex-col relative h-[calc(100%-3.5rem)]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar pb-32">
              {messages.length === 0 ? (
                <div className="max-w-2xl mx-auto flex flex-col items-center mt-4 md:mt-12 text-center">
                  <div className="cortex-orb mb-8 animate-[pulse_4s_ease-in-out_infinite]" />
                  <h1 className="text-3xl md:text-4xl font-medium text-cortex-purple tracking-tight mb-2">Hello, {user.name.split(" ")[0]}</h1>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-10">How can I assist you today?</h2>

                  <div className="w-full bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-[1.5rem] p-4 text-left">
                    <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask me anything..." className="w-full resize-none outline-none text-[15px] bg-transparent min-h-[60px] placeholder:text-gray-400" />
                    
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                      <div className="flex gap-1.5 items-center">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cortex-purple/20 bg-cortex-purple/5 text-cortex-purple text-xs font-semibold hover:bg-cortex-purple/10"><Compass size={14}/> Deeper Research</button>
                        <button onClick={()=>send("image")} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ImageIcon size={16}/></button>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button onClick={handleVoice} className="w-7 h-7 rounded-full bg-cortex-purple/10 text-cortex-purple flex items-center justify-center hover:bg-cortex-purple/20"><Mic size={14}/></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"><Sparkles size={14} className="text-cortex-purple"/> Saved prompts</span>
                      <div className="flex gap-2 items-center">
                        <input type="file" id="fileup" className="hidden" accept=".txt,.md" onChange={handleFile} />
                        <label htmlFor="fileup" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold hover:bg-gray-50 cursor-pointer"><Paperclip size={14}/> Attach file</label>
                        <button onClick={()=>send()} disabled={loading||!input.trim()} className="bg-black disabled:bg-gray-300 text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-gray-800">{loading?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>} Send</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-6">
                    {[{i:<Clock size={16}/>,t:"Synthesize Data",d:"Turn notes into 5 bullets."},{i:<Lightbulb size={16}/>,t:"Brainstorm",d:"3 taglines for fashion brand."},{i:<Compass size={16}/>,t:"Check Facts",d:"GDPR vs CCPA differences."}].map((c,i)=>(
                      <div key={i} onClick={()=>send("text",c.d)} className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-cortex-purple cursor-pointer shadow-sm group">
                        <div className="text-gray-400 mb-2 group-hover:text-cortex-purple">{c.i}</div>
                        <div className="font-semibold text-[13px]">{c.t}</div>
                        <div className="text-[11px] text-gray-500 leading-tight mt-1">{c.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((m, i) => (
                    <motion.div key={i} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className={`flex ${m.role==="user"?"justify-end":"justify-start"} group`}>
                      {m.role==="assistant" && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cortex-purple to-purple-400 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm"><Sparkles size={14} className="text-white"/></div>}
                      <div className={`relative max-w-[85%] ${m.role==="user" ? "bg-gray-100 text-gray-900 rounded-2xl rounded-tr-sm px-5 py-3" : "bg-transparent text-gray-900 w-full"}`}>
                        {m.content==="" && m.role==="assistant" ? <Loader2 size={18} className="animate-spin text-cortex-purple my-2" /> : m.content.startsWith("![") ? (
                          <img src={m.content.match(/\((.*?)\)/)?.[1]} alt="Gen" className="rounded-xl w-full max-w-md shadow-md border" />
                        ) : (
                          <ReactMarkdown className="markdown-body text-[15px] leading-relaxed">{m.content}</ReactMarkdown>
                        )}
                        {m.role==="assistant" && m.content!=="" && (
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={()=>handleCopy(m.content,i)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md">{copied===i?<Check size={14} className="text-green-500"/>:<Copy size={14}/>}</button>
                            <button onClick={()=>speak(m.content)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"><Volume2 size={14}/></button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {loading && messages[messages.length-1].role==="user" && <div className="flex justify-start items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-cortex-purple to-purple-400 flex items-center justify-center"><Sparkles size={14} className="text-white"/></div><span className="w-2 h-2 bg-cortex-purple rounded-full animate-bounce"/><span className="w-2 h-2 bg-cortex-purple rounded-full animate-bounce" style={{animationDelay:"0.2s"}}/><span className="w-2 h-2 bg-cortex-purple rounded-full animate-bounce" style={{animationDelay:"0.4s"}}/></div>}
                </div>
              )}
            </div>

            {/* Sticky Input for active chat */}
            {messages.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20">
                <div className="bg-white border border-gray-200 shadow-[0_5px_20px_rgba(0,0,0,0.08)] rounded-2xl p-1.5 flex items-end gap-2">
                  <div className="flex flex-col flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition">
                    <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask me anything..." className="w-full bg-transparent resize-none outline-none text-[14px] min-h-[40px] max-h-32 custom-scrollbar" />
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={handleVoice} className="text-gray-400 hover:text-gray-700"><Mic size={14}/></button>
                      <button onClick={()=>send("image")} className="text-gray-400 hover:text-gray-700"><ImageIcon size={14}/></button>
                    </div>
                  </div>
                  <button onClick={()=>send()} disabled={loading||!input.trim()} className="w-10 h-10 mb-1 shrink-0 bg-black disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition shadow-md">{loading?<Loader2 size={16} className="animate-spin"/>:<Send size={16}/>}</button>
                </div>
                <div className="text-center mt-2"><span className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1"><Check size={10}/> Auto-saved</span></div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
