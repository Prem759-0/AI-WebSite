"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
export default function Landing() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="cortex-orb mb-12 animate-[pulse_4s_ease-in-out_infinite]" />
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
        Meet <span className="text-cortex-purple">Cortex</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10">
        Your intelligent, context-aware AI assistant. Designed for speed, precision, and beautiful interactions.
      </motion.p>
      <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onClick={() => router.push("/login")} className="bg-black text-white px-8 py-4 rounded-full font-medium text-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-xl">
        Get Started <ArrowRight size={20} />
      </motion.button>
    </div>
  );
}
