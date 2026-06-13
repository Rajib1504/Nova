"use client";
import React from "react";
import { 
  Search, Inbox, Send, FileText, Calendar, 
  AlertCircle, Clock, Archive, Trash2 
} from "lucide-react";
import { motion } from "framer-motion";

interface GmailPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SIDEBAR_ITEMS = [
  { icon: Inbox, label: "Inbox", active: true, count: 3 },
  { icon: Send, label: "Sent", active: false },
  { icon: FileText, label: "Drafts", active: false, count: 2 },
  { icon: Calendar, label: "Scheduled", active: false },
  { icon: AlertCircle, label: "Important", active: false },
  { icon: Clock, label: "Snoozed", active: false },
  { icon: Archive, label: "Archive", active: false },
  { icon: Trash2, label: "Bin", active: false },
];

const MOCK_EMAILS = [
  {
    id: 1,
    sender: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?img=47",
    subject: "Q4 Performance Report & Strategy",
    preview: "Hi Alex, I've attached the final version of the report for your review. We need to align on...",
    time: "10:45 AM",
    isPriority: true,
  },
  {
    id: 2,
    sender: "Design Weekly",
    avatar: "DW", // Text avatar
    subject: "The future of Neumorphic UIs in 2025",
    preview: "Explore how tactile interfaces are making a massive comeback in modern desktop applications...",
    time: "Yesterday",
    isPriority: false,
  },
  {
    id: 3,
    sender: "Mark Thompson",
    avatar: "https://i.pravatar.cc/150?img=12",
    subject: "Dinner plans tonight?",
    preview: "Hey, just checking if you're still up for that Italian place we talked about. Let me know!",
    time: "Yesterday",
    isPriority: false,
  },
  {
    id: 4,
    sender: "Amazon Business",
    avatar: "https://i.pravatar.cc/150?img=68",
    subject: "Your order has been shipped",
    preview: "Great news! Your package containing the Ergonomic Keyboard has been dispatched and will arrive...",
    time: "Oct 24",
    isPriority: false,
  },
];

export const GmailPanel: React.FC<GmailPanelProps> = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <div className="flex flex-col h-full w-full">
      
      {/* Header & Search */}
      <div className="p-4 flex flex-col gap-4 border-b border-white/20 dark:border-white/5 shrink-0">
        <div className="flex justify-between items-center h-8">
          {!isCollapsed && (
            <span className="font-heading font-bold text-lg tracking-tight">
              Inbox
            </span>
          )}
          <button 
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors ${isCollapsed ? "mx-auto" : ""}`}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {!isCollapsed && (
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search in Inbox"
              className="w-full h-10 pl-10 pr-4 rounded-xl glass bg-white/40 dark:bg-white/5 
                         text-sm placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-1 focus:ring-[#FF9494]/50 transition-all
                         border border-white/60 dark:border-white/10"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Vertical Icon Rail / Sidebar */}
        <div className={`py-4 flex flex-col gap-2 shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'w-full px-2 items-center' : 'w-48 px-3 border-r border-white/20 dark:border-white/5'}`}>
          {SIDEBAR_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center h-10 rounded-xl transition-colors
                  ${isCollapsed ? 'w-10 justify-center' : 'w-full px-3 gap-3'}
                  ${item.active 
                    ? 'bg-[#FFE3E1] dark:bg-[#FF9494]/20 text-[#FF9494]' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${item.active ? 'text-[#FF9494]' : ''}`} />
                {!isCollapsed && (
                  <>
                    <span className={`text-sm font-medium ${item.active ? 'font-bold' : ''}`}>
                      {item.label}
                    </span>
                    {item.count && (
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1A1D23] shadow-sm">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
                {/* Unread indicator for collapsed state */}
                {isCollapsed && item.count && (
                   <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF9494]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Email List (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {MOCK_EMAILS.map((email) => (
              <motion.div
                key={email.id}
                whileHover={{ y: -2 }}
                className="relative p-4 rounded-2xl glass bg-white/60 dark:bg-[#23232A]/80 border border-white/80 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-all group"
              >
                {/* Priority Glow Border Effect */}
                {email.isPriority && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#FF9494] rounded-r-full shadow-[0_0_10px_rgba(255,148,148,0.5)]" />
                )}

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {email.avatar.startsWith("http") ? (
                      <img src={email.avatar} alt={email.sender} className="w-8 h-8 rounded-full shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                        {email.avatar}
                      </div>
                    )}
                    <span className="font-semibold text-sm">{email.sender}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {email.time}
                  </span>
                </div>

                <h4 className="text-sm font-bold mb-1 line-clamp-1 pr-6">{email.subject}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {email.preview}
                </p>

                {/* Priority Tag */}
                {email.isPriority && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9494] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#FF9494] uppercase tracking-wider">
                      High Priority
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
