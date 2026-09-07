import type { ReactNode } from "react";

export interface ProgressBarProps {
  /** 0–100; omit for indeterminate patrol */
  value?: number;
  /** called on change (controlled use) */
  onChange?: (value: number) => void;
  /** label shown above the bar, value hugs the right end */
  label?: ReactNode;
  /** show the value next to the label (default true when labeled) */
  showValue?: boolean;
  /** format the value (default `${rounded}%`) */
  formatValue?: (value: number) => ReactNode;
  "aria-label"?: string;
  className?: string;
}

/**
 * a rail that quietly fills. pass no value and a bar patrols
 * (indeterminate). updates glide — the width animates. pass a label
 * for the titlebar row with the value at its end.
 */
export function ProgressBar({
  value,
  onChange: _onChange,
  label,
  showValue,
  formatValue,
  className,
  ...rest
}: ProgressBarProps) {
  const indeterminate = value == null;
  const clamped = indeterminate ? undefined : Math.min(100, Math.max(0, value));
  const withTitle = label != null || showValue;

  const bar = (
    <div
      role="progressbar"
      className={["mut-progress", className].filter(Boolean).join(" ")}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={clamped}
      data-indeterminate={indeterminate || undefined}
      {...rest}
    >
      <div
        className="mut-progress__fill"
        style={indeterminate ? undefined : { width: `${clamped}%` }}
      />
    </div>
  );

  if (!withTitle) return bar;

  const show = showValue ?? true;
  return (
    <div className="mut-progress-wrap">
      <div className="mut-progress__row">
        <span className="mut-progress__label">{label}</span>
        {show && !indeterminate ? (
          <span className="mut-progress__value">
            {formatValue ? formatValue(clamped ?? 0) : `${Math.round(clamped ?? 0)}%`}
          </span>
        ) : null}
      </div>
      {bar}
    </div>
  );
}
