"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Inbox, ChevronDown, ChevronUp } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";

import { GmailThreadView } from "./GmailThreadView";

interface GmailContentProps {
  label: string;
  filteredEmails: any[];
  loading: boolean;
  syncing: boolean;
  onSync: () => void;
  isConnected: boolean;
  onReply: (to: string, subject: string) => void;
  onRefresh: () => void;
}

// Format a JS Date object into a readable time string
const formatTime = (dateStr: string) => {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Extract a text avatar from an email string
const getAvatarText = (fromStr: string) => {
  if (!fromStr) return "?";
  const namePart = fromStr.split('<')[0].trim();
  if (namePart) {
    const words = namePart.split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return namePart.substring(0, 2).toUpperCase();
  }
  return fromStr.substring(0, 2).toUpperCase();
};

export const GmailContent: React.FC<GmailContentProps> = ({ label, filteredEmails, loading, syncing, onSync, isConnected, onReply, onRefresh }) => {
  const [viewingThread, setViewingThread] = useState<any | null>(null);

  // Group emails into threads
  const threadsMap = new Map<string, any[]>();
  filteredEmails.forEach(email => {
    const tId = email.threadId || email.id;
    if (!threadsMap.has(tId)) {
      threadsMap.set(tId, []);
    }
    threadsMap.get(tId)!.push(email);
  });

  const groupedThreads = Array.from(threadsMap.values()).map(threadEmails => {
    // Sort emails within thread chronologically (newest first)
    threadEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const latestDate = new Date(threadEmails[0].date).getTime();
    const isPriority = threadEmails.some(e => e.priority === "high" || e.priority === "urgent" || e.priority === "Important");

    return {
      threadId: threadEmails[0].threadId || threadEmails[0].id,
      emails: threadEmails,
      latestDate,
      isPriority,
      subject: threadEmails[0].subject,
      latestSender: threadEmails[0].fromAddress
    };
  });

  // Sort overall threads descending by latest message
  groupedThreads.sort((a, b) => b.latestDate - a.latestDate);

  return (
    <TabsContent value={label} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 m-0 data-[state=inactive]:hidden focus-visible:outline-none relative">
      
      {!isConnected && label === "Inbox" ? (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-center mt-12 mb-12">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#FFE3E1] to-[#FF9494] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#FF9494]/20">
            <Inbox className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Connect Your Gmail</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
            Initialize your neural core to automatically triage, categorize, and organize your inbox.
          </p>
          <a 
            href="/api/connect?plugin=gmail"
            className="px-6 py-3 bg-gradient-to-r from-[#FF7B7B] to-[#FF9494] text-white font-bold rounded-xl shadow-md hover:shadow-[0_8px_15px_rgba(255,148,148,0.3)] hover:-translate-y-0.5 transition-all text-lg"
          >
            Connect to Gmail
          </a>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center mt-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9494]"></div>
            </div>
          ) : groupedThreads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 mt-10">
              <Inbox className="w-12 h-12 mb-4 opacity-50" />
              <p>No {label.toLowerCase()} loaded yet.</p>
              {label === "Inbox" && <p className="text-sm mt-2 opacity-70">Send a test email to your Gmail account!</p>}
            </div>
          ) : (
            groupedThreads.map((thread) => {
              // Determine if the thread is unread based on the first email's labels
              const isUnread = thread.emails[0].labels?.includes("UNREAD");

              return (
                <div key={thread.threadId} className="flex flex-col shrink-0">
                  <motion.div
                    whileHover={{ y: -2 }}
                    onClick={() => setViewingThread(thread)}
                    className={`relative p-4 rounded-2xl glass ${isUnread ? 'bg-white/80 dark:bg-[#2A2D35]' : 'bg-white/40 dark:bg-[#23232A]/50'} border border-white/80 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-all group z-10`}
                  >
                    {thread.isPriority && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#FF9494] rounded-r-full shadow-[0_0_10px_rgba(255,148,148,0.5)]" />
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 overflow-hidden shrink-0">
                          {getAvatarText(thread.latestSender)}
                        </div>
                        <span className={`text-sm line-clamp-1 max-w-[150px] ${isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>{thread.latestSender.split('<')[0].replace(/"/g, '').trim()}</span>
                        {thread.emails.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-300">
                            {thread.emails.length}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs whitespace-nowrap shrink-0 ml-2 flex items-center gap-1.5 ${isUnread ? 'font-bold text-[#FF9494]' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(thread.emails[0].date)}
                      </span>
                    </div>

                    <h4 className={`text-sm mb-1 line-clamp-1 pr-6 ${isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{thread.subject}</h4>
                    
                    <p className={`text-xs line-clamp-2 leading-relaxed ${isUnread ? 'font-medium text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                      {thread.emails[0].snippet || "No preview available..."}
                    </p>

                    {thread.isPriority && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9494] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#FF9494] uppercase tracking-wider">
                          High Priority
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })
          )}

          {/* Sync Button safely placed at the very bottom of the list */}
          {isConnected && (
            <div className="flex justify-center mt-6 mb-8 shrink-0">
              <button 
                onClick={onSync}
                disabled={syncing}
                className="px-6 py-2.5 rounded-xl text-sm font-medium glass bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {syncing ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-300"></div> Scanning Folders...</>
                ) : (
                  <><Clock className="w-4 h-4" /> Load More / Sync History</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Full Thread View Modal */}
      {viewingThread && (
        <GmailThreadView 
          thread={viewingThread}
          onClose={() => setViewingThread(null)}
          onReply={(to, subject) => {
            setViewingThread(null); // Optional: close reading view when replying, or keep it open behind? The user wants Compose floating on top, so closing reading view is cleaner, or we can keep it. Let's just trigger onReply.
            onReply(to, subject);
          }}
          onUpdateThread={() => {
            onRefresh(); // Re-fetch emails so UI updates
            // if we want immediate feedback we could mutate local state, but refreshing is safer
          }}
        />
      )}
    </TabsContent>
  );
};
