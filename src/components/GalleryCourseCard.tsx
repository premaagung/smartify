import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Chapter, Course, Unit } from "@prisma/client";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  completedChapterIds?: string[];
};

const GalleryCourseCard = ({ course, completedChapterIds = [] }: Props) => {
  const totalChapters = course.units.reduce(
    (acc, unit) => acc + unit.chapters.length,
    0
  );

  const completedSet = new Set(completedChapterIds);
  const completedCount = course.units
    .flatMap((u) => u.chapters)
    .filter((c) => completedSet.has(c.id)).length;

  const progressPercent =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  const hasStarted = completedCount > 0;
  const isComplete = completedCount === totalChapters && totalChapters > 0;

  return (
    <Link
      href={`/course/${course.id}/0/0`}
      className="group flex flex-col bg-[#041123] border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-800 overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={`Cover image for ${course.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-emerald-500/40" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Course name badge over image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 drop-shadow-md">
            {course.name}
          </h3>
        </div>

        {/* Unit count pill */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white/90 font-medium">
          {course.units.length} unit{course.units.length !== 1 ? "s" : ""}
        </div>

        {/* Completed badge */}
        {isComplete && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-md text-xs text-white font-semibold">
            ✓ Complete
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Unit list */}
        <ul className="flex-1 space-y-1.5 mb-4">
          {course.units.slice(0, 4).map((unit, unitIndex) => (
            <li key={unit.id} className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                {unitIndex + 1}
              </span>
              <span className="text-xs text-slate-500 leading-snug line-clamp-1 group-hover:text-slate-400 transition-colors">
                {unit.name}
              </span>
            </li>
          ))}
          {course.units.length > 4 && (
            <li className="text-xs text-slate-600 pl-6">
              +{course.units.length - 4} more units
            </li>
          )}
        </ul>

        {/* Progress bar — only shown if user has started */}
        {hasStarted && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                Progress
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isComplete ? "text-emerald-400" : "text-slate-400"
                )}
              >
                {completedCount}/{totalChapters} chapters
              </span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isComplete ? "bg-emerald-400" : "bg-emerald-600"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5" />
            {totalChapters} chapter{totalChapters !== 1 ? "s" : ""}
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 group-hover:text-emerald-400 transition-colors">
            {hasStarted && !isComplete ? "Continue" : isComplete ? "Review" : "Start Learning"}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GalleryCourseCard;