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
      <div className="container flex h-full items-center justify-between px-4 lg:px-6">
        {/* Smartify Button */}
        <div className="flex items-center gap-2">
          <Link href="https://smartify.cakrawala.live/">
            <Button 
              variant="outline" 
              className="text-sm font-semibold px-4 py-2 lg:text-base lg:px-6 lg:py-3 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
              Smartify
            </Button>
          </Link>
        </div>

        {/* Navbar items */}
        <div className="flex-1 flex items-center justify-end gap-2 lg:gap-4">
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <Link href="/gallery">
              <Button variant="ghost" size="sm" className="px-2 py-1 text-xs lg:text-sm lg:px-3 lg:py-2">
                <Home className="mr-1 h-4 w-4" />
                <span className="hidden lg:inline">Course</span>
              </Button>
            </Link>

            {session?.user && (
              <>
                <Link href="/create">
                  <Button variant="ghost" size="sm" className="px-2 py-1 text-xs lg:text-sm lg:px-3 lg:py-2">
                    <Book className="mr-1 h-4 w-4" />
                    <span className="hidden lg:inline">Create Course</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="px-2 py-1 text-xs lg:text-sm lg:px-3 lg:py-2">
                    <Settings className="mr-1 h-4 w-4" />
                    <span className="hidden lg:inline">Settings</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <ThemeToggle className="text-sm" />

            {session?.user ? (
              <UserAccountNav user={session.user} />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;