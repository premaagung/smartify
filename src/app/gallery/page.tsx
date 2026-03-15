import GalleryCourseCard from "@/components/GalleryCourseCard";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, PlusCircle } from "lucide-react";

const GalleryPage = async () => {
  const session = await getServerSession(authOptions);

  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: { chapters: true },
      },
    },
    orderBy: { id: "desc" },
  });

  const totalChapters = courses.reduce(
    (acc, c) => acc + c.units.reduce((a, u) => a + u.chapters.length, 0),
    0
  );

  // Fetch completed chapter IDs for the current user in one query
  let completedChapterIds: string[] = [];

  if (session?.user?.id) {
    const allChapterIds = courses.flatMap((c) =>
      c.units.flatMap((u) => u.chapters.map((ch) => ch.id))
    );

    const progressRecords = await prisma.userChapterProgress.findMany({
      where: {
        userId: session.user.id,
        chapterId: { in: allChapterIds },
        completed: true,
      },
      select: { chapterId: true },
    });

    completedChapterIds = progressRecords.map((p) => p.chapterId);
  }

  return (
    <div className="min-h-screen bg-[#020B18]">

      {/* Page header */}
      <div className="border-b border-slate-800 bg-[#041123]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
                Learning Library
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Course Gallery
              </h1>
              <p className="text-slate-500 text-sm">
                {courses.length} course{courses.length !== 1 ? "s" : ""} · {totalChapters} chapters available
              </p>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-lg transition-all duration-150 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Create Course
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm">
              Be the first to create a course. Our AI will generate chapters, summaries, and quizzes for you.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {courses.map((course) => (
              <GalleryCourseCard
                key={course.id}
                course={course}
                completedChapterIds={completedChapterIds}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;