import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DropdownItem } from "./Dropdown.js";

export interface ContextMenuProps {
  /** the zone that answers to right-click */
  children: ReactNode;
  items: DropdownItem[];
  label?: string;
  className?: string;
}

/**
 * a menu summoned by right-click, scoped to the wrapped zone — the rest
 * of the page keeps the browser's own menu. escape or any click closes.
 */
export function ContextMenu({
  children,
  items,
  label,
  className,
}: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const zoneRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // keep the menu inside the viewport
  useLayoutEffect(() => {
    if (!open) return;
    const el = menuRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(pos.x, window.innerWidth - r.width - 8);
    const y = Math.min(pos.y, window.innerHeight - r.height - 8);
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  return (
    <div
      ref={zoneRef}
      className={className}
      onContextMenu={handleContextMenu}
    >
      {children}
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          className="mut-menu"
          style={{
            position: "fixed",
            top: pos.y,
            left: pos.x,
            maxWidth: 260,
          }}
        >
          {label ? (
            <div className="mut-menu__label" role="presentation">
              {label}
            </div>
          ) : null}
          {items.map((it) => (
            <button
              key={String(it.label)}
              type="button"
              role="menuitem"
              className={[
                "mut-menu__item",
                it.danger ? "is-mut-danger" : null,
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={it.disabled}
              onClick={() => {
                it.onSelect?.();
                setOpen(false);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
