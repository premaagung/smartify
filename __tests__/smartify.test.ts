/**
 * Smartify – Unit Test Suite
 * Tugas Akhir: ITB STIKOM Bali | NIM 210030487
 */

// ─── Top-level mocks (must be before imports) ─────────────────────────────────

const mockGetServerSession = jest.fn();
const mockGetAuthSession = jest.fn();
const mockGenerateContent = jest.fn();

const mockPrisma = {
  course:              { create: jest.fn() },
  unit:                { create: jest.fn() },
  chapter:             { createMany: jest.fn() },
  user:                { updateMany: jest.fn() },
  userChapterProgress: { upsert: jest.fn(), findUnique: jest.fn() },
};

// Mock Gemini at module level — intercepts the module-level genAI instance
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: (...args: any[]) => mockGenerateContent(...args),
    }),
  })),
}));

jest.mock("axios");
jest.mock("next-auth/next",  () => ({ getServerSession: (...a: any[]) => mockGetServerSession(...a) }));
jest.mock("@/lib/auth",      () => ({ getAuthSession:   (...a: any[]) => mockGetAuthSession(...a), authOptions: {} }));
jest.mock("@/lib/db",        () => ({ prisma: mockPrisma }));
jest.mock("@/lib/unsplash",  () => ({ getUnsplashImage: jest.fn().mockResolvedValue("https://img.test") }));

// ─── Imports ──────────────────────────────────────────────────────────────────

import axios                              from "axios";
import { cleanJSON, strict_output }       from "@/lib/gemini";
import { searchYoutube }                  from "@/lib/youtube";
import { calculateScore }                 from "@/lib/score";
import { POST as createChaptersPost }     from "@/app/api/course/createChapters/route";
import { POST as completeChapterPost }    from "@/app/api/chapter/completeChapter/route";
import { GET  as quizResultGet }          from "@/app/api/chapter/quizResult/[chapterId]/route";

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 – strict_output (Tests 1–4)
// ─────────────────────────────────────────────────────────────────────────────

describe("strict_output", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-01 | valid JSON – returns object matching schema", async () => {
    const expected = { title: "Introduction to AI", chapters: [] };
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(expected) },
    });

    const result = await strict_output(
      "You are a course curator",
      "Create a course about AI",
      { title: "unit title", chapters: "array of chapters" }
    );

    expect(result).toEqual(expected);
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("chapters");
  });

  it("TC-02 | invalid JSON fallback – returns null on parse error", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "This is not JSON { broken ][" },
    });

    const result = await strict_output("system", "prompt", { title: "title" });

    expect(result).toBeNull();
  });

  it("TC-03 | code fence stripping – cleanJSON removes markdown backticks", () => {
    const withFence = '```json\n{"title": "AI Basics"}\n```';
    const result    = cleanJSON(withFence);

    expect(result).not.toContain("```");
    expect(result).not.toContain("json");
    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toEqual({ title: "AI Basics" });
  });

  it("TC-04 | curly quote normalization – replaces typographic quotes with ASCII", () => {
    const withCurly = '{\u201Ctitle\u201D: \u201CAI Basics\u201D}';
    const result    = cleanJSON(withCurly);

    expect(result).not.toMatch(/[\u2018\u2019\u201C\u201D]/);
    expect(result).toBe('{"title": "AI Basics"}');
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 – POST /api/course/createChapters (Tests 5–6)
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/course/createChapters", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-05 | valid input – returns 200 with course_id", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "user-1", credits: 5 } });

    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            title: "Unit 1: Intro",
            chapters: [{ chapter_title: "What is AI?", youtube_search_query: "intro to AI" }],
          }),
        },
      })
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({ image_search_term: "artificial intelligence" }),
        },
      });

    mockPrisma.course.create.mockResolvedValue({ id: "course-abc" });
    mockPrisma.unit.create.mockResolvedValue({ id: "unit-1" });
    mockPrisma.chapter.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.user.updateMany.mockResolvedValue({ count: 1 });

    const req = new Request("http://localhost/api/course/createChapters", {
      method: "POST",
      body: JSON.stringify({ title: "Artificial Intelligence", units: ["Introduction"] }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createChaptersPost(req, {} as any);
    const json = await res.json() as any;

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("course_id");
    expect(json.course_id).toBe("course-abc");
  });

  it("TC-06 | invalid input – returns 400 on missing/invalid body", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "user-1", credits: 5 } });

    const req = new Request("http://localhost/api/course/createChapters", {
      method: "POST",
      body: JSON.stringify({ title: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createChaptersPost(req, {} as any);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3 – POST /api/chapter/completeChapter (Tests 7–8)
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/chapter/completeChapter", () => {

  beforeEach(() => jest.clearAllMocks());

  it("TC-07 | unauthenticated – returns 401 Unauthorized", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/chapter/completeChapter", {
      method: "POST",
      body: JSON.stringify({ chapterId: "ch-1", score: 4, total: 5 }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await completeChapterPost(req);
    const json = await res.json() as any;

    expect(res.status).toBe(401);
    expect(json).toHaveProperty("error");
  });

  it("TC-08 | valid data – returns 200 with progress object", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });

    const mockProgress = {
      userId: "user-1",
      chapterId: "ch-1",
      score: 4,
      total: 5,
      completed: true,
    };
    mockPrisma.userChapterProgress.upsert.mockResolvedValue(mockProgress);

    const req = new Request("http://localhost/api/chapter/completeChapter", {
      method: "POST",
      body: JSON.stringify({ chapterId: "ch-1", score: 4, total: 5 }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await completeChapterPost(req);
    const json = await res.json() as any;

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("progress");
    expect(json.progress.score).toBe(4);
    expect(json.progress.completed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4 – GET /api/chapter/quizResult (Test 9)
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/chapter/quizResult", () => {

  beforeEach(() => jest.clearAllMocks());

  it("TC-09 | no prior result – returns 200 with result: null", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.userChapterProgress.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/chapter/quizResult/ch-999");
    const ctx = { params: { chapterId: "ch-999" } };

    const res = await quizResultGet(req, ctx);
    const json = await res.json() as any;

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("result");
    expect(json.result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 5 – YouTube Search (Test 10)
// ─────────────────────────────────────────────────────────────────────────────

describe("YouTube search", () => {

  beforeEach(() => jest.clearAllMocks());

  it("TC-10 | valid response – returns non-empty videoId string", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { items: [{ id: { videoId: "dQw4w9WgXcQ" } }] },
    });

    const result = await searchYoutube("Introduction to Machine Learning");

    expect(typeof result).toBe("string");
    expect(result).toBeTruthy();
    expect(result).toBe("dQw4w9WgXcQ");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 6 – Score Calculation (Tests 11–12)
// ─────────────────────────────────────────────────────────────────────────────

describe("Score calculation", () => {

  it("TC-11 | all correct – score equals total number of questions", () => {
    const answers = ["A", "B", "C", "D", "A"];
    const correct = ["A", "B", "C", "D", "A"];
    expect(calculateScore(answers, correct)).toBe(5);
  });

  it("TC-12 | all incorrect – score equals 0", () => {
    const answers = ["B", "A", "D", "C", "B"];
    const correct = ["A", "B", "C", "D", "A"];
    expect(calculateScore(answers, correct)).toBe(0);
  });
});