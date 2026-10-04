import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { type Post, formatDate, relativeTime } from "./types";

export { type Post, formatDate, relativeTime };

const postsDirectory = path.join(process.cwd(), "src/content/posts");

/** 计算阅读时间（中文约 400 字/分钟） */
function calcReadingTime(text: string): string {
  const chars = text.replace(/```[\s\S]*?```/g, "").replace(/\s/g, "").length;
  const minutes = Math.max(1, Math.ceil(chars / 400));
  return `${minutes} 分钟`;
}

/** 读取所有已发布文章，按日期倒序 */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "").toLowerCase();
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      date: data.date || "1970-01-01",
      description: data.description || "",
      tags: data.tags || [],
      draft: data.draft || false,
      readingTime: calcReadingTime(content),
      content,
      weight: data.weight || 0,
    } as Post;
  });

  return posts
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 获取最新 n 篇文章（首页用） */
export function getLatestPosts(n: number): Post[] {
  return getAllPosts().slice(0, n);
}

/** 获取热度最高的 n 篇文章（首页置顶用） */
export function getTopPosts(n: number): Post[] {
  return [...getAllPosts()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, n);
}

/** 获取所有出现过的标签 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  getAllPosts().forEach((post) => post.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

/** 获取每个标签及其文章数，按数量降序、同数量按名称升序 */
export function getTagCounts(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  getAllPosts().forEach((post) =>
    post.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
  );
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
  );
}

/** 获取含指定标签的全部文章（已按日期倒序） */
export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

/** 根据 slug 获取单篇文章 */
export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

/** 获取所有文章的 slug 列表（用于 generateStaticParams） */
export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

/** 获取当前文章的上一篇和下一篇（按发布日期降序排列） */
export function getAdjacentPosts(currentSlug: string): { prev: Post | null; next: Post | null } {
  const posts = getAllPosts(); // 已按日期降序
  const index = posts.findIndex((p) => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null, // 时间上更早
    next: index > 0 ? posts[index - 1] : null,                 // 时间上更晚
  };
}

/**
 * 将 MDX 正文粗略转为可搜索的纯文本：
 * 去掉代码块、行内代码、图片/链接标记、标题井号、自定义组件标签，
 * 折叠空白。用于构建搜索索引，不追求完美还原。
 */
export function toPlainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")        // 代码块
    .replace(/`[^`]*`/g, " ")                // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")   // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接保留文字
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")     // JSX/HTML 标签
    .replace(/^#{1,6}\s+/gm, "")             // 标题井号
    .replace(/[*_>#~|-]/g, " ")              // 其余 markdown 符号
    .replace(/\s+/g, " ")                    // 折叠空白
    .trim();
}
