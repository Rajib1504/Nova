"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { addDays } from "date-fns";
import { TopHeader } from "./TopHeader";
import { GmailPanel } from "./GmailPanel";
import { CalendarPanel } from "./CalendarPanel";
import { AgentChatPanel } from "./AgentChatPanel";
import { KeyboardShortcutsOverlay } from "./KeyboardShortcutsOverlay";
import { CommandPalette } from "./CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toggleThemeWithTransition } from "@/utils/theme";

export const WorkspaceLayout = () => {
  // ─── Theme ──────────────────────────────────────────────
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

  const toggleTheme = (e: React.MouseEvent) => {
    toggleThemeWithTransition(e, theme, setTheme);
  };

  // ─── Layout ──────────────────────────────────────────────
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        if (newWidth < 20) newWidth = 20;
        if (newWidth > 50) newWidth = 50;
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

  // ─── Lifted Gmail / Compose State ────────────────────────
  const [isComposing, setIsComposing] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [activeTab, setActiveTab] = useState("Inbox");

  // ─── Keyboard Navigation State ───────────────────────────
  const [focusedEmailIndex, setFocusedEmailIndex] = useState(-1);
  const [openTrigger, setOpenTrigger] = useState(0);

  // ─── Calendar Controlled State ───────────────────────────
  const [calendarViewMode, setCalendarViewMode] = useState<"day" | "week">("week");
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());

  // ─── Column Focus (1 / 2 / 3) ───────────────────────────
  const [focusedColumn, setFocusedColumn] = useState<"gmail" | "agent" | "calendar" | null>(null);

  // ─── Shortcuts Overlay ───────────────────────────────────
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);

  // ─── Refs for Search & Agent Input Focus ─────────────────
  const searchInputRef = useRef<HTMLInputElement>(null);
  const agentInputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Global Keyboard Shortcuts ───────────────────────────
  useKeyboardShortcuts([
    // Email navigation
    {
      key: "j",
      handler: () => setFocusedEmailIndex((prev) => prev + 1),
    },
    {
      key: "k",
      handler: () => setFocusedEmailIndex((prev) => Math.max(0, prev - 1)),
    },
    {
      key: "Enter",
      handler: () => setOpenTrigger((prev) => prev + 1),
    },

    // Compose
    {
      key: "c",
      handler: () => {
        if (isLeftCollapsed) setIsLeftCollapsed(false);
        setReplyTo("");
        setReplySubject("");
        setIsComposing(true);
      },
    },

    // Escape: close compose → then overlay → order matters
    {
      key: "Escape",
      handler: () => {
        if (showShortcutsOverlay) {
          setShowShortcutsOverlay(false);
          return;
        }
        if (isComposing) {
          setIsComposing(false);
        }
      },
    },

    // Search focus
    {
      key: "/",
      handler: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
    },

    // Agent chat focus (Ctrl+K)
    {
      key: "k",
      ctrlKey: true,
      handler: () => agentInputRef.current?.focus(),
    },

    // Column focus
    { key: "1", handler: () => setFocusedColumn("gmail") },
    { key: "2", handler: () => setFocusedColumn("agent") },
    { key: "3", handler: () => setFocusedColumn("calendar") },

    // Calendar shortcuts
    { key: "d", handler: () => setCalendarViewMode("day") },
    { key: "w", handler: () => setCalendarViewMode("week") },
    { key: "t", handler: () => setCalendarBaseDate(new Date()) },
    {
      key: "[",
      handler: () =>
        setCalendarBaseDate((prev) =>
          addDays(prev, calendarViewMode === "week" ? -7 : -1)
        ),
    },
    {
      key: "]",
      handler: () =>
        setCalendarBaseDate((prev) =>
          addDays(prev, calendarViewMode === "week" ? 7 : 1)
        ),
    },

    // Shortcuts overlay
    {
      key: "?",
      handler: () => setShowShortcutsOverlay((prev) => !prev),
    },
  ]);

  // Helper: column focus ring style
  const columnRing = (col: "gmail" | "agent" | "calendar") =>
    focusedColumn === col
      ? "outline outline-2 outline-offset-0 outline-[#FF9494]/50"
      : "";

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FFF5E4] dark:bg-[#1A1D23] text-[#2D2A26] dark:text-[#F0EEEC] font-sans transition-colors duration-500">
      <TopHeader
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
      />

      {/* Main Workspace Area */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">

        {/* LEFT COLUMN: GMAIL */}
        <motion.div
          animate={{
            width: isLeftCollapsed ? 80 : `${leftWidth}%`,
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className={`h-full flex-shrink-0 flex flex-col glass bg-[#FFE3E1]/50 dark:bg-[#23232A]/50 backdrop-blur-xl border-r border-white/50 dark:border-white/10 transition-all duration-200 ${columnRing("gmail")}`}
        >
          <GmailPanel
            isCollapsed={isLeftCollapsed}
            onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
            searchQuery={searchQuery}
            isComposing={isComposing}
            setIsComposing={setIsComposing}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replySubject={replySubject}
            setReplySubject={setReplySubject}
            focusedEmailIndex={focusedEmailIndex}
            openTrigger={openTrigger}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
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
        <div className={`flex-1 h-full flex flex-col bg-transparent relative min-w-[300px] transition-all duration-200 ${columnRing("agent")}`}>
          <AgentChatPanel inputRef={agentInputRef} />
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
          className={`h-full flex-shrink-0 flex flex-col glass bg-[#FFE3E1]/50 dark:bg-[#23232A]/50 backdrop-blur-xl border-l border-white/50 dark:border-white/10 transition-all duration-200 ${columnRing("calendar")}`}
        >
          <CalendarPanel
            isCollapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
            viewMode={calendarViewMode}
            setViewMode={setCalendarViewMode}
            baseDate={calendarBaseDate}
            setBaseDate={setCalendarBaseDate}
          />
        </motion.div>

      </div>

      {/* Global Keyboard Shortcuts Overlay (? key) */}
      <KeyboardShortcutsOverlay
        isOpen={showShortcutsOverlay}
        onClose={() => setShowShortcutsOverlay(false)}
      />

      <CommandPalette
        onOpenShortcuts={() => setShowShortcutsOverlay(true)}
      />
    </div>
  );
};
