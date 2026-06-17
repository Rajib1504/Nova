"use client";
import React from "react";
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

export const TopHeader = ({ theme, toggleTheme, searchQuery, setSearchQuery }: { theme: string, toggleTheme: () => void, searchQuery: string, setSearchQuery: (q: string) => void }) => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Nova User";
  const userImage = session?.user?.image || "https://i.pravatar.cc/150?img=11";
  return (
    <header className="w-full h-20 flex items-center justify-between px-6 bg-[#FFF5E4] dark:bg-[#1A1D23] border-b border-black/5 dark:border-white/5 z-50 shrink-0">
      
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 w-1/4 cursor-pointer hover:opacity-80 transition-opacity">
        <Image src="/logo.svg" alt="logo" width={40} height={40} className="w-10 h-10" />
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



        {/* Neumorphic User Avatar Dialog */}
        <Dialog>
          <DialogTrigger className="flex items-center gap-3 px-2 py-1 rounded-full bg-[#FFF5E4] dark:bg-[#1A1D23]
                            shadow-[4px_4px_8px_#E5DCD0,-4px_-4px_8px_#FFFFFF] 
                            dark:shadow-[4px_4px_8px_#121418,-4px_-4px_8px_#22262e]
                            hover:scale-105 active:scale-95 transition-transform cursor-pointer border-none outline-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFE3E1] to-[#FF9494] overflow-hidden border-2 border-[#FFF5E4] dark:border-[#1A1D23]">
               <img src={userImage} alt={userName} className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm pr-4 text-[#2D2A26] dark:text-[#F0EEEC]">
              {userName}
            </span>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-sm bg-[#FFF5E4] dark:bg-[#1A1D23] border-none shadow-[20px_20px_60px_#d9d0c2,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#16181e,-20px_-20px_60px_#1e2228] rounded-3xl p-8">
            <DialogHeader className="hidden">
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#FFE3E1] to-[#FF9494] overflow-hidden border-[6px] border-[#FFF5E4] dark:border-[#1A1D23] shadow-[8px_8px_16px_#E5DCD0,-8px_-8px_16px_#FFFFFF] dark:shadow-[8px_8px_16px_#121418,-8px_-8px_16px_#22262e] mb-6">
                 <img src={userImage} alt={userName} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-black font-heading text-[#2D2A26] dark:text-[#F0EEEC] mb-1 tracking-tight">
                {userName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                {session?.user?.email || "nova@user.com"}
              </p>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full py-3.5 rounded-2xl font-bold text-[#FF9494] bg-[#FFF5E4] dark:bg-[#1A1D23]
                           shadow-[6px_6px_12px_#E5DCD0,-6px_-6px_12px_#FFFFFF] 
                           dark:shadow-[6px_6px_12px_#121418,-6px_-6px_12px_#22262e]
                           active:shadow-[inset_4px_4px_8px_#E5DCD0,inset_-4px_-4px_8px_#FFFFFF]
                           dark:active:shadow-[inset_4px_4px_8px_#121418,inset_-4px_-4px_8px_#22262e]
                           transition-all outline-none border-none hover:text-[#ff7a7a]"
              >
                Sign Out
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
