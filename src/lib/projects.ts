import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Project {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  link?: string;
  status: "进行中" | "已完成" | "搁置";
}

const projectsDirectory = path.join(process.cwd(), "src/content/projects");

/** 读取所有项目，按名称排序 */
export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDirectory)) return [];

  const files = fs.readdirSync(projectsDirectory).filter((f) => f.endsWith(".md"));

  const projects = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(projectsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      name: data.name || slug,
      description: content.trim(),
      tags: data.tags || [],
      link: data.link || undefined,
      status: data.status || "进行中",
    } as Project;
  });

  return projects.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

/** 兼容页面导入 */
export const projects = getAllProjects();
