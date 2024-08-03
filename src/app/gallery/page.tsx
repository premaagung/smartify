import GalleryCourseCard from "@/components/GalleryCourseCard";
import { prisma } from "@/lib/db";
import React from "react";

type Props = {};

const GalleryPage = async (props: Props) => {
  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: { chapters: true },
      },
    },
  });

  return (
    <div className="py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Gallery</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Explore our wide range of courses. Click on a course to learn more!
        </p>
      </header>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {courses.map((course) => (
          <GalleryCourseCard course={course} key={course.id} />
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
