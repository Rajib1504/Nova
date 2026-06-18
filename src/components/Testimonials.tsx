"use client";
import React from "react";
import { motion } from "framer-motion";
import { Text3DReveal } from "./Text3DReveal";

const testimonials = [
  {
    name: "Elena Rodriguez",
    role: "VP of Engineering at Nexus",
    quote: "The Neural Core completely eliminated our context switching overhead. My team is shipping 30% faster just by having protocols handled autonomously.",
    avatar: "ER"
  },
  {
    name: "Marcus Chen",
    role: "Director of Ops at Vanguard",
    quote: "Telemetry alignment used to take hours of manual triage. Now, Nova synthesizes everything before I even pour my coffee. Absolutely unparalleled.",
    avatar: "MC"
  },
  {
    name: "Sarah Jenkins",
    role: "Chief of Staff at Aether",
    quote: "The way the Schedule Alignment protocol resolves conflicts is pure magic. It's like having an executive assistant that operates at the speed of thought.",
    avatar: "SJ"
  },
  {
    name: "David Kim",
    role: "Product Lead at Prism",
    quote: "We've fully integrated the Neural Core into our daily workflow. The contextual responses are indistinguishable from human intelligence.",
    avatar: "DK"
  }
];

export const Testimonials = () => {
  return (
    <section className="relative w-full py-24 flex flex-col items-center justify-center overflow-hidden z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full text-center mb-16 px-4"
      >
        <Text3DReveal
          text="Trusted by the Vanguard"
          className="text-3xl md:text-5xl font-bold font-heading tracking-tight text-gray-900 dark:text-white"
          highlightWords={["Vanguard"]}
          highlightClass="text-[#FF9494]"
        />
      </motion.div>

      {/* Marquee Container */}
      <div className="w-full overflow-hidden relative flex items-center [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4">
        <motion.div
          animate={{ x: [0, -1600] }} // Adjust based on card width + gap * number of cards
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center gap-6 w-max"
        >
          {/* Duplicate array for seamless infinite scroll */}
          {[...testimonials, ...testimonials].map((t, idx) => (
            <div
              key={idx}
              className="w-[350px] md:w-[400px] glass bg-white/60 dark:bg-[#22262E]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-8 flex flex-col gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic relative">
                <span className="text-4xl absolute -top-4 -left-2 text-[#FF9494]/30 font-serif">"</span>
                {t.quote}
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFE3E1] to-[#FF9494] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
