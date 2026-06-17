"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { toggleThemeWithTransition } from "@/utils/theme";

export default function AboutPage() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nova-theme");
    if (savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"))) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    toggleThemeWithTransition(e, theme, setTheme);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5E4] dark:bg-[#1A1D23] transition-colors duration-500">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-gray-900 dark:text-white mb-6">
            About Nova AI
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-12">
            Nova AI is a next-generation workflow orchestrator built to eliminate digital friction. 
            By integrating directly with your most important tools, it autonomously triages communications, 
            aligns your schedule, and synthesizes contextual responses—allowing you to focus entirely on deep work.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
            <div className="glass p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9494]/20 flex items-center justify-center mb-6">
                <span className="text-[#FF9494] text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Ruthless Minimalism</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe software should get out of your way. Our interface is designed to be completely keyboard-driven and lightning fast.
              </p>
            </div>
            
            <div className="glass p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9494]/20 flex items-center justify-center mb-6">
                <span className="text-[#FF9494] text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Contextual Intelligence</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nova understands the relationships between your emails, meetings, and documents, synthesizing information before you even ask.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9494]/20 flex items-center justify-center mb-6">
                <span className="text-[#FF9494] text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Complete Autonomy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built on the Corsair SDK, Nova doesn't just suggest actions—it executes them securely across your integrated platforms.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
