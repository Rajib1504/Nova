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
import { FAQ } from "@/components/FAQ";

export default function LandingPage() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <Hero />
      <SocialProof />
      <FeatureOne />
      <FeatureTwo />
      <FeatureThree />
      <Stats />
      <Testimonials />
      <FAQ />
    </div>
  );
}
