"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { toggleThemeWithTransition } from "@/utils/theme";

export default function PrivacyPage() {
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

  const toggleTheme = (e: React.MouseEvent) => {
    toggleThemeWithTransition(e, theme, setTheme);
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
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: October 2024
            </p>
          </motion.div>

          <div className="space-y-12 text-gray-700 dark:text-gray-300">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="mb-4">To provide you with our autonomous workflow orchestrator, we collect the following types of information:</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Account Data:</strong> Name, email address, and authentication tokens via Google OAuth.</li>
                  <li><strong>Integration Data:</strong> Metadata from your connected services (Gmail, Google Calendar) necessary for Nova AI to function. <em>We do not store your raw emails or calendar events permanently.</em></li>
                  <li><strong>Usage Telemetry:</strong> Anonymized interaction metrics to improve our predictive models.</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Data</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Your data is exclusively used to power the Nova Neural Core. We use it to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Triage and prioritize your inbox automatically.</li>
                  <li>Identify scheduling conflicts and propose optimal meeting times.</li>
                  <li>Generate contextual summaries of your communications.</li>
                  <li>Provide customer support and ensure system stability.</li>
                </ul>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Security & Storage</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="text-gray-600 dark:text-gray-400">
                  We employ enterprise-grade encryption (AES-256) for data at rest and TLS 1.3 for data in transit. 
                  Integration credentials are securely managed through the Corsair infrastructure and are never exposed 
                  to our frontend client. We enforce strict data retention limits, purging cached workflow data every 30 days.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Your Rights</h2>
              <div className="glass p-6 md:p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                <p className="text-gray-600 dark:text-gray-400">
                  You retain complete control over your data. You may disconnect integrations, request a full data export, 
                  or delete your Nova account at any time via your dashboard settings. Upon deletion, all associated 
                  telemetry and connection tokens are immediately wiped from our servers.
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
