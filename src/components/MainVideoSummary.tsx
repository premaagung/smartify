import React from "react";
import { Chapter, Unit } from "@prisma/client";
import { BookOpen, FileText } from "lucide-react";

type Props = {
  chapter: Chapter;
  unit: Unit;
  unitIndex: number;
  chapterIndex: number;
};

const MainVideoSummary = ({
  unit,
  unitIndex,
  chapter,
  chapterIndex,
}: Props) => {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400">
            Unit {unitIndex + 1} · Chapter {chapterIndex + 1}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-xs font-medium text-emerald-400">
            {unit.name}
          </span>
        </div>
      </div>

      {/* Chapter title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug tracking-tight">
        {chapter.name}
      </h1>

      {/* Video embed */}
      {chapter.videoId ? (
        <div className="relative pt-[56.25%] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40">
          <iframe
            title={`Video for ${chapter.name}`}
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${chapter.videoId}`}
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative pt-[56.25%] rounded-xl overflow-hidden border border-slate-800 bg-[#041123]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
            <div className="w-14 h-14 rounded-full border-2 border-slate-700 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-slate-700 border-b-[8px] border-b-transparent ml-1" />
            </div>
            <p className="text-sm">Video not available</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {chapter.summary && (
        <div className="bg-[#041123] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Summary</h2>
          </div>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {chapter.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default MainVideoSummary;