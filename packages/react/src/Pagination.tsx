import { useState, type ReactNode } from "react";

export interface PaginationProps {
  /** total page count */
  total: number;
  /** controlled current page (1-based) */
  value?: number;
  /** initial page for uncontrolled usage (default 1) */
  defaultValue?: number;
  onChange?: (page: number) => void;
  /** pages kept beside the current one (default 1) */
  siblingCount?: number;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

type Slot = number | string;

/** page numbers with uniquely-keyed gaps — duplicate keys once left
 *  ghost ellipses mounted after navigating two-gap layouts. */
function slots(total: number, current: number, siblings: number): Slot[] {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total, current]);
  for (let i = 1; i <= siblings; i++) {
    pages.add(current - i);
    pages.add(current + i);
  }
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Slot[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push(`gap:${prev + 1}-${p - 1}`);
    out.push(p);
    prev = p;
  }
  return out;
}

/** the nav shell. */
export function Pagination({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <nav
      className={["mut-page", className].filter(Boolean).join(" ")}
      aria-label={rest["aria-label"] ?? "pagination"}
    >
      {children}
    </nav>
  );
}

export function PaginationContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}


interface PageLinkProps {
  children: ReactNode;
  /** renders the page as the current one (sunken) */
  isActive?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onSelect?: () => void;
}

/** one page button. */
export function PaginationLink({ children, isActive, disabled, ariaLabel, onSelect }: PageLinkProps) {
  return (
    <button
      type="button"
      className="mut-page__btn"
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

/** step back — disabled on the first page. */
export function PaginationPrevious({
  disabled,
  onSelect,
}: {
  disabled?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      className="mut-page__btn"
      aria-label="previous page"
      disabled={disabled}
      onClick={onSelect}
    >
      ‹
    </button>
  );
}

export function PaginationItem({ children }: { children: ReactNode }) {
  return <span className="mut-page__item">{children}</span>;
}

/** step forward — disabled on the last page. */
export function PaginationNext({
  disabled,
  onSelect,
}: {
  disabled?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      className="mut-page__btn"
      aria-label="next page"
      disabled={disabled}
      onClick={onSelect}
    >
      ›
    </button>
  );
}

/** collapsed pages. */
export function PaginationEllipsis() {
  return (
    <span className="mut-page__gap" aria-hidden="true">
      …
    </span>
  );
}

/**
 * the smart default: prev/next pair, the current page sunken, gaps
 * collapse to an ellipsis. compose the parts above by hand when the
 * window needs opinions.
 */
export function SmartPagination({
  total,
  value,
  defaultValue = 1,
  onChange,
  siblingCount = 1,
  disabled,
  className,
  ...rest
}: PaginationProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = Math.min(total, Math.max(1, value ?? internal));

  const go = (next: number) => {
    const page = Math.min(total, Math.max(1, next));
    if (page === current || disabled) return;
    if (value === undefined) setInternal(page);
    onChange?.(page);
  };

  return (
    <Pagination className={className} {...rest}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={disabled || current <= 1}
            onSelect={() => go(current - 1)}
          />
        </PaginationItem>
        {slots(total, current, siblingCount).map((s) => (
          <PaginationItem key={typeof s === "number" ? `p:${s}` : s}>
            {typeof s === "number" ? (
              <PaginationLink
                ariaLabel={`page ${s}`}
                isActive={s === current}
                disabled={disabled}
                onSelect={() => go(s)}
              >
                {s}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            disabled={disabled || current >= total}
            onSelect={() => go(current + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
