import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import SignInButton from "./SignInButton";
import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";
import { BookOpen, GalleryHorizontal, LayoutDashboard, PlusCircle, Settings } from "lucide-react";

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <nav className="fixed inset-x-0 top-0 z-[10] h-16 border-b border-slate-800/80 bg-[#020B18]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-full items-center justify-between px-4 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:bg-emerald-400 transition-colors duration-150">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-white">Smartify</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/gallery"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
          >
            <GalleryHorizontal className="w-4 h-4" />
            Courses
          </Link>

          {session?.user && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
              >
                <PlusCircle className="w-4 h-4" />
                Create Course
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 lg:gap-3">
          <ThemeToggle className="text-slate-400 hover:text-white" />

          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;