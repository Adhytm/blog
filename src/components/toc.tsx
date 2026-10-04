import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { TocEntry } from "@/lib/toc";

/** 水合探测：服务端快照恒为 false，挂载后为 true（等价于 setMounted effect，但无级联渲染） */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * 文章目录：lg 以上固定在正文右侧空白处，随滚动高亮当前章节。
 * 窄屏直接隐藏——窄栏布局里塞折叠目录反而增加噪音。
 *
 * 用 createPortal 渲染到 body，脱离 template 动画容器的
 * containing block（animation-fill-mode: both 会让 Chromium
 * 把 fixed 元素当成相对于动画 div 定位）。
 *
 * 加了 max-h + overflow-y-auto，长目录不会溢出视口。
 */
export function Toc({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const mounted = useMounted();

  useEffect(() => {
    const headingEls = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headingEls.length === 0) return;

    // 顶部偏移量：sticky header 高度 + 额外余量
    const OFFSET = 100;

    const update = () => {
      // 找到第一个 top >= OFFSET 的标题（即将进入视口的）
      let current: string | null = null;
      for (const el of headingEls) {
        const top = el.getBoundingClientRect().top;
        if (top <= OFFSET) {
          current = el.id; // 已经滚过去的，取最后一个
        } else {
          break; // 后面的都在视口下方，不用看了
        }
      }
      // 如果所有标题都在视口下方（页面顶部），高亮第一个
      if (current === null && headingEls.length > 0) {
        current = headingEls[0].id;
      }
      setActiveId(current);
    };

    update(); // 初始化
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [entries]);

  if (entries.length < 3) return null;

  const tocContent = (
    <aside
      aria-label="文章目录"
      className="fixed top-28 z-10 hidden w-40 lg:left-[calc(50%+21.5rem)] lg:block xl:left-[calc(50%+24rem)] xl:w-52"
      style={{ maxHeight: "calc(100vh - 8rem)", overflowY: "auto" }}
    >
      <p className="section-label">On this page</p>
      <ul className="mt-4 space-y-2 border-l border-border">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={`-ml-px block border-l py-0.5 text-[13px] leading-snug transition-colors ${
                entry.level === 3 ? "pl-7" : "pl-4"
              } ${
                activeId === entry.id
                  ? "border-accent text-accent font-medium"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );

  // 服务端渲染时不渲染 portal，等客户端挂载后再渲染
  if (!mounted) return null;
  return createPortal(tocContent, document.body);
}
