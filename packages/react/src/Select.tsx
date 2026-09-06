import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button, type ButtonProps } from "./Button.js";
import { ChevronDownIcon } from "./icons.js";

export interface SelectOption {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  /** controlled selected value */
  value?: string;
  /** initial selection for uncontrolled usage */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** shown when nothing is selected */
  placeholder?: string;
  /** which side of the trigger the panel hugs */
  align?: "left" | "right";
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

/**
 * a closed trigger that opens the quiet list — shadcn behavior, mut feel.
 * the chosen value sits in the trigger; picking closes immediately.
 * arrows move, enter picks, escape closes.
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "select…",
  align = "left",
  variant,
  size,
  disabled,
  className,
  ...rest
}: SelectProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedOpt = options.find((o) => o.value === selected);

  const commit = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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

  useLayoutEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setActive(
      options.findIndex((o) => o.value === selected && !o.disabled),
    );
  };

  const pick = (v: string) => {
    commit(v);
    setOpen(false);
  };

  const move = (dir: 1 | -1) => {
    const enabled = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled);
    if (!enabled.length) return;
    const pos = enabled.findIndex(({ i }) => i === active);
    const next = enabled[(pos + dir + enabled.length * 2) % enabled.length];
    if (next) setActive(next.i);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      const opt = options[active];
      if (opt && !opt.disabled) {
        e.preventDefault();
        pick(opt.value);
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className={["mut-select", className].filter(Boolean).join(" ")}
      data-open={open}
    >
      <Button
        variant={variant}
        size={size}
        className="mut-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <span
          className="mut-select__value"
          data-placeholder={selectedOpt ? undefined : "true"}
        >
          {selectedOpt ? (selectedOpt.label ?? selectedOpt.value) : placeholder}
        </span>
        <ChevronDownIcon className="mut-chevron" />
      </Button>
      {open ? (
        <div
          ref={listRef}
          className="mut-menu"
          data-align={align}
          id={listId}
          role="listbox"
        >
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              role="option"
              className="mut-menu__item"
              aria-selected={o.value === selected}
              data-active={i === active ? "true" : undefined}
              disabled={o.disabled}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o.value)}
            >
              <span>{o.label ?? o.value}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
