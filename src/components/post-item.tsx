import { formatDate, relativeTime, type Post } from "@/lib/types";
import { Tag } from "./tag";
import { url } from "@/lib/url";

export function PostItem({
  post,
  onTagClick,
  activeTag,
  index,
}: {
  post: Post;
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
  /** 列表序号（从 0 起），传入时左侧显示 mono 编号，给列表节奏感 */
  index?: number;
}) {
  return (
    <article className="group">
      <div className="relative -mx-4 rounded-lg border border-transparent px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border/60 hover:bg-surface/70 hover:shadow-[0_6px_24px_-12px_rgba(0,0,0,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <a href={url(`/blog/${encodeURIComponent(post.slug)}`)} className="absolute inset-0 z-0" aria-label={post.title} />

        {/* hover 时右上角浮现箭头：和置顶卡片同一套可点击暗示 */}
        <span
          aria-hidden
          className="absolute right-4 top-4 font-mono text-sm text-accent/0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent/70 motion-reduce:transition-none"
        >
          →
        </span>

        {/* 序号 + 日期 + 相对时间 + 阅读时长 */}
        <div className="font-mono text-xs text-muted">
          {index !== undefined && (
            <>
              <span className="text-accent/50">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mx-1.5 text-muted/50">·</span>
            </>
          )}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="mx-1.5 text-muted/50">·</span>
          {/* 静态导出下服务端 HTML 是构建时的相对时间，客户端水合时会重算，
              跨过“今天/昨天/X天前”边界会报 hydration mismatch——以构建时文本为准 */}
          <span suppressHydrationWarning>{relativeTime(post.date)}</span>
          <span className="mx-1.5 text-muted/50">·</span>
          <span>{post.readingTime}</span>
        </div>

        {/* 标题 */}
        <h3 className="mt-2 text-[15px] font-medium leading-snug transition-colors group-hover:text-accent">
          {post.title}
        </h3>

        {/* 摘要 */}
        {post.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted line-clamp-2">
            {post.description}
          </p>
        )}

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="relative z-10 mt-2.5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) =>
              onTagClick ? (
                <Tag
                  key={tag}
                  active={activeTag === tag}
                  onClick={() => onTagClick(tag)}
                >
                  {tag}
                </Tag>
              ) : (
                <Tag key={tag}>{tag}</Tag>
              )
            )}
          </div>
        )}
      </div>
    </article>
  );
}
