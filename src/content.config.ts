import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    weight: z.number().default(0),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    tags: z.array(z.string()).default([]),
    link: z.string().optional(),
    status: z.string().default("进行中"),
  }),
});

export const collections = { posts, projects };
