"use client";
import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Sparkles, ArrowRight, CornerDownRight } from "lucide-react";
import { BlobButton } from "./BlobButton";
import { Text3DReveal } from "./Text3DReveal";

const TypewriterText = ({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) => {
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{
        overflow: "hidden",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.3rem",
      }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export const FeatureOne = () => {
  return (
    <section className="relative bg-white/40 dark:bg-black/30 w-full py-20 flex flex-col items-center justify-center overflow-hidden z-20">
      <div className="w-full max-w-7xl px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Text & Doodles */}
        <div className="relative z-10 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFE3E1] flex items-center justify-center text-[#FF9494]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-[#FF9494] uppercase tracking-widest">
              Autonomous Synthesis
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative inline-block"
          >
            <Text3DReveal
              text={`AI That ${'\n'} Writes For You`}
              className="text-4xl md:text-6xl font-bold font-heading tracking-tight leading-[1.1] text-gray-900 dark:text-white mb-6 !justify-start"
            />
            {/* Hand-drawn SVG Underline Doodle */}
            <motion.svg
              className="absolute bottom-2 left-0 w-full h-4 text-[#FF9494] overflow-visible pointer-events-none"
              viewBox="0 0 200 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M 5 15 Q 50 0 100 10 T 195 5"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 1.2,
                  delay: 0.5,
                  ease: "easeInOut",
                }}
              />
            </motion.svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed"
          >
            Deploy our advanced neural core to draft contextual responses,
            synthesize meeting notes, and execute complex communication
            protocols in milliseconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <a href="/dashboard">
              <BlobButton
                blobColor="#FF7B7B"
                textColor="#FF7B7B"
                hoverTextColor="#FFFFFF"
              >
                Authorize Protocol <ArrowRight className="w-4 h-4 ml-2 inline" />
              </BlobButton>
            </a>

            {/* Doodle Arrow pointing to mockup */}
            <motion.svg
              className="absolute top-1/2 left-[110%] w-32 h-32 text-gray-400 dark:text-gray-600 hidden lg:block overflow-visible"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M 0 50 Q 50 10 90 70"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
              />
              <motion.path
                d="M 80 65 L 90 70 L 82 80"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.2, delay: 2 }}
              />
            </motion.svg>
          </motion.div>
        </div>

        {/* Right Column: Glass Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-[500px] glass bg-white/60 dark:bg-[#22262E]/60 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              AM
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Alex Mercer
              </h4>
              <p className="text-xs text-gray-500">
                Subject: Partnership Telemetry & Synthesis
              </p>
            </div>
          </div>

          {/* Incoming Email */}
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Hi team, <br />
            <br />
            Could we get an executive summary synthesized for the Q4 partnership
            alignment? We need to deploy the finalized protocol by tomorrow. Let
            me know if the neural core has parsed the raw data.
          </div>

          {/* AI Composing Area */}
          <div className="flex-1 bg-white/80 dark:bg-[#1A1D23]/80 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-inner relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-[#FF9494]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Nova Neural Core Active
              </span>
            </div>

            {/* Animated Typing Indicator */}
            <div className="flex items-center gap-1 mb-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: i * 0.15,
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[#FF9494]"
                />
              ))}
            </div>

            {/* Typewriter Text */}
            <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              <TypewriterText
                text="Alex, telemetry is fully parsed. The Q4 synthesis is attached. All alignment parameters meet the protocol constraints, and deployment is authorized for tomorrow."
                delay={1.5}
              />
            </div>

            {/* Send Button Mock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 3.5 }}
              className="mt-auto self-end flex items-center gap-2"
            >
              <div className="text-xs font-bold text-gray-400">
                Review Synthesis
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FF9494] text-white flex items-center justify-center shadow-lg cursor-pointer">
                <CornerDownRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
