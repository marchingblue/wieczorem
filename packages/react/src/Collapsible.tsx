import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "./icons.js";

export interface CollapsibleProps {
  /** the always-visible row that toggles */
  trigger: ReactNode;
  children?: ReactNode;
  /** controlled open state */
  open?: boolean;
  /** initial state for uncontrolled usage (default false) */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** show the rotating chevron at the row's end (default true) */
  chevron?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * a quiet disclosure: the trigger row toggles, the panel unfolds with
 * the grid-rows glide — no js measuring, no layout jump. the chevron
 * answers instantly, like the menus.
 */
export function Collapsible({
  trigger,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  chevron = true,
  disabled,
  className,
}: CollapsibleProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = openProp ?? internal;

  const toggle = () => {
    if (disabled) return;
    const next = !open;
    if (openProp === undefined) setInternal(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className={["mut-collapse", className].filter(Boolean).join(" ")}
      data-open={open}
      data-disabled={disabled || undefined}
    >
      <button
        type="button"
        className="mut-collapse__trigger"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
      >
        <span className="mut-collapse__label">{trigger}</span>
        {chevron ? <ChevronDownIcon className="mut-chevron" /> : null}
      </button>
      <div className="mut-collapse__panel" aria-hidden={!open}>
        <div className="mut-collapse__inner">{children}</div>
      </div>
    </div>
  );
}
