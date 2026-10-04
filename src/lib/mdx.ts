import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { Image } from "@/components/mdx/image";

/** MDX 文章中可用的自定义组件 */
const mdxComponents = {
  Callout,
  CodeBlock,
  Image,
  pre: CodeBlock, // 所有代码块自动套用增强样式
};

/**
 * 编译 MDX 内容为 React 组件
 * 使用 next-mdx-remote 的 RSC 模式，直接在服务端渲染
 */
export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        rehypePlugins: [
          // 先给标题生成 id（与 lib/toc.ts 的 github-slugger 规则一致）
          rehypeSlug,
          [rehypePrettyCode, {
            theme: { dark: "github-dark", light: "github-light" },
            keepBackground: false,
          }],
        ],
        remarkPlugins: [],
      },
    },
  });

  return content;
}
