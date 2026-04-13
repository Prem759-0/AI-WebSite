import { ChatBox } from "@/components/chat/chat-box";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#0b0b0f] text-white">
      <header className="w-full p-6 text-center border-b border-white/5">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Nexus
        </h1>
      </header>
      
      <section className="flex-1 w-full overflow-hidden flex flex-col">
        <ChatBox />
      </section>
    </main>
  );
}
