import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { XIcon } from "./icons.js";

export interface ComboboxOption {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
}

interface CoreProps {
  options: ComboboxOption[];
  multiple: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: ((value: string) => void) | ((value: string[]) => void);
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

/**
 * shared engine for Combobox (single) and ComboboxMulti (chips).
 * single: picking shows the value in the titlebar and closes the list.
 * multi: picks become reorderable chips; the list stays open and the
 * placeholder always waits after the last chip.
 */
function ComboCore({
  options,
  multiple,
  value,
  defaultValue,
  onChange,
  placeholder = "search…",
  disabled,
  className,
  ...rest
}: CoreProps) {
  const [internal, setInternal] = useState<string | string[] | undefined>(
    defaultValue,
  );
  const current = value ?? internal;
  const selectedList: string[] = Array.isArray(current)
    ? current
    : current != null
      ? [current]
      : [];

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered = options.filter(
    (o) => !query || o.value.toLowerCase().includes(query.toLowerCase()),
  );

  const commit = useCallback(
    (next: string | string[]) => {
      if (value === undefined) setInternal(next);
      (onChange as ((v: string | string[]) => void) | undefined)?.(next);
    },
    [value, onChange],
  );

  // outside click + escape close
  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // keep the active option in view
  useLayoutEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setActive(
      filtered.findIndex(
        (o) => o.value === selectedList[selectedList.length - 1] && !o.disabled,
      ),
    );
  };

  const pick = (v: string) => {
    if (multiple) {
      commit(
        selectedList.includes(v)
          ? selectedList.filter((s) => s !== v)
          : [...selectedList, v],
      );
      setQuery("");
      inputRef.current?.focus();
    } else {
      commit(v);
      setOpen(false);
      setQuery("");
    }
  };

  const remove = (v: string) => {
    if (!multiple) return;
    commit(selectedList.filter((s) => s !== v));
  };

  // drag-to-reorder chips
  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...selectedList];
    const moved = next.splice(from, 1)[0];
    if (moved === undefined) return;
    next.splice(to, 0, moved);
    commit(next);
  };

  const move = (dir: 1 | -1) => {
    const enabled = filtered
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled);
    if (!enabled.length) return;
    const pos = enabled.findIndex(({ i }) => i === active);
    const next = enabled[(pos + dir + enabled.length * 2) % enabled.length];
    if (next) setActive(next.i);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      const opt = filtered[active];
      if (opt && !opt.disabled) {
        e.preventDefault();
        pick(opt.value);
      }
    }
  };

  const labelOf = (v: string) => {
    const opt = options.find((o) => o.value === v);
    return opt?.label ?? v;
  };

  const inputProps = {
    role: "combobox" as const,
    "aria-expanded": open,
    "aria-haspopup": "listbox" as const,
    "aria-autocomplete": "list" as const,
    "aria-controls": listId,
    autoComplete: "off",
    disabled,
    ...rest,
    onFocus: openList,
    onClick: () => {
      if (!open) openList();
    },
    onInput: (e: React.FormEvent<HTMLInputElement>) => {
      setQuery(e.currentTarget.value);
      setActive(-1);
      if (!open) setOpen(true);
    },
    onKeyDown: handleKeyDown,
  };

  return (
    <div
      ref={rootRef}
      className={["mut-combo", className].filter(Boolean).join(" ")}
    >
      {multiple ? (
        <div
          className="mut-combo__bar"
          onClick={() => inputRef.current?.focus()}
        >
          {selectedList.map((v, i) => (
            <span
              key={v}
              className="mut-combo__chip"
              draggable
              data-dragging={dragIdx === i || undefined}
              onDragStart={(e) => {
                setDragIdx(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => setDragIdx(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx != null) reorder(dragIdx, i);
                setDragIdx(null);
              }}
            >
              {labelOf(v)}
              <button
                type="button"
                className="mut-combo__chip-x"
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
          <input
            ref={inputRef}
            className="mut-combo__input mut-combo__input--bare"
            placeholder={placeholder}
            {...inputProps}
          />
        </div>
      ) : (
        <input
          ref={inputRef}
          className="mut-combo__input"
          placeholder={open ? placeholder : (selectedList[0] ? String(labelOf(selectedList[0])) : placeholder)}
          {...inputProps}
        />
      )}
      {open ? (
        <div ref={listRef} className="mut-combo__list" id={listId} role="listbox">
          {filtered.length === 0 ? (
            <div className="mut-combo__empty">nothing found</div>
          ) : (
            filtered.map((o, i) => (
              <button
                key={o.value}
                type="button"
                role="option"
                className="mut-combo__opt"
                aria-selected={selectedList.includes(o.value)}
                data-active={i === active ? "true" : undefined}
                disabled={o.disabled}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o.value)}
              >
                <span>{o.label ?? o.value}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export interface ComboboxProps {
  options: ComboboxOption[];
  /** controlled selected value */
  value?: string;
  /** initial selection for uncontrolled usage */
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

/**
 * an input that opens a quiet list. type to filter, arrows to move, enter
 * or click to pick — the pick becomes the titlebar and the list closes.
 */
export function Combobox(props: ComboboxProps) {
  return <ComboCore {...props} multiple={false} />;
}

export interface ComboboxMultiProps {
  options: ComboboxOption[];
  /** controlled selected values (order = chip order) */
  value?: string[];
  /** initial selection for uncontrolled usage */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

/**
 * the multi combobox: picks become chips you can drag to reorder, each
 * with a quiet ×. the list stays open while you pick; the placeholder
 * keeps waiting after the last chip.
 */
export function ComboboxMulti(props: ComboboxMultiProps) {
  return <ComboCore {...props} multiple />;
}
