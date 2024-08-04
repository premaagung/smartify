"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseSideBar from "@/components/CourseSideBar";
import MainVideoSummary from "@/components/MainVideoSummary";
import QuizCards from "@/components/QuizCards";

type CoursePageClientProps = {
  course: any; // Replace 'any' with the actual course type
  unit: any; // Replace 'any' with the actual unit type
  chapter: any; // Replace 'any' with the actual chapter type
  chapterIndex: number;
  unitIndex: number;
  nextChapter: any | null; // Replace 'any' with the actual chapter type
  prevChapter: any | null; // Replace 'any' with the actual chapter type
};

const CoursePageClient: React.FC<CoursePageClientProps> = ({ 
  course, 
  unit, 
  chapter, 
  chapterIndex, 
  unitIndex, 
  nextChapter, 
  prevChapter 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typically the breakpoint for md in Tailwind
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      {isMobile ? (
        <div
          className={`
            fixed inset-y-0 left-0 w-[300px] lg:w-[400px] bg-secondary z-40
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            transition-transform duration-200 ease-in-out
            overflow-y-auto
          `}
        >
          <CourseSideBar course={course} currentChapterId={chapter.id} />
        </div>
      ) : (
        <div className="hidden md:block w-[300px] lg:w-[400px]">
          <CourseSideBar course={course} currentChapterId={chapter.id} />
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 px-4 md:px-8 ${isMobile ? 'pt-20' : 'pt-0'}`}>
        {isMobile && (
          <Button 
            className="fixed top-1/2 -translate-y-1/2 right-0 z-50 md:hidden bg-secondary hover:bg-secondary-hover text-secondary-foreground h-12 w-12 rounded-md flex items-center justify-center"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        <div className="flex flex-col gap-4">
          <MainVideoSummary
            chapter={chapter}
            chapterIndex={chapterIndex}
            unit={unit}
            unitIndex={unitIndex}
          />
          <div className="flex-1">
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

export default CoursePageClient;
