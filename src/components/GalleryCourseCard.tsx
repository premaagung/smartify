import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Chapter, Course, Unit } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const GalleryCourseCard = ({ course }: Props) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/course/${course.id}/0/0`} className="relative block">
          <Image
            src={course.image || "/placeholder-course.jpg"}
            className="object-cover w-full h-48 transition-transform hover:scale-105"
            width={400}
            height={200}
            alt={`Cover image for ${course.name}`}
          />
          <Badge className="absolute bottom-2 left-2 right-2 bg-black/60 text-white">
            {course.name}
          </Badge>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <h4 className="mb-2 text-lg font-semibold text-primary">Units</h4>
        <ul className="space-y-2">
          {course.units.map((unit, unitIndex) => (
            <li key={unit.id}>
              <Link
                href={`/course/${course.id}/${unitIndex}/0`}
                className="text-sm text-secondary-foreground hover:text-primary transition-colors"
              >
                Unit {unitIndex + 1}: {unit.name}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default GalleryCourseCard;