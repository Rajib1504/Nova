"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Hexagon, Check, FileText, CalendarDays, CalendarPlus, X } from "lucide-react";
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

interface CalendarDraft {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "ai",
    text: "Greetings. I am **NOVA**—your Personal Workflow Automator. I am engineered to seamlessly orchestrate your digital communications and schedule. From drafting targeted emails to coordinating complex calendar logistics, simply articulate your objective, and I will handle the execution.",
  },
];

interface AgentChatPanelProps {
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const AgentChatPanel = ({
  inputRef: externalInputRef,
}: AgentChatPanelProps = {}) => {
  const localInputRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = externalInputRef || localInputRef;
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [activeDraft, setActiveDraft] = useState<any>(null);
  const [draftAction, setDraftAction] = useState<"send" | "save" | null>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarDraft | null>(null);
  const [eventAction, setEventAction] = useState<"create" | "skip" | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Holds the AbortController for the current in-flight agent request
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error(
          "Voice input is only supported in Chrome, Edge, and Safari.",
        );
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);

        // Auto-resize the textarea while speaking
        if (inputRef && inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.style.height =
            Math.min(inputRef.current.scrollHeight, 120) + "px";
        }
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        console.error("SpeechRecognition error:", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone blocked. Please allow mic access in your browser address bar.");
        } else if (event.error === 'network') {
          toast.error("Network error. Voice input requires a secure connection (HTTPS).");
        } else {
          toast.error("Voice input error: " + event.error);
        }
      };
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

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
      clearConfirmedDraft();
    }
  }, [confirmedDraft]);

  const handleDraftAction = async (action: "send" | "save") => {
    if (!activeDraft || draftAction) return;
    setDraftAction(action);
    try {
      await axios.post(`/api/emails/${action === "send" ? "send" : "draft"}`, activeDraft);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: action === "send"
            ? `Email sent to <strong>${activeDraft.to}</strong>.`
            : `Email saved to drafts for <strong>${activeDraft.to}</strong>.`,
        },
      ]);
      setActiveDraft(null);
      router.refresh();
      try { await axios.post("/api/emails/sync"); } catch (syncErr) { console.error("Sync failed:", syncErr); }
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Could not ${action === "send" ? "send" : "save"} the email.`);
    } finally {
      setDraftAction(null);
    }
  };

  const handleCalendarAction = async (action: "create" | "skip") => {
    if (!activeEvent || eventAction) return;
    setEventAction(action);

    if (action === "skip") {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Okay, I skipped adding this event to your calendar.",
        },
      ]);
      setActiveEvent(null);
      setEventAction(null);
      return;
    }

    try {
      await axios.post("/api/calendar/modify", {
        action: "create",
        ...activeEvent,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `Added <strong>${activeEvent.summary}</strong> to your calendar.`,
        },
      ]);
      setActiveEvent(null);
      router.refresh();
      try { await axios.post("/api/calendar/sync"); } catch (syncErr) { console.error("Calendar sync failed:", syncErr); }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Could not add the event to your calendar.");
    } finally {
      setEventAction(null);
    }
  };

  const sendSilentSystemMessage = async (prompt: string) => {
    if (!tenantId) return;
    setIsTyping(true);

    // Add system message to the state so it is bundled in history, but NOT rendered in UI
    const sysMsg: Message = {
      id: Date.now().toString(),
      sender: "system",
      text: prompt,
    };
    setMessages((prev) => [...prev, sysMsg]);

    // Create a fresh AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await axios.post(
        "/api/agent",
        { prompt, tenantId },
        {
          signal: controller.signal,
        },
      );
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
      // If the request was aborted by the user, don't show an error toast
      if (
        axios.isCancel(error) ||
        error.name === "CanceledError" ||
        error.code === "ERR_CANCELED"
      ) {
        console.log("[Nova] Agent request cancelled by user.");
        return;
      }
      console.error("Agent execution error:", error);
      const errorMessage =
        error.response?.data?.error || "I encountered an error.";
      toast.error(errorMessage);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
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

    // Create a fresh AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const recentHistory = messages
        .slice(-10)
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
        .join("\n");

      const contextualPrompt = `[CHAT HISTORY]\n${recentHistory}\n[NEW COMMAND]\nUSER: ${userText}`;

      const response = await axios.post(
        "/api/agent",
        {
          prompt: contextualPrompt,
          tenantId,
          draftPayload: activeDraft,
        },
        {
          signal: controller.signal,
        },
      );

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
        const parsedBody = match[4].replace(/\\n/g, "\n");
        startNovaDraft({
          to: match[1],
          subject: match[2],
          threadId: match[3],
          body: parsedBody,
        });
        aiText = aiText.replace(composeRegex, "").trim();
        if (!aiText) {
          aiText = `I have opened the compose window and drafted the email:<br/><br/><strong>To:</strong> ${match[1]}<br/><strong>Subject:</strong> ${match[2]}<br/><br/><div style="padding-left:10px; border-left: 2px solid #FF9494; color: gray;">${parsedBody.replace(/\n/g, "<br/>")}</div><br/>You can edit it now. Once you're ready, click <strong>Confirm Draft</strong>.`;
        }
      }

      const calendarRegex =
        /<UI_COMMAND\s+type="CALENDAR"\s+summary="([^"]*)"\s+description="([^"]*)"\s+startTime="([^"]*)"\s+endTime="([^"]*)"\s*\/>/;
      const calendarMatch = aiText.match(calendarRegex);
      if (calendarMatch) {
        setActiveEvent({
          summary: calendarMatch[1],
          description: calendarMatch[2],
          startTime: calendarMatch[3],
          endTime: calendarMatch[4],
        });
        aiText = aiText.replace(calendarRegex, "").trim();
        if (!aiText) {
          aiText = "I found the event details. Review them below and choose an action.";
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
      // If the request was aborted by the user, don't show an error toast
      if (
        axios.isCancel(error) ||
        error.name === "CanceledError" ||
        error.code === "ERR_CANCELED"
      ) {
        console.log("[Nova] Agent request cancelled by user.");
        return;
      }
      console.error("Agent execution error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "I encountered an error while trying to process your request. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
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
          {messages
            .filter((m) => m.sender !== "system")
            .map((msg) => {
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
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mb-1">
                <Image
                  src="/logo.svg"
                  alt="Nova"
                  width={100}
                  height={100}
                  style={{ width: "auto", height: "auto" }}
                  className="w-full h-full object-cover"
                />
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

      {activeDraft && (
        <div className="mx-4 mb-3 rounded-2xl border border-[#FF9494]/30 bg-white/85 p-4 shadow-sm dark:bg-[#23232A]/90">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <FileText className="h-4 w-4 text-[#FF7B7B]" />
            Review email
          </div>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold">To:</span> {activeDraft.to}</p>
            <p><span className="font-semibold">Subject:</span> {activeDraft.subject || "No subject"}</p>
          </div>
          <div className="mt-3 max-h-28 overflow-y-auto whitespace-pre-wrap border-l-2 border-[#FF9494] pl-3 text-sm text-gray-700 dark:text-gray-200">
            {activeDraft.body}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleDraftAction("save")}
              disabled={!!draftAction}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
            >
              <FileText className="h-4 w-4" />
              {draftAction === "save" ? "Saving…" : "Save to draft"}
            </button>
            <button
              onClick={() => handleDraftAction("send")}
              disabled={!!draftAction}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF9494] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#ff8080] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {draftAction === "send" ? "Sending…" : "Send email"}
            </button>
          </div>
        </div>
      )}

      {activeEvent && (
        <div className="mx-4 mb-3 rounded-2xl border border-orange-300/40 bg-white/85 p-4 shadow-sm dark:bg-[#23232A]/90">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              Review calendar event
            </div>
            <button
              onClick={() => handleCalendarAction("skip")}
              disabled={!!eventAction}
              aria-label="Skip calendar event"
              className="rounded-full p-1 text-gray-400 transition hover:bg-black/5 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold">Event:</span> {activeEvent.summary}</p>
            <p><span className="font-semibold">Starts:</span> {new Date(activeEvent.startTime).toLocaleString()}</p>
            <p><span className="font-semibold">Ends:</span> {new Date(activeEvent.endTime).toLocaleString()}</p>
            {activeEvent.description && <p><span className="font-semibold">Details:</span> {activeEvent.description}</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleCalendarAction("skip")}
              disabled={!!eventAction}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" />
              Skip
            </button>
            <button
              onClick={() => handleCalendarAction("create")}
              disabled={!!eventAction}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              <CalendarPlus className="h-4 w-4" />
              {eventAction === "create" ? "Adding…" : "Add to calendar"}
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 shrink-0">
        <div className="relative w-full rounded-2xl glass bg-white/60 dark:bg-[#23232A]/80 border border-white/80 dark:border-white/10 shadow-sm p-1.5 flex items-end transition-all focus-within:ring-2 focus-within:ring-[#FF9494]/50 focus-within:bg-white/90 dark:focus-within:bg-[#2A2D35]/90">
          <button
            onClick={toggleRecording}
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

          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
                // Reset height
                if (inputRef && inputRef.current) {
                  inputRef.current.style.height = "40px";
                }
              } else {
                handleKeyDown(e);
              }
            }}
            placeholder="Message Nova Core... (or use voice)"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-auto mb-[-4px]"
            style={{ minHeight: "40px", maxHeight: "120px", lineHeight: "1.5" }}
          />

          <AnimatePresence mode="popLayout">
            {isTyping ? (
              <motion.button
                key="stop"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => {
                  // Cancel the in-flight HTTP request, then reset UI state
                  abortControllerRef.current?.abort();
                  setIsTyping(false);
                }}
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
