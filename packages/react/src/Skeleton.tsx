import type { CSSProperties } from "react";

export interface SkeletonProps {
  /** text = a line, circle = avatar dot, rect = a block (default text) */
  shape?: "text" | "circle" | "rect";
  size?: "sm" | "md" | "lg";
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * a placeholder with the patience of wet cement. a soft wash that
 * breathes while the real content loads. purely decorative.
 */
export function Skeleton({
  shape = "text",
  size = "md",
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const w = width ?? (shape === "circle" ? height : undefined);
  return (
    <div
      aria-hidden="true"
      className={["mut-skel", className].filter(Boolean).join(" ")}
      data-shape={shape}
      data-size={size === "md" ? undefined : size}
      style={{ width: w, height, ...style }}
      {...rest}
    />
  );
}
