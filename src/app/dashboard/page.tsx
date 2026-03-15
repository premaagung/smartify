import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronRight, Trophy, Target, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  // Fetch all courses with units + chapters
  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: { chapters: true },
      },
    },
    orderBy: { id: "desc" },
  });

  // Fetch all progress records for this user
  const allChapterIds = courses.flatMap((c) =>
    c.units.flatMap((u) => u.chapters.map((ch) => ch.id))
  );

  const progressRecords = await prisma.userChapterProgress.findMany({
    where: {
      userId: session.user.id,
      chapterId: { in: allChapterIds },
      completed: true,
    },
    select: { chapterId: true, score: true, total: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const completedSet = new Set(progressRecords.map((p) => p.chapterId));

  // Build per-course stats
  const courseStats = courses.map((course) => {
    const chapters = course.units.flatMap((u) => u.chapters);
    const total = chapters.length;
    const completed = chapters.filter((c) => completedSet.has(c.id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = completed === total && total > 0;
    const hasStarted = completed > 0;

    // Find first incomplete chapter for "Continue" link
    let continueUnitIndex = 0;
    let continueChapterIndex = 0;
    outer: for (let ui = 0; ui < course.units.length; ui++) {
      for (let ci = 0; ci < course.units[ui].chapters.length; ci++) {
        if (!completedSet.has(course.units[ui].chapters[ci].id)) {
          continueUnitIndex = ui;
          continueChapterIndex = ci;
          break outer;
        }
      }
    }

    return {
      course,
      total,
      completed,
      percent,
      isComplete,
      hasStarted,
      continueUnitIndex,
      continueChapterIndex,
    };
  });

  const startedCourses = courseStats.filter((s) => s.hasStarted);
  const notStartedCourses = courseStats.filter((s) => !s.hasStarted);
  const totalCompleted = progressRecords.length;
  const totalChapters = allChapterIds.length;
  const completedCourses = courseStats.filter((s) => s.isComplete).length;

  return (
    <div className="min-h-screen bg-[#020B18]">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#041123]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 pt-24">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">
                My Learning
              </p>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">
                Welcome back, {session.user.name?.split(" ")[0] ?? "there"} 👋
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-[#020B18] rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Chapters</span>
              </div>
              <p className="text-2xl font-black text-white">{totalCompleted}</p>
              <p className="text-xs text-slate-600 mt-0.5">of {totalChapters} total</p>
            </div>
            <div className="bg-[#020B18] rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
              </div>
              <p className="text-2xl font-black text-white">{completedCourses}</p>
              <p className="text-xs text-slate-600 mt-0.5">courses done</p>
            </div>
            <div className="bg-[#020B18] rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
              </div>
              <p className="text-2xl font-black text-white">
                {startedCourses.filter((s) => !s.isComplete).length}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">courses active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-12">

        {/* In progress / started */}
        {startedCourses.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Continue Learning
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {startedCourses.map(({ course, total, completed, percent, isComplete, continueUnitIndex, continueChapterIndex }) => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}/${continueUnitIndex}/${continueChapterIndex}`}
                  className="group flex flex-col bg-[#041123] border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-800 overflow-hidden">
                    {course.image ? (
                      <Image
                        src={course.image}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-emerald-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 drop-shadow-md">
                        {course.name}
                      </h3>
                    </div>
                    {isComplete && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-md text-xs text-white font-semibold">
                        ✓ Complete
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Progress</span>
                      <span className={cn("text-[10px] font-bold", isComplete ? "text-emerald-400" : "text-slate-400")}>
                        {completed}/{total} chapters
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", isComplete ? "bg-emerald-400" : "bg-emerald-600")}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{percent}%</span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 group-hover:text-emerald-400 transition-colors">
                        {isComplete ? "Review" : "Continue"}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Not started */}
        {notStartedCourses.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Not Started Yet
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {notStartedCourses.map(({ course, total }) => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}/0/0`}
                  className="group flex flex-col bg-[#041123] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 opacity-70 hover:opacity-100"
                >
                  <div className="relative aspect-video bg-slate-800 overflow-hidden">
                    {course.image ? (
                      <Image
                        src={course.image}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 drop-shadow-md">
                        {course.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-xs text-slate-600">{total} chapters</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-emerald-400 transition-colors">
                      Start Learning
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm">
              Create your first course and start tracking your progress here.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-all"
            >
              Create Your First Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;