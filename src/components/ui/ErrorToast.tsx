"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ErrorToastProps {
  message: string | null;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold">{message}</span>
          <button onClick={onClose} className="ml-2 hover:bg-red-500/20 p-1 rounded-full transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
