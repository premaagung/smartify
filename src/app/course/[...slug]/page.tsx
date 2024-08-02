import CourseSideBar from "@/components/CourseSideBar";
import MainVideoSummary from "@/components/MainVideoSummary";
import QuizCards from "@/components/QuizCards";
import { prisma } from "@/lib/db";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    slug: string[];
  };
};

const CoursePage = async ({ params: { slug } }: Props) => {
  const [courseId, unitIndexParam, chapterIndexParam] = slug;
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
  if (!course) {
    return redirect("/gallery");
  }
  let unitIndex = parseInt(unitIndexParam);
  let chapterIndex = parseInt(chapterIndexParam);

  const unit = course.units[unitIndex];
  if (!unit) {
    return redirect("/gallery");
  }
  const chapter = unit.chapters[chapterIndex];
  if (!chapter) {
    return redirect("/gallery");
  }
  const nextChapter = unit.chapters[chapterIndex + 1];
  const prevChapter = unit.chapters[chapterIndex - 1];
  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar hidden on mobile screens */}
      <div className="hidden md:block md:w-[300px] lg:w-[400px]">
        <CourseSideBar course={course} currentChapterId={chapter.id} />
      </div>
      <div className="flex-1 px-4 md:px-8">
        <div className="flex flex-col gap-4">
          <MainVideoSummary
            chapter={chapter}
            chapterIndex={chapterIndex}
            unit={unit}
            unitIndex={unitIndex}
          />
          <div className="flex-1 px-4 md:px-8">
            <QuizCards chapter={chapter} />
          </div>
        </div>

        <div className="flex-[1] h-[1px] mt-4 text-gray-500 bg-gray-500" />
        <div className="flex flex-col sm:flex-row justify-between pb-8">
          {prevChapter && (
            <Link
              href={`/course/${course.id}/${unitIndex}/${chapterIndex - 1}`}
              className="flex mt-4 w-full sm:w-fit"
            >
              <div className="flex items-center">
                <ChevronLeft className="w-6 h-6 mr-1" />
                <div className="flex flex-col items-start">
                  <span className="text-sm text-secondary-foreground/60">
                    Previous
                  </span>
                  <span className="text-xl font-bold">
                    {prevChapter.name}
                  </span>
                </div>
              </div>
            </Link>
          )}

          {nextChapter && (
            <Link
              href={`/course/${course.id}/${unitIndex}/${chapterIndex + 1}`}
              className="flex mt-4 w-full sm:w-fit sm:ml-auto"
            >
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-secondary-foreground/60">
                    Next
                  </span>
                  <span className="text-xl font-bold">
                    {nextChapter.name}
                  </span>
                </div>
                <ChevronRight className="w-6 h-6 ml-1" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
