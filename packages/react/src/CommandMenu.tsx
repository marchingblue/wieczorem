import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useExit } from "./useExit.js";

export interface CommandItem {
  value: string;
  label: ReactNode;
  /** optional leading icon */
  icon?: ReactNode;
  /** optional keybind hints, e.g. ["⌘", "K"] */
  keys?: string[];
  /** group heading the item falls under */
  group?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandMenuProps {
  open: boolean;
  items: CommandItem[];
  placeholder?: string;
  onOpenChange?: (open: boolean) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * a palette for search and actions: opens centered, filters as you type,
 * arrows move, enter runs. rows carry optional icons and keybind hints.
 * mount it once and toggle `open` (wire it to ⌘K yourself).
 */
export function CommandMenu({
  open,
  items,
  placeholder = "type a command or search…",
  onOpenChange,
  "aria-label": ariaLabel,
  className,
}: CommandMenuProps) {
  const [show, closing] = useExit(open);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const cbs = useRef({ onOpenChange });
  cbs.current = { onOpenChange };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") cbs.current.onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // fresh start each open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const q = query.toLowerCase();
  const filtered = items.filter(
    (it) => !q || it.value.toLowerCase().includes(q),
  );

  // group rows in listed order: [{ group, items: [...] }]
  const groups: { name?: string; items: CommandItem[] }[] = [];
  for (const it of filtered) {
    const last = groups[groups.length - 1];
    if (last && last.name === it.group) last.items.push(it);
    else groups.push({ name: it.group, items: [it] });
  }
  const flat = filtered.filter((it) => !it.disabled);

  useLayoutEffect(() => {
    setActive(0);
  }, [query]);

  // keep the active row in view
  useLayoutEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (it: CommandItem) => {
    if (it.disabled) return;
    it.onSelect?.();
    cbs.current.onOpenChange?.(false);
  };

  const move = (dir: 1 | -1) => {
    if (!flat.length) return;
    const pos = flat.findIndex(
      (it) => it === filtered[active],
    );
    const next = flat[(pos + dir + flat.length) % flat.length];
    if (next) setActive(filtered.indexOf(next));
  };

  if (!show) return null;

  return createPortal(
    <div
      className="mut-cmd-overlay"
      role="presentation"
      data-closing={closing || undefined}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cbs.current.onOpenChange?.(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? "command menu"}
        className={["mut-cmd", className].filter(Boolean).join(" ")}
        data-closing={closing || undefined}
      >
        <input
          ref={inputRef}
          className="mut-cmd__input"
          role="combobox"
          aria-expanded
          aria-haspopup="listbox"
          aria-controls={listId}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              move(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              move(-1);
            } else if (e.key === "Enter") {
              e.preventDefault();
              const it = filtered[active];
              if (it) run(it);
            }
          }}
        />
        <div ref={listRef} className="mut-cmd__list" id={listId} role="listbox">
          {flat.length === 0 ? (
            <div className="mut-cmd__empty">nothing found</div>
          ) : (
            groups.map((g, gi) => (
              <div key={g.name ?? gi} role="presentation">
                {g.name ? (
                  <div className="mut-cmd__label">{g.name}</div>
                ) : null}
                {g.items.map((it) => {
                  const i = filtered.indexOf(it);
                  return (
                    <button
                      key={it.value}
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      className="mut-cmd__item"
                      data-active={i === active ? "true" : undefined}
                      disabled={it.disabled}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(it)}
                    >
                      {it.icon}
                      <span>{it.label}</span>
                      {it.keys?.length ? (
                        <span className="mut-cmd__hint" aria-hidden="true">
                          {it.keys.map((k) => (
                            <kbd key={k}>{k}</kbd>
                          ))}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
