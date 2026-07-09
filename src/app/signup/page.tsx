"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MapPin, Loader2, Compass, Camera } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/utils";

type Role = "EXPLORER" | "CREATOR";

const ROLES = [
  {
    value: "EXPLORER" as Role,
    icon: Compass,
    emoji: "🧭",
    title: "Explorer",
    desc: "Discover & save hidden gems",
    color: "border-zinc-700 bg-zinc-800 text-zinc-300",
    activeColor: "border-white bg-white/10 text-white",
  },
  {
    value: "CREATOR" as Role,
    icon: Camera,
    emoji: "🎬",
    title: "Creator",
    desc: "Upload & share your stories",
    color: "border-zinc-700 bg-zinc-800 text-zinc-300",
    activeColor: "border-white bg-white/10 text-white",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    role: "EXPLORER" as Role,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      login(data.data.user);
      // Route by role
      if (data.data.user.role === "CREATOR") router.push("/creator/dashboard");
      else router.push("/");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all";

  return (
    <div className="min-h-dvh bg-black overflow-y-auto">
      <div className="flex flex-col items-center px-6 pt-16 pb-12">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-2xl shadow-white/10">
          <MapPin className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Join Karnataka</h1>
        <p className="text-sm text-zinc-500 mb-7">Create your free account</p>

        {error && (
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">

          {/* Role picker */}
          <div>
            <label className="text-xs font-black text-zinc-500 tracking-wide mb-2 block">I WANT TO</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ value, icon: Icon, emoji, title, desc, color, activeColor }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center",
                    form.role === value ? activeColor : "bg-zinc-900 border-zinc-800"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl",
                    form.role === value ? color : "bg-zinc-800"
                  )}>
                    {emoji}
                  </div>
                  <div>
                    <p className={cn("text-sm font-black",
                      form.role === value ? "text-white" : "text-zinc-400"
                    )}>
                      {title}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-zinc-500 tracking-wide mb-1.5 block">FULL NAME</label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="Arjun Sharma"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="text-xs font-black text-zinc-500 tracking-wide mb-1.5 block">EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="text-xs font-black text-zinc-500 tracking-wide mb-1.5 block">PASSWORD</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 chars · uppercase + number"
                className={inputCls + " pr-12"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 p-1"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-zinc-500 tracking-wide mb-1.5 block">CONFIRM PASSWORD</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repeat your password"
              className={inputCls}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 active:scale-[0.98] text-black font-black py-4 rounded-2xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              : "Create account"
            }
          </button>
        </form>

        <p className="text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-black hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}