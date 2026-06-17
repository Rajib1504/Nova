"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface NovaDraft {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
}

interface NovaContextType {
  // State
  isNovaControlled: boolean;
  isGhostTyping: boolean;
  novaDraft: NovaDraft | null;
  confirmedDraft: NovaDraft | null;
  
  // Actions
  startNovaDraft: (draft: NovaDraft) => void;
  updateNovaDraft: (draft: Partial<NovaDraft>) => void;
  finishGhostTyping: () => void;
  clearNovaDraft: () => void;
  confirmDraft: (finalDraft: NovaDraft) => void;
  clearConfirmedDraft: () => void;
}

const NovaContext = createContext<NovaContextType | undefined>(undefined);

export const NovaProvider = ({ children }: { children: ReactNode }) => {
  const [isNovaControlled, setIsNovaControlled] = useState(false);
  const [isGhostTyping, setIsGhostTyping] = useState(false);
  const [novaDraft, setNovaDraft] = useState<NovaDraft | null>(null);
  const [confirmedDraft, setConfirmedDraft] = useState<NovaDraft | null>(null);

  const startNovaDraft = (draft: NovaDraft) => {
    setNovaDraft(draft);
    setIsNovaControlled(true);
    setIsGhostTyping(true);
  };

  const updateNovaDraft = (draft: Partial<NovaDraft>) => {
    setNovaDraft((prev) => (prev ? { ...prev, ...draft } : { to: "", subject: "", body: "", ...draft }));
  };

  const finishGhostTyping = () => {
    setIsGhostTyping(false);
  };

  const clearNovaDraft = () => {
    setNovaDraft(null);
    setIsNovaControlled(false);
    setIsGhostTyping(false);
  };

  const confirmDraft = (finalDraft: NovaDraft) => {
    setConfirmedDraft(finalDraft);
    clearNovaDraft();
  };

  const clearConfirmedDraft = () => {
    setConfirmedDraft(null);
  };

  return (
    <NovaContext.Provider
      value={{
        isNovaControlled,
        isGhostTyping,
        novaDraft,
        confirmedDraft,
        startNovaDraft,
        updateNovaDraft,
        finishGhostTyping,
        clearNovaDraft,
        confirmDraft,
        clearConfirmedDraft,
      }}
    >
      {children}
    </NovaContext.Provider>
  );
};

export const useNovaContext = () => {
  const context = useContext(NovaContext);
  if (!context) {
    throw new Error("useNovaContext must be used within a NovaProvider");
  }
  return context;
};
