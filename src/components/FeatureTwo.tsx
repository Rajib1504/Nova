"use client";
import React from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Users, ArrowRight } from "lucide-react";
import { BlobButton } from "./BlobButton";
import { Text3DReveal } from "./Text3DReveal";
import { TextBlurReveal } from "./TextBlurReveal";

export const FeatureTwo = () => {
  return (
    <section className="relative w-full py-20 flex flex-col items-center justify-center overflow-hidden z-20">
      <div className="w-full max-w-7xl px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Glass Mockup (Reverse Layout) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-[500px] glass bg-white/60 dark:bg-[#22262E]/60 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 flex flex-col order-2 lg:order-1"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
              <CalendarIcon className="w-5 h-5 text-[#FF9494]" />
              <span>Today's Alignment</span>
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Oct 24
            </div>
          </div>

          {/* Timeline View */}
          <div className="flex-1 relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 pl-6 flex flex-col gap-6">
            
            {/* Standard Meeting */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="relative bg-white/80 dark:bg-[#1A1D23]/80 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="absolute -left-[29px] top-4 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Daily Standup</h4>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 09:00 AM</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 8 Participants</span>
              </div>
            </motion.div>

            {/* High Priority Popping Meeting */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 15,
                delay: 0.8 
              }}
              className="relative bg-[#FFF5E4] dark:bg-[#322A2A] rounded-xl p-4 border border-[#FF9494]/30 shadow-md z-10 cursor-pointer"
            >
              {/* Highlight Dot */}
              <div className="absolute -left-[29px] top-4 w-3 h-3 rounded-full bg-[#FF9494] shadow-[0_0_10px_#FF9494]" />
              
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-[#FF7B7B]">Protocol Review & Synthesis</h4>
                <span className="text-[10px] font-bold bg-[#FF9494]/20 text-[#FF7B7B] px-2 py-1 rounded-full uppercase tracking-wider">
                  High Priority
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 11:30 AM</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Exec Team</span>
              </div>

              {/* Animated Doodle Circle around the high priority meeting */}
              <motion.svg
                className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] text-[#FF9494] pointer-events-none opacity-50"
                viewBox="0 0 400 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 200 10 C 350 5, 390 50, 350 90 C 250 105, 50 95, 20 70 C -10 40, 50 15, 200 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
                />
              </motion.svg>
            </motion.div>

            {/* Standard Meeting */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.0 }}
              className="relative bg-white/80 dark:bg-[#1A1D23]/80 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm opacity-60"
            >
              <div className="absolute -left-[29px] top-4 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Async Wrap-up</h4>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 04:00 PM</span>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* Right Column: Text & Doodles */}
        <div className="relative z-10 flex flex-col items-start text-left order-1 lg:order-2 lg:pl-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">
              Schedule Alignment
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Text3DReveal
              text={`Your Calendar, ${'\n'} Effortless`}
              className="text-4xl md:text-6xl font-bold font-heading tracking-tight leading-[1.1] text-gray-900 dark:text-white mb-6 !justify-start"
              highlightWords={["Effortless"]}
              highlightClass="text-blue-500"
            />
          </motion.div>

          <TextBlurReveal
            text="The neural core autonomously monitors your time constraints, triages overlapping meetings, and prioritizes essential protocols so you can focus on deep work."
            className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href="/dashboard">
              <BlobButton
                blobColor="#3B82F6"
                textColor="#3B82F6"
                hoverTextColor="#FFFFFF"
              >
                Sync Telemetry <ArrowRight className="w-4 h-4 ml-2 inline" />
              </BlobButton>
            </a>
          </motion.div>
        </div>
        
      </div>
    </section>
  );
};
