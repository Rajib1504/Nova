"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Sparkles,
  Rocket,
  CreditCard,
  Moon,
  Sun,
  LayoutDashboard
} from "lucide-react";
import "./workspace/command-palette.css"; // Reuse the beautiful styling from the workspace

interface LandingCommandPaletteProps {
  onTriggered?: () => void;
}

export function LandingCommandPalette({ onTriggered }: LandingCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K or Ctrl+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        document.dispatchEvent(new CustomEvent("nova-landing-cmdk-open"));
        if (onTriggered) onTriggered();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onTriggered]);

  const handleSignIn = () => {
    setOpen(false);
    signIn("google", { callbackUrl: "/command-center" });
  };

  const handleScrollToPricing = () => {
    setOpen(false);
    const element = document.getElementById("pricing");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToFeatures = () => {
    setOpen(false);
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToggleTheme = () => {
    setOpen(false);
    // Since we manually handle theme in landing page currently, we can dispatch an event or just toggle body class
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("nova-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nova-theme", "dark");
    }
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Landing Command Menu"
      className="nova-cmdk-dialog"
    >
      <div className="nova-cmdk-overlay" onClick={() => setOpen(false)} />
      <div className="nova-cmdk-content glass">
        <div className="flex items-center px-4 py-3 border-b border-white/20 dark:border-white/5">
          <Sparkles className="w-5 h-5 text-indigo-500 mr-3" />
          <Command.Input
            placeholder="Where do you want to go?"
            className="w-full bg-transparent text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-lg"
          />
          <div className="text-[10px] text-gray-400 font-mono font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded">ESC</div>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">
            No actions found.
          </Command.Empty>

          <Command.Group heading="Get Started" className="nova-cmdk-group">
            <Command.Item onSelect={handleSignIn} className="nova-cmdk-item text-indigo-600 dark:text-indigo-400 font-bold data-[selected=true]:bg-indigo-500/10">
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Connect Gmail & Go to Dashboard
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Navigation" className="nova-cmdk-group">
            <Command.Item onSelect={handleScrollToFeatures} className="nova-cmdk-item">
              <Rocket className="w-4 h-4 mr-3" />
              Explore Features
            </Command.Item>
            <Command.Item onSelect={handleScrollToPricing} className="nova-cmdk-item">
              <CreditCard className="w-4 h-4 mr-3" />
              View Pricing
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Preferences" className="nova-cmdk-group">
            <Command.Item onSelect={handleToggleTheme} className="nova-cmdk-item">
              <Moon className="w-4 h-4 mr-3 hidden dark:block" />
              <Sun className="w-4 h-4 mr-3 block dark:hidden" />
              Toggle Dark/Light Mode
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
