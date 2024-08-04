import { cn } from "@/lib/utils";
import { Chapter, Course, Unit } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { Separator } from "./ui/separator";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  currentChapterId: string;
};

const CourseSideBar = ({ course, currentChapterId }: Props) => {
  return (
    <div className="fixed top-0 bottom-0 left-0 w-[300px] lg:w-[400px] bg-secondary shadow-lg overflow-y-auto">
      {/* Fixed top section for the course title */}
      <div className="sticky top-0 bg-secondary py-4 pt-12 z-20">
        <h1 className="text-4xl font-bold text-dark">{course.name}</h1>
        <Separator className="mt-2 text-gray-500 bg-gray-500" />
      </div>
      <div className="mt-6 px-4">
        {course.units.map((unit, unitIndex) => (
          <div key={unit.id} className="mt-6">
            <h2 className="text-sm uppercase text-secondary-foreground/70 mb-2">
              Unit {unitIndex + 1}
            </h2>
            <h3 className="text-xl font-semibold text-dark">{unit.name}</h3>
            {unit.chapters.map((chapter) => (
              <div key={chapter.id} className="mt-2">
                <Link
                  href={`/course/${course.id}/${unitIndex}/${unit.chapters.indexOf(chapter)}`}
                  className={cn("block text-base py-1 px-2 rounded hover:bg-secondary-hover", {
                    "text-green-400 font-semibold": chapter.id === currentChapterId,
                    "text-secondary-foreground/70": chapter.id !== currentChapterId,
                  })}
                >
                  {chapter.name}
                </Link>
              </div>
            ))}
            <Separator className="mt-2 text-gray-500 bg-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSideBar;
