import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useExit } from "./useExit.js";

export interface ModalProps {
  open: boolean;
  title?: ReactNode;
  children?: ReactNode;
  /** panel width, number = px (default 420) */
  width?: number | string;
  /** frost the overlay — true for the default 4px, number for px */
  blur?: boolean | number;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * the general interruption: centered panel, overlay fade, rise-in and a
 * mirrored fall-out. escape and overlay-click close. compose your own
 * actions inside; ConfirmDialog is this with opinions.
 */
export function Modal({
  open,
  title,
  children,
  width,
  blur = false,
  onOpenChange,
  className,
  style,
}: ModalProps) {
  const [show, closing] = useExit(open);
  const titleId = useId();
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

  const panelStyle: CSSProperties | undefined =
    width != null
      ? {
          width: `min(${typeof width === "number" ? `${width}px` : width}, 100%)`,
          ...style,
        }
      : style;

  if (!show) return null;

  const onOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) cbs.current.onOpenChange?.(false);
  };

  return createPortal(
    <div
      className="mut-dialog-overlay"
      role="presentation"
      data-closing={closing || undefined}
      data-blur={blur ? "true" : undefined}
      style={
        typeof blur === "number"
          ? ({ "--mut-dialog-blur": `${blur}px` }) as CSSProperties
          : style
      }
      onMouseDown={onOverlayMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={["mut-dialog", className].filter(Boolean).join(" ")}
        data-closing={closing || undefined}
        tabIndex={-1}
        style={panelStyle}
      >
        {title != null ? (
          <h2 id={titleId} className="mut-dialog__title">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
