interface CalloutProps {
  type?: "info" | "warn" | "error" | "tip";
  children: React.ReactNode;
}

/**
 * 图标为内联 SVG（Lucide 风格路径），替代 emoji——
 * 跨平台渲染一致，线条风格和站内其他图标（主题切换等）统一。
 * 颜色只上在图标上，容器保持中性，不与正文抢戏。
 */
const styles = {
  info: {
    color: "var(--callout-info)",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
  },
  tip: {
    color: "var(--callout-tip)",
    path: (
      <>
        <path d="M21.801 10A10 10 0 1 1 17 3.335" />
        <path d="m9 11 3 3L22 4" />
      </>
    ),
  },
  warn: {
    color: "var(--callout-warn)",
    path: (
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
  },
  error: {
    color: "var(--callout-error)",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m4.9 4.9 14.2 14.2" />
      </>
    ),
  },
};

export function Callout({ type = "info", children }: CalloutProps) {
  const { color, path } = styles[type];

  return (
    <div className="my-6 flex gap-3 rounded-2xl border border-border/70 bg-quote-bg px-5 py-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="mt-[5px] shrink-0"
        style={{ color }}
      >
        {path}
      </svg>
      <div className="text-sm leading-7 text-muted [&_p]:mb-0 [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}
