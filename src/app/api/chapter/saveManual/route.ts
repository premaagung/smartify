// src/app/api/chapter/saveManual/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  chapterId: z.string(),
  videoId: z.string(),
  summary: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    option1: z.string(),
    option2: z.string(),
    option3: z.string(),
  })),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId, videoId, summary, questions } = bodySchema.parse(body);

    // Delete existing questions for this chapter (in case of re-save)
    await prisma.question.deleteMany({ where: { chapterId } });

    // Save questions
    if (questions.length > 0) {
      await prisma.question.createMany({
        data: questions.map((q) => {
          const options = [q.answer, q.option1, q.option2, q.option3].sort(
            () => Math.random() - 0.5
          );
          return {
            question: q.question,
            answer: q.answer,
            options: JSON.stringify(options),
            chapterId,
          };
        }),
      });
    }

    // Update chapter
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { videoId, summary },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to save chapter" }, { status: 500 });
  }
}