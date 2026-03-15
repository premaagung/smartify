"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Rocket, Users, Cpu,
  Play, X, CheckCircle, Star, Zap, Facebook,
  Twitter, Linkedin, Instagram, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type ContinueData = {
  courseId: string;
  courseName: string;
  courseImage: string;
  completedCount: number;
  totalChapters: number;
  percent: number;
  isComplete: boolean;
  continueUnitIndex: number;
  continueChapterIndex: number;
} | null;

type Props = {
  continueData: ContinueData;
};

export default function HomeClient({ continueData }: Props) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#020B18] text-white">
      <main className="flex-grow">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative min-h-[92vh] flex items-center overflow-hidden">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[140px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/4 blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.6) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(16,185,129,0.6) 1px, transparent 1px)`,
                backgroundSize: "64px 64px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8">
                <Zap className="w-3.5 h-3.5" />
                AI-Powered Learning Platform
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Learn Smarter,{" "}
                <span className="text-emerald-400">Grow Faster</span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
                Unlock your potential with AI-generated courses on any topic — complete with videos, summaries, and quizzes, created in seconds.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center">
                    <Play className="w-3 h-3 ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Continue Learning card — only shown if user has progress */}
              {continueData && (
                <div className="mt-8">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                    Continue where you left off
                  </p>
                  <Link
                    href={
                      continueData.isComplete
                        ? `/course/${continueData.courseId}/0/0`
                        : `/course/${continueData.courseId}/${continueData.continueUnitIndex}/${continueData.continueChapterIndex}`
                    }
                    className="group flex items-center gap-4 p-4 rounded-xl border border-slate-700/60 bg-[#041123]/80 hover:border-emerald-500/40 hover:bg-[#041123] transition-all duration-200 max-w-sm"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                      {continueData.courseImage ? (
                        <Image
                          src={continueData.courseImage}
                          alt={continueData.courseName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-emerald-500/50" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug line-clamp-1 mb-1">
                        {continueData.courseName}
                      </p>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              continueData.isComplete ? "bg-emerald-400" : "bg-emerald-600"
                            )}
                            style={{ width: `${continueData.percent}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold shrink-0",
                          continueData.isComplete ? "text-emerald-400" : "text-slate-500"
                        )}>
                          {continueData.completedCount}/{continueData.totalChapters}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {continueData.isComplete ? "Course complete · Review anytime" : `${continueData.percent}% complete`}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 mt-12 pt-8 border-t border-slate-800">
                {[
                  { value: "10k+", label: "Courses Created" },
                  { value: "50+", label: "Topics Covered" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
                <div className="w-px h-10 bg-slate-800" />
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right — mock course card */}
            <div className="relative lg:pl-6">
              <div className="relative bg-[#041123] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-[#020B18]">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-xs text-slate-500 font-mono">smartify.app/course</span>
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Unit 1 · Chapter 2
                  </span>
                  <h3 className="text-base font-semibold text-white mt-3 mb-4">
                    Machine Learning Fundamentals
                  </h3>
                  <div className="relative rounded-lg overflow-hidden bg-slate-800 aspect-video mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900/60" />
                    <div className="w-12 h-12 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {[100, 80, 60].map((w, i) => (
                      <div key={i} className="h-2 bg-slate-700 rounded-full" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="border border-emerald-500/20 rounded-lg p-3 bg-emerald-500/5">
                    <div className="text-xs text-emerald-400 font-medium mb-2">Concept Check</div>
                    {["A", "B", "C"].map((opt, i) => (
                      <div key={opt} className={`flex items-center gap-2 py-1.5 px-2 rounded-md mb-1 ${i === 1 ? "bg-emerald-500/20 border border-emerald-500/30" : ""}`}>
                        <div className={`w-3 h-3 rounded-full border ${i === 1 ? "border-emerald-400 bg-emerald-400" : "border-slate-600"}`} />
                        <div className={`h-2 rounded-full ${i === 1 ? "bg-emerald-400/50" : "bg-slate-700"} w-${i === 0 ? "20" : i === 1 ? "28" : "16"}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/40">
                ✨ AI Generated
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section className="py-24 bg-[#041123]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Why Choose Smartify AI</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to master any topic — powered by AI.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BookOpen, title: "Expert Content", desc: "AI-curated chapters based on the best educational material available." },
                { icon: Users, title: "Interactive Quizzes", desc: "Auto-generated concept checks to test your understanding after each chapter." },
                { icon: Rocket, title: "Career-Ready Skills", desc: "Build practical knowledge in topics that matter for your career." },
                { icon: Cpu, title: "AI-Powered Paths", desc: "Personalized course structure generated from your chosen topic and units." },
              ].map((f) => (
                <div key={f.title} className="group p-6 rounded-xl border border-slate-800 bg-[#020B18] hover:border-emerald-500/40 hover:bg-[#041123] transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-4 group-hover:bg-emerald-500/25 transition-colors">
                    <f.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How Smartify AI Works</h2>
              <p className="text-slate-400 text-lg">Four steps from idea to mastery</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Sign Up", desc: "Create your account and set your learning goals." },
                { step: "02", title: "Create a Course", desc: "Enter a topic and units — AI generates the full course structure." },
                { step: "03", title: "Learn & Practice", desc: "Watch curated videos and test yourself with concept checks." },
                { step: "04", title: "Track Progress", desc: "See your completed chapters and monitor growth over time." },
              ].map((item, i) => (
                <div key={item.step} className="relative p-6 rounded-xl border border-slate-800 bg-[#041123] hover:border-emerald-500/30 transition-colors">
                  {i < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-6 h-px bg-gradient-to-r from-emerald-500/40 to-transparent z-10" />
                  )}
                  <div className="text-3xl font-black text-emerald-500/20 mb-4 font-mono">{item.step}</div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────── */}
        <section className="py-24 bg-[#041123]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">What Our Learners Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "John Doe", role: "Software Developer", text: "Smartify AI has transformed how I approach learning. The personalized curriculum and AI-guided sessions have accelerated my growth tremendously." },
                { name: "Jane Smith", role: "Data Scientist", text: "The quality of courses and the interactive experience are unparalleled. It's been instrumental in advancing my career in data science." },
                { name: "Emily Johnson", role: "UX Designer", text: "I love how Smartify adapts to my learning pace. The project-based approach helped me build an impressive portfolio alongside new skills." },
              ].map((r) => (
                <div key={r.name} className="p-6 rounded-xl border border-slate-800 bg-[#020B18] hover:border-emerald-500/20 transition-colors">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="p-12 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Accelerate Your Learning?
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Join thousands of learners already mastering new skills with Smartify AI.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/25"
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white font-semibold rounded-lg transition-all"
                >
                  Create a Course
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-slate-500">
                {["Free to get started", "No credit card required", "Cancel anytime"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-[#041123] border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">Smartify</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Empowering learners worldwide with AI-driven education.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {["Courses", "Create Course", "Settings"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-emerald-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {["Terms of Service", "Privacy Policy"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-emerald-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
              <div className="flex gap-3">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-600">
            © {new Date().getFullYear()} Smartify AI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ── Video Modal ──────────────────────────────────── */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#041123] border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <span className="text-sm font-medium text-slate-300">Demo Video</span>
              <button
                onClick={() => setShowVideo(false)}
                className="w-7 h-7 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Smartify Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}