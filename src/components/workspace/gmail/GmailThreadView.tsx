import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Trash2, Archive, Mail, Reply, MoreVertical } from "lucide-react";
import { BlobButton } from "../../BlobButton";
import { api } from "@/lib/axios";

interface GmailThreadViewProps {
  thread: any;
  onClose: () => void;
  onReply: (to: string, subject: string) => void;
  onUpdateThread: () => void;
}

export const GmailThreadView: React.FC<GmailThreadViewProps> = ({ thread, onClose, onReply, onUpdateThread }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // We show the latest email or the whole thread.
  // The first email in the array is usually the oldest or newest depending on fetch. 
  // We'll map through them.
  const emails = thread.emails || [];
  
  // Extract latest from/subject for the header
  const latestEmail = emails[emails.length - 1] || emails[0];
  const subject = latestEmail?.subject || "No Subject";
  const from = latestEmail?.fromAddress || "Unknown Sender";

  const handleAction = async (action: "archive" | "trash" | "unread") => {
    setIsProcessing(true);
    try {
      await api.post("/api/emails/modify", {
        threadId: thread.threadId,
        action,
      });
      onUpdateThread(); // Trigger a refresh in the parent
      if (action === "archive" || action === "trash") {
        onClose(); // Close the view if we archived or deleted it
      }
    } catch (error) {
      console.error(`Failed to ${action} thread`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplyClick = () => {
    // Pass the sender and subject up to trigger Compose
    onReply(from, `Re: ${subject}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm"
      >
        <div className="w-full h-full max-w-4xl bg-[#FFF5E4] dark:bg-[#1A1D23] border border-gray-200 dark:border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative">
          
          {/* Header Toolbar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-white/10 bg-[#FFF5E4] dark:bg-[#1A1D23] shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                title="Back to Inbox"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
              
              <button onClick={() => handleAction("archive")} disabled={isProcessing} className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors" title="Archive">
                <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={() => handleAction("trash")} disabled={isProcessing} className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={() => handleAction("unread")} disabled={isProcessing} className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors" title="Mark as Unread">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <BlobButton onClick={handleReplyClick} size="sm">
                <Reply className="w-4 h-4" />
                <span className="hidden sm:inline">Reply</span>
              </BlobButton>
            </div>
          </div>

          {/* Email Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#FFF5E4] dark:bg-[#1A1D23]">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
              {subject}
            </h1>
            
            <div className="flex flex-col gap-10">
              {emails.map((email: any, idx: number) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex justify-between items-start mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{email.fromAddress.split('<')[0].replace(/"/g, '').trim()}</p>
                      <p className="text-sm text-gray-500">&lt;{email.fromAddress.match(/<([^>]+)>/)?.[1] || email.fromAddress}&gt; to {email.toAddress || "me"}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-400">
                      {new Date(email.date).toLocaleString()}
                    </p>
                  </div>
                  
                  <div 
                    className="text-gray-800 dark:text-gray-200 prose prose-sm md:prose-base dark:prose-invert max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: email.body || email.snippet || "No content." }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
