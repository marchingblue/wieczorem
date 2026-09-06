export interface ProgressBarProps {
  /** 0–100; omit for indeterminate patrol */
  value?: number;
  /** called on change (controlled use) */
  onChange?: (value: number) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * a rail that quietly fills. pass no value and a bar patrols
 * (indeterminate). updates glide — the width animates.
 */
export function ProgressBar({
  value,
  onChange: _onChange,
  className,
  ...rest
}: ProgressBarProps) {
  const indeterminate = value == null;
  const clamped = indeterminate ? undefined : Math.min(100, Math.max(0, value));
  return (
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
}
