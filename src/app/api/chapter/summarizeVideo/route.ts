// src/app/api/chapter/summarizeVideo/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { strict_output } from "@/lib/gemini";
import { z } from "zod";

const bodySchema = z.object({
  videoId: z.string(),
  chapterName: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, chapterName } = bodySchema.parse(body);

    const result = await strict_output(
      "You are an AI capable of summarising educational content for students.",
      `Generate a concise educational summary (250 words or less) for a chapter called "${chapterName}". 
       The chapter uses this YouTube video: https://www.youtube.com/watch?v=${videoId}
       Focus on the key educational concepts. Do not mention the video itself or any sponsors.`,
      { summary: "educational summary of the chapter content in 250 words or less" }
    );

    return NextResponse.json({ summary: result?.summary ?? "" });
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: "API quota exceeded. Please write the summary manually." }, { status: 429 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}