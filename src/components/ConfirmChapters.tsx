"use client";

import { Chapter, Course, Unit } from '@prisma/client'
import React from 'react'
import ChapterCard, { ChapterCardHandler } from './ChapterCard'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, BookOpen, Sparkles,
  CheckCircle2, ClipboardList, AlertCircle, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[]
    })[];
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Alignment states per chapter
type AlignmentStatus = "unchecked" | "aligned" | "partial" | "not-aligned";

const alignmentConfig: Record<AlignmentStatus, {
  label: string;
  color: string;
  border: string;
  bg: string;
}> = {
  unchecked:   { label: "Unchecked",   color: "text-slate-500",   border: "border-slate-700",        bg: "bg-slate-800/40" },
  aligned:     { label: "Aligned",     color: "text-emerald-400", border: "border-emerald-500/40",   bg: "bg-emerald-500/10" },
  partial:     { label: "Partial",     color: "text-amber-400",   border: "border-amber-500/40",     bg: "bg-amber-500/10" },
  "not-aligned": { label: "Not Aligned", color: "text-red-400",   border: "border-red-500/40",       bg: "bg-red-500/10" },
};

const ConfirmChapters = ({ course }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [alignmentChecked, setAlignmentChecked] = React.useState(false);

  // Alignment state per chapter id
  const [alignments, setAlignments] = React.useState<Record<string, AlignmentStatus>>({});

  const allChapters = React.useMemo(
    () => course.units.flatMap((unit) => unit.chapters),
    [course.units]
  );

  const chapterRefs = React.useRef<Record<string, React.RefObject<ChapterCardHandler>>>({});
  allChapters.forEach((chapter) => {
    if (!chapterRefs.current[chapter.id]) {
      chapterRefs.current[chapter.id] = React.createRef<ChapterCardHandler>();
    }
  });

  const [completedChapters, setCompletedChapters] = React.useState<Set<String>>(new Set());

  const totalChaptersCount = React.useMemo(
    () => course.units.reduce((acc, unit) => acc + unit.chapters.length, 0),
    [course.units]
  );

  // Alignment stats
  const alignmentStats = React.useMemo(() => {
    const counts = { aligned: 0, partial: 0, "not-aligned": 0, unchecked: 0 };
    allChapters.forEach((c) => {
      const status = alignments[c.id] ?? "unchecked";
      counts[status]++;
    });
    return counts;
  }, [alignments, allChapters]);

  // All chapters must be at least "partial" to unlock Generate
  const allAtLeastPartial = React.useMemo(() => {
    return allChapters.every((c) => {
      const s = alignments[c.id];
      return s === "aligned" || s === "partial";
    });
  }, [alignments, allChapters]);

  const allChecked = React.useMemo(() => {
    return allChapters.every((c) => alignments[c.id] && alignments[c.id] !== "unchecked");
  }, [alignments, allChapters]);

  const setAlignment = (chapterId: string, status: AlignmentStatus) => {
    setAlignments((prev) => ({ ...prev, [chapterId]: status }));
  };

  const handleConfirmAlignment = () => {
    setAlignmentChecked(true);
  };

  const handleGenerate = async () => {
    setLoading(true);
    for (const chapter of allChapters) {
      const ref = chapterRefs.current[chapter.id];
      ref?.current?.triggerLoad();
      await sleep(5000);
    }
  };

  const isComplete = totalChaptersCount === completedChapters.size;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Confirm Course Chapters</h2>
          <p className="text-sm text-slate-500">
            Review chapters against your school syllabus before generating content.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { num: 1, label: "Check Alignment", done: alignmentChecked },
          { num: 2, label: "Generate Content", done: isComplete },
        ].map((step, i) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                step.done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : i === 0 && !alignmentChecked || i === 1 && alignmentChecked
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                  : "border-slate-700 text-slate-600 bg-slate-800"
              )}>
                {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.num}
              </div>
              <span className={cn(
                "text-xs font-medium",
                step.done ? "text-emerald-400" :
                i === 0 && !alignmentChecked || i === 1 && alignmentChecked
                  ? "text-white" : "text-slate-600"
              )}>
                {step.label}
              </span>
            </div>
            {i === 0 && (
              <div className={cn(
                "flex-1 h-px transition-colors",
                alignmentChecked ? "bg-emerald-500/50" : "bg-slate-800"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Alignment Review ── */}
      {!alignmentChecked && (
        <div>
          {/* Instruction banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-6">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300/80 leading-relaxed">
              Review each chapter against your school syllabus using your external resources.
              Mark each chapter as <span className="text-emerald-400 font-medium">Aligned</span>, <span className="text-amber-400 font-medium">Partial</span>, or <span className="text-red-400 font-medium">Not Aligned</span>.
              All chapters must be at least <span className="text-amber-400 font-medium">Partial</span> before you can generate content.
            </p>
          </div>

          {/* Alignment stats summary */}
          {allChecked && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { key: "aligned",     label: "Aligned",     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { key: "partial",     label: "Partial",     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
                { key: "not-aligned", label: "Not Aligned", color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
              ].map((s) => (
                <div key={s.key} className={cn("rounded-lg border p-3 text-center", s.bg)}>
                  <p className={cn("text-2xl font-bold", s.color)}>
                    {alignmentStats[s.key as AlignmentStatus]}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Units + chapters with alignment controls */}
          <div className="space-y-6 mb-8">
            {course.units.map((unit, unitIndex) => (
              <div key={unit.id} className="bg-[#041123] border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    {unitIndex + 1}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                      Unit {unitIndex + 1}
                    </p>
                    <h3 className="text-base font-semibold text-white leading-snug">
                      {unit.name}
                    </h3>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  {unit.chapters.map((chapter, chapterIndex) => {
                    const status = alignments[chapter.id] ?? "unchecked";
                    const config = alignmentConfig[status];

                    return (
                      <div
                        key={chapter.id}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-150",
                          config.border, config.bg
                        )}
                      >
                        {/* Chapter info */}
                        <div className="min-w-0 flex-1 mr-4">
                          <p className="text-xs text-slate-500 mb-0.5">Ch. {chapterIndex + 1}</p>
                          <p className={cn("text-sm font-medium leading-snug", config.color)}>
                            {chapter.name}
                          </p>
                        </div>

                        {/* Alignment buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(["aligned", "partial", "not-aligned"] as AlignmentStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => setAlignment(chapter.id, s)}
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-150",
                                status === s
                                  ? s === "aligned"
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : s === "partial"
                                    ? "bg-amber-500 border-amber-500 text-white"
                                    : "bg-red-500 border-red-500 text-white"
                                  : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                              )}
                            >
                              {s === "aligned" ? "✓" : s === "partial" ? "~" : "✕"}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Not aligned warning */}
          {allChecked && !allAtLeastPartial && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300/80 leading-relaxed">
                <span className="font-semibold text-red-300">
                  {alignmentStats["not-aligned"]} chapter{alignmentStats["not-aligned"] !== 1 ? "s" : ""} marked as Not Aligned.
                </span>{" "}
                All chapters must be at least Partial before you can proceed. Please review and update the alignment status or revise your course structure.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>

            <button
              onClick={handleConfirmAlignment}
              disabled={!allChecked || !allAtLeastPartial}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-150",
                allChecked && allAtLeastPartial
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              )}
            >
              <ClipboardList className="w-4 h-4" />
              Confirm Alignment
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Generate Content ── */}
      {alignmentChecked && (
        <div>
          {/* Alignment confirmed banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300/80">
              <span className="font-semibold text-emerald-300">Alignment confirmed.</span>{" "}
              {alignmentStats.aligned} aligned · {alignmentStats.partial} partial.
              You can now generate course content.
            </p>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Generating content...</span>
                <span className="text-xs text-emerald-400 font-medium">
                  {completedChapters.size}/{totalChaptersCount}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedChapters.size / totalChaptersCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Units + chapters (generation mode) */}
          <div className="space-y-6">
            {course.units.map((unit, unitIndex) => (
              <div key={unit.id} className="bg-[#041123] border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    {unitIndex + 1}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                      Unit {unitIndex + 1}
                    </p>
                    <h3 className="text-base font-semibold text-white leading-snug">
                      {unit.name}
                    </h3>
                  </div>
                  {/* Show alignment badge on unit */}
                  <div className="ml-auto flex items-center gap-1">
                    {unit.chapters.map((c) => {
                      const s = alignments[c.id];
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            s === "aligned" ? "bg-emerald-500" :
                            s === "partial" ? "bg-amber-500" : "bg-slate-700"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  {unit.chapters.map((chapter, chapterIndex) => (
                    <ChapterCard
                      key={chapter.id}
                      completedChapters={completedChapters}
                      setCompletedChapters={setCompletedChapters}
                      ref={chapterRefs.current[chapter.id]}
                      chapter={chapter}
                      chapterIndex={chapterIndex}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => setAlignmentChecked(false)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Alignment
            </button>

            {isComplete ? (
              <Link
                href={`/course/${course.id}/0/0`}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save & Continue
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleGenerate}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-150",
                  loading
                    ? "bg-emerald-600/40 text-white/50 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                )}
              >
                <Sparkles className={cn("w-4 h-4", loading && "animate-pulse")} />
                {loading ? "Generating..." : "Generate Content"}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmChapters;