export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  draft: boolean;
  readingTime: string;
  content: string;
  weight: number;
}

/** 格式化日期：2026-07-23 → 2026.07.23 */
export function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, ".");
}

/** 相对时间：2026-07-23 → “3天前” */
export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffDays = Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}
