"use client";

import { Children, isValidElement, useRef, useState } from "react";

/** 从 <code> 元素中提取语言标注（兼容 rehype-pretty-code 的 data-language 属性） */
function getLanguage(children: React.ReactNode): string {
  // rehype-pretty-code 处理后，children 可能包含多个节点
  // 遍历找到第一个 <code> 元素
  let codeProps: Record<string, unknown> | null = null;

  Children.forEach(children, (child) => {
    if (!codeProps && isValidElement(child) && child.type === 'code') {
      codeProps = child.props as Record<string, unknown>;
    }
  });

  if (codeProps) {
    // rehype-pretty-code 会在 <code> 上注入 data-language 属性
    const dataLang = codeProps['data-language'];
    if (typeof dataLang === 'string') return dataLang;
    // fallback: 从 className="language-ts" 正则提取
    const props = codeProps as Record<string, unknown>;
    const cls = Array.isArray(props.className)
      ? props.className.join(" ")
      : (props.className ?? "");
    const match = (typeof cls === 'string' ? cls : '').match(/language-([\w+#-]+)/);
    if (match) return match[1];
  }
  return "text";
}

export function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const language = getLanguage(children);

  const copyCode = async () => {
    const text = blockRef.current?.querySelector("code")?.textContent ?? "";

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时静默失败
    }
  };

  return (
    <div
      ref={blockRef}
      data-codeblock
      className="group/code my-8 overflow-hidden rounded-xl border border-border bg-code-bg backdrop-blur-md"
    >
      {/* 头部栏：语言标注 + 复制按钮（参考 Next.js / Vercel 文档做法） */}
      <div className="flex items-center justify-between border-b border-border bg-code-header px-4 py-2">
        <span className="flex items-center gap-2 select-none font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent/70" />
          {language}
        </span>
        <button
          onClick={copyCode}
          className="rounded-md border border-border/50 bg-background/60 px-2.5 py-1 text-xs text-muted backdrop-blur-sm transition-all hover:text-foreground"
        >
          {copied ? "已复制 ✓" : "复制"}
        </button>
      </div>
      {/* 代码内容：CodeBlock 替代了 pre，code 是直接子元素，需在此重置行内代码样式 */}
      <div className="overflow-x-auto px-5 py-5 [&_code]:block [&_code]:whitespace-pre [&_code]:bg-transparent [&_code]:p-0 [&_code]:rounded-none [&_code]:text-[0.8125rem] [&_code]:leading-[1.75]">
        {children}
      </div>
    </div>
  );
}

