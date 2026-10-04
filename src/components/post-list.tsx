import { useEffect, useMemo, useState } from "react";
import { PostItem } from "./post-item";
import type { Post } from "@/lib/types";

type SortMode = "latest" | "hottest";

interface ListState {
  sort: SortMode;
  tag: string | null;
}

const DEFAULT_STATE: ListState = { sort: "latest", tag: null };

/** 从当前 URL 解析筛选状态；非法 sort 值回退到 latest */
function parseState(search: string): ListState {
  const params = new URLSearchParams(search);
  const sort = params.get("sort") === "hottest" ? "hottest" : "latest";
  return { sort, tag: params.get("tag") };
}

export function PostList({
  posts,
}: {
  posts: Post[];
}) {
  // 初始值与 URL 无关（最新、无筛选），保证静态导出的 HTML 里有完整列表；
  // 挂载后再按 ?sort= / ?tag= 应用筛选，避免 hydration mismatch
  const [state, setState] = useState<ListState>(DEFAULT_STATE);

  // 静态导出没有服务端运行时，URL 参数只能在挂载后从浏览器读取；
  // 首帧先渲染默认态（与导出 HTML 一致），随后应用 ?sort= / ?tag=，不会产生 hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(parseState(window.location.search));
  }, []);

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    setState(parseState(qs));
    window.history.pushState(null, "", `/blog${qs ? `?${qs}` : ""}`);
  };

  const setSort = (mode: SortMode) => updateParams("sort", mode);
  const setActiveTag = (tag: string | null) => updateParams("tag", tag);

  const { sort, tag: activeTag } = state;

  const filtered = useMemo(() => {
    let list = posts;
    if (activeTag) {
      list = list.filter((p) => p.tags.includes(activeTag));
    }
    if (sort === "latest") {
      list = [...list].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else {
      list = [...list].sort((a, b) => b.weight - a.weight);
    }
    return list;
  }, [posts, activeTag, sort]);

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  return (
    <div>
      {/* 控制栏：排序 + 当前筛选 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSort("hottest")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sort === "hottest"
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            精选
          </button>
          <button
            onClick={() => setSort("latest")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sort === "latest"
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            最新
          </button>
        </div>

        {activeTag && (
          <>
            <span className="h-4 w-px bg-border" />
            <button
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs text-accent transition-colors hover:bg-accent/20"
            >
              {activeTag}
              <span className="text-accent/60">×</span>
            </button>
          </>
        )}
      </div>

      {/* 文章列表 */}
      <div className="mt-8 space-y-1">
        {filtered.length > 0 ? (
          filtered.map((post, i) => (
            <PostItem
              key={post.slug}
              post={post}
              index={i}
              onTagClick={handleTagClick}
              activeTag={activeTag}
            />
          ))
        ) : (
          <p className="py-12 text-center text-sm text-muted">
            没有相关文章
          </p>
        )}
      </div>
    </div>
  );
}
