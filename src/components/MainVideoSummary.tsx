import React from "react";
import { Chapter, Unit } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="mt-4 sm:mt-8 w-full p-3 sm:p-6 shadow-lg rounded-lg bg-background">
      <CardHeader className="border-b border-border pb-3 sm:pb-4 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <Badge variant="outline" className="text-xs sm:text-sm w-fit">
            Unit {unitIndex + 1} • Chapter {chapterIndex + 1}
          </Badge>
          <Badge variant="secondary" className="text-xs sm:text-sm font-medium text-primary w-fit">
            {unit.name}
          </Badge>
        </div>
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary">
          {chapter.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="relative pt-[56.25%]">
          <iframe
            title={`Video for ${chapter.name}`}
            className="absolute inset-0 w-full h-full rounded-lg border border-border"
            src={`https://www.youtube.com/embed/${chapter.videoId}`}
            allowFullScreen
          />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
            Summary
          </h3>
          <p className="text-sm sm:text-base text-secondary-foreground/80 leading-relaxed">
            {chapter.summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainVideoSummary;