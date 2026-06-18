"use client";
import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import { MoonStar, Sun, Loader2 } from "lucide-react";
import { BlobButton } from "./BlobButton";
import { useSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  theme: string;
  toggleTheme: (e: React.MouseEvent) => void;
}

export const Navbar = ({ theme, toggleTheme }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const [isInitializing, setIsInitializing] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    if (status === "authenticated") {
      const justLoggedIn = sessionStorage.getItem("just_logged_in");
      if (justLoggedIn === "true") {
        sessionStorage.removeItem("just_logged_in");
        toast.success("Neural Core Initialized Successfully!", { id: "auth" });
      } else if (!sessionStorage.getItem("welcome_shown")) {
        sessionStorage.setItem("welcome_shown", "true");
        toast.success(`Welcome back, ${session.user?.name || "Nova User"}! Database synchronized.`);
      }
    } else if (status === "unauthenticated") {
      setIsInitializing(false);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const error = url.searchParams.get("error");
        if (error) {
          toast.error("Authentication Failed. Please try again.", { id: "auth" });
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [status, session]);

  const handleInitialize = () => {
    setIsInitializing(true);
    sessionStorage.setItem("just_logged_in", "true");
    toast.loading("Establishing Secure Connection...", { id: "auth" });
    signIn("google");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: -5 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`w-[90%] max-w-7xl px-8 flex justify-between items-center transition-all duration-500 ease-out rounded-full ${isScrolled ? "glass py-3 border border-white/20 shadow-lg backdrop-blur-3xl bg-[var(--panel)]" : "bg-transparent py-4 border-transparent"}`}
      >
        <div className="flex items-center gap-3 interactive cursor-pointer">
          <div className="w-8 h-8">
            <Image
              src="/logo.svg"
              alt="Nova AI"
              width={32}
              height={32}
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          <span className="text-2xl font-bold font-heading tracking-tight text-[var(--foreground)]">
            Nova AI
          </span>
        </div>

        <div className="hidden md:flex space-x-10 text-[15px] font-medium tracking-wide">
          {[
            { name: "Product", href: "/#home" },
            { name: "Features", href: "/#features" },
            { name: "Pricing", href: "/#pricing" },
            { name: "About", href: "/about" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="interactive relative group text-gray-600 dark:text-gray-300 hover:text-[var(--foreground)] dark:hover:text-white transition-colors"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 ease-out group-hover:w-full"></span>
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-5">
          <button
            onClick={toggleTheme}
            className="interactive w-10 h-10 rounded-full flex items-center justify-center neu-light dark:neu-light hover:neu-pressed transition-all duration-300"
            aria-label="Toggle Theme"
          >
            <motion.span
              initial={false}
              animate={{
                rotate: theme === "light" ? 0 : 180,
                scale: theme === "light" ? 1 : 0.8,
              }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              {theme === "light" ? <MoonStar /> : <Sun />}
            </motion.span>
          </button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                  <Image
                    src={
                      session.user?.image || "https://i.pravatar.cc/150?img=11"
                    }
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full shadow-sm"
                  />
                  <span className="text-sm font-semibold text-[var(--foreground)] hidden md:block">
                    {session.user?.name || "Nova User"}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#FFF5E4] dark:bg-[#1A1D23] border border-black/10 dark:border-white/20 shadow-lg backdrop-blur-3xl rounded-xl"
              >
                <DropdownMenuItem
                  className="cursor-pointer font-medium hover:bg-black/5 dark:hover:bg-white/10 p-2.5 rounded-lg focus:bg-black/5 dark:focus:bg-white/10"
                  onClick={() => (window.location.href = "/command-center")}
                >
                  Command Center
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer font-medium hover:bg-black/5 dark:hover:bg-white/10 p-2.5 rounded-lg focus:bg-black/5 dark:focus:bg-white/10"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10 my-1" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-red-500 font-medium hover:bg-red-500/10 dark:hover:bg-red-500/20 p-2.5 rounded-lg focus:bg-red-500/10 dark:focus:bg-red-500/20 focus:text-red-500"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div onClick={handleInitialize} className={isInitializing ? "pointer-events-none opacity-80" : ""}>
              <BlobButton
                className="interactive"
                blobColor="#FF7B7B"
                textColor="#FF7B7B"
                hoverTextColor="#FFFFFF"
                size="md"
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <>
                    <span>Connecting...</span>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Initialize</span>
                    <motion.svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </motion.svg>
                  </>
                )}
              </BlobButton>
            </div>
          )}
        </div>
      </motion.nav>
    </div>
  );
};

