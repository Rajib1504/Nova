import React from "react";
import Link from "next/link";
import { Hexagon, Home } from "lucide-react";
import { BlobButton } from "@/components/BlobButton";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white dark:bg-[#1A1D23]">
      <div className="z-10 flex flex-col items-center text-center p-8 glass rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl max-w-lg w-full">
        <div className="w-24 h-24 bg-gradient-to-tr from-[#FF7B7B] to-[#FF9494] rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,148,148,0.5)] rotate-12">
          <Hexagon className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-8xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Neural Pathway Disconnected
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-md mx-auto">
          The quadrant you are trying to access does not exist in Nova's current workspace. The page may have been moved or deleted.
        </p>

        <Link href="/">
          <BlobButton size="lg" className="flex items-center gap-2 group w-[250px]">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Return to Core
          </BlobButton>
        </Link>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF9494] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-10 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFE3E1] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 dark:opacity-10 animate-blob animation-delay-2000"></div>
    </div>
  );
}
