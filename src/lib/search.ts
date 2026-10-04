/**
 * 站内搜索：类型定义 + 纯前端检索算法。
 *
 * 本站是静态导出（Cloudflare Pages），没有运行时服务端，
 * 因此索引在构建期生成为 /search-index.json，检索全部在浏览器完成。
 * 中文没有天然词边界，故采用大小写无关的子串匹配 + 字段加权打分，
 * 不引入分词器，保持零额外依赖、索引体积可控。
 */

export interface SearchDoc {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  /** 去除 markdown 标记后的正文纯文本（构建期已截断） */
  content: string;
}

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  /** 命中位置附近的正文片段，用于结果预览 */
  snippet: string;
}

// 各字段命中权重：标题最重，其次标签、摘要，正文最轻
const WEIGHT = {
  title: 10,
  tag: 6,
  description: 3,
  content: 1,
} as const;

/** 统计 needle 在 haystack 中出现的次数（大小写无关） */
function countOccurrences(haystack: string, needle: string): number {
  if (!haystack || !needle) return 0;
  const h = haystack.toLowerCase();
  let count = 0;
  let idx = h.indexOf(needle);
  while (idx !== -1) {
    count += 1;
    idx = h.indexOf(needle, idx + needle.length);
  }
  return count;
}

/** 从正文中截取命中词周围的片段 */
function buildSnippet(content: string, query: string, radius = 40): string {
  const idx = content.toLowerCase().indexOf(query);
  if (idx === -1) return content.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + query.length + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < content.length ? "…" : "";
  return prefix + content.slice(start, end) + suffix;
}

/**
 * 检索：对每篇文档按字段加权累加分数，返回按分数降序的命中结果。
 * query 会被 trim + 转小写；空 query 返回空数组。
 */
export function searchDocs(docs: SearchDoc[], rawQuery: string): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results: SearchResult[] = [];

  for (const doc of docs) {
    let score = 0;
    score += countOccurrences(doc.title, query) * WEIGHT.title;
    score += countOccurrences(doc.description, query) * WEIGHT.description;
    score += countOccurrences(doc.content, query) * WEIGHT.content;
    for (const tag of doc.tags) {
      score += countOccurrences(tag, query) * WEIGHT.tag;
    }

    if (score > 0) {
      results.push({
        doc,
        score,
        snippet: buildSnippet(doc.content, query),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
