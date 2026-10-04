import type { APIRoute } from "astro";
import { getAllPosts, toPlainText } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = getAllPosts();
  const docs = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    date: post.date,
    content: toPlainText(post.content).slice(0, 1500),
  }));

  return new Response(JSON.stringify(docs), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
