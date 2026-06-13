"use client";
import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import { MoonStar, Sun } from "lucide-react";
import { BlobButton } from "./BlobButton";

interface NavbarProps {
  theme: string;
  toggleTheme: (e: React.MouseEvent) => void;
}

export const Navbar = ({ theme, toggleTheme }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`w-[90%] max-w-7xl px-8 flex justify-between items-center transition-all duration-500 ease-out rounded-full ${isScrolled ? "glass py-3 border border-white/20 shadow-lg backdrop-blur-3xl bg-[var(--panel)]" : "bg-transparent py-4 border-transparent"}`}
      >
        <div className="flex items-center gap-3 interactive cursor-pointer">
          <div className="w-8 h-8">
            <Image src="/logo.svg" alt="Nova AI" width={32} height={32} />
          </div>

          <span className="text-2xl font-bold font-heading tracking-tight text-[var(--foreground)]">
            Nova AI
          </span>
        </div>

        <div className="hidden md:flex space-x-10 text-[15px] font-medium tracking-wide">
          {["Product", "Features", "Pricing", "Blog"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="interactive relative group text-gray-600 dark:text-gray-300 hover:text-[var(--foreground)] dark:hover:text-white transition-colors"
            >
              {item}
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

          <BlobButton
            className="interactive"
            blobColor="#FF7B7B"
            textColor="#FF7B7B"
            hoverTextColor="#FFFFFF"
          >
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
              ></path>
            </motion.svg>
          </BlobButton>
        </div>
      </motion.nav>
    </div>
  );
};
