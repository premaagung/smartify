import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const completeChapterSchema = z.object({
  chapterId: z.string(),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId, score, total } = completeChapterSchema.parse(body);

    const progress = await prisma.userChapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
      update: {
        score,
        total,
        completed: true,
      },
      create: {
        userId: session.user.id,
        chapterId,
        score,
        total,
        completed: true,
      },
    });

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[COMPLETE_CHAPTER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}