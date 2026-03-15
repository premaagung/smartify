"use client";

import React, { useState } from "react";
import { Chapter } from "@prisma/client";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  X, Search, Play, ChevronRight, ChevronLeft,
  Loader2, Sparkles, Plus, Trash2, CheckCircle2,
  FileText, HelpCircle, Youtube, AlertCircle
} from "lucide-react";

type VideoResult = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
};

type QuizQuestion = {
  id: string;
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
};

type Props = {
  chapter: Chapter;
  onClose: () => void;
  onSaved: () => void;
};

const STEPS = ["Video", "Summary", "Quiz", "Confirm"];

const ManualChapterModal = ({ chapter, onClose, onSaved }: Props) => {
  const [step, setStep] = useState(0);

  // Step 1 — Video
  const [searchQuery, setSearchQuery] = useState(chapter.youtubeSearchQuery || chapter.name);
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [searchError, setSearchError] = useState("");

  // Step 2 — Summary
  const [summary, setSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Step 3 — Quiz
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Step 4 — Save
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Search YouTube ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const { data } = await axios.get(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.videos);
      if (data.videos.length === 0) setSearchError("No videos found. Try a different search.");
    } catch {
      setSearchError("Search failed. Please check your YouTube API quota.");
    } finally {
      setSearching(false);
    }
  };

  // ── AI Summary ──
  const handleAISummary = async () => {
    if (!selectedVideo) return;
    setGeneratingSummary(true);
    setSummaryError("");
    try {
      const { data } = await axios.post("/api/chapter/summarizeVideo", {
        videoId: selectedVideo.videoId,
        chapterName: chapter.name,
      });
      setSummary(data.summary);
    } catch (e: any) {
      setSummaryError(e.response?.data?.error ?? "Failed to generate summary.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  // ── AI Quiz ──
  const handleAIQuiz = async () => {
    setGeneratingQuiz(true);
    setQuizError("");
    try {
      const { data } = await axios.post("/api/chapter/generateQuiz", {
        chapterName: chapter.name,
        summary,
      });
      const newQuestions: QuizQuestion[] = (data.questions ?? []).map((q: any, i: number) => ({
        id: `ai-${i}-${Date.now()}`,
        question: q.question,
        answer: q.answer,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
      }));
      setQuestions(newQuestions);
    } catch (e: any) {
      setQuizError(e.response?.data?.error ?? "Failed to generate quiz.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // ── Add/update/remove questions ──
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, question: "", answer: "", option1: "", option2: "", option3: "" },
    ]);
  };

  const updateQuestion = (id: string, field: keyof QuizQuestion, value: string) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // ── Save ──
  const handleSave = async () => {
    if (!selectedVideo) return;
    setSaving(true);
    setSaveError("");
    try {
      await axios.post("/api/chapter/saveManual", {
        chapterId: chapter.id,
        videoId: selectedVideo.videoId,
        summary,
        questions,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setSaveError(e.response?.data?.error ?? "Failed to save chapter.");
    } finally {
      setSaving(false);
    }
  };

  const canProceed = [
    !!selectedVideo,
    summary.trim().length > 0,
    true, // quiz is optional
    true,
  ][step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#041123] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-0.5">
              Manual Chapter Builder
            </p>
            <h2 className="text-base font-semibold text-white leading-snug truncate">
              {chapter.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all shrink-0 ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 py-4 border-b border-slate-800 shrink-0 gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                  i < step
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : i === step
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                    : "border-slate-700 text-slate-600 bg-slate-800/50"
                )}>
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  i === step ? "text-white" : i < step ? "text-emerald-400" : "text-slate-600"
                )}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-px transition-colors",
                  i < step ? "bg-emerald-500/50" : "bg-slate-800"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Step 1: Video ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                  Search YouTube
                </label>
                <div className="flex gap-2">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search for a video..."
                    className="flex-1 bg-[#020B18] border border-slate-700 text-white placeholder:text-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>
                {searchError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {searchError}
                  </p>
                )}
              </div>

              {/* Selected video preview */}
              {selectedVideo && (
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected Video
                  </p>
                  <div className="flex gap-3">
                    <img src={selectedVideo.thumbnail} alt="" className="w-24 h-14 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white leading-snug line-clamp-2">{selectedVideo.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{selectedVideo.channelTitle}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search results */}
              {searchResults.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {searchResults.length} results — click to select
                  </p>
                  <div className="space-y-2">
                    {searchResults.map((video) => (
                      <button
                        key={video.videoId}
                        onClick={() => setSelectedVideo(video)}
                        className={cn(
                          "w-full flex gap-3 p-3 rounded-lg border text-left transition-all duration-150",
                          selectedVideo?.videoId === video.videoId
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-800/40"
                        )}
                      >
                        <div className="relative shrink-0">
                          <img src={video.thumbnail} alt="" className="w-24 h-14 rounded-md object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                              <Play className="w-3 h-3 text-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white leading-snug line-clamp-2 mb-1">
                            {video.title}
                          </p>
                          <p className="text-xs text-slate-500">{video.channelTitle}</p>
                        </div>
                        {selectedVideo?.videoId === video.videoId && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && !searching && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Youtube className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-sm text-slate-600">Search for a YouTube video to get started</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Summary ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-0.5">
                    Chapter Summary
                  </label>
                  <p className="text-xs text-slate-600">Write a summary or let AI generate one from the chapter topic.</p>
                </div>
                <button
                  onClick={handleAISummary}
                  disabled={generatingSummary}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {generatingSummary
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                  {generatingSummary ? "Generating..." : "AI Summarize"}
                </button>
              </div>

              {summaryError && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {summaryError}
                </p>
              )}

              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a concise educational summary of this chapter..."
                rows={10}
                className="w-full bg-[#020B18] border border-slate-700 text-white placeholder:text-slate-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors resize-none leading-relaxed"
              />
              <p className="text-xs text-slate-600 text-right">{summary.length} characters</p>
            </div>
          )}

          {/* ── Step 3: Quiz ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-0.5">
                    Quiz Questions
                  </label>
                  <p className="text-xs text-slate-600">Add questions manually or let AI generate them. Quiz is optional.</p>
                </div>
                <button
                  onClick={handleAIQuiz}
                  disabled={generatingQuiz}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {generatingQuiz
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                  {generatingQuiz ? "Generating..." : "AI Generate"}
                </button>
              </div>

              {quizError && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {quizError}
                </p>
              )}

              <div className="space-y-4">
                {questions.map((q, qi) => (
                  <div key={q.id} className="bg-[#020B18] border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        Question {qi + 1}
                      </span>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                      placeholder="Question text..."
                      className="w-full bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/60 mb-3 transition-colors"
                    />

                    <div className="space-y-2">
                      {(["answer", "option1", "option2", "option3"] as const).map((field, fi) => (
                        <div key={field} className="flex items-center gap-2">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                            field === "answer"
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                              : "bg-slate-800 border border-slate-700 text-slate-500"
                          )}>
                            {field === "answer" ? "✓" : fi}
                          </span>
                          <input
                            value={q[field]}
                            onChange={(e) => updateQuestion(q.id, field, e.target.value)}
                            placeholder={field === "answer" ? "Correct answer..." : `Wrong option ${fi}...`}
                            className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/60 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addQuestion}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/5 text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>

              {questions.length === 0 && (
                <div className="flex flex-col items-center py-6 text-center">
                  <HelpCircle className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-600">No questions yet. Add manually or use AI Generate.</p>
                  <p className="text-xs text-slate-700 mt-1">Quiz is optional — you can skip this step.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-sm text-slate-400">Review everything before saving to the course.</p>

              {/* Video */}
              <div className="bg-[#020B18] border border-slate-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-400" /> Video
                </p>
                {selectedVideo && (
                  <div className="flex gap-3">
                    <img src={selectedVideo.thumbnail} alt="" className="w-24 h-14 rounded-lg object-cover shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white leading-snug">{selectedVideo.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{selectedVideo.channelTitle}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-[#020B18] border border-slate-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Summary
                </p>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">
                  {summary || <span className="text-slate-600 italic">No summary written.</span>}
                </p>
              </div>

              {/* Quiz */}
              <div className="bg-[#020B18] border border-slate-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Quiz
                </p>
                {questions.length === 0 ? (
                  <p className="text-sm text-slate-600 italic">No questions — quiz skipped.</p>
                ) : (
                  <div className="space-y-2">
                    {questions.map((q, i) => (
                      <div key={q.id} className="flex items-start gap-2">
                        <span className="text-xs text-slate-600 shrink-0 mt-0.5">Q{i + 1}.</span>
                        <p className="text-sm text-slate-400 line-clamp-1">{q.question || <span className="italic text-slate-600">Empty question</span>}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {saveError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {saveError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 shrink-0">
          <button
            onClick={() => step === 0 ? onClose() : setStep(step - 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-lg transition-all",
                canProceed
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              )}
            >
              Next: {STEPS[step + 1]}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Chapter"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualChapterModal;