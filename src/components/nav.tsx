import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { SearchPalette } from "./search-palette";
import { url } from "@/lib/url";

const links = [
  { href: "/blog", label: "文章" },
  { href: "/projects", label: "项目" },
  { href: "/about", label: "关于" },
];

export function Nav({ currentPath = "" }: { currentPath?: string }) {
  const [pathname, setPathname] = useState(currentPath);

  useEffect(() => {
    if (!currentPath && typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, [currentPath]);

  const homeHref = url("/");
  const normHome = homeHref.replace(/\/$/, "") || "/";
  const normPath = pathname.replace(/\/$/, "") || "/";

  return (
    <nav className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
      <a
        href={homeHref}
        className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
      >
        Adhytm
      </a>
      <div className="flex items-center gap-5 text-sm text-muted">
        {links.map(({ href, label }) => {
          const targetHref = url(href);
          const normTarget = targetHref.replace(/\/$/, "") || "/";
          const isActive =
            normPath === normTarget ||
            (normTarget !== normHome && normPath.startsWith(normTarget));

          return (
            <a
              key={href}
              href={targetHref}
              aria-current={isActive ? "page" : undefined}
              className={`relative transition-colors hover:text-foreground ${
                isActive ? "text-foreground font-medium" : ""
              }`}
            >
              {label}
              {isActive && (
                <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-accent" />
              )}
            </a>
          );
        })}
        <SearchPalette />
        <ThemeToggle />
      </div>
    </nav>
  );
}
