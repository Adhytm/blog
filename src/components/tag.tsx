/**
 * 全站统一的标签胶囊。
 * 视觉规则：中性灰是常态，amber 只用于激活态与可点击项的 hover——
 * 保证强调色不被大面积稀释。
 * 三种形态：传 href 渲染跳转链接，传 onClick 渲染筛选按钮，否则纯 span。
 */
type TagProps = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
};

const base =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors";
const interactiveHover =
  "hover:border-accent/25 hover:bg-accent/10 hover:text-accent";

export function Tag({ children, active = false, onClick, href }: TagProps) {
  const tone = active
    ? "border-accent/25 bg-accent/15 text-accent font-medium"
    : "border-border/60 bg-surface text-muted";

  if (href) {
    return (
      <a href={href} className={`${base} ${tone} ${interactiveHover}`}>
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${tone} ${interactiveHover}`}>
        {children}
      </button>
    );
  }

  return <span className={`${base} ${tone}`}>{children}</span>;
}
