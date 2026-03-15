// src/app/api/chapter/generateQuiz/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { strict_output } from "@/lib/gemini";
import { z } from "zod";

const bodySchema = z.object({
  chapterName: z.string(),
  summary: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chapterName, summary } = bodySchema.parse(body);

    const context = summary
      ? `Chapter: "${chapterName}"\n\nSummary: ${summary}`
      : `Chapter: "${chapterName}"`;

    const questions = await strict_output(
      "You are a helpful AI that generates multiple choice questions for students. Never use curly quotes — only straight quotes.",
      new Array(5).fill(
        `Generate a clear multiple choice question for this chapter. ${context}`
      ),
      {
        question: "the question text",
        answer: "correct answer, max 15 words",
        option1: "wrong option 1, max 15 words",
        option2: "wrong option 2, max 15 words",
        option3: "wrong option 3, max 15 words",
      }
    );

    return NextResponse.json({ questions });
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: "API quota exceeded. Please add questions manually." }, { status: 429 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}