import type { ReactNode } from "react";

export interface CalloutProps {
  /** short heading — the one-line version of the news */
  title?: ReactNode;
  children?: ReactNode;
  /** default is quiet ink; tones only when they carry meaning */
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}

/**
 * a bordered note for news that must survive a scroll-by. quiet ink by
 * default; success, warning, and danger tints when the meaning needs
 * the eye. never shouts — no icons, no fills.
 */
export function Callout({ title, children, tone = "default", className }: CalloutProps) {
  return (
    <div
      className={["mut-callout", className].filter(Boolean).join(" ")}
      data-tone={tone}
      role={tone === "danger" || tone === "warning" ? "alert" : undefined}
    >
      {title != null ? <div className="mut-callout__title">{title}</div> : null}
      {children != null ? <div className="mut-callout__body">{children}</div> : null}
    </div>
  );
}
