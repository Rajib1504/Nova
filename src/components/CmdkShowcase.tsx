"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Reply, Calendar } from "lucide-react";
import { Text3DReveal } from "./Text3DReveal";

const commands = [
  { text: "Summarize this 50-reply thread...", icon: FileText, color: "text-blue-500" },
  { text: "Draft a polite rejection...", icon: Reply, color: "text-green-500" },
  { text: "Create meeting with sender...", icon: Calendar, color: "text-orange-500" },
];

export function CmdkShowcase() {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [hasTriggeredEasterEgg, setHasTriggeredEasterEgg] = useState(false);

  // Stop animation if easter egg is triggered
  useEffect(() => {
    const handleTrigger = () => {
      setHasTriggeredEasterEgg(true);
      setIsTyping(false);
      setDisplayedText("You're in control now.");
    };
    document.addEventListener("nova-landing-cmdk-open", handleTrigger);
    return () => document.removeEventListener("nova-landing-cmdk-open", handleTrigger);
  }, []);

  // Typewriter effect logic
  useEffect(() => {
    if (hasTriggeredEasterEgg) return;

    const currentCommand = commands[currentCommandIndex].text;
    
    if (isTyping) {
      if (displayedText.length < currentCommand.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentCommand.slice(0, displayedText.length + 1));
        }, 50); // Typing speed
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause then delete
        const timeout = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentCommand.slice(0, displayedText.length - 1));
        }, 30); // Deleting speed
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next command
        setCurrentCommandIndex((prev) => (prev + 1) % commands.length);
        setIsTyping(true);
      }
    }
  }, [displayedText, isTyping, currentCommandIndex]);

  const CurrentIcon = commands[currentCommandIndex].icon;
  const iconColor = commands[currentCommandIndex].color;

  return (
    <section className="py-24 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF9494]/10 dark:bg-[#FF9494]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <Text3DReveal 
          text="Work at the speed of thought."
          className="text-4xl md:text-5xl font-black font-heading tracking-tight text-[#2D2A26] dark:text-[#F0EEEC] mb-4"
        />
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-12"
        >
          Ditch the mouse. Nova’s context-aware Command Palette gives you instant access to AI triage and automated workflows without ever lifting your hands.
        </motion.p>

        {/* The Mock Palette */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="relative w-full max-w-2xl"
        >
          {/* Try pressing Cmd K Badge */}
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute -top-10 -right-6 md:-right-12 z-20 flex items-center gap-2 bg-[#2D2A26] dark:bg-white text-[#F0EEEC] dark:text-[#2D2A26] px-4 py-2 rounded-full shadow-xl font-medium text-sm border border-white/10 dark:border-black/10"
          >
            <span>Try it yourself. Press</span>
            <kbd className="font-mono bg-white/20 dark:bg-black/10 px-1.5 py-0.5 rounded text-xs">⌘K</kbd>
          </motion.div>

          {/* Palette Window */}
          <div className="bg-white/80 dark:bg-[#1A1D23]/80 backdrop-blur-3xl rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden text-left flex flex-col">
            
            {/* Input Header */}
            <div className="flex items-center px-6 py-5 border-b border-black/5 dark:border-white/5">
              <Sparkles className="w-6 h-6 text-indigo-500 mr-4 shrink-0" />
              <div className="flex-1 text-xl md:text-2xl text-gray-800 dark:text-gray-200 font-medium relative h-8 flex items-center">
                {displayedText}
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-[2px] h-6 bg-indigo-500 ml-1"
                />
              </div>
            </div>

            {/* Mock Results */}
            <div className="p-3">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Suggested Actions
              </div>
              
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentCommandIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center px-4 py-4 m-1 rounded-xl bg-black/5 dark:bg-white/10"
                >
                  <CurrentIcon className={`w-5 h-5 mr-4 ${iconColor}`} />
                  <span className="text-gray-800 dark:text-gray-200 font-medium text-lg">
                    {commands[currentCommandIndex].text}
                  </span>
                  <div className="ml-auto text-xs font-mono bg-white dark:bg-black/30 px-2 py-1 rounded text-gray-500">
                    ↵
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center px-4 py-4 m-1 rounded-xl opacity-40">
                <FileText className="w-5 h-5 mr-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                  Archive this email
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
