"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { Check } from "lucide-react";
import { BlobButton } from "@/components/BlobButton";

// Smooth counting number for the price
const AnimatedPrice = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { duration: 800, bounce: 0 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toString();
      }
    });
  }, [springValue]);

  return <span ref={ref}>{value}</span>;
};

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Core Alignment",
      desc: "Essential telemetry for individual operators.",
      monthlyPrice: 29,
      annualPrice: 19,
      features: [
        "Standard Context Window",
        "Daily Schedule Alignment",
        "Basic Email Triage",
        "Community Support",
      ],
      isPopular: false,
    },
    {
      name: "Autonomous Vanguard",
      desc: "Full neural core access for high-velocity teams.",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "Unlimited Context Window",
        "Real-time Schedule Alignment",
        "Priority Email Triage",
        "Custom Telemetry Rules",
        "24/7 Dedicated Support",
      ],
      isPopular: true,
    },
    {
      name: "Infinite Telemetry",
      desc: "Bespoke neural networks for enterprise scale.",
      monthlyPrice: 299,
      annualPrice: 249,
      features: [
        "Dedicated Neural Core",
        "On-premise Deployment",
        "Advanced Security Protocols",
        "Custom Protocol Synthesis",
        "SLA Guarantee",
      ],
      isPopular: false,
    },
  ];

  return (
    <section className="relative w-full py-32 flex flex-col items-center justify-center overflow-hidden z-20">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-[#FF9494] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-7xl px-4 md:px-8 flex flex-col items-center relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 flex flex-col items-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tight text-gray-900 dark:text-white mb-6">
            Invest in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7B7B] to-[#FF9494]">
              Autonomy
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10">
            Select the protocol that aligns with your organizational velocity.
            Save 20% on all Vanguard plans with annual synthesis.
          </p>

          {/* Billing Toggle */}
          <div className="relative flex items-center p-1 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full shadow-inner">
            <div
              className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-[#FF9494]/20 border border-gray-200 dark:border-[#FF9494]/30 rounded-full shadow-sm transition-transform duration-300 ease-spring"
              style={{
                transform: isAnnual ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative z-10 w-32 py-2 text-sm font-bold tracking-wide transition-colors ${
                !isAnnual
                  ? "text-gray-900 dark:text-[#FF9494]"
                  : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative z-10 w-32 py-2 text-sm font-bold tracking-wide transition-colors ${
                isAnnual ? "text-gray-900 dark:text-[#FF9494]" : "text-gray-500"
              }`}
            >
              Annual
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 lg:gap-12 items-stretch mt-8">
          {plans.map((plan, index) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex flex-col p-8 rounded-3xl glass backdrop-blur-xl transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-white/80 dark:bg-[#22262E]/80 border-[#FF9494]/50 shadow-[0_0_40px_rgba(255,148,148,0.15)] md:-translate-y-4 md:py-12 z-10"
                    : "bg-white/40 dark:bg-[#1A1D23]/40 border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/60 dark:hover:bg-[#22262E]/60 md:my-4 z-0"
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#FF7B7B] to-[#FF9494] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                  {plan.desc}
                </p>

                <div className="flex items-end gap-1 mb-8">
                  <span className="text-5xl font-black font-heading text-gray-900 dark:text-white leading-none">
                    $<AnimatedPrice value={price} />
                  </span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    /mo
                  </span>
                </div>

                <div className="w-full h-[1px] bg-gray-200 dark:bg-white/10 mb-8" />

                <ul className="flex flex-col gap-4 mb-10 flex-grow">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#FFE3E1] dark:bg-[#FF9494]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check
                          className="w-3 h-3 text-[#FF9494]"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto w-full">
                  {plan.isPopular ? (
                    <div className="w-full h-[52px]">
                      {/* The BlobButton manages its own height/padding, we just wrap it to ensure space */}
                      <a href="/dashboard"><BlobButton>Initialize Vanguard</BlobButton></a>
                    </div>
                  ) : (
                    <a href="/dashboard">
                      <BlobButton className="w-full h-[52px]">
                        Select Protocol
                      </BlobButton>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
