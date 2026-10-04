import GithubSlugger from "github-slugger";

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * 从 Markdown 源码提取 h2/h3 标题，生成目录数据。
 * id 用 github-slugger 计算，与 rehype-slug 的生成规则一致，
 * 保证 TOC 锚点与正文标题 id 严格对应。
 */
export function extractToc(markdown: string): TocEntry[] {
  // 先剔除代码块，避免把代码里的 "## " 误判为标题
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];

  for (const line of withoutCode.split("\n")) {
    const match = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    // 去掉标题内的行内 markdown 标记（粗体、行内代码、链接）
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1");
    entries.push({ id: slugger.slug(text), text, level });
  }

  return entries;
}
