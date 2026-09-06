import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useExit } from "./useExit.js";

export interface DrawerProps {
  open: boolean;
  /** which edge the panel slides from (default right) */
  side?: "left" | "right" | "top" | "bottom";
  title?: ReactNode;
  children?: ReactNode;
  /** panel width for left/right, px or css length (default 320) */
  width?: number | string;
  /** show the little bar on the leading edge (nice on sheets) */
  handle?: boolean;
  /** frost the overlay with a backdrop blur */
  blur?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * a panel that slides over the page from any edge. content stays still;
 * the overlay fades. opening and closing animate the same way.
 * escape and overlay-click close it.
 */
export function Drawer({
  open,
  side = "right",
  title,
  children,
  width,
  handle = false,
  blur = false,
  onOpenChange,
}: DrawerProps) {
  const [show, closing] = useExit(open);
  const panelRef = useRef<HTMLDivElement>(null);

  const cbs = useRef({ onOpenChange });
  cbs.current = { onOpenChange };

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") cbs.current.onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open]);

  if (!show) return null;

  const onOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) cbs.current.onOpenChange?.(false);
  };

  return createPortal(
    <div
      className="mut-drawer-overlay"
      role="presentation"
      data-closing={closing || undefined}
      data-blur={blur || undefined}
      onMouseDown={onOverlayMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        data-side={side}
        data-closing={closing || undefined}
        className="mut-drawer"
        tabIndex={-1}
        style={
          width != null
            ? ({ "--mut-drawer-w": typeof width === "number" ? `${width}px` : width }) as CSSProperties
            : undefined
        }
      >
        {handle ? <div className="mut-drawer__handle" aria-hidden="true" /> : null}
        {title != null ? (
          <h2 className="mut-drawer__title">{title}</h2>
        ) : null}
        <div className="mut-drawer__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
