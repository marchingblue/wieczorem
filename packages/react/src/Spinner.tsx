export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  "aria-label"?: string;
  className?: string;
}

/** the classic: a quiet arc turning on the ink color. */
export function Spinner({ size = "md", className, ...rest }: SpinnerProps) {
  return (
    <span
      role="status"
      className={["mut-spinner", className].filter(Boolean).join(" ")}
      data-size={size === "md" ? undefined : size}
      {...rest}
    />
  );
}
