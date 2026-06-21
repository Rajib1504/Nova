"use client";
import React, { useState } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TopHeader = ({
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  searchInputRef,
}: {
  theme: string;
  toggleTheme: (e: React.MouseEvent) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Nova User";
  const userImage = session?.user?.image || "https://i.pravatar.cc/150?img=11";

  return (
    <header className="w-full h-20 flex items-center justify-between px-6 bg-white/40 dark:bg-[#1A1D23]/60 backdrop-blur-md border-b border-white/20 dark:border-white/5 z-50 shrink-0 shadow-sm">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-3 w-1/4 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Image
          src="/logo.svg"
          alt="logo"
          width={40}
          height={40}
          className="w-10 h-10"
          style={{ width: "auto", height: "auto" }}
        />
        <span className="text-2xl font-black font-heading tracking-tighter text-[#2D2A26] dark:text-[#F0EEEC]">
          NOVA
        </span>
      </Link>

      {/* Neumorphic Search Bar */}
      <div className="flex-1 max-w-xl flex items-center justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="nova-search-input"
            ref={searchInputRef}
            type="text"
            placeholder="Search workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-full bg-[#FFF5E4] dark:bg-[#1A1D23] 
                       text-[#2D2A26] dark:text-[#F0EEEC] placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#FF9494]/50 transition-all
                       shadow-[inset_4px_4px_8px_#E5DCD0,inset_-4px_-4px_8px_#FFFFFF] 
                       dark:shadow-[inset_4px_4px_8px_#121418,inset_-4px_-4px_8px_#22262e]"
          />
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center justify-end gap-6 w-1/4">
        {/* Cmd+K Hint Badge */}
        <div
          className="w-18 h-12 rounded-full flex items-center justify-center bg-[#FFF5E4] dark:bg-[#1A1D23] 
                       text-gray-400 dark:text-gray-500 
                       focus:outline-none focus:ring-2 focus:ring-[#FF9494]/50 transition-all
                       shadow-[inset_4px_4px_8px_#E5DCD0,inset_-4px_-4px_8px_#FFFFFF] 
                       dark:shadow-[inset_4px_4px_8px_#121418,inset_-4px_-4px_8px_#22262e]"
        >
          ⌘K
        </div>

        {/* Theme Toggle (Neumorphic Button) */}
        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-[#FF9494] dark:text-gray-400 transition-colors
                     bg-[#FFF5E4] dark:bg-[#1A1D23]
                     shadow-[4px_4px_8px_#E5DCD0,-4px_-4px_8px_#FFFFFF] 
                     dark:shadow-[4px_4px_8px_#121418,-4px_-4px_8px_#22262e]
                     active:shadow-[inset_4px_4px_8px_#E5DCD0,inset_-4px_-4px_8px_#FFFFFF]
                     dark:active:shadow-[inset_4px_4px_8px_#121418,inset_-4px_-4px_8px_#22262e]"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Neumorphic User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 px-2 py-1 rounded-full bg-[#FFF5E4] dark:bg-[#1A1D23] shadow-[4px_4px_8px_#E5DCD0,-4px_-4px_8px_#FFFFFF] dark:shadow-[4px_4px_8px_#121418,-4px_-4px_8px_#22262e] hover:scale-100 active:scale-95 transition-transform cursor-pointer border-none outline-none focus:outline-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFE3E1] to-[#FF9494] overflow-hidden border-2 border-[#FFF5E4] dark:border-[#1A1D23]">
              <img
                src={userImage}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-sm pr-4 text-[#2D2A26] dark:text-[#F0EEEC]">
              {userName}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 mt-2 bg-[#FFF5E4] dark:bg-[#1A1D23] border border-black/10 dark:border-white/20 shadow-lg backdrop-blur-3xl rounded-xl z-50"
          >
            <DropdownMenuItem
              className="cursor-pointer font-medium hover:bg-black/5 dark:hover:bg-white/10 p-2.5 rounded-lg focus:bg-black/5 dark:focus:bg-white/10"
              onClick={() => (window.location.href = "/")}
            >
              Home
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer font-medium hover:bg-black/5 dark:hover:bg-white/10 p-2.5 rounded-lg focus:bg-black/5 dark:focus:bg-white/10"
              onClick={() => (window.location.href = "/command-center")}
            >
              Command Center
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer font-medium hover:bg-black/5 dark:hover:bg-white/10 p-2.5 rounded-lg focus:bg-black/5 dark:focus:bg-white/10"
              onClick={() => (window.location.href = "/settings")}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10 my-1" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer text-red-500 font-medium hover:bg-red-500/10 dark:hover:bg-red-500/20 p-2.5 rounded-lg focus:bg-red-500/10 dark:focus:bg-red-500/20 focus:text-red-500"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
