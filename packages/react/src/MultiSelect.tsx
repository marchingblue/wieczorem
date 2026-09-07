import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { ButtonProps } from "./Button.js";
import { ChevronDownIcon } from "./icons.js";
import { XIcon } from "./icons.js";
import { useExit } from "./useExit.js";

export interface MultiSelectOption {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  /** controlled selected values (order = chip order) */
  value?: string[];
  /** initial selection for uncontrolled usage */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
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
 * a select that keeps the list open and grows chips. picking toggles,
 * chips carry a quiet × that slides them down and out, escape or outside
 * click closes — and the close mirrors the open.
 */
export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = "select…",
  align = "left",
  disabled,
  className,
  ...rest
}: MultiSelectProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const current = value ?? internal;
  const [open, setOpen] = useState(false);
  // show lingers through the exit animation; closing flags it for css.
  const [show, closing] = useExit(open);
  const [active, setActive] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

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
  }, [open ]);

  useLayoutEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const commit = (next: string[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const toggle = (v: string) => {
    if (current.includes(v)) {
      remove(v);
    } else {
      commit([...current, v]);
    }
  };

  // removal is instant — exit animations on chips read as lag, not polish.
  const remove = (v: string) => {
    commit(current.filter((s) => s !== v));
  };

  const chips = current;

  const labelOf = (v: string) => {
    const opt = options.find((o) => o.value === v);
    return opt?.label ?? v;
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      const opt = options[active];
      if (opt && !opt.disabled) {
        e.preventDefault();
        toggle(opt.value);
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className={["mut-select", className].filter(Boolean).join(" ")}
      // open, not show: the chevron answers the instant the list starts
      // leaving, while the panel finishes its exit underneath.
      data-open={open}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className="mut-select__multi"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={show ? listId : undefined}
        aria-disabled={disabled}
        data-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {chips.map((v) => (
          <span
            key={v}
            className="mut-select__chip"
          >
            {labelOf(v)}
            <button
              type="button"
              className="mut-select__chip-x"
              aria-label={`remove ${v}`}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                remove(v);
              }}
            >
              <XIcon size={9} />
            </button>
          </span>
        ))}
        {current.length === 0 ? (
          <span className="mut-select__placeholder">{placeholder}</span>
        ) : null}
        <ChevronDownIcon className="mut-chevron" />
      </div>
      {show ? (
        <div
          ref={listRef}
          className="mut-menu"
          data-align={align}
          data-closing={closing || undefined}
          id={listId}
          role="listbox"
          aria-multiselectable="true"
        >
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              role="option"
              className="mut-menu__item"
              aria-selected={current.includes(o.value)}
              data-active={i === active ? "true" : undefined}
              disabled={o.disabled}
              onMouseEnter={() => setActive(i)}
              onClick={() => toggle(o.value)}
            >
              <span>{o.label ?? o.value}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
