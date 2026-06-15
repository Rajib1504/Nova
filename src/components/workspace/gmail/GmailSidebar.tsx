"use client";
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Inbox,
  Send,
  FileText,
  Calendar,
  AlertCircle,
  Clock,
  Archive,
  Trash2,
  Edit,
} from "lucide-react";

import { BlobButton } from "../../BlobButton";

export const SIDEBAR_ITEMS = [
  { icon: Inbox, label: "Inbox", count: 0 },
  { icon: Send, label: "Sent", count: 0 },
  { icon: FileText, label: "Drafts", count: 0 },
  { icon: Calendar, label: "Scheduled", count: 0 },
  { icon: AlertCircle, label: "Important", count: 0 },
  { icon: Clock, label: "Snoozed", count: 0 },
  { icon: Archive, label: "Archive", count: 0 },
  { icon: Trash2, label: "Bin", count: 0 },
];

interface GmailSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  getFilteredCount: (label: string) => number;
  onCompose: () => void;
}

export const GmailSidebar: React.FC<GmailSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  getFilteredCount,
  onCompose,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // The sidebar is visually collapsed to just icons when not hovered, OR when the whole panel is closed.
  const effectivelyCollapsed = isCollapsed || !isHovered;

  return (
    <div
      className="h-full shrink-0 relative transition-all duration-300 w-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TabsList
        className={`absolute top-0 left-0 bottom-0 py-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden h-full justify-start transition-all duration-300 z-30
        ${
          effectivelyCollapsed
            ? "w-16 px-2 items-center bg-transparent border-r border-white/20 dark:border-white/5"
            : "w-56 px-3 bg-[#FFF5E4] dark:bg-[#1A1D23] border-r border-gray-200 dark:border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Compose and Collapse Toggle Area */}
        <div
          className={`w-full flex ${effectivelyCollapsed ? "flex-col items-center gap-2" : "justify-between items-center px-2"} mb-4`}
        >
          {!effectivelyCollapsed ? (
            <BlobButton onClick={onCompose} size="sm" className="flex-1 mr-2 flex justify-center">
              <Edit className="w-4 h-4" />
              Compose
            </BlobButton>
          ) : (
            <BlobButton onClick={onCompose} size="icon">
              <Edit className="w-5 h-5" />
            </BlobButton>
          )}
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors shrink-0 ${effectivelyCollapsed ? "mt-2" : ""}`}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {SIDEBAR_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const filteredCount = getFilteredCount(item.label);
          const count = filteredCount > 0 ? filteredCount : item.count;

          return (
            <TabsTrigger
              key={idx}
              value={item.label}
              title={effectivelyCollapsed ? item.label : undefined}
              onClick={() => {
                if (isCollapsed) onToggleCollapse();
              }}
              className={`relative flex items-center h-10 rounded-xl transition-colors data-[state=active]:bg-[#FFE3E1] data-[state=active]:text-[#FF9494] data-[state=active]:dark:bg-[#FF9494]/20 data-[state=active]:shadow-none
                ${effectivelyCollapsed ? "w-10 justify-center" : "w-full px-3 gap-3 justify-start"}
                text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!effectivelyCollapsed && (
                <>
                  <span className="text-sm font-medium">{item.label}</span>
                  {count > 0 ? (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1A1D23] shadow-sm">
                      {count}
                    </span>
                  ) : null}
                </>
              )}
              {/* Unread indicator for collapsed state */}
              {effectivelyCollapsed && count > 0 ? (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF9494]" />
              ) : null}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
};
