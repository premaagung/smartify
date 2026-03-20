import ConfirmChapters from "@/components/ConfirmChapters";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Info, BookOpen, Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: { courseId: string };
  searchParams: { mode?: string };
};

const CreateChapters = async ({ params: { courseId }, searchParams }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) return redirect("/gallery");

  const isEditMode = searchParams.mode === "edit";

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      units: {
        include: {
          chapters: {
            include: { questions: true },
          },
        },
      },
    },
  });

  if (!course) return redirect("/create");

  return (
    <div className="min-h-screen bg-[#020B18] text-white py-20 px-6 font-sans">
      <div className="flex flex-col items-start max-w-3xl mx-auto">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4 uppercase tracking-wider shadow-sm">
          {isEditMode ? <Pencil className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
          {isEditMode ? "Edit Course" : "Course Setup"}
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-8 text-slate-100">
          {course.name}
        </h1>

        <div className="flex items-start p-5 mb-10 border border-blue-500/20 bg-blue-500/10 rounded-xl w-full shadow-lg shadow-blue-500/5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mr-4 mt-0.5">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-100 mb-1">
              {isEditMode ? "Edit & Review Course" : "Two Steps to Launch"}
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {isEditMode
                ? "Review each chapter's content and validate alignment with your curriculum. Expand any chapter to preview its video, summary, and quiz. Rebuild chapters that are not aligned using the Manual Builder."
                : "First, generate AI content for all chapters. Then review each chapter and validate alignment with your curriculum before the course goes live."}
            </p>
          </div>
        </div>

        <div className="w-full bg-[#041123] border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl">
          <ConfirmChapters course={course} initialStep={isEditMode ? "review" : "generate"} />
        </div>

      </div>
    </div>
  );
};

export default CreateChapters;