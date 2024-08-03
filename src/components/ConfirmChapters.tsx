"use client";

import { Chapter, Course, Unit } from '@prisma/client'
import React from 'react'
import ChapterCard, { ChapterCardHandler } from './ChapterCard'
import { Separator } from "./ui/separator";
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Props = {
    course: Course & {
        units: (Unit & {
            chapters: Chapter[]
        })[];
    };
};

const ConfirmChapters = ({course}: Props) => {
    const [loading, setLoading] = React.useState(false); 
    const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {};
    course.units.forEach((unit) => {
        unit.chapters.forEach((chapter) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          chapterRefs[chapter.id] = React.useRef(null);
        });
    });
    const [completedChapters, setCompletedChapters] = React.useState<Set<String>>(
        new Set()
    );
    const totalChaptersCount = React.useMemo(() => {
        return course.units.reduce((acc, unit) => {
          return acc + unit.chapters.length;
        }, 0);
      }, [course.units]);

    return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
          <BookOpen className="w-6 h-6 mr-2" />
          Confirm Course Chapters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {course.units.map((unit, unitIndex) => (
            <div key={unit.id} className="bg-secondary/20 p-4 rounded-lg">
              <h2 className="text-sm uppercase text-secondary-foreground font-semibold">
                Unit {unitIndex + 1}
              </h2>
              <h3 className="text-2xl font-bold mt-1 mb-3">
                {unit.name}
              </h3>
              <div className="space-y-2">
                {unit.chapters.map((chapter, chapterIndex) => (
                  <ChapterCard 
                    completedChapters={completedChapters}
                    setCompletedChapters={setCompletedChapters}            
                    ref={chapterRefs[chapter.id]}
                    key={chapter.id} 
                    chapter={chapter} 
                    chapterIndex={chapterIndex} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-between mt-8'>
          <Link href='/create' className={buttonVariants({
            variant: "outline",
          })}>
            <ChevronLeft className='w-4 h-4 mr-2' strokeWidth={2} />
            Back
          </Link>
          {totalChaptersCount === completedChapters.size ? (
            <Link
              className={buttonVariants({
                className: "font-semibold",
              })}
              href={`/course/${course.id}/0/0`}
            >
              Save & Continue
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Link>
          ) : (
            <Button
              type="button"
              className="font-semibold"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                Object.values(chapterRefs).forEach((ref) => {
                  ref.current?.triggerLoad();
                });
              }}
            >
              Generate
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={2} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfirmChapters;