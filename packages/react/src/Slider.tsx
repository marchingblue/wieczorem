import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface SliderProps {
  /** minimum value (default 0) */
  min?: number;
  /** maximum value (default 100) */
  max?: number;
  /** allowed interval between values (default 1) — 0.1, 0.5, 5, 25… */
  step?: number;
  /** controlled value — number, or [lo, hi] for a range slider */
  value?: number | [number, number];
  /** initial value for uncontrolled usage */
  defaultValue?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  /** show the step ruler under the rail */
  ruler?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

type Num2 = [number, number];

const round = (v: number, step: number, min: number) => {
  const eps = 1e-9;
  return Math.round((v - min) / step + eps) * step + min;
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * a fader. rectangular thumb with a square dot, ink fill, optional step
 * ruler. pass an array value for a two-thumb range. drag anywhere on the
 * rail; arrows move by one step, page-up/down by ten.
 */
export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 0,
  onChange,
  ruler = false,
  disabled,
  className,
  ...rest
}: SliderProps) {
  const isRange = Array.isArray(value) || Array.isArray(defaultValue);
  const [internal, setInternal] = useState<number | Num2>(defaultValue);
  const current = value ?? internal;
  const values: Num2 = Array.isArray(current)
    ? [current[0], current[1]]
    : [current, current];

  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const isNum2 = (v: number | Num2): v is Num2 => Array.isArray(v);
  const emit = useCallback(
    (v: number | Num2) => {
      if (value === undefined) setInternal(v);
      onChange?.(v);
    },
    [value, onChange],
  );

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return min;
      const r = el.getBoundingClientRect();
      const t = clamp((clientX - r.left) / r.width, 0, 1);
      return clamp(round(min + t * (max - min), step, min), min, max);
    },
    [min, max, step],
  );

  // pointer events — works for mouse, touch, and pen
  useLayoutEffect(() => {
    if (drag === null || disabled) return;

    const onMove = (e: PointerEvent) => {
      const v = valueFromClientX(e.clientX);
      if (isRange) {
        const lo = drag === 0 ? v : values[0];
        const hi = drag === 1 ? v : values[1];
        emit([Math.min(lo, hi), Math.max(lo, hi)] as Num2);
      } else {
        emit(v);
      }
    };
    const onUp = () => setDrag(null);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, disabled, isRange, values, valueFromClientX, emit]);

  const onRailDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    const v = valueFromClientX(e.clientX);
    let idx = 0;
    if (isRange) {
      const [lo, hi] = values;
      idx =
        Math.abs(v - lo) <= Math.abs(v - hi)
          ? 0
          : 1;
    }
    setDrag(idx);
    if (isRange) {
      const lo = idx === 0 ? v : values[0];
      const hi = idx === 1 ? v : values[1];
      emit([Math.min(lo, hi), Math.max(lo, hi)] as Num2);
    } else {
      emit(v);
    }
  };

  const stepValue = (idx: 0 | 1, dir: 1 | -1, mult = 1) => {
    const v = clamp(round(values[idx] + dir * step * mult, step, min), min, max);
    if (isRange) {
      const lo = idx === 0 ? v : values[0];
      const hi = idx === 1 ? v : values[1];
      emit([Math.min(lo, hi), Math.max(lo, hi)] as Num2);
    } else {
      emit(v);
    }
  };

  const onThumbKeyDown =
    (idx: 0 | 1) => (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowUp") {
        e.preventDefault();
        stepValue(idx, 1);
      } else if (k === "ArrowLeft" || k === "ArrowDown") {
        e.preventDefault();
        stepValue(idx, -1);
      } else if (k === "PageUp") {
        e.preventDefault();
        stepValue(idx, 1, 10);
      } else if (k === "PageDown") {
        e.preventDefault();
        stepValue(idx, -1, 10);
      } else if (k === "Home") {
        e.preventDefault();
        stepValue(idx, -1, Infinity);
      } else if (k === "End") {
        e.preventDefault();
        stepValue(idx, 1, Infinity);
      }
    };

  const steps: number[] = [];
  if (ruler) {
    const eps = 1e-9;
    for (let v = min; v <= max + eps; v += step) {
      steps.push(Number(v.toFixed(10)));
    }
  }
  const fmt = (v: number) => Number(v.toFixed(10));

  const thumbs: { idx: 0 | 1; v: number; key: string }[] = isRange
    ? [
        { idx: 0, v: fmt(values[0]), key: "lo" },
        { idx: 1, v: fmt(values[1]), key: "hi" },
      ]
    : [{ idx: 0, v: fmt(values[0]), key: "single" }];

  return (
    <div
      ref={trackRef}
      className={["mut-slider", className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      onPointerDown={onRailDown}
      {...rest}
    >
      <div className="mut-slider__rail" />
      <div
        className="mut-slider__fill"
        style={{
          // single sliders fill from the minimum; ranges fill lo…hi
          left: `${isRange ? pct(thumbs[0]?.v ?? min) : pct(min)}%`,
          width: `${
            pct(thumbs[thumbs.length - 1]?.v ?? min) -
            (isRange ? pct(thumbs[0]?.v ?? min) : pct(min))
          }%`,
        }}
      />
      {thumbs.map((t) => (
        <div
          key={t.key}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          className="mut-slider__thumb"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={t.v}
          aria-label={rest["aria-label"]}
          data-dragging={drag === t.idx ? "true" : undefined}
          style={{ left: `${pct(t.v)}%` }}
          onKeyDown={onThumbKeyDown(t.idx)}
        />
      ))}
      {ruler ? (
        <div className="mut-slider__steps" aria-hidden="true">
          {steps.map((v) => (
            <span
              key={v}
              className="mut-slider__step"
              style={{ left: `${pct(v)}%` }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
