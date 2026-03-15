// src/app/api/youtube/search/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import axios from "axios";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const { q } = querySchema.parse({ q: searchParams.get("q") });

    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${encodeURIComponent(q)}&type=video&videoEmbeddable=true&part=snippet&maxResults=6`
    );

    const videos = data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}