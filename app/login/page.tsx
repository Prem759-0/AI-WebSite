"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: isLogin ? "login" : "signup", email, password, name }) });
    const data = await res.json();
    if (res.ok) { localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user)); router.push("/chat"); }
    else alert(data.error);
  };
  return (
    <div className="h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="w-12 h-12 bg-cortex-purple/10 text-cortex-purple rounded-xl flex items-center justify-center mb-6"><Sparkles size={24} /></div>
        <h2 className="text-2xl font-bold mb-6">{isLogin ? "Sign in to Cortex" : "Create Account"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && <input required type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cortex-purple" />}
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cortex-purple" />
          <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cortex-purple" />
          <button type="submit" className="w-full bg-black text-white rounded-xl py-3 font-medium hover:bg-gray-800 transition">{isLogin ? "Continue" : "Sign Up"}</button>
        </form>
        <p className="text-sm text-gray-500 mt-6 text-center cursor-pointer" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}</p>
      </div>
    </div>
  );
}
