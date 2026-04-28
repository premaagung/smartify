import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  CheckCircle2, BarChart3, Shield, User,
  BookOpen, GraduationCap, Trophy, Target,
} from "lucide-react";

const SettingsPage = async () => {
  const session = await getAuthSession();
  if (!session?.user) redirect("/gallery");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Learning stats from UserChapterProgress
  const progressRecords = await prisma.userChapterProgress.findMany({
    where: { userId: session.user.id },
    include: { chapter: { include: { unit: { include: { course: true } } } } },
  });

  const completedChapters = progressRecords.filter((p) => p.completed).length;
  const totalAttempted = progressRecords.length;

  // Quiz performance
  const quizAttempts = progressRecords.filter((p) => p.total > 0);
  const avgScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((acc, p) => acc + (p.score / p.total) * 100, 0) /
            quizAttempts.length
        )
      : 0;

  const perfectScores = quizAttempts.filter(
    (p) => p.score === p.total && p.total > 0
  ).length;

  // Courses in progress
  const courseMap = new Map<string, { name: string; completed: number; total: number }>();
  for (const p of progressRecords) {
    const course = p.chapter.unit.course;
    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, { name: course.name, completed: 0, total: 0 });
    }
    const entry = courseMap.get(course.id)!;
    entry.total += 1;
    if (p.completed) entry.completed += 1;
  }
  const activeCourses = Array.from(courseMap.values());

  // Total chapters across all courses
  const totalChapters = await prisma.chapter.count();

  const overallPercent =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#020B18]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
          <p className="text-slate-500">Your account and learning overview</p>
        </div>

        <div className="space-y-6">

          {/* Profile card */}
          <div className="bg-[#041123] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Account
            </h2>
            <div className="flex items-center gap-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  className="w-14 h-14 rounded-full border-2 border-slate-700 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-xl font-bold text-emerald-400">
                  {session.user.name?.[0] ?? "U"}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-white">{session.user.name}</p>
                <p className="text-sm text-slate-500">{session.user.email}</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Learner
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Chapters Completed", value: completedChapters, icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Quizzes Taken", value: quizAttempts.length, icon: Target, color: "text-blue-400" },
              { label: "Avg Quiz Score", value: `${avgScore}%`, icon: BarChart3, color: avgScore >= 80 ? "text-emerald-400" : avgScore >= 60 ? "text-amber-400" : "text-red-400" },
              { label: "Perfect Scores", value: perfectScores, icon: Trophy, color: "text-amber-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#041123] border border-slate-800 rounded-xl p-5 flex flex-col items-center text-center">
                <Icon className={`w-5 h-5 mb-2 ${color}`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Overall progress */}
          <div className="bg-[#041123] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Learning Progress
            </h2>

            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Overall completion</p>
              <p className="text-sm font-bold text-white">{completedChapters}/{totalChapters} chapters</p>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>

            {/* Per-course breakdown */}
            {activeCourses.length > 0 ? (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Courses in Progress</p>
                <div className="space-y-3">
                  {activeCourses.map((course) => {
                    const pct = course.total > 0
                      ? Math.round((course.completed / course.total) * 100)
                      : 0;
                    return (
                      <div key={course.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <p className="text-sm text-slate-300 truncate max-w-xs">{course.name}</p>
                          </div>
                          <span className={`text-xs font-semibold ${pct === 100 ? "text-emerald-400" : "text-slate-400"}`}>
                            {pct === 100 ? "✓ Complete" : `${course.completed}/${course.total}`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-400" : "bg-emerald-600"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">
                No learning activity yet — start a course to track your progress.
              </p>
            )}
          </div>

          {/* Security card */}
          <div className="bg-[#041123] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Security
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white mb-0.5">Authentication</p>
                <p className="text-xs text-slate-500">
                  Signed in with Google · {session.user.email}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;