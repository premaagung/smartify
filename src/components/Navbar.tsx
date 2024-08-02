import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import SignInButton from "./SignInButton";
import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Home, Book, Settings } from "lucide-react";

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <nav className="fixed inset-x-0 top-0 z-[10] h-16 border-b border-zinc-300 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-full items-center justify-between">
        <Link href="http://localhost:3000/" className="flex items-center gap-2">
          <Button variant="outline" className="text-xl font-bold">
            Smartify
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/gallery">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Gallery
            </Button>
          </Link>

          {session?.user && (
            <>
              <Link href="/create">
                <Button variant="ghost" size="sm">
                  <Book className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </>
          )}

          <ThemeToggle />

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