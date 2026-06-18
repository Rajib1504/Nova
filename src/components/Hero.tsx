"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mic,
  Send,
  Sparkles,
  Calendar,
  Tag,
  Check,
} from "lucide-react";

import { BlobButton } from "./BlobButton";
import { Text3DReveal } from "./Text3DReveal";
import Image from "next/image";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Mouse Parallax for the 3D Mockup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    damping: 30,
    stiffness: 100,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    damping: 30,
    stiffness: 100,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center px-4 pt-28 pb-20 text-center min-h-[90vh] overflow-hidden"
      style={{ perspective: 1200 }}
    >
      {/* Modern Tech Grid & Glowing Beams Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden flex justify-center">
        {/* Light mode grid */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-0 bg-[radial-gradient(circle,#1A1D23_1.5px,transparent_1.5px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]"></div>
        {/* Dark mode grid */}
        <div className="absolute inset-0 opacity-0 dark:opacity-[0.08] bg-[radial-gradient(circle,#FFFFFF_1.5px,transparent_1.5px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]"></div>

        {/* Dynamic Sweeping Beams */}
        <motion.div
          animate={{ x: ["-100vw", "100vw"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] w-[150vw] h-[2px] bg-gradient-to-r from-transparent via-[#FF9494] to-transparent opacity-20 blur-[2px] transform -rotate-12"
        />
        <motion.div
          animate={{ x: ["100vw", "-100vw"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[50%] w-[150vw] h-[1px] bg-gradient-to-r from-transparent via-[#FF9494] to-transparent opacity-20 blur-[1px] transform rotate-6"
        />

        {/* Central Core Glow for depth */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] w-[80vw] max-w-[800px] h-[500px] bg-[#FF9494] rounded-[100%] blur-[120px] dark:opacity-[0.15]"
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center w-full max-w-5xl mt-12"
      >
        {/* Keyboard Superpower Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm"
        >
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Your keyboard is your superpower. Discover shortcuts with
          </span>
          <kbd className="font-mono bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10 text-xs font-bold text-[#FF9494]">
            shift + /
          </kbd>
        </motion.div>

        {/* Clean, Premium Typography Headline */}
        <div className="text-center z-20">
          <Text3DReveal
            text="Orchestrate Your Workflow \n with Autonomous Intelligence"
            animationType="time"
            className="text-5xl md:text-7xl font-bold font-heading tracking-tight leading-[1.1] text-[#1A1D23] dark:text-white"
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl font-sans font-medium leading-relaxed"
        >
          Accelerate your deep work. Nova AI autonomously triages your
          communications, aligns your schedule, and synthesizes contextual
          responses in milliseconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 relative z-20"
        >
          <a href="/dashboard">
            <BlobButton
              className="interactive"
              blobColor="#FF7B7B"
              textColor="#FF7B7B"
              hoverTextColor="#FFFFFF"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              ✦ Experience the Future of Work
            </BlobButton>
          </a>
        </motion.div>
      </motion.div>

      {/* Container for Mockup and Independent Floating Badges */}
      <div
        className="relative mt-22 w-full max-w-6xl"
        style={{ perspective: 1200 }}
      >
        {/* Floating Badges (Outside the tilted mockup, floating independently) */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-32 -left-12 glass bg-white/80 dark:bg-black/40 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-white/40 dark:border-white/10 z-50 flex items-center gap-3 transform -rotate-2 pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-[#FFE3E1] flex items-center justify-center text-[#FF9494]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Contextual Synthesis Complete
          </span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-20 -right-8 glass bg-white/80 dark:bg-black/40 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-white/40 dark:border-white/10 z-50 flex items-center gap-3 transform rotate-3 pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Protocol Aligned for 14:00
          </span>
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4.5,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-28 -right-4 glass bg-white/80 dark:bg-black/40 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-white/40 dark:border-white/10 z-50 flex flex-col gap-3 transform -rotate-1 pointer-events-none"
        >
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left">
            Deploy Sequence?
          </span>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold border border-black/5 dark:border-white/5 shadow-sm">
              Review Telemetry
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#FF9494] text-white text-xs font-bold shadow-md">
              Authorize Deployment
            </div>
          </div>
        </motion.div>

        {/* 3D Glassmorphic Mockup with Parallax */}
        <motion.div
          style={{ rotateX, rotateY, z: 100 }}
          initial={{ opacity: 0, y: 150, scale: 0.9, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          transition={{
            duration: 1.5,
            delay: 0.6,
            type: "spring",
            stiffness: 40,
            damping: 20,
          }}
          className="w-full h-[650px] glass rounded-3xl neu-card overflow-hidden relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white/60 dark:border-white/10 z-20 transform-style-3d bg-[#FFF5E4]/80 dark:bg-[#1A1D23]/80 backdrop-blur-2xl"
        >
          {/* Content Columns inside Mockup */}
          <div className="absolute inset-0 flex">
            {/* LEFT COLUMN: INBOX */}
            <div className="w-[30%] h-full border-r border-black/5 dark:border-white/10 p-5 flex flex-col space-y-4 bg-white/30 dark:bg-black/20">
              <div className="w-full bg-white/60 dark:bg-black/40 rounded-xl p-3 flex items-center gap-2 shadow-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 font-medium">
                  Query Workspace Data...
                </span>
              </div>

              {/* Email Cards */}
              <div className="flex flex-col space-y-3 overflow-hidden">
                <div className="bg-white/90 dark:bg-[#22262E] rounded-2xl p-4 shadow-sm border border-[#FFE3E1] dark:border-gray-700 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FF9494] rounded-l-2xl"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden relative">
                        <Image
                          src="https://i.ibb.co/FJgrGVk/wor.jpg"
                          alt="Avatar"
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Sarah Jenkins
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      10:45 AM
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                    Q4 Strategic Telemetry & Metrics
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                    Alex, the predictive models for Q4 are finalized. Review the
                    attached telemetry data...
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#FF9494]"></div>
                    <span className="text-[9px] font-bold text-[#FF9494] uppercase tracking-wider">
                      HIGH PRIORITY
                    </span>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-[#22262E]/50 rounded-2xl p-4 shadow-sm border border-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        DW
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Design Weekly
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Yesterday
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                    Spatial Computing Architectures
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                    An analysis of the paradigm shift toward spatial neomorphism
                    in enterprise environments...
                  </p>
                </div>

                <div className="bg-white/50 dark:bg-[#22262E]/50 rounded-2xl p-4 shadow-sm border border-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden relative">
                        <Image
                          src="https://i.ibb.co/3fGkDSH/ey-Jid-WNr-ZXQi-Oi-Jjb250-ZW50-Lmhzd3-N0-YXRp-Yy5jb20i-LCJr-ZXki-Oi-Jna-WZc-L3-Bs-YXlc-Lz-Bi-N2-Y0-Z.webp"
                          alt="Avatar"
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Mark Thompson
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Yesterday
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                    Sync Protocol: Evening Itinerary
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                    Confirming the logistics and optimal routing for our
                    upcoming alignment dinner at...
                  </p>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: AI ASSISTANT */}
            <div className="w-[40%] h-full flex flex-col bg-[#FFE3E1]/20 dark:bg-[#1A1D23]/50 relative">
              {/* Header */}
              <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF9494] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800 dark:text-white">
                    Nova AI
                  </div>
                  <div className="text-[10px] text-[#FF9494] font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF9494]"></div>{" "}
                    Neural Core Active • Autonomous Triage
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 flex flex-col space-y-4 overflow-hidden">
                {/* AI Bubble */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF9494] text-white flex flex-shrink-0 items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="bg-white dark:bg-[#22262E] rounded-2xl rounded-tl-none p-4 shadow-sm text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-800">
                    Alex, inbox triage complete. I isolated{" "}
                    <strong>3 critical escalations</strong> from Sarah
                    concerning Q4 telemetry. Shall I synthesize an executive
                    summary and extract actionable directives?
                  </div>
                </div>

                {/* User Bubble */}
                <div className="flex gap-3 self-end flex-row-reverse max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0">
                    <Image
                      src="https://i.ibb.co/VxDJ7kt/profile-photo-1.jpg"
                      alt="Alex"
                      fill
                      sizes="40px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="bg-[#FF9494] text-white rounded-2xl rounded-tr-none p-4 shadow-md text-[13px] leading-relaxed">
                    Execute synthesis. Additionally, cross-reference my schedule
                    for tomorrow to isolate a 30-minute block for strategic
                    alignment with her.
                  </div>
                </div>

                {/* AI Bubble 2 */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF9494] text-white flex flex-shrink-0 items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="bg-white dark:bg-[#22262E] rounded-2xl rounded-tl-none p-4 shadow-sm text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-800">
                    Schedule mapped. Optimal window identified at{" "}
                    <strong>14:30</strong> between "Product Sync" and "Global
                    Review". Awaiting authorization to dispatch calendar
                    protocol to Sarah.
                  </div>
                </div>
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                <div className="bg-white dark:bg-[#22262E] rounded-full px-4 py-3 flex items-center justify-between shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-gray-400 cursor-pointer hover:text-[#FF9494] transition-colors" />
                    {/* Fake Audio Wave */}
                    <div className="flex items-center gap-0.5">
                      {[1, 3, 2, 4, 2, 5, 3, 1, 2].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#FF9494] rounded-full"
                          style={{ height: `${h * 4}px`, opacity: 0.7 }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FF9494] flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform">
                    <Send className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CALENDAR */}
            <div className="w-[30%] h-full border-l border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/30 p-5 flex flex-col text-gray-800 dark:text-gray-200">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 text-sm font-semibold">
                  <span className="text-gray-400">Day</span>
                  <span className="text-[#FF9494]">Week</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                  October 2024
                  <div className="flex gap-1">
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-6 gap-2 mb-2 text-center text-[10px] font-bold text-gray-500 uppercase">
                <div></div>
                <div>
                  Mon
                  <br />
                  <span className="text-xs text-gray-800 dark:text-gray-200">
                    21
                  </span>
                </div>
                <div className="text-[#FF9494]">
                  Tue
                  <br />
                  <span className="text-xs">22</span>
                </div>
                <div>
                  Wed
                  <br />
                  <span className="text-xs text-gray-800 dark:text-gray-200">
                    23
                  </span>
                </div>
                <div>
                  Thu
                  <br />
                  <span className="text-xs text-gray-800 dark:text-gray-200">
                    24
                  </span>
                </div>
                <div>
                  Fri
                  <br />
                  <span className="text-xs text-gray-800 dark:text-gray-200">
                    25
                  </span>
                </div>
              </div>

              {/* Time Grid & Events */}
              <div className="flex-1 relative border-t border-black/5 dark:border-white/10 pt-2">
                <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-gray-400 font-medium">
                  {[
                    "08 AM",
                    "09 AM",
                    "10 AM",
                    "11 AM",
                    "12 PM",
                    "01 PM",
                    "02 PM",
                  ].map((time) => (
                    <div key={time} className="flex w-full items-center">
                      <span className="w-8">{time}</span>
                      <div className="flex-1 border-b border-black/5 dark:border-white/5 border-dashed"></div>
                    </div>
                  ))}
                </div>

                {/* Current Time Line */}
                <div className="absolute top-[35%] left-8 right-0 border-b-2 border-[#FF9494] z-10">
                  <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-[#FF9494]"></div>
                </div>

                {/* Pale Pink Events */}
                {/* Product Sync */}
                <div className="absolute top-[28%] left-[28%] w-[15%] h-16 bg-[#FFE3E1] dark:bg-[#FF9494]/20 border border-[#FF9494]/30 rounded-lg p-1.5 shadow-sm">
                  <div className="text-[9px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                    Product
                    <br />
                    Sync
                  </div>
                  <div className="text-[7px] text-gray-500 mt-1">
                    10:00 - 11:30
                  </div>
                </div>

                {/* Sprint Prep */}
                <div className="absolute top-[14%] left-[60%] w-[15%] h-10 bg-[#FFE3E1] dark:bg-[#FF9494]/20 border border-[#FF9494]/30 rounded-lg p-1.5 shadow-sm">
                  <div className="text-[9px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                    Sprint
                    <br />
                    Prep
                  </div>
                </div>

                {/* Global Review */}
                <div className="absolute top-[57%] left-[44%] w-[15%] h-20 bg-[#FFE3E1] dark:bg-[#FF9494]/20 border border-[#FF9494]/30 rounded-lg p-1.5 shadow-sm">
                  <div className="text-[9px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                    Global
                    <br />
                    Review
                  </div>
                  <div className="text-[7px] text-gray-500 mt-1">
                    12:00 - 02:00
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
