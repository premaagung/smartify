import { cn } from "@/lib/utils";
import { Chapter, Course, Unit } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { BookOpen, CheckCircle2, Circle } from "lucide-react";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  currentChapterId: string;
  completedChapterIds: string[];
  completedCount: number;
  totalChapters: number;
};

const CourseSideBar = ({
  course,
  currentChapterId,
  completedChapterIds,
  completedCount,
  totalChapters,
}: Props) => {
  const completedSet = new Set(completedChapterIds);
  const progressPercent =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  return (
    <div className="fixed top-0 bottom-0 left-0 w-[280px] lg:w-[320px] bg-[#041123] border-r border-slate-800 overflow-y-auto flex flex-col">

      {/* Course title header */}
      <div className="sticky top-0 z-20 bg-[#041123] border-b border-slate-800 px-5 py-5 pt-20">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
              Course
            </p>
            <h1 className="text-sm font-semibold text-white leading-snug line-clamp-2">
              {course.name}
            </h1>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Progress
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {completedCount}/{totalChapters}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {completedCount === totalChapters && totalChapters > 0 && (
            <p className="text-[10px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Course complete!
            </p>
          )}
        </div>
      </div>

      {/* Units & chapters */}
      <div className="flex-1 py-4 px-3">
        {course.units.map((unit, unitIndex) => (
          <div key={unit.id} className="mb-6">

            {/* Unit header */}
            <div className="px-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                  {unitIndex + 1}
                </span>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest truncate">
                  {unit.name}
                </p>
              </div>
            </div>

            {/* Chapters */}
            <div className="ml-3 border-l border-slate-800 pl-3 space-y-0.5">
              {unit.chapters.map((chapter, chapterIndex) => {
                const isActive = chapter.id === currentChapterId;
                const isCompleted = completedSet.has(chapter.id);

                return (
                  <Link
                    key={chapter.id}
                    href={`/course/${course.id}/${unitIndex}/${chapterIndex}`}
                    className={cn(
                      "flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                      isActive
                        ? "bg-emerald-500/15 border border-emerald-500/30"
                        : "hover:bg-slate-800/60 border border-transparent"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        className={cn(
                          "w-3.5 h-3.5 mt-0.5 shrink-0",
                          isActive ? "text-emerald-400" : "text-emerald-600"
                        )}
                      />
                    ) : (
                      <Circle
                        className={cn(
                          "w-3.5 h-3.5 mt-0.5 shrink-0",
                          isActive ? "text-emerald-400" : "text-slate-700"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "text-xs leading-snug",
                        isActive
                          ? "text-emerald-300 font-medium"
                          : isCompleted
                          ? "text-slate-400 group-hover:text-slate-200"
                          : "text-slate-500 group-hover:text-slate-300"
                      )}
                    >
                      {chapter.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSideBar;