import SubscriptionButton from "@/components/SubscriptionButton";
import { checkSubscription } from "@/lib/subscription";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Crown, Zap, CheckCircle2, BookOpen, BarChart3, Shield, User } from "lucide-react";

const SettingsPage = async () => {
  const session = await getAuthSession();
  if (!session?.user) redirect("/gallery");

  const isPro = await checkSubscription();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: false,
    },
  });

  const credits = user?.credits ?? 0;

  return (
    <div className="min-h-screen bg-[#020B18]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
          <p className="text-slate-500">Manage your account and subscription</p>
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
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  isPro
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}>
                  {isPro ? <Crown className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
            </div>
          </div>

          {/* Credits card */}
          <div className="bg-[#041123] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Usage
            </h2>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-white">{credits}</p>
                <p className="text-sm text-slate-500">course credits remaining</p>
              </div>
              {isPro && (
                <span className="text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Unlimited with Pro
                </span>
              )}
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  credits > 5 ? "bg-emerald-500" : credits > 2 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: isPro ? "100%" : `${Math.min((credits / 10) * 100, 100)}%` }}
              />
            </div>
            {!isPro && (
              <p className="text-xs text-slate-600 mt-2">
                Each course creation uses 1 credit. Upgrade to Pro for unlimited courses.
              </p>
            )}
          </div>

          {/* Subscription card */}
          <div className="bg-[#041123] border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Crown className="w-4 h-4 text-emerald-400" />
              Subscription
            </h2>

            {isPro ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span className="text-lg font-bold text-white">Pro Plan</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    You have access to all Pro features including unlimited course creation.
                  </p>
                  <div className="space-y-2">
                    {[
                      "Unlimited course creation",
                      "Priority AI processing",
                      "Advanced analytics",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  <SubscriptionButton isPro={isPro} />
                </div>
              </div>
            ) : (
              <div>
                {/* Pro plan pitch */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/50">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Free Plan
                    </h3>
                    <div className="space-y-2">
                      {[
                        "10 course credits",
                        "Basic AI generation",
                        "YouTube video curation",
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                      RECOMMENDED
                    </div>
                    <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      Pro Plan
                    </h3>
                    <div className="space-y-2">
                      {[
                        "Unlimited course creation",
                        "Priority AI processing",
                        "Advanced analytics",
                        "Early access to new features",
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-amber-300/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <SubscriptionButton isPro={isPro} />
              </div>
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