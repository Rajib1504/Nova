"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SocialProof } from "@/components/SocialProof";
import { FeatureOne } from "@/components/FeatureOne";
import { FeatureTwo } from "@/components/FeatureTwo";
import { FeatureThree } from "@/components/FeatureThree";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { toggleThemeWithTransition } from "@/utils/theme";

export default function LandingPage() {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div id="home">
        <Hero />
      </div>
      <SocialProof />
      <div id="features">
        <FeatureOne />
        <FeatureTwo />
        <FeatureThree />
      </div>
      <Stats />
      <Testimonials />
      <div id="pricing">
        <Pricing />
      </div>
      <FAQ />
      <Footer />
    </div>
  );
}
