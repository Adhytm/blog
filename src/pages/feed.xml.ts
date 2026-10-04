import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/posts";
import { SITE_NAME, SITE_URL } from "../lib/site";

function escapeXml(str: string) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toISO(dateStr: string) {
  if (!dateStr) return new Date(0).toISOString();
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

export const GET: APIRoute = async () => {
  const posts = getAllPosts();
  const latestDate = posts.length > 0 ? toISO(posts[0].date) : toISO(new Date().toISOString());

  const entries = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(postUrl)}" rel="alternate" type="text/html"/>
    <id>${escapeXml(postUrl)}</id>
    <updated>${toISO(post.date)}</updated>
    <summary>${escapeXml(post.description)}</summary>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_NAME)}</title>
  <subtitle>${escapeXml(SITE_NAME)} Blog</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${SITE_URL}" rel="alternate" type="text/html"/>
  <id>${SITE_URL}/</id>
  <updated>${latestDate}</updated>
  <author>
    <name>${escapeXml(SITE_NAME)}</name>
  </author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
};
