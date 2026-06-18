import React from "react";

export const toggleThemeWithTransition = (
  e: React.MouseEvent | null,
  theme: string,
  setTheme: (t: string) => void
) => {
  const isDark = theme === "light";

  const performToggle = () => {
    setTheme(isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nova-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("nova-theme", "light");
    }
  };

  if (!document.startViewTransition) {
    performToggle();
    return;
  }

  // Fallback to top-right if event is missing
  const x = e?.clientX ?? window.innerWidth;
  const y = e?.clientY ?? 0;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(performToggle);

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ];
    
    document.documentElement.animate(
      {
        clipPath: clipPath,
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
};
