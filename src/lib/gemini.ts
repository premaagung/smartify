// src/lib/gemini.ts
// Replace entire file with this

import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/hunter-alpha";

// Strip markdown code fences and normalize quotes
function cleanJSON(text: string): string {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
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

  for (const prompt of prompts) {
    const messages = [
      {
        role: "system",
        content: `${system_prompt}
You must respond ONLY with a valid JSON object matching this exact format:
${JSON.stringify(output_format, null, 2)}
No explanation, no markdown, no code fences. Just the raw JSON object.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: MODEL,
          messages,
          temperature,
          response_format: { type: "json_object" }, // forces JSON output on supported models
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Smartify LMS",
          },
        }
      );

      const raw = response.data.choices?.[0]?.message?.content ?? "";
      const cleaned = cleanJSON(raw);

      try {
        const parsed = JSON.parse(cleaned);
        results.push(parsed);
      } catch {
        console.error("JSON parse error. Raw response:", raw);
        results.push({});
      }
    } catch (error: any) {
      // Rate limit handling
      if (error?.response?.status === 429) {
        console.warn("OpenRouter rate limit hit (429). Stopping retries.");
        throw { status: 429, message: "Rate limit exceeded" };
      }
      // Insufficient credits
      if (error?.response?.status === 402) {
        console.error("OpenRouter insufficient credits.");
        throw { status: 402, message: "Insufficient credits" };
      }
      console.error("OpenRouter API error:", error?.response?.data || error.message);
      throw error;
    }
  }

  return isArray ? results : results[0];
}