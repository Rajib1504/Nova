"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Hexagon } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useNovaContext } from "@/context/NovaContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "ai",
    text: "Greetings. I am **NOVA**—your Personal Workflow Automator. I am engineered to seamlessly orchestrate your digital communications and schedule. From drafting targeted emails to coordinating complex calendar logistics, simply articulate your objective, and I will handle the execution.",
  },
];

export const AgentChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [activeDraft, setActiveDraft] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const tenantId = session?.user?.id;
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image || "https://i.pravatar.cc/150?img=11";
  
  const router = useRouter();
  const { startNovaDraft, confirmedDraft, clearConfirmedDraft } =
    useNovaContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (confirmedDraft) {
      setActiveDraft(confirmedDraft);
      const systemMessage = `[System: Final draft ready for review. To: ${confirmedDraft.to}, Subject: ${confirmedDraft.subject}, ThreadId: ${confirmedDraft.threadId || "NONE"}, Body: ${confirmedDraft.body}. Please present this to the user and ask for confirmation to send.]`;
      // Call the API silently
      sendSilentSystemMessage(systemMessage);
      clearConfirmedDraft();
    }
  }, [confirmedDraft]);

  const sendSilentSystemMessage = async (prompt: string) => {
    if (!tenantId) return;
    setIsTyping(true);
    
    // Add system message to the state so it is bundled in history, but NOT rendered in UI
    const sysMsg: Message = { id: Date.now().toString(), sender: "system", text: prompt };
    setMessages((prev) => [...prev, sysMsg]);

    try {
      const response = await axios.post("/api/agent", { prompt, tenantId });
      let aiText = response.data.message || "Action completed.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: aiText,
        },
      ]);
    } catch (error: any) {
      console.error("Agent execution error:", error);
      const errorMessage =
        error.response?.data?.error || "I encountered an error.";
      toast.error(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !tenantId) return;

    const userText = inputValue;
    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const recentHistory = messages
        .slice(-10)
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
        .join("\n");

      const contextualPrompt = `[CHAT HISTORY]\n${recentHistory}\n[NEW COMMAND]\nUSER: ${userText}`;

      const response = await axios.post("/api/agent", {
        prompt: contextualPrompt,
        tenantId,
        draftPayload: activeDraft
      });

      // TRIGGER SYNC: If the AI just executed a confirmed draft, force a background sync & UI refresh
      if (activeDraft) {
        try {
          await axios.post("/api/emails/sync");
        } catch (syncErr) {
          console.error("Sync failed:", syncErr);
        }
        router.refresh();
        setActiveDraft(null); // Clear memory so we don't re-trigger sync on the next chat message
      }

      let aiText = response.data.message || "Action completed.";

      const composeRegex =
        /<UI_COMMAND\s+type="COMPOSE"\s+to="([^"]*)"\s+subject="([^"]*)"\s+threadId="([^"]*)"\s+body="([\s\S]*?)"\s*\/>/;
      const match = aiText.match(composeRegex);
      if (match) {
        const parsedBody = match[4].replace(/\\n/g, '\n');
        startNovaDraft({ to: match[1], subject: match[2], threadId: match[3], body: parsedBody });
        aiText = aiText.replace(composeRegex, "").trim();
        if (!aiText) {
          aiText = `I have opened the compose window and drafted the email:<br/><br/><strong>To:</strong> ${match[1]}<br/><strong>Subject:</strong> ${match[2]}<br/><br/><div style="padding-left:10px; border-left: 2px solid #FF9494; color: gray;">${parsedBody.replace(/\n/g, '<br/>')}</div><br/>You can edit it now. Once you're ready, click <strong>Confirm Draft</strong>.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: aiText,
        },
      ]);
    } catch (error: any) {
      console.error("Agent execution error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "I encountered an error while trying to process your request. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      {/* <div className="flex items-center gap-3 p-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B7B] to-[#FF9494] flex items-center justify-center shadow-md relative">
          <Hexagon className="w-6 h-6 text-white" strokeWidth={2.5} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#FFF5E4] dark:border-[#1A1D23]" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Nova Core
          </span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Always Active • Deep Focus
          </span>
        </div>
      </div> */}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.filter(m => m.sender !== "system").map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`flex items-end gap-2 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-md  flex items-center justify-center shrink-0 mb-1">
                    <Image
                      src="/logo.svg"
                      alt="Nova"
                      width={100}
                      height={100}
                      style={{ width: "auto", height: "auto" }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#FF9494] text-white rounded-br-sm shadow-md"
                      : "glass bg-white/70 dark:bg-[#23232A]/80 border border-white/60 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.text.replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong>$1</strong>",
                    ),
                  }}
                />

                {isUser && (
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mb-1 border border-[#FF9494]/30 shadow-sm">
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-end gap-2 self-start"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FF7B7B] to-[#FF9494] flex items-center justify-center shrink-0 mb-1">
                <Hexagon className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
              <div className="p-4 rounded-3xl rounded-bl-sm glass bg-white/70 dark:bg-[#23232A]/80 border border-white/60 dark:border-white/10 shadow-sm flex items-center gap-1.5 h-12">
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 shrink-0">
        <div className="relative w-full rounded-full glass bg-white/60 dark:bg-[#23232A]/80 border border-white/80 dark:border-white/10 shadow-sm p-1.5 flex items-center transition-all focus-within:ring-2 focus-within:ring-[#FF9494]/50 focus-within:bg-white/90 dark:focus-within:bg-[#2A2D35]/90">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isRecording
                ? "bg-[#FFE3E1] dark:bg-[#FF9494]/20 text-[#FF9494]"
                : "text-gray-400 hover:text-[#FF9494] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {isRecording ? (
              <div className="flex items-center gap-0.5">
                <motion.div
                  animate={{ height: [4, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-1 bg-[#FF9494] rounded-full"
                />
                <motion.div
                  animate={{ height: [4, 16, 4] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  className="w-1 bg-[#FF9494] rounded-full"
                />
                <motion.div
                  animate={{ height: [4, 8, 4] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  className="w-1 bg-[#FF9494] rounded-full"
                />
              </div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nova Core..."
            className="flex-1 h-10 bg-transparent px-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />

          <AnimatePresence mode="popLayout">
            {isTyping ? (
              <motion.button
                key="stop"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setIsTyping(false)}
                className="w-8 h-8 shrink-0 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center shadow-md hover:bg-gray-700 dark:hover:bg-white transition-colors ml-2"
              >
                <div className="w-3 h-3 bg-current rounded-sm" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ml-2 ${
                  inputValue.trim()
                    ? "bg-[#FF9494] text-white shadow-md hover:bg-[#ff8080]"
                    : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
