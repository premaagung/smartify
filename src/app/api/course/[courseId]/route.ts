import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = params;

    // Delete in correct order — children first, then parent
    // 1. Get all chapter IDs for this course
    const units = await prisma.unit.findMany({
      where: { courseId },
      include: { chapters: true },
    });

    const chapterIds = units.flatMap((u) => u.chapters.map((c) => c.id));

    // 2. Delete UserChapterProgress
    await prisma.userChapterProgress.deleteMany({
      where: { chapterId: { in: chapterIds } },
    });

    // 3. Delete Questions
    await prisma.question.deleteMany({
      where: { chapterId: { in: chapterIds } },
    });

    // 4. Delete Chapters
    await prisma.chapter.deleteMany({
      where: { unitId: { in: units.map((u) => u.id) } },
    });

    // 5. Delete Units
    await prisma.unit.deleteMany({
      where: { courseId },
    });

    // 6. Delete Course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE_COURSE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}