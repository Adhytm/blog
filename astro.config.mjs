import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// 自动识别 GitHub Actions 环境下的仓库名，免去手动配置 base 的痛苦
const githubRepo = process.env.GITHUB_REPOSITORY; // 例如 "Adhytm/blog" 或 "Adhytm/adhytm.github.io"
const [owner, repo] = githubRepo ? githubRepo.split("/") : [];
const isUserSite = owner && repo && repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;

const site = githubRepo
  ? `https://${owner}.github.io`
  : (process.env.SITE_URL || "https://adhytm.github.io");

// 如果是项目仓库（如 Adhytm/blog），base 自动设为 /blog；如果是主站仓库或自定义域名，base 为 /
const base = githubRepo
  ? (isUserSite ? "/" : `/${repo}`)
  : (process.env.BASE_PATH || "/");

export default defineConfig({
  site,
  base,
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

