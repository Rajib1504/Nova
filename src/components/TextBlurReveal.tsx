"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface TextBlurRevealProps {
  text: string;
  className?: string;
  animationType?: "scroll" | "time";
}

const ScrollWordBlur = ({
  word,
  index,
  totalWords,
  scrollYProgress,
}: {
  word: string;
  index: number;
  totalWords: number;
  scrollYProgress: MotionValue<number>;
}) => {
  // Stagger the start times so words appear sequentially
  const staggerStep = totalWords > 1 ? 0.7 / (totalWords - 1) : 0;
  const start = index * staggerStep;
  const end = start + 0.3; // Leave 0.3 for the duration of the blur transition

  // Start with slight opacity (0.1) and heavy blur
  const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
  const blur = useTransform(scrollYProgress, [start, end], ["blur(12px)", "blur(0px)"]);

  return (
    <motion.span
      style={{
        opacity,
        filter: blur,
        display: "inline-block",
        willChange: "opacity, filter",
      }}
      className="mr-[0.25em]"
    >
      {word}
    </motion.span>
  );
};

const TimeWordBlur = ({ word, index }: { word: string; index: number }) => {
  // Faster stagger for time-based reveal
  const delay = index * 0.04;

  return (
    <motion.span
      initial={{ opacity: 0.1, filter: "blur(12px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.8,
        delay: delay + 0.5, // 0.5s initial delay so it follows the heading
        ease: "easeOut",
      }}
      style={{
        display: "inline-block",
        willChange: "opacity, filter",
      }}
      className="mr-[0.25em]"
    >
      {word}
    </motion.span>
  );
};

export const TextBlurReveal = ({
  text,
  className = "",
  animationType = "scroll",
}: TextBlurRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 90%", "end 60%"],
  });

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        return animationType === "scroll" ? (
          <ScrollWordBlur
            key={i}
            word={word}
            index={i}
            totalWords={words.length}
            scrollYProgress={scrollYProgress}
          />
        ) : (
          <TimeWordBlur key={i} word={word} index={i} />
        );
      })}
    </div>
  );
};
