import { ChatBox } from "@/components/chat/chat-box";

export default function Home() {
  return (
    <main className="flex h-screen flex-col bg-transparent overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full -z-10" />

      <header className="flex items-center justify-between px-8 py-4 glass-card border-x-0 border-t-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="text-xl font-bold tracking-tight">AI Nexus</span>
        </div>
        <div className="flex gap-4">
          <div className="text-xs px-3 py-1 glass-card rounded-full border-white/5 text-white/60">
            Model: Gemma 4
          </div>
        </div>
      </header>
      
      <section className="flex-1 overflow-hidden">
        <ChatBox />
      </section>
    </main>
  );
}
