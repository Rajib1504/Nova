import { useEffect, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  handler: () => void;
}

/**
 * Global keyboard shortcut hook.
 * - Registers ONE keydown listener on window (avoids stacking).
 * - Uses a ref internally so the listener is added only once, but always
 *   reads the latest handlers via the ref — no stale closures.
 * - Automatically ignores all keys when the user is typing in an
 *   input / textarea / contenteditable, except for Escape.
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  // Keep the latest shortcuts in a ref so the effect never needs to re-run
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Allow Escape to bubble through even when the user is typing
      if (isTyping && e.key !== "Escape") return;

      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch =
          !!shortcut.ctrlKey === (e.ctrlKey || e.metaKey);

        if (e.key === shortcut.key && ctrlMatch) {
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Runs once — latest handlers always available via ref
}
