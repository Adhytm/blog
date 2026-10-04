import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/posts";
import { SITE_NAME, SITE_URL } from "../lib/site";
import { url } from "../lib/url";

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

export const GET: APIRoute = async (context) => {
  const posts = getAllPosts();
  const latestDate = posts.length > 0 ? toISO(posts[0].date) : toISO(new Date().toISOString());

  const origin = context.site ? context.site.origin : SITE_URL.replace(/\/$/, "");
  const feedUrl = new URL(url("/feed.xml"), origin).href;
  const homeUrl = new URL(url("/"), origin).href;

  const entries = posts
    .map((post) => {
      const postUrl = new URL(url(`/blog/${encodeURIComponent(post.slug)}`), origin).href;
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
  <link href="${feedUrl}" rel="self" type="application/atom+xml"/>
  <link href="${homeUrl}" rel="alternate" type="text/html"/>
  <id>${homeUrl}</id>
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
