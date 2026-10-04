"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "auto" | "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "auto",
  resolvedTheme: "light",
  setTheme: () => {},
  cycleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("auto");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved && ["auto", "light", "dark"].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const applyTheme = () => {
      const root = document.documentElement;
      let resolved: "light" | "dark";

      if (theme === "auto") {
        resolved = getSystemTheme();
        root.classList.remove("light", "dark");
      } else {
        resolved = theme;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
      }

      setResolvedTheme(resolved);
    };

    applyTheme();

    if (theme === "auto") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", applyTheme);
      return () => mql.removeEventListener("change", applyTheme);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme === "auto") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
  };

  const cycleTheme = () => {
    const order: Theme[] = ["auto", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  // 未挂载前不渲染 context，避免 hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, cycleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
