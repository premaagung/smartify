// src/components/AuthForm.tsx
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  BookOpen, Mail, Lock, User, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle2, Chrome
} from "lucide-react";

type Mode = "login" | "register";

const AuthForm = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetForm();
  };

  // Password strength indicator
  const passwordStrength = () => {
    if (password.length === 0) return null;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-emerald-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = mode === "register" ? passwordStrength() : null;

  // ── Handle email/password submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "register") {
        // Register new account
        await axios.post("/api/auth/register", { name, email, password });

        // Auto sign-in after registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Account created but sign-in failed. Please log in manually.");
          switchMode("login");
          return;
        }

        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => router.push("/gallery"), 1000);
      } else {
        // Login
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        router.push("/gallery");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Google sign-in ──
  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: "/gallery" });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Smartify</h1>
        <p className="text-sm text-slate-500 mt-1">AI-powered learning platform</p>
      </div>

      {/* Card */}
      <div className="bg-[#041123] border border-slate-800 rounded-2xl p-8 shadow-2xl">

        {/* Tab toggle */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-150",
                mode === m
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-red-500/20 bg-red-500/10 mb-5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-300">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name — register only */}
          {mode === "register" && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  disabled={loading}
                  className="w-full bg-[#020B18] border border-slate-700 text-white placeholder:text-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full bg-[#020B18] border border-slate-700 text-white placeholder:text-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Min. 8 characters" : "Your password"}
                required
                disabled={loading}
                className="w-full bg-[#020B18] border border-slate-700 text-white placeholder:text-slate-600 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {mode === "register" && strength && (
              <div className="mt-2">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-300", strength.color, strength.width)} />
                </div>
                <p className={cn("text-xs mt-1", strength.color.replace("bg-", "text-"))}>
                  {strength.label} password
                </p>
              </div>
            )}

            {/* Password requirements for register */}
            {mode === "register" && password.length > 0 && (
              <div className="mt-2 space-y-1">
                {[
                  { check: password.length >= 8, label: "At least 8 characters" },
                  { check: /[A-Z]/.test(password), label: "One uppercase letter" },
                  { check: /[0-9]/.test(password), label: "One number" },
                ].map((req) => (
                  <div key={req.label} className={cn("flex items-center gap-1.5 text-xs", req.check ? "text-emerald-400" : "text-slate-600")}>
                    <CheckCircle2 className={cn("w-3 h-3", req.check ? "text-emerald-400" : "text-slate-700")} />
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all duration-150 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
              : mode === "login" ? "Sign In" : "Create Account"
            }
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-600 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-700 hover:border-slate-600 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )
          }
          Continue with Google
        </button>

        {/* Footer note */}
        <p className="text-xs text-slate-600 text-center mt-5 leading-relaxed">
          {mode === "register"
            ? "By creating an account you agree to our terms. New accounts are assigned Student role by default."
            : "Don't have an account? "
          }
          {mode === "login" && (
            <button onClick={() => switchMode("register")} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign up here
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;