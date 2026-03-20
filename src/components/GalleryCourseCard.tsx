"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chapter, Course, Unit } from "@prisma/client";
import { BookOpen, ChevronRight, Clock, Trash2, AlertTriangle, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  completedChapterIds?: string[];
};

const GalleryCourseCard = ({ course, completedChapterIds = [] }: Props) => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/course/${course.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete course:", error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col bg-[#041123] border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1">

        {/* Edit button — top left, appears on hover */}
        <Link
          href={`/create/${course.id}?mode=edit`}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/60 transition-all duration-150 opacity-0 group-hover:opacity-100"
          title="Edit course"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Link>

        {/* Delete button — top right, appears on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition-all duration-150 opacity-0 group-hover:opacity-100"
          title="Delete course"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <Link href={`/course/${course.id}/0/0`} className="flex flex-col flex-1">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 drop-shadow-md">
                {course.name}
              </h3>
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white/90 font-medium">
              {course.units.length} unit{course.units.length !== 1 ? "s" : ""}
            </div>
            {isComplete && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-md text-xs text-white font-semibold">
                ✓ Complete
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4">
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

            {hasStarted && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Progress</span>
                  <span className={cn("text-[10px] font-bold", isComplete ? "text-emerald-400" : "text-slate-400")}>
                    {completedCount}/{totalChapters} chapters
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", isComplete ? "bg-emerald-400" : "bg-emerald-600")}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

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
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setShowConfirm(false)}
        >
          <div
            className="bg-[#041123] border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete Course?</h3>
            <p className="text-sm text-slate-400 text-center mb-1">
              <span className="text-white font-medium">{course.name}</span>
            </p>
            <p className="text-xs text-slate-500 text-center mb-6">
              This will permanently delete the course, all chapters, quizzes, and progress data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-400 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryCourseCard;