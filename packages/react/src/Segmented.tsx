import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  /** controlled selected value */
  value?: string;
  /** initial value for uncontrolled usage */
  defaultValue?: string;
  onChange?: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * a pill rail with a highlight that glides between options. the highlight
 * is measured from the live dom and moved with transform, so it springs
 * across regardless of option widths. arrow keys move between options.
 */
export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}: SegmentedProps) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const selected = value ?? internal;
  const [glide, setGlide] = useState<{ x: number; w: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const measure = useCallback(() => {
    const i = options.findIndex((o) => o.value === selected);
    const el = optRefs.current[i];
    if (!el) return;
    setGlide({ x: el.offsetLeft, w: el.offsetWidth });
  }, [options, selected]);

  // measure before paint so the glide never flickers at 0,0
  useLayoutEffect(measure, [measure]);

  // re-measure when the rail resizes (fonts loading, container changes)
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [measure]);

  const select = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const dir =
        e.key === "ArrowRight" || e.key === "ArrowDown"
          ? 1
          : e.key === "ArrowLeft" || e.key === "ArrowUp"
            ? -1
            : 0;
      if (!dir) return;
      e.preventDefault();

      const enabled = options
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => !o.disabled);
      if (enabled.length === 0) return;

      const pos = enabled.findIndex(({ o }) => o.value === selected);
      const next = enabled[(pos + dir + enabled.length * 2) % enabled.length];
      if (!next) return;

      select(next.o.value);
      optRefs.current[next.i]?.focus();
    },
    [options, selected, select],
  );

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      className={["mut-seg", className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span
        className="mut-seg__glide"
        data-ready={glide ? "true" : undefined}
        style={
          glide
            ? { transform: `translateX(${glide.x}px)`, width: `${glide.w}px` }
            : undefined
        }
      />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            optRefs.current[i] = el;
          }}
          type="button"
          role="radio"
          className="mut-seg__opt"
          aria-checked={o.value === selected}
          disabled={o.disabled}
          tabIndex={o.value === selected ? 0 : -1}
          onClick={() => select(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
