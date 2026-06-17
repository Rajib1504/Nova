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
}

export const GmailPanel: React.FC<GmailPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [replySubject, setReplySubject] = useState("");
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

  const handleRestore = async () => {
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
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (!isMounted) return;
      const data = await fetchEmails(true);
      
      const currentlyConnected = data?.isConnected ?? false;
      const currentEmailsCount = data?.emails?.length ?? 0;
      
      if (currentlyConnected && currentEmailsCount === 0 && isMounted) {
        timeoutId = setTimeout(poll, 3000);
      }
    };

    fetchEmails(false).then((data) => {
      if (!isMounted) return;
      const currentlyConnected = data?.isConnected ?? false;
      const currentEmailsCount = data?.emails?.length ?? 0;
      if (currentlyConnected && currentEmailsCount === 0) {
        timeoutId = setTimeout(poll, 3000);
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchEmails]);

  const getFilteredEmails = (label: string) => {
    switch (label) {
      case "Inbox":
        return emails.filter(
          (e) =>
            e.labels?.includes("INBOX") ||
            (!e.labels?.includes("SENT") &&
              !e.labels?.includes("DRAFT") &&
              !e.labels?.includes("TRASH")),
        );
      case "Sent":
        return emails.filter((e) => e.labels?.includes("SENT"));
      case "Drafts":
        return emails.filter((e) => e.labels?.includes("DRAFT"));
      case "Important":
        return emails.filter(
          (e) =>
            e.labels?.includes("IMPORTANT") ||
            e.priority === "Important" ||
            e.priority === "high" ||
            e.priority === "urgent",
        );
      case "Bin":
        return emails.filter((e) => e.labels?.includes("TRASH"));
      case "Archive":
        return emails.filter(
          (e) =>
            !e.labels?.includes("INBOX") &&
            !e.labels?.includes("TRASH") &&
            !e.labels?.includes("DRAFT") &&
            !e.labels?.includes("SENT"),
        );
      default:
        return emails.filter((e) => e.labels?.includes(label.toUpperCase()));
    }
  };

  const getFilteredCount = (label: string) => {
    return getFilteredEmails(label).length;
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* We completely removed the top header. The toggle button is now inside the Sidebar. */}

      <Tabs defaultValue="Inbox" className="flex-1 flex overflow-hidden">
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
