/**
 * 规范化站内相对路径，自动适配 Astro / GitHub Pages 的 base path。
 *
 * 规则：
 * - 外部链接 (http://, https://, //, mailto:) 或锚点 (#) 原样返回
 * - 当 base = "/blog/" 时：
 *     url("/") => "/blog/"
 *     url("/about") => "/blog/about"
 *     url("/blog") => "/blog/blog"
 *     url("/blog/post-1") => "/blog/blog/post-1"
 *     url("/tags/AI") => "/blog/tags/AI"
 *     url("/search-index.json") => "/blog/search-index.json"
 * - 当 base = "/" 时：
 *     url("/") => "/"
 *     url("/about") => "/about"
 *     url("/blog") => "/blog"
 *     url("/tags/AI") => "/tags/AI"
 */
export function url(path: string = "/"): string {
  if (!path) return "/";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("#") ||
    path.startsWith("mailto:")
  ) {
    return path;
  }

  const rawBase = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
  const base = rawBase.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cleanPath === "/") {
    return base ? `${base}/` : "/";
  }

  return `${base}${cleanPath}`;
}
