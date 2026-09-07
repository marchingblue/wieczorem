import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button, type ButtonProps } from "./Button.js";
import { ChevronDownIcon } from "./icons.js";
import { useExit } from "./useExit.js";

export interface DropdownItem {
  label: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  /** heading shown at the top of the menu */
  label?: string;
  align?: "left" | "right";
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /** show the chevron after the trigger label (default true) */
  chevron?: boolean;
  className?: string;
}

/**
 * trigger + panel. the chevron rotates with the spring while the panel
 * rises; pass chevron={false} for a plain button that still summons the
 * menu. escape or outside click closes; any click inside closes after
 * acting.
 */
export function Dropdown({
  trigger,
  items,
  label,
  align = "left",
  variant,
  size,
  chevron = true,
  className,
}: DropdownProps) {
  return (
    <DropdownRoot className={className} align={align}>
      {(open) => (
        <>
          <DropdownTrigger variant={variant} size={size} chevron={chevron}>
            {trigger}
          </DropdownTrigger>
          {open ? (
            <DropdownMenu label={label}>
              {items.map((it) => (
                <DropdownMenuItem
                  key={String(it.label)}
                  disabled={it.disabled}
                  danger={it.danger}
                  onSelect={it.onSelect}
                >
                  {it.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          ) : null}
        </>
      )}
    </DropdownRoot>
  );
}

/** true while the menu plays its exit animation — DropdownMenu reads it
 * so open and close mirror each other. */
const DropdownClosing = createContext(false);

/** owns the open state; children receive it as a render prop */
export function DropdownRoot({
  align = "left",
  children,
  className,
}: {
  align?: "left" | "right";
  children: (open: boolean) => ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // show lingers through the exit animation; closing flags it for css.
  const [show, closing] = useExit(open);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={["mut-dd", className].filter(Boolean).join(" ")}
      // open, not show: the chevron answers the instant the menu starts
      // leaving, while the panel finishes its exit underneath.
      data-open={open}
      data-align={align}
      onClick={() => setOpen((o) => !o)}
    >
      <DropdownClosing.Provider value={closing}>
        {children(show)}
      </DropdownClosing.Provider>
    </div>
  );
}

export function DropdownTrigger({
  variant,
  size,
  chevron = true,
  children,
  className,
  ...rest
}: ButtonProps & { chevron?: boolean }) {
  return (
    <Button variant={variant} size={size} className={className} {...rest}>
      {children}
      {chevron ? <ChevronDownIcon className="mut-chevron" /> : null}
    </Button>
  );
}

export function DropdownMenu({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const closing = useContext(DropdownClosing);
  return (
    <div
      className="mut-menu"
      role="menu"
      data-closing={closing || undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {label ? (
        <div className="mut-menu__label" role="presentation">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  disabled,
  danger,
  onSelect,
}: {
  children: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={["mut-menu__item", danger ? "is-mut-danger" : null]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
