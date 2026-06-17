"use client";
import React from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export const TopHeader = ({ theme, toggleTheme }: { theme: string, toggleTheme: () => void }) => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Nova User";
  const userImage = session?.user?.image || "https://i.pravatar.cc/150?img=11";
  return (
    <header className="w-full h-20 flex items-center justify-between px-6 bg-[#FFF5E4] dark:bg-[#1A1D23] border-b border-black/5 dark:border-white/5 z-50 shrink-0">
      
      {/* Brand */}
      <div className="flex items-center gap-3 w-1/4">
        <Image src="/logo.svg" alt="logo" width={40} height={40} className="w-10 h-10" />
        <span className="text-2xl font-black font-heading tracking-tighter text-[#2D2A26] dark:text-[#F0EEEC]">
          NOVA
        </span>
      </div>

      {/* Neumorphic Search Bar */}
      <div className="flex-1 max-w-xl flex items-center justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search workspace..."
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
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications (Neumorphic Button) */}
        <button
          className="relative w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-[#FF9494] dark:text-gray-400 transition-colors
                     bg-[#FFF5E4] dark:bg-[#1A1D23]
                     shadow-[4px_4px_8px_#E5DCD0,-4px_-4px_8px_#FFFFFF] 
                     dark:shadow-[4px_4px_8px_#121418,-4px_-4px_8px_#22262e]
                     active:shadow-[inset_4px_4px_8px_#E5DCD0,inset_-4px_-4px_8px_#FFFFFF]
                     dark:active:shadow-[inset_4px_4px_8px_#121418,inset_-4px_-4px_8px_#22262e]"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FF9494]" />
        </button>

        {/* Neumorphic User Avatar */}
        <div className="flex items-center gap-3 px-2 py-1 rounded-full bg-[#FFF5E4] dark:bg-[#1A1D23]
                        shadow-[4px_4px_8px_#E5DCD0,-4px_-4px_8px_#FFFFFF] 
                        dark:shadow-[4px_4px_8px_#121418,-4px_-4px_8px_#22262e]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFE3E1] to-[#FF9494] overflow-hidden border-2 border-[#FFF5E4] dark:border-[#1A1D23]">
             <img src={userImage} alt={userName} className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-sm pr-4 text-[#2D2A26] dark:text-[#F0EEEC]">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
};
