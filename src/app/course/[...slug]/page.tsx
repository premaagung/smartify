import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CoursePageClient from "./CoursePageClient";

type Props = {
  params: {
    slug: string[];
  };
};

const CoursePage = async ({ params: { slug } }: Props) => {
  const [courseId, unitIndexParam, chapterIndexParam] = slug;

  const session = await getServerSession(authOptions);

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

  if (!course) return redirect("/gallery");

  let unitIndex = parseInt(unitIndexParam);
  let chapterIndex = parseInt(chapterIndexParam);

  const unit = course.units[unitIndex];
  if (!unit) return redirect("/gallery");

  const chapter = unit.chapters[chapterIndex];
  if (!chapter) return redirect("/gallery");

  const nextChapter = unit.chapters[chapterIndex + 1];
  const prevChapter = unit.chapters[chapterIndex - 1];

  // Fetch per-user progress for all chapters in this course
  let completedChapterIds: Set<string> = new Set();
  let progressMap: Record<string, { score: number; total: number }> = {};

  if (session?.user?.id) {
    const allChapterIds = course.units.flatMap((u) =>
      u.chapters.map((c) => c.id)
    );

    const progressRecords = await prisma.userChapterProgress.findMany({
      where: {
        userId: session.user.id,
        chapterId: { in: allChapterIds },
        completed: true,
      },
      select: { chapterId: true, score: true, total: true },
    });

    progressRecords.forEach((p) => {
      completedChapterIds.add(p.chapterId);
      progressMap[p.chapterId] = { score: p.score, total: p.total };
    });
  }

  const totalChapters = course.units.reduce(
    (acc, u) => acc + u.chapters.length,
    0
  );
  const completedCount = completedChapterIds.size;

  return (
    <CoursePageClient
      course={course}
      unit={unit}
      chapter={chapter}
      chapterIndex={chapterIndex}
      unitIndex={unitIndex}
      nextChapter={nextChapter}
      prevChapter={prevChapter}
      completedChapterIds={Array.from(completedChapterIds)}
      progressMap={progressMap}
      completedCount={completedCount}
      totalChapters={totalChapters}
    />
  );
};

export default CoursePage;