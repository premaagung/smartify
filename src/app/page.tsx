import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export default async function Page() {
  const session = await getServerSession(authOptions);

  let continueData = null;

  if (session?.user?.id) {
    const lastProgress = await prisma.userChapterProgress.findFirst({
      where: { userId: session.user.id, completed: true },
      orderBy: { updatedAt: "desc" },
      select: { chapterId: true },
    });

    if (lastProgress) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: lastProgress.chapterId },
        include: {
          unit: {
            include: {
              course: {
                include: {
                  units: { include: { chapters: true } },
                },
              },
            },
          },
        },
      });

      if (chapter) {
        const course = chapter.unit.course;
        const allChapterIds = course.units.flatMap((u) => u.chapters.map((c) => c.id));

        const progressRecords = await prisma.userChapterProgress.findMany({
          where: {
            userId: session.user.id,
            chapterId: { in: allChapterIds },
            completed: true,
          },
          select: { chapterId: true },
        });

        const completedSet = new Set(progressRecords.map((p) => p.chapterId));
        const totalChapters = allChapterIds.length;
        const completedCount = completedSet.size;
        const percent = Math.round((completedCount / totalChapters) * 100);
        const isComplete = completedCount === totalChapters;

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

        continueData = {
          courseId: course.id,
          courseName: course.name,
          courseImage: course.image,
          completedCount,
          totalChapters,
          percent,
          isComplete,
          continueUnitIndex,
          continueChapterIndex,
        };
      }
    }
  }

  return <HomeClient continueData={continueData} />;
}