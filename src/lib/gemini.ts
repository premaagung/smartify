// src/lib/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function cleanJSON(text: string): string {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]")
    .trim();
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: Record<string, string>,
  temperature: number = 1
): Promise<any> {
  const isArray = Array.isArray(user_prompt);
  const prompts = isArray ? user_prompt : [user_prompt];
  const results: any[] = [];

  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
    },
    systemInstruction: `${system_prompt}
You must respond ONLY with a valid JSON object matching this exact format:
${JSON.stringify(output_format, null, 2)}
No explanation, no markdown, no code fences. Just the raw JSON object.`,
  });

  for (const prompt of prompts) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const cleaned = cleanJSON(raw);

      try {
        const parsed = JSON.parse(cleaned);

        if (parsed.questions && Array.isArray(parsed.questions)) {
          parsed.questions = parsed.questions.map((q: any) => ({
            ...q,
            answer: q.answer ?? "",
            options: Array.isArray(q.options)
              ? q.options.filter((o: any) => o !== null && o !== undefined)
              : [],
          }));
        }

        results.push(parsed);
      } catch {
        console.error("JSON parse error. Raw response:", raw);
        results.push({});
      }
    } catch (error: any) {
      if (error?.status === 429) {
        console.warn("Gemini rate limit hit (429).");
        throw { status: 429, message: "Rate limit exceeded" };
      }
      console.error("Gemini API error:", error?.message);
      throw error;
    }
  }

  return isArray ? results : results[0];
}