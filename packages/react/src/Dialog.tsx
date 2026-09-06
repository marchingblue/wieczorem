import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button.js";
import { useExit } from "./useExit.js";

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger renders the confirm action in the danger tone */
  tone?: "neutral" | "danger";
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
}

/**
 * a quiet interruption: dim the world, ask one question, get out.
 * escape, overlay click, or cancel dismisses; confirm fires onConfirm.
 * leaving mirrors arriving.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "confirm",
  cancelLabel = "cancel",
  tone = "neutral",
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const [show, closing] = useExit(open);
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // keep handlers in a ref so the open/close effect runs only on `open`
  const cbs = useRef({ onOpenChange, onConfirm });
  cbs.current = { onOpenChange, onConfirm };

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

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

  const dismiss = () => cbs.current.onOpenChange?.(false);
  const confirm = () => {
    cbs.current.onConfirm?.();
    cbs.current.onOpenChange?.(false);
  };
  const onOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) dismiss();
  };

  return createPortal(
    <div
      className="mut-dialog-overlay"
      role="presentation"
      data-closing={closing || undefined}
      onMouseDown={onOverlayMouseDown}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mut-dialog"
        data-closing={closing || undefined}
      >
        <h2 id={titleId} className="mut-dialog__title">
          {title}
        </h2>
        <p className="mut-dialog__body">{children}</p>
        <div className="mut-dialog__actions">
          <Button ref={cancelRef} onClick={dismiss}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={confirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
