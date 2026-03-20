"use client";

import { Chapter, Course, Question, Unit } from '@prisma/client'
import React from 'react'
import ChapterCard, { ChapterCardHandler } from './ChapterCard'
import ManualChapterModal from './ManualChapterModal'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, BookOpen, Sparkles,
  CheckCircle2, ClipboardList, Info, Wrench,
  ChevronDown, Play, FileText, HelpCircle, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type ChapterWithQuestions = Chapter & { questions: Question[] }

type Props = {
  initialStep?: "generate" | "review";
  course: Course & {
    units: (Unit & {
      chapters: ChapterWithQuestions[]
    })[];
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type AlignmentStatus = "unchecked" | "aligned" | "partial" | "not-aligned";

const alignmentConfig: Record<AlignmentStatus, {
  color: string; border: string; bg: string;
}> = {
  unchecked:     { color: "text-slate-500",   border: "border-slate-700",      bg: "bg-slate-800/40" },
  aligned:       { color: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10" },
  partial:       { color: "text-amber-400",   border: "border-amber-500/40",   bg: "bg-amber-500/10" },
  "not-aligned": { color: "text-red-400",     border: "border-red-500/40",     bg: "bg-red-500/10" },
};

const ConfirmChapters = ({ course, initialStep = "generate" }: Props) => {
  const router = useRouter();

  // Step: "generate" | "review"
  const [step, setStep] = React.useState<"generate" | "review">(initialStep);
  const [loading, setLoading] = React.useState(false);
  const [alignments, setAlignments] = React.useState<Record<string, AlignmentStatus>>({});
  const [expandedChapterId, setExpandedChapterId] = React.useState<string | null>(null);
  const [manualModalChapterId, setManualModalChapterId] = React.useState<string | null>(null);
  const [manualCompleted, setManualCompleted] = React.useState<Set<string>>(new Set());
  const [completedChapters, setCompletedChapters] = React.useState<Set<String>>(new Set());

  // Live chapter data — updated after generation so previews show fresh content
  const [liveChapters, setLiveChapters] = React.useState<Record<string, ChapterWithQuestions>>(
    () => {
      const map: Record<string, ChapterWithQuestions> = {};
      course.units.flatMap(u => u.chapters).forEach(c => { map[c.id] = c; });
      return map;
    }
  );

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

  const totalChaptersCount = allChapters.length;

  const alignmentStats = React.useMemo(() => {
    const counts = { aligned: 0, partial: 0, "not-aligned": 0, unchecked: 0 };
    allChapters.forEach((c) => {
      const status = alignments[c.id] ?? "unchecked";
      counts[status]++;
    });
    return counts;
  }, [alignments, allChapters]);

  const allChecked = React.useMemo(
    () => allChapters.every((c) => alignments[c.id] && alignments[c.id] !== "unchecked"),
    [alignments, allChapters]
  );

  const manualChapters = React.useMemo(
    () => allChapters.filter((c) => alignments[c.id] === "not-aligned"),
    [alignments, allChapters]
  );

  const isAllManualDone = manualChapters.every((c) => manualCompleted.has(c.id));
  const generationComplete = completedChapters.size === totalChaptersCount;

  const setAlignment = (chapterId: string, status: AlignmentStatus) => {
    setAlignments((prev) => ({ ...prev, [chapterId]: status }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    for (const chapter of allChapters) {
      const ref = chapterRefs.current[chapter.id];
      ref?.current?.triggerLoad();
      await sleep(5000);
    }
    // After generation, refresh chapter data for previews
    router.refresh();
  };

  // When generation completes, move to review step automatically
  React.useEffect(() => {
    if (generationComplete && loading) {
      setLoading(false);
      setStep("review");
    }
  }, [generationComplete, loading]);

  const manualModalChapter = manualModalChapterId
    ? (liveChapters[manualModalChapterId] ?? allChapters.find((c) => c.id === manualModalChapterId) ?? null)
    : null;

  const progressPercent = totalChaptersCount > 0
    ? Math.round((completedChapters.size / totalChaptersCount) * 100)
    : 0;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Course Setup</h2>
          <p className="text-sm text-slate-500">
            Generate content first, then review curriculum alignment.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { num: 1, label: "Generate Content", done: generationComplete },
          { num: 2, label: "Review Alignment",  done: allChecked && generationComplete },
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                s.done
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : (i === 0 && step === "generate") || (i === 1 && step === "review")
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                  : "border-slate-700 text-slate-600 bg-slate-800"
              )}>
                {s.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={cn(
                "text-xs font-medium",
                s.done ? "text-emerald-400" :
                (i === 0 && step === "generate") || (i === 1 && step === "review")
                  ? "text-white" : "text-slate-600"
              )}>
                {s.label}
              </span>
            </div>
            {i === 0 && (
              <div className={cn("flex-1 h-px transition-colors",
                generationComplete ? "bg-emerald-500/50" : "bg-slate-800"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Generate Content ── */}
      {step === "generate" && (
        <div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-6">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300/80 leading-relaxed">
              Click <span className="font-semibold text-blue-200">Generate Content</span> to start. 
              The AI will generate a video, summary, and quiz for each chapter. 
              Once complete, you'll review and validate alignment with your curriculum.
            </p>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Generating content...</span>
                <span className="text-xs text-emerald-400 font-medium">
                  {completedChapters.size}/{totalChaptersCount} chapters
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Chapter cards */}
          <div className="space-y-6 mb-8">
            {course.units.map((unit, unitIndex) => (
              <div key={unit.id} className="bg-[#041123] border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    {unitIndex + 1}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Unit {unitIndex + 1}</p>
                    <h3 className="text-base font-semibold text-white leading-snug">{unit.name}</h3>
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
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>

            {generationComplete ? (
              <button
                onClick={() => setStep("review")}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
              >
                <ClipboardList className="w-4 h-4" />
                Review Alignment
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
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

      {/* ── STEP 2: Review Alignment ── */}
      {step === "review" && (
        <div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-6">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300/80 leading-relaxed">
              Review each chapter's generated content against your school syllabus. 
              Expand any chapter to preview its video, summary, and quiz. 
              Mark as <span className="text-emerald-400 font-medium">Aligned</span>, <span className="text-amber-400 font-medium">Partial</span>, or <span className="text-red-400 font-medium">Not Aligned</span>.
              Chapters marked <span className="text-red-400 font-medium">Not Aligned</span> can be rebuilt manually.
            </p>
          </div>

          {/* Stats */}
          {allChecked && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { key: "aligned",     label: "Aligned",          color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { key: "partial",     label: "Partial",          color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
                { key: "not-aligned", label: "Not Aligned",      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
              ].map((s) => (
                <div key={s.key} className={cn("rounded-lg border p-3 text-center", s.bg)}>
                  <p className={cn("text-2xl font-bold", s.color)}>{alignmentStats[s.key as AlignmentStatus]}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Not aligned notice */}
          {allChecked && alignmentStats["not-aligned"] > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300/80 leading-relaxed">
                <span className="font-semibold text-amber-300">
                  {alignmentStats["not-aligned"]} chapter{alignmentStats["not-aligned"] !== 1 ? "s" : ""} marked as Not Aligned.
                </span>{" "}
                Use the <span className="font-medium text-amber-300">Rebuild</span> button to replace their content using the Manual Builder.
              </p>
            </div>
          )}

          {/* Units + chapters with expand preview */}
          <div className="space-y-6 mb-8">
            {course.units.map((unit, unitIndex) => (
              <div key={unit.id} className="bg-[#041123] border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    {unitIndex + 1}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Unit {unitIndex + 1}</p>
                    <h3 className="text-base font-semibold text-white leading-snug">{unit.name}</h3>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  {unit.chapters.map((chapter, chapterIndex) => {
                    const status = alignments[chapter.id] ?? "unchecked";
                    const config = alignmentConfig[status];
                    const isExpanded = expandedChapterId === chapter.id;
                    const live = liveChapters[chapter.id] ?? chapter;
                    const isManualDone = manualCompleted.has(chapter.id);

                    return (
                      <div key={chapter.id} className={cn(
                        "rounded-lg border transition-all duration-200",
                        config.border, config.bg
                      )}>
                        {/* Chapter row */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="min-w-0 flex-1 mr-3">
                            <p className="text-xs text-slate-500 mb-0.5">Ch. {chapterIndex + 1}</p>
                            <p className={cn("text-sm font-medium leading-snug", config.color)}>
                              {chapter.name}
                            </p>
                            {status === "not-aligned" && isManualDone && (
                              <p className="text-xs text-emerald-400/80 mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Rebuilt manually
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Alignment buttons */}
                            <div className="flex items-center gap-1">
                              {(["aligned", "partial", "not-aligned"] as AlignmentStatus[]).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setAlignment(chapter.id, s)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-150",
                                    status === s
                                      ? s === "aligned" ? "bg-emerald-500 border-emerald-500 text-white"
                                        : s === "partial" ? "bg-amber-500 border-amber-500 text-white"
                                        : "bg-red-500 border-red-500 text-white"
                                      : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                                  )}
                                >
                                  {s === "aligned" ? "✓" : s === "partial" ? "~" : "✕"}
                                </button>
                              ))}
                            </div>

                            {/* Rebuild button for not-aligned */}
                            {status === "not-aligned" && !isManualDone && (
                              <button
                                onClick={() => setManualModalChapterId(chapter.id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
                              >
                                <Wrench className="w-3 h-3" />
                                Rebuild
                              </button>
                            )}

                            {/* Expand toggle */}
                            <button
                              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                              className="w-7 h-7 rounded-md border border-slate-700 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-all"
                            >
                              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isExpanded && "rotate-180")} />
                            </button>
                          </div>
                        </div>

                        {/* Expandable preview */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-3">

                            {/* Video */}
                            <div className="p-3 rounded-lg bg-[#020B18] border border-slate-800">
                              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Play className="w-3 h-3 text-red-400" />
                                Video
                              </p>
                              {live.videoId ? (
                                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                                  <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${live.videoId}`}
                                    title={chapter.name}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              ) : (
                                <p className="text-xs text-slate-600 italic">No video generated</p>
                              )}
                            </div>
                                                        {/* Summary */}
                            <div className="p-3 rounded-lg bg-[#020B18] border border-slate-800">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Summary</p>
                              </div>
                              {live.summary ? (
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                                  {live.summary}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-600 italic">No summary generated</p>
                              )}
                            </div>

                            {/* Quiz */}
                            <div className="p-3 rounded-lg bg-[#020B18] border border-slate-800">
                              <div className="flex items-center gap-2 mb-2">
                                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quiz</p>
                              </div>
                              {live.questions && live.questions.length > 0 ? (
                                <div className="space-y-1.5">
                                  {live.questions.slice(0, 3).map((q, qi) => (
                                    <p key={q.id} className="text-xs text-slate-400">
                                      <span className="text-slate-600">Q{qi + 1}.</span> {q.question}
                                    </p>
                                  ))}
                                  {live.questions.length > 3 && (
                                    <p className="text-xs text-slate-600">+{live.questions.length - 3} more questions</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-600 italic">No quiz questions generated</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={() => setStep("generate")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => router.push(`/course/${course.id}/0/0`)}
              disabled={!allChecked || !isAllManualDone}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-150",
                allChecked && isAllManualDone
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

      {/* ManualChapterModal */}
      {manualModalChapter && (
        <ManualChapterModal
          chapter={manualModalChapter}
          onClose={() => setManualModalChapterId(null)}
          onSaved={() => {
            setManualCompleted((prev) => new Set([...prev, manualModalChapter.id]));
            setManualModalChapterId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
};

export default ConfirmChapters;