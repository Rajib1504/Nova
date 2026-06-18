"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { Text3DReveal } from "./Text3DReveal";

// Custom hook to animate the number based on whether it is "active"
const AnimatedNumber = ({
  value,
  suffix = "",
  isActive,
}: {
  value: number;
  suffix?: string;
  isActive: boolean;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2500, bounce: 0 });

  useEffect(() => {
    if (isActive) {
      motionValue.set(value);
    } else {
      // Optional: reset to 0 when not active, or keep it. Let's reset for full scrollytelling effect.
      motionValue.set(0);
    }
  }, [isActive, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent =
          Intl.NumberFormat("en-US").format(Math.floor(latest)) + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

export const Stats = () => {
  const stats = [
    { 
      value: 10000, 
      suffix: "+", 
      label: "Emails Triaged", 
      desc: "Autonomous prioritization running 24/7.",
      colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
      height: "h-[300px]"
    },
    { 
      value: 5, 
      suffix: "x", 
      label: "Faster Alignment", 
      desc: "Zero human intervention required.",
      colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
      height: "h-[300px]"
    },
    { 
      value: 99, 
      suffix: "%", 
      label: "Telemetry Uptime", 
      desc: "Military-grade neural core stability.",
      colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
      height: "h-[300px]"
    },
    { 
      value: 0, 
      suffix: "", 
      label: "Context Switching", 
      desc: "Keep your flow state completely unbroken.",
      colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
      height: "h-[300px]"
    },
  ];

  return (
    <section className="relative w-full py-32 flex flex-col items-center justify-center overflow-hidden z-20">
      <div className="w-full max-w-7xl px-4 md:px-8 flex flex-col items-center">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <Text3DReveal
            text="Unprecedented Scale"
            className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-gray-900 dark:text-white mb-4"
            highlightWords={["Scale"]}
            highlightClass="text-[#FF9494]"
          />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Metrics that redefine human-computer interaction.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`${stat.colSpan} ${stat.height} glass bg-white/60 dark:bg-[#22262E]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] group`}
            >
              {/* Background gradient blob for hover effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF9494] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
              
              <div className="relative z-10">
                <div className="text-7xl md:text-8xl font-black font-heading tracking-tighter text-gray-900 dark:text-white mb-2 leading-none">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} isActive={true} />
                </div>
                <h3 className="text-2xl font-bold text-[#FF9494] mb-2 tracking-tight">
                  {stat.label}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[80%]">
                  {stat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
