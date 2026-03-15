import ConfirmChapters from "@/components/ConfirmChapters";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Info, BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    courseId: string;
  };
};

const CreateChapters = async ({ params: { courseId } }: Props) => {
  const session = await getAuthSession();
  
  if (!session?.user) {
    return redirect("/gallery");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  });

  if (!course) {
    return redirect("/create");
  }

  return (
    <div className="min-h-screen bg-[#020B18] text-white py-20 px-6 font-sans">
      <div className="flex flex-col items-start max-w-3xl mx-auto">
        
        {/* ── Header Section ──────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4 uppercase tracking-wider shadow-sm">
          <BookOpen className="w-3.5 h-3.5" />
          Review Curriculum
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-8 text-slate-100">
          {course.name}
        </h1>

        {/* ── Info Alert ──────────────────────────────────── */}
        <div className="flex items-start p-5 mb-10 border border-blue-500/20 bg-blue-500/10 rounded-xl w-full shadow-lg shadow-blue-500/5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mr-4 mt-0.5">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-100 mb-1">
              AI Generation Complete
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              We generated chapters for each of your units based on your topic. 
              Review the structure below, and click confirm when you are ready to continue.
            </p>
          </div>
        </div>

        {/* ── Client Component Wrapper ────────────────────── */}
        <div className="w-full bg-[#041123] border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl">
          <ConfirmChapters course={course} />
        </div>
        
      </div>
    </div>
  );
};

export default CreateChapters;