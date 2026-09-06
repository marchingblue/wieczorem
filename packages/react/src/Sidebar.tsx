import type { ReactNode } from "react";

export interface SidebarItem {
  label: ReactNode;
  onSelect?: () => void;
  /** renders the item as the current one (sunken) */
  active?: boolean;
  disabled?: boolean;
  /** optional small badge on the right */
  badge?: ReactNode;
  /** optional leading icon */
  icon?: ReactNode;
  href?: string;
}

export interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  /** panel width, number = px (default 220) */
  width?: number | string;
  /** quiet content under a top border */
  footer?: ReactNode;
  className?: string;
}

/**
 * a sidebar as a widget, not a page column: an inset panel with quiet
 * sections. the active item is sunken; items press like keys.
 */
export function Sidebar({
  sections,
  width,
  footer,
  className,
  ...rest
}: SidebarProps) {
  return (
    <div
      className={["mut-side", className].filter(Boolean).join(" ")}
      style={width != null ? { "--mut-side-w": typeof width === "number" ? `${width}px` : width } as React.CSSProperties : undefined}
      {...rest}
    >
      {sections.map((sec, i) => (
        <div key={sec.label ?? i} className="mut-side__section">
          {sec.label ? (
            <div className="mut-side__label">{sec.label}</div>
          ) : null}
          <nav className="mut-side__nav">
            {sec.items.map((item) => {
              const cls = "mut-side__item";
              const inner = (
                <>
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge != null ? item.badge : null}
                </>
              );
              return item.href ? (
                <a
                  key={String(item.label)}
                  href={item.href}
                  className={cls}
                  aria-current={item.active ? "page" : undefined}
                  aria-disabled={item.disabled || undefined}
                  onClick={item.disabled ? (e) => e.preventDefault() : item.onSelect}
                >
                  {inner}
                </a>
              ) : (
                <button
                  key={String(item.label)}
                  type="button"
                  className={cls}
                  aria-current={item.active || undefined}
                  disabled={item.disabled}
                  onClick={item.onSelect}
                >
                  {inner}
                </button>
              );
            })}
          </nav>
        </div>
      ))}
      {footer != null ? <div className="mut-side__footer">{footer}</div> : null}
    </div>
  );
}
