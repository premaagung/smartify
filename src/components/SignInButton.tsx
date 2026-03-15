"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

const SignInButton = () => {
  return (
    <Link
      href="/auth"
      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-all duration-150 shadow-md shadow-emerald-500/20"
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </Link>
  );
};

export default SignInButton;