"use client";
import React, { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { api } from "@/lib/axios";
import { GmailSidebar, SIDEBAR_ITEMS } from "./gmail/GmailSidebar";
import { GmailContent } from "./gmail/GmailContent";
import { GmailCompose } from "./gmail/GmailCompose";
import { EmailMessage } from "@/types/models";
import { useNovaContext } from "@/context/NovaContext";

interface GmailPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  searchQuery?: string;
  // Lifted compose state (controlled by WorkspaceLayout for keyboard shortcuts)
  isComposing: boolean;
  setIsComposing: (v: boolean) => void;
  replyTo: string;
  setReplyTo: (v: string) => void;
  replySubject: string;
  setReplySubject: (v: string) => void;
  // Keyboard navigation
  focusedEmailIndex: number;
  openTrigger: number;
  activeTab: string;
  setActiveTab: (v: string) => void;
}

export const GmailPanel: React.FC<GmailPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
  searchQuery = "",
  isComposing,
  setIsComposing,
  replyTo,
  setReplyTo,
  replySubject,
  setReplySubject,
  focusedEmailIndex,
  openTrigger,
  activeTab,
  setActiveTab,
}) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { isNovaControlled, clearNovaDraft } = useNovaContext();

  const handleCompose = () => {
    setReplyTo("");
    setReplySubject("");
    setIsComposing(true);
  };

  const handleReply = (to: string, subject: string) => {
    setReplyTo(to);
    setReplySubject(subject);
    setIsComposing(true);
  };

  const fetchEmails = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      // Using the new axios api instance
      const res = await api.get("/api/emails");
      if (res.data) {
        if (res.data.emails) {
          setEmails(res.data.emails);
        }
        if (res.data.isConnected !== undefined) {
          setIsConnected(res.data.isConnected);
        } else if (res.data.emails && res.data.emails.length > 0) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      }
      return res.data;
    } catch (err) {
      console.error("Failed to fetch emails", err);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const handleRestore = React.useCallback(async () => {
    setSyncing(true);
    try {
      await api.post("/api/emails/sync", { offset: emails.length });
      await fetchEmails();
      setIsConnected(true); // If sync succeeds, we are connected
    } catch (err) {
      console.error("Failed to restore history", err);
    } finally {
      setSyncing(false);
    }
  }, [emails.length, fetchEmails]);

  useEffect(() => {
    let isMounted = true;

    fetchEmails(false).then((data) => {
      if (!isMounted) return;
      const currentlyConnected = data?.isConnected ?? false;
      const currentEmailsCount = data?.emails?.length ?? 0;
      if (currentlyConnected && currentEmailsCount === 0) {
        // Automatically pull in Inbox, Sent, Drafts, Trash etc. if DB is empty
        handleRestore();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchEmails, handleRestore]);

  const getFilteredEmails = (label: string) => {
    let filtered = emails;
    switch (label) {
      case "Inbox":
        filtered = emails.filter(
          (e) =>
            e.labels?.includes("INBOX") ||
            (!e.labels?.includes("SENT") &&
              !e.labels?.includes("DRAFT") &&
              !e.labels?.includes("TRASH")),
        );
        break;
      case "Sent":
        filtered = emails.filter((e) => e.labels?.includes("SENT"));
        break;
      case "Drafts":
        filtered = emails.filter((e) => e.labels?.includes("DRAFT"));
        break;
      case "Important":
        filtered = emails.filter(
          (e) =>
            e.labels?.includes("IMPORTANT") ||
            e.priority === "Important" ||
            e.priority === "high" ||
            e.priority === "urgent",
        );
        break;
      case "Bin":
        filtered = emails.filter((e) => e.labels?.includes("TRASH"));
        break;
      case "Archive":
        filtered = emails.filter(
          (e) =>
            !e.labels?.includes("INBOX") &&
            !e.labels?.includes("TRASH") &&
            !e.labels?.includes("DRAFT") &&
            !e.labels?.includes("SENT"),
        );
        break;
      default:
        filtered = emails.filter((e) => e.labels?.includes(label.toUpperCase()));
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        (e.fromAddress && e.fromAddress.toLowerCase().includes(q)) ||
        (e.snippet && e.snippet.toLowerCase().includes(q))
      );
    }
    return filtered;
  };

  const getFilteredCount = (label: string) => {
    return getFilteredEmails(label).length;
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* We completely removed the top header. The toggle button is now inside the Sidebar. */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex overflow-hidden">
        <GmailSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          getFilteredCount={getFilteredCount}
          onCompose={handleCompose}
        />

        {/* ALWAYS render content so it doesn't vanish when sidebar shrinks to icons */}
        <>
          {SIDEBAR_ITEMS.map((item) => (
            <GmailContent
              key={item.label}
              label={item.label}
              filteredEmails={getFilteredEmails(item.label)}
              loading={loading}
              syncing={syncing}
              onSync={handleRestore}
              isConnected={isConnected}
              onReply={handleReply}
              onRefresh={fetchEmails}
              focusedEmailIndex={focusedEmailIndex}
              openTrigger={openTrigger}
              isActiveTab={activeTab === item.label}
            />
          ))}
        </>
      </Tabs>

      {/* Floating Compose Window */}
      {(isComposing || isNovaControlled) && (
        <GmailCompose
          onClose={() => {
            setIsComposing(false);
            if (isNovaControlled) clearNovaDraft();
          }}
          initialTo={replyTo}
          initialSubject={replySubject}
        />
      )}
    </div>
  );
};
