import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDownIcon, XIcon } from "./icons.js";
import { useExit } from "./useExit.js";

export interface ComboboxOption {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  /** group name — options sharing a group render under one header
   * (regions for timezones, continents for countries, …) */
  group?: string;
}

interface CoreProps {
  options: ComboboxOption[];
  multiple: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: ((value: string) => void) | ((value: string[]) => void);
  placeholder?: string;
  disabled?: boolean;
  /** show a chevron button at the end that toggles the list */
  chevron?: boolean;
  /** show a clear button once something is picked — clears the value.
   * takes the chevron's place while a selection exists. */
  showClear?: boolean;
  /** render an option row yourself (the selected end-dot stays) */
  renderOption?: (option: ComboboxOption) => ReactNode;
  /** render a group header yourself */
  renderGroup?: (group: string) => ReactNode;
  "aria-label"?: string;
  className?: string;
}

/**
 * shared engine for Combobox (single) and ComboboxMulti (chips).
 * single: the pick becomes the input value (real text, not the
 * placeholder) and the list closes. multi: picks become reorderable
 * chips; the placeholder only waits while no chip is picked.
 */
function ComboCore({
  options,
  multiple,
  value,
  defaultValue,
  onChange,
  placeholder = "search…",
  disabled,
  chevron = false,
  showClear = false,
  renderOption,
  renderGroup,
  className,
  ...rest
}: CoreProps) {
  const [internal, setInternal] = useState<string | string[] | undefined>(
    defaultValue,
  );
  const current = value ?? internal;
  const selectedList: string[] = Array.isArray(current)
    ? current
    : current != null && current !== ""
      ? [current]
      : [];

  const [query, setQuery] = useState("");
  // dirty = the user typed since opening — only then does the query
  // filter. opening shows the selected text over the full list.
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  // show lingers through the exit animation; closing flags it for css.
  const [show, closing] = useExit(open);
  const [active, setActive] = useState(-1);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  // set by clear: the focus it triggers opens the list but must not
  // restore the just-cleared text.
  const skipRestoreRef = useRef(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered =
    dirty && query
      ? options.filter((o) =>
          o.value.toLowerCase().includes(query.toLowerCase()),
        )
      : options;

  const commit = useCallback(
    (next: string | string[]) => {
      if (value === undefined) setInternal(next);
      (onChange as ((v: string | string[]) => void) | undefined)?.(next);
    },
    [value, onChange],
  );
  // plain text for an option — the input value must be a string even
  // when the row renders something richer.
  const textOf = (v: string) => {
    const opt = options.find((o) => o.value === v);
    const l = opt?.label;
    return typeof l === "string" ? l : (opt?.value ?? v);
  };
  const selectedText =
    !multiple && selectedList[0] ? textOf(selectedList[0]) : "";


  const closeAll = useCallback(() => {
    setOpen(false);
    setQuery("");
    setDirty(false);
  }, []);

  // outside click + escape close
  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeAll]);

  // keep the active option in view
  useLayoutEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setDirty(false);
    // picking starts from the current choice, in real text — the muted
    // placeholder only ever stands for "nothing picked yet".
    if (!multiple) {
      if (skipRestoreRef.current) skipRestoreRef.current = false;
      else setQuery(selectedText);
    }
    setActive(
      filtered.findIndex(
        (o) => o.value === selectedList[selectedList.length - 1] && !o.disabled,
      ),
    );
  };

  // removal is instant — exit animations on chips read as lag, not polish.
  const remove = (v: string) => {
    if (!multiple) return;
    commit(selectedList.filter((s) => s !== v));
  };
  const pick = (v: string) => {
    if (multiple) {
      // toggling off plays the chip exit before the value commits
      if (selectedList.includes(v)) remove(v);
      else commit([...selectedList, v]);
      setQuery("");
      setDirty(false);
      inputRef.current?.focus();
    } else {
      commit(v);
      closeAll();
    }
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
      setDirty(true);
      setActive(-1);
      if (!open) setOpen(true);
    },
    onKeyDown: handleKeyDown,
  };
  // end tool: the chevron, or — once something is picked and showClear
  // is on — a clear button in its place. clearing resets the value.
  const hasSelection = selectedList.length > 0;
  const showTheClear = showClear && hasSelection;
  const clearAll = () => {
    if (multiple) {
      if (selectedList.length === 0) return;
      commit([]);
    } else {
      // the focus below reopens the list — skipRestoreRef keeps the
      // cleared text cleared instead of restoring it.
      skipRestoreRef.current = true;
      commit("");
      setQuery("");
      setDirty(false);
    }
    inputRef.current?.focus();
  };
  const tools =
    showTheClear || chevron ? (
      <span className="mut-combo__tools" data-n={1}>
        {showTheClear ? (
          <button
            type="button"
            className="mut-combo__tool mut-combo__clear"
            aria-label="clear selection"
            tabIndex={-1}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearAll}
          >
            <XIcon size={9} />
          </button>
        ) : (
          <button
            type="button"
            className="mut-combo__tool"
            aria-label={open ? "close list" : "open list"}
            aria-expanded={open}
            tabIndex={-1}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (open) closeAll();
              else {
                openList();
                inputRef.current?.focus();
              }
            }}
          >
            <ChevronDownIcon className="mut-combo__chev" />
          </button>
        )}
      </span>
    ) : null;

  // chips on screen are exactly the selection — removal is instant.
  const chips = multiple ? selectedList : [];

  // grouped rows: a header whenever the group changes down the list
  const rows: { key: string; header?: ReactNode; option?: ComboboxOption }[] =
    [];
  {
    let last: string | undefined;
    let first = true;
    filtered.forEach((o) => {
      if (first || o.group !== last) {
        first = false;
        last = o.group;
        if (o.group != null) {
          rows.push({
            key: `g:${rows.length}:${o.group}`,
            header: renderGroup ? renderGroup(o.group) : o.group,
          });
        }
      }
      rows.push({ key: `o:${o.value}`, option: o });
    });
  }

  return (
    <div
      ref={rootRef}
      className={["mut-combo", className].filter(Boolean).join(" ")}
      // open, not show: the chevron answers the instant the list starts
      // leaving, while the panel finishes its exit underneath.
      data-open={open}
    >
      {multiple ? (
        <div
          className="mut-combo__bar"
          onClick={() => inputRef.current?.focus()}
        >
          {chips.map((v, i) => {
            return (
              <span
                key={v}
                className="mut-combo__chip"
                draggable={!disabled}
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
            );
          })}
          <input
            ref={inputRef}
            className="mut-combo__input mut-combo__input--bare"
            value={query}
            placeholder={selectedList.length > 0 ? undefined : placeholder}
            {...inputProps}
          />
          {tools}
        </div>
      ) : (
        <div className="mut-combo__wrap">
          <input
            ref={inputRef}
            className="mut-combo__input"
            value={open ? query : selectedText}
            placeholder={placeholder}
            {...inputProps}
          />
          {tools}
        </div>
      )}
      {show ? (
        <div
          ref={listRef}
          className="mut-combo__list"
          data-closing={closing || undefined}
          id={listId}
          role="listbox"
        >
          {filtered.length === 0 ? (
            <div className="mut-combo__empty">nothing found</div>
          ) : (
            rows.map((r) =>
              r.option ? (
                <button
                  key={r.key}
                  type="button"
                  role="option"
                  className="mut-combo__opt"
                  aria-selected={selectedList.includes(r.option.value)}
                  data-active={
                    filtered.indexOf(r.option) === active ? "true" : undefined
                  }
                  disabled={r.option.disabled}
                  onMouseEnter={() => setActive(filtered.indexOf(r.option!))}
                  onClick={() => pick(r.option!.value)}
                >
                  {renderOption ? (
                    renderOption(r.option)
                  ) : (
                    <span>{r.option.label ?? r.option.value}</span>
                  )}
                </button>
              ) : (
                <div key={r.key} className="mut-combo__group" role="presentation">
                  {r.header}
                </div>
              ),
            )
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
  /** shown only while nothing is picked — the pick itself shows as ink */
  placeholder?: string;
  disabled?: boolean;
  /** show a chevron button at the end that toggles the list */
  chevron?: boolean;
  /** show a clear button once something is picked — clears the value.
   * takes the chevron's place while a selection exists. */
  showClear?: boolean;
  /** render an option row yourself (the selected end-dot stays) */
  renderOption?: (option: ComboboxOption) => ReactNode;
  /** render a group header yourself */
  renderGroup?: (group: string) => ReactNode;
  "aria-label"?: string;
  className?: string;
}

/**
 * an input that opens a quiet list. type to filter, arrows to move, enter
 * or click to pick — the pick becomes the input value and the list closes.
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
  /** shown only while no chip is picked */
  placeholder?: string;
  disabled?: boolean;
  /** show a chevron button at the end that toggles the list */
  chevron?: boolean;
  /** show a clear button once something is picked — clears the value.
   * takes the chevron's place while a selection exists. */
  showClear?: boolean;
  /** render an option row yourself (the selected end-dot stays) */
  renderOption?: (option: ComboboxOption) => ReactNode;
  /** render a group header yourself */
  renderGroup?: (group: string) => ReactNode;
  "aria-label"?: string;
  className?: string;
}

/**
 * the multi combobox: picks become chips you can drag to reorder, each
 * with a quiet × that slides the chip down and out. the list stays open
 * while you pick; the placeholder only waits while no chip is picked.
 */
export function ComboboxMulti(props: ComboboxMultiProps) {
  return <ComboCore {...props} multiple />;
}
