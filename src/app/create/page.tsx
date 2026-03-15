import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkSubscription } from "@/lib/subscription";
import CreateCourseForm from "@/components/CreateCourseForm";
import { Zap, BookOpen, Video, BarChart3, Lightbulb } from "lucide-react";

const CreatePage = async () => {
  const session = await getAuthSession();
  if (!session?.user) redirect("/gallery");

  const isPro = await checkSubscription();

  return (
    <div className="min-h-screen bg-[#020B18]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* Left — Form */}
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
                <Zap className="w-3.5 h-3.5" />
                AI Course Generator
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Create a New Course
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg">
                Enter a topic and define your units. Our AI will generate structured chapters, find curated videos, and write summaries and quizzes for each one.
              </p>
            </div>

            <div className="bg-[#041123] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <CreateCourseForm isPro={isPro} />
            </div>
          </div>

          {/* Right — Info panel */}
          <div className="lg:sticky lg:top-24 space-y-4">

            {/* What gets generated */}
            <div className="bg-[#041123] border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-5">
                What gets generated
              </h3>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, title: "Chapter Titles", desc: "Logical chapter names created for each unit you define." },
                  { icon: Video, title: "Curated Videos", desc: "Relevant YouTube videos sourced for every chapter." },
                  { icon: BarChart3, title: "Summaries", desc: "Concise educational summaries written per chapter." },
                  { icon: Zap, title: "Concept Checks", desc: "5 multiple choice questions per chapter to test your knowledge." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-300 mb-1">Pro tip</p>
                  <p className="text-xs text-emerald-400/70 leading-relaxed">
                    Be specific with your unit names. Instead of "Unit 1", try "Introduction to Neural Networks" — it helps the AI generate much richer content.
                  </p>
                </div>
              </div>
            </div>

            {/* Time estimate */}
            <div className="bg-[#041123] border border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                ⏱ Course generation takes about{" "}
                <span className="text-slate-300 font-medium">30–60 seconds</span> depending on the number of units. Chapters are generated one by one to stay within API limits.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;