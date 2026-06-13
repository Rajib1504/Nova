"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the Neural Core handle context switching?",
    answer:
      "The Neural Core autonomously triages incoming data streams and categorizes them by priority. By analyzing your active viewport and calendar constraints, it intelligently suppresses low-priority interruptions, allowing you to maintain an unbroken flow state for hours.",
  },
  {
    question: "Can Nova synthesize raw telemetry across all platforms?",
    answer:
      "Yes. Nova integrates deeply with your existing workspace tools (Slack, Gmail, Jira, Calendar) and uses advanced protocol alignment to synthesize cross-platform data into a singular, cohesive executive summary every morning.",
  },
  {
    question: "Is my schedule alignment completely autonomous?",
    answer:
      "Once you authorize the scheduling protocol, Nova will cross-reference your required deep-work blocks with incoming meeting requests. It negotiates availability in the background and only surfaces high-priority executive alignments that require your direct approval.",
  },
  {
    question: "What security constraints protect my proprietary data?",
    answer:
      "Our infrastructure utilizes military-grade telemetry encryption and strict zero-knowledge architecture. The Neural Core processes semantic data locally in a sandboxed environment, ensuring your proprietary synthesis never touches external servers.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-32 flex flex-col items-center justify-center overflow-hidden z-20">
      <div className="w-full max-w-4xl px-4 md:px-8 flex flex-col items-center">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FFE3E1] flex items-center justify-center text-[#FF9494] mb-6 shadow-sm">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-gray-900 dark:text-white mb-4">
            Protocol <span className="text-[#FF9494]">Inquiries</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Advanced parameters regarding the Neural Core execution.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="w-full flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`glass backdrop-blur-xl border rounded-2xl overflow-hidden transition-colors duration-500 ${
                  isOpen
                    ? "bg-white/80 dark:bg-[#22262E]/80 border-[#FF9494]/30 shadow-[0_8px_30px_rgb(255,148,148,0.1)]"
                    : "bg-white/40 dark:bg-[#1A1D23]/40 border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/60 dark:hover:bg-[#22262E]/60"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span
                    className={`text-lg md:text-xl font-bold tracking-tight transition-colors duration-300 ${
                      isOpen ? "text-[#FF9494]" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isOpen ? "bg-[#FF9494] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 15 }}
                    >
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
