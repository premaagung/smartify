"use client";

import { cn } from '@/lib/utils';
import { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import { useToast } from './ui/use-toast';
import { Loader2, CheckCircle2, XCircle, Circle, Sparkles, PenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ManualChapterModal from './ManualChapterModal';

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  completedChapters: Set<String>;
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<String>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  ({ chapter, chapterIndex, setCompletedChapters, completedChapters }, ref) => {
    const { toast } = useToast();
    const router = useRouter();
    const [success, setSuccess] = React.useState<boolean | null>(null);
    const [showManual, setShowManual] = useState(false);
    const [mode, setMode] = useState<"ai" | "manual" | null>(null);

    const { mutate: getChapterInfo, isPending } = useMutation({
      mutationFn: async () => {
        const response = await axios.post(`/api/chapter/getInfo`, {
          chapterId: chapter.id,
        });
        return response.data;
      },
    });

    const addChapterIdToSet = React.useCallback(() => {
      setCompletedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(chapter.id);
        return newSet;
      });
    }, [chapter.id, setCompletedChapters]);

    React.useEffect(() => {
      if (chapter.videoId) {
        setSuccess(true);
        addChapterIdToSet();
      }
    }, [chapter, addChapterIdToSet]);

    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        if (chapter.videoId) {
          addChapterIdToSet();
          return;
        }
        // Default to AI if triggerLoad called (from sequential generate)
        setMode("ai");
        getChapterInfo(undefined, {
          onSuccess: () => {
            setSuccess(true);
            addChapterIdToSet();
            router.refresh();
          },
          onError: (error) => {
            console.error(error);
            setSuccess(false);
            toast({
              title: "Error",
              description: "There was an error loading your chapter",
              variant: "destructive",
            });
            addChapterIdToSet();
          },
        });
      },
    }));

    const handleManualSaved = () => {
      setSuccess(true);
      setMode("manual");
      addChapterIdToSet();
      router.refresh();
    };

    const handleAI = () => {
      if (chapter.videoId || isPending) return;
      setMode("ai");
      getChapterInfo(undefined, {
        onSuccess: () => {
          setSuccess(true);
          addChapterIdToSet();
          router.refresh();
        },
        onError: () => {
          setSuccess(false);
          toast({
            title: "Error",
            description: "AI generation failed. Try manual instead.",
            variant: "destructive",
          });
          addChapterIdToSet();
        },
      });
    };

    const isDone = success === true;
    const isFailed = success === false;

    return (
      <>
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200",
          isDone   && "bg-emerald-500/10 border-emerald-500/30",
          isFailed && "bg-red-500/10 border-red-500/30",
          !isDone && !isFailed && "bg-slate-900/50 border-slate-800"
        )}>
          {/* Left — status + name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
            ) : isDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isFailed ? (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-700 shrink-0" />
            )}

            <div className="min-w-0">
              <span className="text-xs text-slate-500 mr-1.5">Ch. {chapterIndex + 1}</span>
              <span className={cn(
                "text-sm",
                isDone ? "text-emerald-300" : isFailed ? "text-red-300" : "text-slate-300"
              )}>
                {chapter.name}
              </span>
              {isDone && mode && (
                <span className={cn(
                  "ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                  mode === "ai"
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : "text-blue-400 border-blue-500/30 bg-blue-500/10"
                )}>
                  {mode === "ai" ? "AI" : "Manual"}
                </span>
              )}
            </div>
          </div>

          {/* Right — action buttons (only show if not done) */}
          {!isDone && !isPending && (
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={handleAI}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-3 h-3" />
                AI
              </button>
              <button
                onClick={() => setShowManual(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-all"
              >
                <PenLine className="w-3 h-3" />
                Manual
              </button>
            </div>
          )}

          {/* Status label when done */}
          {isDone && (
            <span className="text-xs font-medium text-emerald-400 shrink-0 ml-3">Done</span>
          )}
          {isFailed && !isPending && (
            <span className="text-xs font-medium text-red-400 shrink-0 ml-3">Failed</span>
          )}
          {isPending && (
            <span className="text-xs font-medium text-emerald-400 shrink-0 ml-3">Loading...</span>
          )}
        </div>

        {/* Manual modal */}
        {showManual && (
          <ManualChapterModal
            chapter={chapter}
            onClose={() => setShowManual(false)}
            onSaved={handleManualSaved}
          />
        )}
      </>
    );
  }
);

ChapterCard.displayName = "ChapterCard";

export default ChapterCard;