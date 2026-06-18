"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface Text3DRevealProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClass?: string;
  animationType?: "scroll" | "time";
}

const Char3D = ({
  char,
  slotIndex,
  totalSlots,
  scrollYProgress,
  isHighlight,
  highlightClass,
}: {
  char: string;
  slotIndex: number;
  totalSlots: number;
  scrollYProgress: MotionValue<number>;
  isHighlight: boolean;
  highlightClass?: string;
}) => {
  // The entire animation finishes within [0, 1] of scroll progress.
  // We leave 0.3 for the duration of the flip itself.
  const staggerStep = totalSlots > 1 ? 0.7 / (totalSlots - 1) : 0; 
  const start = slotIndex * staggerStep;
  const end = start + 0.3;

  const rotateX = useTransform(scrollYProgress, [start, end], [90, 0]);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

  return (
    <motion.span
      style={{
        rotateX,
        opacity,
        transformOrigin: "bottom",
        display: "inline-block",
      }}
      className={isHighlight ? highlightClass : ""}
    >
      {char}
    </motion.span>
  );
};

const TimeChar3D = ({
  char,
  slotIndex,
  isHighlight,
  highlightClass,
}: {
  char: string;
  slotIndex: number;
  isHighlight: boolean;
  highlightClass?: string;
}) => {
  const delay = slotIndex * 0.15; // 150ms delay per slot group

  return (
    <motion.span
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ 
        duration: 0.8, 
        delay: delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      style={{
        transformOrigin: "bottom",
        display: "inline-block",
      }}
      className={isHighlight ? highlightClass : ""}
    >
      {char}
    </motion.span>
  );
};

export const Text3DReveal = ({
  text,
  className = "",
  highlightWords = [],
  highlightClass = "",
  animationType = "scroll",
}: Text3DRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 50%"], 
  });

  // Handle explicit newlines passed as "\n" strings in JSX attributes
  const normalizedText = text.replace(/\\n/g, "\n");
  
  // Split by spaces but preserve explicit newline characters if they exist attached to words
  const words = normalizedText.split(" ");
  
  // Deterministic random slots for characters (to avoid hydration errors)
  const totalChars = normalizedText.replace(/ |\n/g, "").length;
  const totalSlots = Math.ceil(totalChars / 2);
  
  const charSlots = React.useMemo(() => {
    const indices = Array.from({ length: totalChars }, (_, i) => i);
    // Simple deterministic pseudo-random sort
    indices.sort((a, b) => {
      const hashA = Math.sin(a + 1) * 10000;
      const hashB = Math.sin(b + 1) * 10000;
      return (hashA - Math.floor(hashA)) - (hashB - Math.floor(hashB));
    });
    
    const slots: Record<number, number> = {};
    indices.forEach((charIndex, pos) => {
      slots[charIndex] = Math.floor(pos / 2);
    });
    return slots;
  }, [totalChars]);

  let globalCharIndex = 0;

  return (
    <div
      ref={containerRef}
      className={`flex flex-wrap justify-center ${className}`}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      {words.map((word, wordIndex) => {
        if (word === "\n") {
          return <div key={`br-${wordIndex}`} className="w-full h-0" />;
        }

        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "");
        const isHighlight = highlightWords.includes(cleanWord);

        return (
          <span key={wordIndex} className="inline-flex mr-[0.3em] whitespace-nowrap">
            {word.split("").map((char, charIndex) => {
              if (char === "\n") {
                return <div key={`br-inline-${charIndex}`} className="w-full h-0" />;
              }
              
              const currentIndex = globalCharIndex;
              globalCharIndex++;

              return animationType === "scroll" ? (
                <Char3D
                  key={`${wordIndex}-${charIndex}`}
                  char={char}
                  slotIndex={charSlots[currentIndex]}
                  totalSlots={totalSlots}
                  scrollYProgress={scrollYProgress}
                  isHighlight={!!isHighlight}
                  highlightClass={highlightClass}
                />
              ) : (
                <TimeChar3D
                  key={`${wordIndex}-${charIndex}`}
                  char={char}
                  slotIndex={charSlots[currentIndex]}
                  isHighlight={!!isHighlight}
                  highlightClass={highlightClass}
                />
              );
            })}
          </span>
        );
      })}
    </div>
  );
};
