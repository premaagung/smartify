import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gemini";
import { searchYoutube } from "@/lib/youtube";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  chapterId: z.string(),
});

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { chapterId } = bodyParser.parse(body);

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    const videoId = await searchYoutube(chapter.youtubeSearchQuery);

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "No YouTube video found for this chapter." },
        { status: 404 }
      );
    }

    // Single Gemini call for both summary and questions
    // This halves quota usage — 1 call per chapter instead of 2
    const chapterContent = await strict_output(
      `You are an educational AI. Generate content for a chapter called "${chapter.name}". 
      Never use curly quotes or smart quotes — only use straight quotes.`,
      `Generate educational content for the chapter: ${chapter.name}`,
      {
        summary: "a concise 250 word or less educational summary of this chapter topic",
        questions: "a JSON array of 5 multiple choice questions, each with fields: question, answer, option1, option2, option3. Each answer/option must be 15 words or less.",
      }
    );

    if (!chapterContent?.summary) {
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { videoId: videoId },
      });
      return NextResponse.json(
        { success: false, error: "Failed to generate content. API quota may be exceeded." },
        { status: 503 }
      );
    }

    // Parse questions — they come back as a string since strict_output treats values as strings
    let questions = [];
    try {
      const raw = typeof chapterContent.questions === "string"
        ? chapterContent.questions
        : JSON.stringify(chapterContent.questions);
      questions = JSON.parse(raw);
    } catch (e) {
      console.log("Failed to parse questions, skipping:", e);
    }

    if (questions && questions.length > 0) {
      await prisma.question.createMany({
        data: questions.map((question: any) => {
          let options = [
            question.answer,
            question.option1,
            question.option2,
            question.option3,
          ];
          options = options.sort(() => Math.random() - 0.5);
          return {
            question: question.question,
            answer: question.answer,
            options: JSON.stringify(options),
            chapterId: chapterId,
          };
        }),
      });
    }

    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoId: videoId,
        summary: chapterContent.summary,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "invalid body" },
        { status: 400 }
      );
    }
    if ((error as any)?.status === 429) {
      return NextResponse.json(
        { success: false, error: "Gemini API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, error: "internal server error" },
      { status: 500 }
    );
  }
}