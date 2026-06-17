import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Maximize2,
  Link as LinkIcon,
  Smile,
  Send,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/axios";
import { useNovaContext } from "@/context/NovaContext";

import { BlobButton } from "../../BlobButton";

interface GmailComposeProps {
  onClose: () => void;
  initialTo?: string;
  initialSubject?: string;
}

export const GmailCompose: React.FC<GmailComposeProps> = ({
  onClose,
  initialTo = "",
  initialSubject = "",
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Controlled form state (ready for AI injection later)
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const EMOJI_LIST = [
    "😊", "😂", "🤣", "❤️", "🔥", "👍", "👏", "🎉",
    "🙏", "💯", "✨", "🚀", "💪", "🤝", "👋", "😎",
    "🤔", "👀", "💡", "⚡", "🎯", "✅", "📌", "📎",
    "📧", "📅", "⏰", "🌟", "💼", "📊", "🔗", "💬",
  ];

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const {
    isNovaControlled,
    isGhostTyping,
    novaDraft,
    finishGhostTyping,
    confirmDraft,
  } = useNovaContext();

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    if (isNovaControlled && novaDraft) {
      setTo(novaDraft.to);
      setSubject(novaDraft.subject);

      if (isGhostTyping) {
        setBody("");
        const fullText = novaDraft.body;
        let i = 0;

        const typeChar = () => {
          if (!isMounted) return;
          if (i < fullText.length) {
            setBody(fullText.substring(0, i + 1));
            i++;
            // Add a slight random variance for realistic typing speed
            const delay = Math.random() * 15 + 10;
            timeoutId = setTimeout(typeChar, delay);
          } else {
            finishGhostTyping();
          }
        };

        // Start typing after a tiny pause to let the modal animate in
        timeoutId = setTimeout(typeChar, 300);
      } else {
        setBody(novaDraft.body);
      }
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isNovaControlled, novaDraft]); // Intentionally omitting isGhostTyping to avoid interrupting the effect

  const handleSend = async () => {
    if (!to || !body) return;
    setIsSending(true);
    try {
      await api.post("/api/emails/send", { to, subject, body });
      onClose(); // Close on success
    } catch (err) {
      console.error("Failed to send email", err);
      alert("Failed to send email. Ensure you are connected to Gmail.");
    } finally {
      setIsSending(false);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      setBody((prev) => prev + `\n[Link: ${url}] `);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          width: isFullscreen ? "80%" : "500px",
          height: isFullscreen ? "80vh" : isMinimized ? "48px" : "500px",
          right: isFullscreen ? "10%" : "24px",
          bottom: isFullscreen ? "10vh" : "24px",
        }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed z-[110] flex flex-col bg-[#FFF5E4] dark:bg-[#1A1D23] rounded-t-xl rounded-b-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-gray-200 dark:border-white/10 overflow-hidden max-w-[calc(100vw-32px)]"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-[#FFF5E4] dark:bg-[#23232A] cursor-pointer border-b border-gray-200 dark:border-white/10"
          onClick={() => !isFullscreen && setIsMinimized(!isMinimized)}
        >
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            New Message
          </span>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
                setIsFullscreen(false);
              }}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen((prev) => !prev);
                setIsMinimized(false);
              }}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-black/5 hover:text-red-400 dark:hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Container */}
        {!isMinimized && (
          <div className="flex flex-col flex-1 bg-[#FFF5E4] dark:bg-[#1A1D23]">
            {/* To Field */}
            <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-sm text-gray-500 w-12">To</span>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                readOnly={isGhostTyping}
                className={`flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white ${isGhostTyping ? "opacity-70 cursor-not-allowed" : ""}`}
                autoFocus
              />
              <span className="text-xs text-gray-400 cursor-pointer hover:underline">
                Cc Bcc
              </span>
            </div>

            {/* Subject Field */}
            <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-white/5">
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                readOnly={isGhostTyping}
                className={`flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-white ${isGhostTyping ? "opacity-70 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <textarea
                className={`w-full h-full bg-transparent border-none outline-none resize-none text-sm text-gray-800 dark:text-gray-200 ${isGhostTyping ? "opacity-70 cursor-not-allowed" : ""}`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                readOnly={isGhostTyping}
              />
            </div>

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#23232A] border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                {isNovaControlled ? (
                  <BlobButton
                    onClick={() => confirmDraft({ to, subject, body })}
                    disabled={isGhostTyping}
                    size="sm"
                    className={`flex items-center gap-2 transition-opacity ${isGhostTyping ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isGhostTyping ? "Nova Drafting..." : "Confirm Draft"}
                    {!isGhostTyping && <Send className="w-3 h-3" />}
                  </BlobButton>
                ) : (
                  <BlobButton
                    onClick={handleSend}
                    disabled={isSending || !to || !body}
                    size="sm"
                    className={`flex items-center gap-2 transition-opacity ${isSending || !to || !body ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isSending ? "Sending..." : "Send"}
                    {!isSending && <Send className="w-3 h-3" />}
                  </BlobButton>
                )}

                {/* Formatting Tools */}
                <div className="flex items-center gap-1 ml-4 text-gray-500 dark:text-gray-400">
                  <button
                    onClick={insertLink}
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <div className="relative" ref={emojiPickerRef}>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-1.5 rounded transition-colors ${showEmojiPicker ? "bg-[#FF9494]/20 text-[#FF9494]" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
                      title="Insert Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ type: "spring", damping: 25, stiffness: 400 }}
                          className="absolute bottom-10 left-0 w-[220px] p-2 bg-white dark:bg-[#23232A] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 grid grid-cols-8 gap-0.5 z-50"
                        >
                          {EMOJI_LIST.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setBody((prev) => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="w-6 h-6 flex items-center justify-center text-base rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
