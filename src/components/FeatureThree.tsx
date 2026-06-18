"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Mail, Layout, Menu, Settings } from "lucide-react";
import { BlobButton } from "./BlobButton";
import { Text3DReveal } from "./Text3DReveal";

export const FeatureThree = () => {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const columns = [
    {
      id: 0,
      title: "Inbox Triage",
      icon: Mail,
      color: "text-blue-500",
      content: (
        <div className="flex flex-col gap-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full bg-white/50 dark:bg-[#1A1D23]/50 rounded-lg p-3 border border-black/5 dark:border-white/5 shadow-sm"
            >
              <div className="w-1/2 h-2 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 1,
      title: "Neural Core",
      icon: Sparkles,
      color: "text-[#FF7B7B]",
      content: (
        <div className="flex flex-col h-full mt-4">
          <div className="flex-1 bg-white/50 dark:bg-[#1A1D23]/50 rounded-xl border border-black/5 dark:border-white/5 shadow-inner p-4 relative overflow-hidden">
            <div className="w-3/4 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-lg rounded-tl-none mb-4 p-3 border border-blue-100 dark:border-blue-800/30 text-xs text-blue-800 dark:text-blue-200">
              Query processed. Telemetry aligned.
            </div>
            <div className="w-3/4 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none absolute right-4 bottom-16 p-3 text-xs text-gray-800 dark:text-gray-200 text-right">
              Execute protocol.
            </div>
            <div className="absolute bottom-4 left-4 right-4 h-8 bg-white dark:bg-black rounded-md border border-gray-200 dark:border-gray-800 flex items-center px-2">
              <div className="w-1/2 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Schedule",
      icon: Calendar,
      color: "text-purple-500",
      content: (
        <div className="flex flex-col gap-3 mt-4 relative">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-[90%] ml-auto bg-[#FFF5E4] dark:bg-[#322A2A] rounded-lg p-3 border border-[#FF9494]/20 shadow-sm relative"
            >
              <div className="absolute -left-[18px] top-4 w-2 h-2 rounded-full bg-[#FF9494]"></div>
              <div className="w-2/3 h-2 bg-gray-800 dark:bg-gray-200 rounded mb-2"></div>
              <div className="w-1/3 h-2 bg-gray-400 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="relative w-full py-20 flex flex-col items-center justify-center overflow-hidden z-20">
      {/* Header Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl px-4 text-center mb-16 flex flex-col items-center"
      >
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#FF9494] mb-4">
          <Layout className="w-5 h-5" />
        </div>
        <Text3DReveal
          text={`One Workspace ${"\n"} Total Control`}
          className="text-4xl md:text-6xl font-bold font-heading tracking-tight leading-[1.1] text-gray-900 dark:text-white mb-6"
          highlightWords={["Total", "Control"]}
          highlightClass="text-[#FF9494]"
        />
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
          The ultimate command center. Seamlessly shift between inbox triage,
          schedule alignment, and neural synthesis without ever switching tabs.
          Hover to expand protocols.
        </p>
      </motion.div>

      {/* 3-Column Interactive Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl px-4 md:px-8 h-[600px] cursor-crosshair"
        onMouseLeave={() => setHoveredCol(null)}
      >
        <div className="w-full h-full glass bg-white/60 dark:bg-[#22262E]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden relative">
          {/* Dashboard Header Bar */}
          <div className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 bg-white/30 dark:bg-black/20">
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex gap-4 text-gray-500">
              <Menu className="w-4 h-4" />
              <Settings className="w-4 h-4" />
            </div>
          </div>

          {/* Fluid Columns */}
          <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 h-full">
            {columns.map((col, idx) => {
              const isHovered = hoveredCol === idx;
              const isDimmed = hoveredCol !== null && hoveredCol !== idx;

              return (
                <motion.div
                  key={col.id}
                  onMouseEnter={() => setHoveredCol(idx)}
                  animate={{
                    flex: isHovered ? 2 : 1,
                    opacity: isDimmed ? 0.4 : 1,
                    scale: isHovered ? 1.02 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="h-full bg-white/40 dark:bg-[#1A1D23]/40 rounded-2xl border border-white/40 dark:border-white/5 p-4 flex flex-col relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <col.icon className={`w-5 h-5 ${col.color}`} />
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {col.title}
                    </h3>
                  </div>
                  {col.content}

                  {/* Gradient Overlay for Unhovered State */}
                  <motion.div
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/80 dark:from-[#1A1D23]/80 to-transparent pointer-events-none rounded-b-2xl"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
