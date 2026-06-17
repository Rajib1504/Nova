"use client";
import React from "react";
import { Mail, Hexagon } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: [
      { label: "Neural Core", href: "/#home" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
    ],
    Company: [
      { label: "About Nova", href: "/about" },
      { label: "Contact", href: "mailto:hello@nova.ai" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="relative w-full bg-white/40 dark:bg-[#1A1D23] z-20 overflow-hidden">
      {/* Glassmorphic Top Border Separator */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12 flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">
          {/* Brand Column */}
          <div className="flex flex-col max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.svg" alt="logo" className="w-10 h-10" />
              <span className="text-2xl font-black font-heading tracking-tighter text-gray-900 dark:text-white">
                NOVA
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
              Autonomous Synthesis for Elite Teams. Eliminate context switching
              and perfectly align your organizational telemetry.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://x.com/rajib_dev1504"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
              >
                <FaXTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/dev-rajib/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 transition-all duration-300 shadow-sm"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Rajib1504"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#333] dark:hover:text-white hover:border-[#333]/30 dark:hover:border-white/30 hover:bg-[#333]/10 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
              >
                <FaGithub className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16">
            {Object.entries(links).map(([title, items], idx) => (
              <div key={idx} className="flex flex-col">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                  {title}
                </h4>
                <ul className="flex flex-col gap-4">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <a
                        href={item.href}
                        className="text-gray-500 dark:text-gray-400 hover:text-[#FF9494] dark:hover:text-[#FF9494] font-medium transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-gray-400 dark:text-gray-500">
          <p>© {currentYear} Nova Automation Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
