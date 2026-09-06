import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** status tones — used sparingly, meaning only */
  tone?: "neutral" | "contrast" | "success" | "warning" | "danger";
  /** outline = bordered, no wash */
  look?: "soft" | "outline";
  /** small square dot before the label */
  dot?: boolean;
  children?: ReactNode;
}

/**
 * a small quiet label. soft ink wash by default; tones only when they
 * carry meaning.
 */
export function Badge({
  tone = "neutral",
  look = "soft",
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={["mut-badge", className].filter(Boolean).join(" ")}
      data-tone={tone === "neutral" ? undefined : tone}
      data-look={look === "soft" ? undefined : look}
      data-dot={dot || undefined}
      {...rest}
    >
      {children}
    </span>
  );
}
