// src/app/auth/page.tsx

import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default async function AuthPage() {
  const session = await getAuthSession();

  // Already logged in — redirect to gallery
  if (session?.user) {
    redirect("/gallery");
  }

  return (
    <div className="min-h-screen bg-[#020B18] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/4 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(16,185,129,0.6) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 w-full">
        <AuthForm />
      </div>
    </div>
  );
}