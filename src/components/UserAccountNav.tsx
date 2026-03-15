"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { LogOut, Settings, Shield } from "lucide-react";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  user: User & { role?: string; credits?: number };
};

const UserAccountNav = ({ user }: Props) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth");
    router.refresh(); // forces server components (Navbar) to re-render
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500/50 transition-colors outline-none">
          <UserAvatar user={user} />
          <span className="text-sm text-slate-300 hidden sm:block max-w-[100px] truncate">
            {user.name?.split(" ")[0]}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-[#041123] border border-slate-700 text-slate-200 rounded-xl shadow-xl p-1 mt-1"
      >
        {/* User info */}
        <div className="px-3 py-2.5 mb-1">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
          {user.role && (
            <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              user.role === "admin"
                ? "text-red-400 bg-red-500/10 border-red-500/20"
                : user.role === "instructor"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-blue-400 bg-blue-500/10 border-blue-500/20"
            }`}>
              {user.role}
            </span>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-800" />

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-800" />

        <DropdownMenuItem
          onSelect={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-500/10 hover:text-red-400 text-red-400/70 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;