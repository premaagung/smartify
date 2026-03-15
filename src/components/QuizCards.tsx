"use client";
import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Chapter, Question } from "@prisma/client";
import { ChevronRight, CheckCircle2, XCircle, RotateCcw, Loader2, Trophy } from "lucide-react";
import axios from "axios";

type Props = {
  chapter: Chapter & {
    questions: Question[];
  };
  onComplete?: () => void;
};

type PreviousResult = {
  score: number;
  total: number;
  updatedAt: string;
} | null;

const QuizCards = ({ chapter, onComplete }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionState, setQuestionState] = useState<Record<string, boolean | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previousResult, setPreviousResult] = useState<PreviousResult>(null);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(true);

  useEffect(() => {
    const fetchPreviousResult = async () => {
      try {
        const { data } = await axios.get(`/api/chapter/quizResult/${chapter.id}`);
        setPreviousResult(data.result);
      } catch {
        // No previous result
      } finally {
        setIsLoadingPrevious(false);
      }
    };
    fetchPreviousResult();
  }, [chapter.id]);

  const checkAnswer = useCallback(async () => {
    const newQuestionState = { ...questionState };
    chapter.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;
      newQuestionState[question.id] = userAnswer === question.answer;
    });
    setQuestionState(newQuestionState);
    setIsSubmitted(true);

    const correctCount = Object.values(newQuestionState).filter(Boolean).length;

    setIsSaving(true);
    try {
      await axios.post("/api/chapter/completeChapter", {
        chapterId: chapter.id,
        score: correctCount,
        total: chapter.questions.length,
      });
      setPreviousResult({
        score: correctCount,
        total: chapter.questions.length,
        updatedAt: new Date().toISOString(),
      });
      onComplete?.();
    } catch (error) {
      console.error("Failed to save chapter progress:", error);
    } finally {
      setIsSaving(false);
    }
  }, [answers, questionState, chapter.questions, chapter.id, onComplete]);

  const reset = () => {
    setAnswers({});
    setQuestionState({});
    setIsSubmitted(false);
  };

  const correctCount = Object.values(questionState).filter(Boolean).length;
  const totalAnswered = Object.keys(answers).length;
  const scorePercent = isSubmitted
    ? Math.round((correctCount / chapter.questions.length) * 100)
    : null;
  const prevScorePercent = previousResult
    ? Math.round((previousResult.score / previousResult.total) * 100)
    : null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Concept Check</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {chapter.questions.length} questions · Test your understanding
          </p>
        </div>
        {isSubmitted && (
          <button onClick={reset} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>

      {!isSubmitted && !isLoadingPrevious && previousResult && prevScorePercent !== null && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-700 bg-slate-800/40 mb-5">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-300">
                Previous attempt: {previousResult.score}/{previousResult.total} correct
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(previousResult.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <span className={cn("text-lg font-black", prevScorePercent >= 80 ? "text-emerald-400" : prevScorePercent >= 60 ? "text-amber-400" : "text-red-400")}>
            {prevScorePercent}%
          </span>
        </div>
      )}

      {isSubmitted && scorePercent !== null && (
        <div className={cn("flex items-center justify-between p-4 rounded-xl border mb-6",
          scorePercent >= 80 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : scorePercent >= 60 ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
          : "bg-red-500/10 border-red-500/30 text-red-300")}>
          <div>
            <p className="font-semibold text-lg">{correctCount}/{chapter.questions.length} correct</p>
            <p className="text-sm opacity-80">
              {isSaving ? (
                <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />Saving progress…</span>
              ) : scorePercent >= 80 ? "Excellent! You've mastered this chapter."
                : scorePercent >= 60 ? "Good effort! Review the incorrect answers."
                : "Keep studying and try again."}
            </p>
          </div>
          <div className="text-3xl font-black">{scorePercent}%</div>
        </div>
      )}

      <div className="space-y-5">
        {chapter.questions.map((question, qi) => {
          const options = JSON.parse(question.options) as string[];
          const isAnswered = questionState[question.id] !== undefined && questionState[question.id] !== null;
          const isCorrect = questionState[question.id] === true;
          const selected = answers[question.id];

          return (
            <div key={question.id} className={cn("bg-[#041123] rounded-xl border p-5 transition-colors duration-200",
              isAnswered ? isCorrect ? "border-emerald-500/40" : "border-red-500/30" : "border-slate-800")}>
              <div className="flex items-start gap-3 mb-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">
                  {qi + 1}
                </span>
                <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white leading-relaxed">{question.question}</p>
                  {isAnswered && (isCorrect
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-400 shrink-0" />)}
                </div>
              </div>
              <div className="space-y-2 pl-9">
                {options.map((option, index) => {
                  const isSelected = selected === option;
                  const isAnswer = option === question.answer;
                  let style = "border-slate-700 text-slate-400 hover:border-emerald-500/40 hover:text-slate-200 hover:bg-slate-800/50 cursor-pointer";
                  let indicator = <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />;

                  if (isAnswered) {
                    if (isAnswer) {
                      style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 cursor-default";
                      indicator = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                    } else if (isSelected && !isAnswer) {
                      style = "border-red-500/40 bg-red-500/10 text-red-300 cursor-default";
                      indicator = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
                    } else {
                      style = "border-slate-800 text-slate-600 cursor-default";
                    }
                  } else if (isSelected) {
                    style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 cursor-pointer";
                    indicator = <div className="w-4 h-4 rounded-full border-2 border-emerald-400 bg-emerald-400 shrink-0" />;
                  }

                  return (
                    <button key={index}
                      onClick={() => {
                        if (isAnswered) {
                          setQuestionState((prev) => ({ ...prev, [question.id]: null }));
                          setIsSubmitted(false);
                        }
                        setAnswers((prev) => ({ ...prev, [question.id]: option }));
                      }}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all duration-150", style)}>
                      {indicator}
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <button onClick={checkAnswer} disabled={totalAnswered < chapter.questions.length}
          className={cn("mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-150",
            totalAnswered >= chapter.questions.length
              ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
              : "bg-slate-800 text-slate-600 cursor-not-allowed")}>
          Check Answers <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default QuizCards;