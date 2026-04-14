"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isLogin ? "login" : "signup", email, password }),
    });
    if (res.ok) router.push("/");
    else alert("Authentication failed");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c10]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl w-full max-w-md">
        <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold transition flex justify-center mt-2">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>
        <p className="text-center text-sm text-white/40 mt-6 cursor-pointer hover:text-white" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </p>
      </motion.div>
    </div>
  );
}
