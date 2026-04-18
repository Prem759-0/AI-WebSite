"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Cpu, Shield, Zap, Code, Image as ImageIcon, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white selection:bg-cortex-purple selection:text-white font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-gradient-to-br from-cortex-purple to-blue-500 p-1.5 rounded-xl shadow-[0_0_15px_rgba(168,127,251,0.3)]"><Sparkles size={18}/></div> 
            Cortex
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition">Sign In</Link>
            <Link href="/login" className="text-sm font-semibold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cortex-purple/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="w-48 h-48 md:w-64 md:h-64 mb-8 mix-blend-screen">
          <img src="/ai_logo_video.gif" alt="Cortex AI" className="w-full h-full object-contain scale-[1.2]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-cortex-purple mb-6 backdrop-blur-md">
          <Sparkles size={14} /> Introducing Cortex Advanced 2.0
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 max-w-4xl leading-[1.1]">
          Intelligence, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cortex-purple via-blue-400 to-cortex-purple animate-gradient-x">Evolved.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 font-medium">
          Experience the next generation of AI. Generate code, create stunning visuals, and analyze documents at lightning speed in a distraction-free workspace.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Start Chatting <ArrowRight size={18} />
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold flex items-center justify-center text-white border border-white/20 hover:bg-white/10 transition-all">
            View Features
          </a>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 bg-[#0d0d0f] border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group hover:border-cortex-purple/50 transition duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition duration-500" />
            <Code className="text-blue-400 mb-6" size={32} />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Advanced Developer Mode</h3>
            <p className="text-gray-400 leading-relaxed max-w-md">Equipped with specialized coding models to instantly write, debug, and explain complex software architectures with Mac-style code blocks.</p>
          </div>
          
          <div className="col-span-1 bg-[#0d0d0f] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:border-pink-500/50 transition duration-500">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-pink-500/20 transition duration-500" />
            <ImageIcon className="text-pink-400 mb-6" size={32} />
            <h3 className="text-2xl font-bold mb-4">Visual Generation</h3>
            <p className="text-gray-400 leading-relaxed">Turn your imagination into reality with integrated, high-fidelity image generation right inside your chat.</p>
          </div>

          <div className="col-span-1 bg-[#0d0d0f] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:border-green-500/50 transition duration-500">
            <div className="absolute top-1/2 right-0 w-40 h-40 bg-green-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-green-500/20 transition duration-500" />
            <Globe className="text-green-400 mb-6" size={32} />
            <h3 className="text-2xl font-bold mb-4">Real-Time Web</h3>
            <p className="text-gray-400 leading-relaxed">Toggle Web Search to give Cortex real-time access to live data, news, and internet research.</p>
          </div>

          <div className="col-span-1 md:col-span-2 bg-[#0d0d0f] border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group hover:border-cortex-purple/50 transition duration-500">
            <div className="absolute top-0 left-0 w-64 h-64 bg-cortex-purple/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cortex-purple/20 transition duration-500" />
            <Shield className="text-cortex-purple mb-6" size={32} />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Secure & Private</h3>
            <p className="text-gray-400 leading-relaxed max-w-md">Your conversations are end-to-end encrypted. We prioritize your data security with industry-leading JWT authentication and MongoDB encryption.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-cortex-purple/10 blur-[120px] pointer-events-none" />
        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight relative z-10">Ready to elevate your workflow?</h2>
        <Link href="/login" className="inline-flex bg-white text-black px-10 py-4 rounded-full font-bold items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-xl relative z-10">
          Get Started for Free
        </Link>
      </section>

    </div>
  );
}
