import axios from "axios";
import { strict_output } from "./gemini";

export async function searchYoutube(searchQuery: string) {
  searchQuery = encodeURIComponent(searchQuery);
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
    );
    if (!data) {
      console.log("youtube fail: no data returned");
      return null;
    }
    if (!data.items || data.items.length === 0) {
      console.log("youtube fail: no items in response");
      return null;
    }
    return data.items[0].id.videoId;
  } catch (error: any) {
    console.log("YouTube API error:", JSON.stringify(error.response?.data, null, 2));
    return null;
  }
}

export async function getQuestionsFromTranscript(
  context: string,
  course_title: string
) {
  type Question = {
    question: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
  };

  const questions: Question[] = await strict_output(
    "You are a helpful AI that generates mcq questions and answers. Each answer must not exceed 15 words. Never use curly quotes or smart quotes — only use straight quotes.",
    new Array(5).fill(
      `Generate a hard mcq question about ${course_title} based on this context: ${context}`
    ),
    {
      question: "question",
      answer: "answer with max length of 15 words",
      option1: "option1 with max length of 15 words",
      option2: "option2 with max length of 15 words",
      option3: "option3 with max length of 15 words",
    }
  );
  return questions;
}