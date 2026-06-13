"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Command,
  Triangle,
  Hexagon,
  Circle,
  Box,
  Globe,
  Cpu,
  Layers,
} from "lucide-react";

const logos = [
  { icon: Command, name: "Vanguard" },
  { icon: Triangle, name: "Prisma" },
  { icon: Hexagon, name: "Nexus" },
  { icon: Globe, name: "Aether" },
  { icon: Cpu, name: "Synapse" },
  { icon: Layers, name: "Stack" },
  { icon: Box, name: "Vertex" },
  { icon: Circle, name: "Nova Corp" },
];

export const SocialProof = () => {
  return (
    <section className="relative w-full py-20 flex flex-col items-center justify-center overflow-hidden z-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-4"
      >
        <div className=" bg-white/40 dark:bg-[#22262E] backdrop-blur-xl border border-white/40 dark:border-white/10 py-6 px-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden">
          {/* Subtle top border glow */}
          <div className="flex-shrink-0 z-10 bg-gradient-to-r from-transparent via-[#FF9494] to-transparent h-px w-full absolute top-0 left-0 opacity-30"></div>

          <div className="flex-shrink-0 md:border-r border-black/10 dark:border-white/10 md:pr-8 z-10">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
              Trusted by engineering teams at
            </p>
          </div>

          {/* Marquee Container */}
          <div className="flex-1 overflow-hidden relative w-full flex items-center [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
              initial={{ x: "0%" }}
              animate={{ x: "-50%" }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex items-center w-max"
            >
              {/* Duplicate array for seamless infinite scroll. 
                  Padding-right added to each item to create gaps without messing up the 50% width calculation. */}
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 pr-16 opacity-40 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 cursor-pointer"
                >
                  <logo.icon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                  <span className="text-xl font-bold font-heading tracking-tight text-gray-800 dark:text-gray-200">
                    {logo.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
