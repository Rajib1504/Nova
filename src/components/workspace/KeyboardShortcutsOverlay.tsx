"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutRow {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutRow[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Email Navigation",
    shortcuts: [
      { keys: ["j"], description: "Next email" },
      { keys: ["k"], description: "Previous email" },
      { keys: ["Enter"], description: "Open focused thread" },
      { keys: ["Esc"], description: "Close thread / compose" },
    ],
  },
  {
    title: "Email Actions",
    shortcuts: [
      { keys: ["c"], description: "Compose new email" },
      { keys: ["r"], description: "Reply to open thread" },
    ],
  },
  {
    title: "Workspace",
    shortcuts: [
      { keys: ["/"], description: "Focus search bar" },
      { keys: ["Ctrl", "K"], description: "Focus agent chat" },
      { keys: ["1"], description: "Highlight Gmail column" },
      { keys: ["2"], description: "Highlight Agent column" },
      { keys: ["3"], description: "Highlight Calendar column" },
    ],
  },
  {
    title: "Calendar",
    shortcuts: [
      { keys: ["d"], description: "Switch to Day view" },
      { keys: ["w"], description: "Switch to Week view" },
      { keys: ["t"], description: "Jump to Today" },
      { keys: ["["], description: "Previous week / day" },
      { keys: ["]"], description: "Next week / day" },
    ],
  },
];

const KeyBadge = ({ children }: { children: string }) => (
  <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold font-mono
    bg-[#FFF5E4] dark:bg-[#22262E]
    text-[#2D2A26] dark:text-[#F0EEEC]
    shadow-[2px_2px_4px_#E5DCD0,-1px_-1px_3px_#FFFFFF]
    dark:shadow-[2px_2px_4px_#0d0f12,-1px_-1px_3px_#2e3440]
    border border-black/5 dark:border-white/10">
    {children}
  </kbd>
);

export const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl
              bg-[#FFF5E4] dark:bg-[#1A1D23]
              border border-white/60 dark:border-white/10
              shadow-[20px_20px_60px_#d9d0c2,-10px_-10px_40px_#ffffff]
              dark:shadow-[20px_20px_60px_#0d0f12,-10px_-10px_40px_#22262e]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B7B] to-[#FF9494] flex items-center justify-center shadow-md">
                  <Keyboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-black tracking-tight text-[#2D2A26] dark:text-[#F0EEEC]">
                    Keyboard Protocols
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Press <KeyBadge>?</KeyBadge> anytime to toggle
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-[#FF9494] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcut Groups */}
            <div className="grid grid-cols-2 gap-6 p-8">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title} className="flex flex-col gap-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF9494]">
                    {group.title}
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {group.shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.description}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-none">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {shortcut.keys.map((key, idx) => (
                            <React.Fragment key={key}>
                              <KeyBadge>{key}</KeyBadge>
                              {idx < shortcut.keys.length - 1 && (
                                <span className="text-[10px] text-gray-400 font-bold">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Shortcuts are disabled while typing in any input field.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
