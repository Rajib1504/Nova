"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { EmailMessage } from "@/types/models";
import {
  PenSquare,
  LayoutDashboard,
  Keyboard,
  FileText,
  Reply,
  Archive,
  Calendar,
  Sparkles
} from "lucide-react";
import "./command-palette.css";

interface CommandPaletteProps {
  onOpenShortcuts: () => void;
}

export function CommandPalette({ onOpenShortcuts }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState<EmailMessage | null>(null);
  const router = useRouter();

  // Listen for email focus events from GmailContent
  useEffect(() => {
    const handleFocus = (e: any) => {
      setFocusedEmail(e.detail);
    };
    const handleBlur = () => {
      setFocusedEmail(null);
    };

    document.addEventListener("nova-focus-email", handleFocus);
    document.addEventListener("nova-blur-email", handleBlur);

    return () => {
      document.removeEventListener("nova-focus-email", handleFocus);
      document.removeEventListener("nova-blur-email", handleBlur);
    };
  }, []);

  // Toggle the menu when ⌘K or Ctrl+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Action handlers
  const handleCompose = () => {
    setOpen(false);
    // Custom event to trigger draft modal from WorkspaceLayout
    document.dispatchEvent(new CustomEvent("nova-compose-draft"));
  };

  const handleGoToCommandCenter = () => {
    setOpen(false);
    router.push("/command-center");
  };

  const handleOpenShortcuts = () => {
    setOpen(false);
    onOpenShortcuts();
  };

  const handleSummarize = () => {
    setOpen(false);
    if (focusedEmail) {
      document.dispatchEvent(
        new CustomEvent("nova-agent-action", {
          detail: { action: "summarize", emailId: focusedEmail.id },
        })
      );
    }
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="nova-cmdk-dialog"
    >
      <div className="nova-cmdk-overlay" onClick={() => setOpen(false)} />
      <div className="nova-cmdk-content glass">
        <div className="flex items-center px-4 py-3 border-b border-white/20 dark:border-white/5">
          <Sparkles className="w-5 h-5 text-indigo-500 mr-3" />
          <Command.Input
            placeholder="What do you want to do?"
            className="w-full bg-transparent text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-lg"
          />
          <div className="text-[10px] text-gray-400 font-mono font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded">ESC</div>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">
            No results found.
          </Command.Empty>

          {/* Contextual Actions (Only show if an email is focused) */}
          {focusedEmail && (
            <Command.Group heading={`Email: ${focusedEmail.subject.substring(0, 30)}...`} className="nova-cmdk-group">
              <Command.Item onSelect={handleSummarize} className="nova-cmdk-item">
                <FileText className="w-4 h-4 mr-3 text-blue-500" />
                Summarize this Thread
              </Command.Item>
              <Command.Item onSelect={() => setOpen(false)} className="nova-cmdk-item">
                <Reply className="w-4 h-4 mr-3 text-green-500" />
                Draft a Reply
              </Command.Item>
              <Command.Item onSelect={() => setOpen(false)} className="nova-cmdk-item">
                <Calendar className="w-4 h-4 mr-3 text-orange-500" />
                Create Meeting with Sender
              </Command.Item>
              <Command.Item onSelect={() => setOpen(false)} className="nova-cmdk-item text-red-500 data-[selected=true]:bg-red-500/10">
                <Archive className="w-4 h-4 mr-3" />
                Archive Email
              </Command.Item>
            </Command.Group>
          )}

          {/* Global Actions */}
          <Command.Group heading="Global Actions" className="nova-cmdk-group">
            <Command.Item onSelect={handleCompose} className="nova-cmdk-item">
              <PenSquare className="w-4 h-4 mr-3" />
              Compose New Email
            </Command.Item>
            <Command.Item onSelect={handleGoToCommandCenter} className="nova-cmdk-item">
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Go to Command Center
            </Command.Item>
            <Command.Item onSelect={handleOpenShortcuts} className="nova-cmdk-item">
              <Keyboard className="w-4 h-4 mr-3" />
              View Keyboard Shortcuts
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
