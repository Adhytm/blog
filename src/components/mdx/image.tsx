"use client";

import { useEffect, useRef, useState } from "react";

interface ImageProps {
  src: string;
  alt?: string;
  caption?: string;
}

/**
 * 懒加载图片以渐现方式进场，消除滚动时"突然闪现"的生硬感。
 * 缓存命中时浏览器不再触发 load 事件，故挂载后用 complete 兜底；
 * reduced-motion 用户在 CSS 层直接跳过过渡。
 */
export function Image({ src, alt = "", caption }: ImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 渲染期不能读 ref（react-hooks/refs），挂载后统一检查缓存命中的图片
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`img-reveal w-full rounded-2xl border border-border ${loaded ? "is-loaded" : ""}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
      {caption && (
        <figcaption className="mt-3 text-center text-xs text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
