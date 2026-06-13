"use client";
import React from "react";
import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[var(--background)]">
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--highlight)] opacity-40 dark:opacity-10 blur-[100px]"
        animate={{
          x: ["0%", "20%", "0%"],
          y: ["0%", "10%", "0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[40%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[var(--panel)] opacity-50 dark:opacity-[0.15] blur-[120px]"
        animate={{
          x: ["0%", "-20%", "0%"],
          y: ["0%", "-10%", "0%"],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[var(--accent)] opacity-20 dark:opacity-[0.05] blur-[150px]"
        animate={{
          x: ["0%", "10%", "0%"],
          y: ["0%", "-20%", "0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
