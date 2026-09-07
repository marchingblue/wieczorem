import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { PanelCollapseIcon } from "./icons.js";

export type SidebarCollapsible = "icon" | "offcanvas" | "none";
export type SidebarVariant = "sidebar" | "floating" | "inset";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  collapsible: SidebarCollapsible;
  side: "left" | "right";
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * reads the sidebar state — open, toggle, collapsible, side. throws
 * outside a SidebarProvider so misuse fails loudly.
 */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside a SidebarProvider");
  return ctx;
}

export interface SidebarProviderProps {
  children: ReactNode;
  /** uncontrolled initial state (default true) */
  defaultOpen?: boolean;
  /** controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** icon rail (default), slide away, or fixed */
  collapsible?: SidebarCollapsible;
  side?: "left" | "right";
  /** cmd/ctrl+b toggles (default true) */
  shortcut?: boolean;
  /** panel width, number = px (default 220) */
  width?: number | string;
  /** rail width while icon-collapsed, number = px (default 52) */
  collapsedWidth?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * owns the collapse state and shares it with every sidebar part.
 * renders a display:contents wrapper — no layout of its own.
 */
export function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  collapsible = "icon",
  side = "left",
  shortcut = true,
  width,
  collapsedWidth,
  className,
  style,
}: SidebarProviderProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = collapsible === "none" ? true : (openProp ?? internal);

  const toggle = useCallback(() => {
    if (collapsible === "none") return;
    const next = !open;
    if (openProp === undefined) setInternal(next);
    onOpenChange?.(next);
  }, [collapsible, open, openProp, onOpenChange]);

  useEffect(() => {
    if (!shortcut || collapsible === "none") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut, collapsible, toggle]);

  const vars = {
    ...(width != null
      ? { "--mut-side-w": typeof width === "number" ? `${width}px` : width }
      : null),
    ...(collapsedWidth != null
      ? {
          "--mut-side-w-collapsed":
            typeof collapsedWidth === "number"
              ? `${collapsedWidth}px`
              : collapsedWidth,
        }
      : null),
    ...style,
  } as CSSProperties;

  return (
    <SidebarContext.Provider value={{ open, toggle, collapsible, side }}>
      <div
        className={["mut-side-provider", className]
          .filter(Boolean)
          .join(" ")}
        data-state={open ? "open" : "collapsed"}
        data-collapsible={collapsible}
        data-side={side}
        style={vars}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export interface SidebarProps {
  children: ReactNode;
  /** floating panel (default) | flush app column | inset card */
  variant?: SidebarVariant;
  className?: string;
  style?: CSSProperties;
}

/**
 * the panel itself. reads state from the provider — icon-collapses to a
 * rail, slides away as offcanvas, or stays fixed when collapsible is none.
 */
export function Sidebar({ children, variant = "floating", className, style }: SidebarProps) {
  const { open, collapsible, side } = useSidebar();
  return (
    <aside
      className={["mut-side", className].filter(Boolean).join(" ")}
      data-state={open ? "open" : "collapsed"}
      data-variant={variant}
      data-side={side}
      data-collapsible={collapsible}
      style={style}
    >
      {children}
      {collapsible !== "none" ? <SidebarRail /> : null}
    </aside>
  );
}

/** sticky top — branding, titles, workspace switchers. */
export function SidebarHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["mut-side__header", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

/** scrollable middle between header and footer. */
export function SidebarContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["mut-side__content", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

/** sticky bottom — user menus, settings, quiet meta. */
export function SidebarFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["mut-side__footer", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export interface SidebarGroupProps {
  children: ReactNode;
  /** section heading */
  label?: ReactNode;
  /** trailing action (add, …) */
  action?: ReactNode;
  className?: string;
}

/** related nav with an optional label + action row. */
export function SidebarGroup({ children, label, action, className }: SidebarGroupProps) {
  return (
    <section className={["mut-side__group", className].filter(Boolean).join(" ")}>
      {label || action ? (
        <div className="mut-side__group-head">
          {label ? <div className="mut-side__label">{label}</div> : null}
          {action ? <span className="mut-side__group-action">{action}</span> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SidebarMenu({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <nav className={["mut-side__nav", className].filter(Boolean).join(" ")}>
      {children}
    </nav>
  );
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["mut-side__row", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export interface SidebarMenuButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  label?: ReactNode;
  badge?: ReactNode;
  /** renders the item as the current one (sunken) */
  isActive?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** one nav row — icon, label, badge. active stays sunken. */
export function SidebarMenuButton({
  children,
  icon,
  label,
  badge,
  isActive,
  disabled,
  href,
  onClick,
  className,
}: SidebarMenuButtonProps) {
  const cls = ["mut-side__item", className].filter(Boolean).join(" ");
  // icon rail fallback: first letter of a plain label
  const text = label ?? children;
  const glyph =
    icon ??
    (typeof text === "string" && text.length > 0 ? (
      <span className="mut-side__glyph">{text[0]}</span>
    ) : null);
  const inner = (
    <>
      {glyph}
      <span className="mut-side__item-label">{label ?? children}</span>
      {badge != null ? <span className="mut-side__badge">{badge}</span> : null}
    </>
  );
  if (href && !disabled) {
    return (
      <a
        href={href}
        className={cls}
        aria-current={isActive ? "page" : undefined}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      aria-current={isActive || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}

/** trailing row action (add, more, …) — quiet until hovered. */
export function SidebarMenuAction({
  children,
  label,
  onClick,
  className,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={["mut-side__action", className].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** indented submenu stack. */
export function SidebarMenuSub({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["mut-side__sub", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

/** toggles the sidebar — the panel-with-chevron, flipping when collapsed. */
export function SidebarTrigger({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { open, toggle, collapsible } = useSidebar();
  if (collapsible === "none") return null;
  return (
    <button
      type="button"
      className={["mut-side__trigger", className].filter(Boolean).join(" ")}
      aria-label={label ?? (open ? "collapse sidebar" : "expand sidebar")}
      aria-expanded={open}
      title="toggle sidebar (ctrl+b)"
      onClick={toggle}
    >
      <PanelCollapseIcon size={15} />
    </button>
  );
}

/** edge strip that toggles — the rail shadcn hides on the border. */
export function SidebarRail({ className }: { className?: string }) {
  const { open, toggle, collapsible } = useSidebar();
  if (collapsible === "none") return null;
  return (
    <button
      type="button"
      className={["mut-side__rail", className].filter(Boolean).join(" ")}
      aria-label={open ? "collapse sidebar" : "expand sidebar"}
      tabIndex={-1}
      onClick={toggle}
    />
  );
}

export interface SidebarWorkspaceProps {
  /** tile glyph — an icon, emoji, or initials */
  icon?: ReactNode;
  name: ReactNode;
  onSelect?: () => void;
  /** trailing actions (search, add, …) — hidden while collapsed */
  actions?: ReactNode;
}
export function SidebarWorkspace({
  icon,
  name,
  onSelect,
  actions,
}: SidebarWorkspaceProps) {
  const tile =
    icon ??
    (typeof name === "string" && name.length > 0 ? name[0] : null);
  const body = (
    <>
      <span className="mut-side__tile">{tile}</span>
      <span className="mut-side__name">{name}</span>
    </>
  );
  return (
    <div className="mut-side__workspace-row">
      {onSelect ? (
        <button
          type="button"
          className="mut-side__workspace"
          onClick={onSelect}
          aria-label={typeof name === "string" ? name : undefined}
        >
          {body}
        </button>
      ) : (
        <div className="mut-side__workspace">{body}</div>
      )}
      {actions ? <span className="mut-side__actions">{actions}</span> : null}
    </div>
  );
}
