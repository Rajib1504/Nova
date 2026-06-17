"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function TermsPage() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nova-theme");
    if (savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"))) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("nova-theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("nova-theme", "light");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5E4] dark:bg-[#1A1D23] transition-colors duration-500">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-1 max-w-4xl mx-auto px-6 pt-40 pb-24 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-16">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: October 2024
            </p>
          </motion.div>

          <div className="space-y-12 text-gray-700 dark:text-gray-300">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="text-gray-600 dark:text-gray-400">
                  By accessing or using Nova AI, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of the terms, you may not access the service. These terms apply to all visitors, 
                  users, and others who access or use the service.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Service Provision & Limitations</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Nova AI is an autonomous workflow orchestrator designed to assist with digital productivity.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Beta Status:</strong> Certain features powered by predictive models may occasionally produce inaccurate synthesis. You are responsible for reviewing automated actions.</li>
                  <li><strong>Rate Limits:</strong> API requests are throttled based on your subscription tier to prevent infrastructure abuse.</li>
                  <li><strong>Integration Dependencies:</strong> Our service relies on third-party APIs (Google, Corsair). We are not liable for outages caused by these upstream providers.</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Responsibilities</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="text-gray-600 dark:text-gray-400">
                  You are responsible for safeguarding your authentication credentials. You must not use Nova AI to violate any laws, 
                  transmit malicious code, or scrape data. If you use our Neural Core to automate communication, you must ensure it 
                  complies with anti-spam legislation in your jurisdiction.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Termination</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="text-gray-600 dark:text-gray-400">
                  We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, 
                  including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                </p>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
