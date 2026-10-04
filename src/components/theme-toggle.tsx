import { useState, useEffect } from "react";

type Theme = "auto" | "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved && ["auto", "light", "dark"].includes(saved)) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const order: Theme[] = ["auto", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (next === "auto") {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      }
    } else {
      localStorage.setItem("theme", next);
      root.classList.add(next);
    }
  };

  if (!mounted) {
    return (
      <div className="w-7 h-7" aria-hidden="true" />
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted transition-colors hover:text-foreground hover:bg-surface"
      aria-label="切换主题"
      title={`当前：${theme === "auto" ? "自动" : theme === "light" ? "亮色" : "深色"}`}
    >
      {theme === "auto" && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )}
      {theme === "light" && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
      {theme === "dark" && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
