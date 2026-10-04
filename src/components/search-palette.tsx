import { useEffect, useMemo, useRef, useState } from "react";
import { searchDocs, type SearchDoc, type SearchResult } from "@/lib/search";
import { url } from "@/lib/url";

/**
 * 命令面板式站内搜索。
 * - Cmd/Ctrl+K 或 / 唤起；Esc 关闭
 * - ↑↓ 选择，Enter 跳转
 * - 索引在首次打开时懒加载 /search-index.json，仅拉取一次
 */
export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 全局快捷键：Cmd/Ctrl+K 开关，"/" 在非输入态唤起
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 打开状态翻转时重置查询与高亮（渲染期调整，避免 effect 级联渲染）
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }

  // 打开时懒加载索引 + 聚焦输入框
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (docs === null) {
      fetch(url("/search-index.json"))
        .then((r) => r.json())
        .then((data: SearchDoc[]) => setDocs(data))
        .catch(() => setDocs([]));
    }
  }, [open, docs]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const results: SearchResult[] = useMemo(() => {
    if (!docs) return [];
    return searchDocs(docs, query).slice(0, 8);
  }, [docs, query]);

  // 查询变化时重置高亮项（渲染期调整）
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setActive(0);
  }

  const go = (slug: string) => {
    setOpen(false);
    window.location.href = url(`/blog/${encodeURIComponent(slug)}`);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].doc.slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // 高亮项滚动进视野
  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <>
      {/* 触发按钮：桌面显示带快捷键提示的搜索框，移动端只显示图标 */}
      <button
        onClick={() => setOpen(true)}
        aria-label="搜索"
        className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-surface/50 px-2 py-1 text-muted transition-colors hover:border-border hover:text-foreground sm:px-2.5"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden text-xs sm:inline">搜索</span>
        <kbd className="hidden rounded border border-border/60 px-1 font-mono text-[10px] text-muted/70 sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

          {/* 面板 */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="站内搜索"
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-up relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          >
            {/* 输入行 */}
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="搜索文章标题、标签、正文…"
                className="w-full bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted/60"
              />
              <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                ESC
              </kbd>
            </div>

            {/* 结果区 */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query && results.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  没有匹配「{query}」的文章
                </p>
              )}
              {!query && (
                <p className="px-4 py-8 text-center text-xs text-muted/70">
                  输入关键词开始搜索 · ↑↓ 选择 · ↵ 打开
                </p>
              )}
              <ul ref={listRef}>
                {results.map((r, i) => (
                  <li key={r.doc.slug}>
                    <button
                      onClick={() => go(r.doc.slug)}
                      onMouseEnter={() => setActive(i)}
                      className={`block w-full border-l-2 px-4 py-3 text-left transition-colors ${
                        i === active
                          ? "border-accent bg-accent/[0.07]"
                          : "border-transparent hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium text-foreground">
                          {highlight(r.doc.title, query)}
                        </span>
                        <time className="shrink-0 font-mono text-[11px] text-muted">
                          {r.doc.date.replace(/-/g, ".")}
                        </time>
                      </div>
                      <p className="mt-1 truncate text-xs leading-relaxed text-muted">
                        {highlight(r.snippet || r.doc.description, query)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** 把命中的关键词用 amber 标出（大小写无关） */
function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let last = 0;
  let idx = lower.indexOf(needle);
  let key = 0;
  while (idx !== -1) {
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(
      <mark key={key++} className="bg-accent/20 text-accent">
        {text.slice(idx, idx + needle.length)}
      </mark>
    );
    last = idx + needle.length;
    idx = lower.indexOf(needle, last);
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
