import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

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
 * 文章页顶部阅读进度条：一条随滚动增长的 amber 细线。
 * 固定在视口最顶端，层级高于 sticky 导航，覆盖其上边缘。
 *
 * 用 createPortal 渲染到 body，脱离 template 动画容器的
 * containing block（animation-fill-mode: both 会让 Chromium
 * 把 fixed 元素当成相对于动画 div 定位，进度条就“消失”了）。
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const mounted = useMounted();

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        className="h-full bg-accent transition-[width] duration-100 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>,
    document.body
  );
}
