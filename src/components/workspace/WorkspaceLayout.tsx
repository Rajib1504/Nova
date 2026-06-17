"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TopHeader } from "./TopHeader";
import { GmailPanel } from "./GmailPanel";
import { CalendarPanel } from "./CalendarPanel";
import { AgentChatPanel } from "./AgentChatPanel";

export const WorkspaceLayout = () => {
  const [theme, setTheme] = useState("dark");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("nova-theme");
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
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

  // Panel States
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  
  // Base widths in percentages
  const [leftWidth, setLeftWidth] = useState(35);
  const [rightWidth, setRightWidth] = useState(35);

  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;

      if (isDraggingLeft.current) {
        let newWidth = (e.clientX / containerWidth) * 100;
        if (newWidth < 20) newWidth = 20; // Min 20%
        if (newWidth > 50) newWidth = 50; // Max 50%
        setLeftWidth(newWidth);
        if (isLeftCollapsed) setIsLeftCollapsed(false);
      }

      if (isDraggingRight.current) {
        let newWidth = ((containerWidth - e.clientX) / containerWidth) * 100;
        if (newWidth < 20) newWidth = 20;
        if (newWidth > 50) newWidth = 50;
        setRightWidth(newWidth);
        if (isRightCollapsed) setIsRightCollapsed(false);
      }
    };

    const handleMouseUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      document.body.classList.remove("select-none");
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isLeftCollapsed, isRightCollapsed]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FFF5E4] dark:bg-[#1A1D23] text-[#2D2A26] dark:text-[#F0EEEC] font-sans transition-colors duration-500">
      <TopHeader theme={theme} toggleTheme={toggleTheme} />

      {/* Main Workspace Area */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT COLUMN: GMAIL */}
        <motion.div
          animate={{
            width: isLeftCollapsed ? 80 : `${leftWidth}%`,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="h-full flex-shrink-0 flex flex-col glass bg-[#FFE3E1]/50 dark:bg-[#23232A]/50 backdrop-blur-xl border-r border-white/50 dark:border-white/10"
        >
          <GmailPanel 
            isCollapsed={isLeftCollapsed} 
            onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)} 
          />
        </motion.div>

        {/* LEFT DRAG HANDLE */}
        <div
          className="w-4 h-full cursor-col-resize flex justify-center items-center z-30 flex-shrink-0 group -mx-1.5"
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingLeft.current = true;
            document.body.classList.add("select-none");
            document.body.style.cursor = "col-resize";
          }}
          onDoubleClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
        >
          <div className="w-[2px] h-full bg-transparent group-hover:bg-[#FF9494] transition-colors" />
        </div>

        {/* CENTER COLUMN: AGENT CHAT */}
        <div className="flex-1 h-full flex flex-col bg-transparent relative min-w-[300px]">
          <AgentChatPanel />
        </div>

        {/* RIGHT DRAG HANDLE */}
        <div
          className="w-4 h-full cursor-col-resize flex justify-center items-center z-30 flex-shrink-0 group -mx-1.5"
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingRight.current = true;
            document.body.classList.add("select-none");
            document.body.style.cursor = "col-resize";
          }}
          onDoubleClick={() => setIsRightCollapsed(!isRightCollapsed)}
        >
          <div className="w-[2px] h-full bg-transparent group-hover:bg-[#FF9494] transition-colors" />
        </div>

        {/* RIGHT COLUMN: CALENDAR */}
        <motion.div
          animate={{
            width: isRightCollapsed ? 80 : `${rightWidth}%`,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="h-full flex-shrink-0 flex flex-col glass bg-[#FFE3E1]/50 dark:bg-[#23232A]/50 backdrop-blur-xl border-l border-white/50 dark:border-white/10"
        >
          <CalendarPanel 
            isCollapsed={isRightCollapsed} 
            onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)} 
          />
        </motion.div>

      </div>
    </div>
  );
};
