"use client";
import React from "react";
import { Mail, Hexagon } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: ["Neural Core", "Telemetry", "Protocol Alignment", "Pricing"],
    Company: ["About Nova", "Careers", "Blog", "Contact"],
    Resources: ["Documentation", "API Reference", "Community", "Status"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B7B] to-[#FF9494] flex items-center justify-center shadow-lg">
                <Hexagon className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black font-heading tracking-tighter text-gray-900 dark:text-white">
                NOVA
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
              Autonomous Synthesis for Elite Teams. Eliminate context switching
              and perfectly align your organizational telemetry.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full glass bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#FF9494] hover:border-[#FF9494]/30 hover:bg-[#FFE3E1] dark:hover:bg-[#FF9494]/10 transition-all duration-300 shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {Object.entries(links).map(([title, items], idx) => (
              <div key={idx} className="flex flex-col">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                  {title}
                </h4>
                <ul className="flex flex-col gap-4">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <a
                        href="#"
                        className="text-gray-500 dark:text-gray-400 hover:text-[#FF9494] dark:hover:text-[#FF9494] font-medium transition-colors duration-200"
                      >
                        {item}
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
