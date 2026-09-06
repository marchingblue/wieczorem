import { Fragment, useState, type ReactNode } from "react";

export interface Crumb {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /** separator between crumbs — defaults to a slash */
  separator?: ReactNode;
  /** max visible crumbs before collapsing to first + dots + tail (default 3) */
  maxItems?: number;
  className?: string;
}

const DotSep = ({ children }: { children: ReactNode }) => (
  <span className="mut-crumbs__sep" aria-hidden="true">
    {children}
  </span>
);

/**
 * a quiet trail. separators are faint slashes that lean a little further
 * when the next crumb is hovered. overflow collapses to first + dots +
 * tail; clicking the dots expands the hidden crumbs.
 */
export function Breadcrumbs({
  items,
  separator = "/",
  maxItems = 3,
  className,
}: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const collapsed = !expanded && items.length > maxItems;

  const last = items.length - 1;

  type Entry = { crumb?: Crumb; index: number; dots?: boolean };
  const entries: Entry[] = collapsed
    ? [
        { crumb: items[0], index: 0 },
        { dots: true, index: -1 },
        ...items.slice(last - (maxItems - 2)).map((crumb, i, arr) => ({
          crumb,
          index: last - (arr.length - 1 - i),
        })),
      ]
    : items.map((crumb, index) => ({ crumb, index }));

  return (
    <nav
      className={["mut-crumbs", className].filter(Boolean).join(" ")}
      aria-label="breadcrumb"
    >
      {entries.map((e, pos) => {
        const sep = pos > 0 ? <DotSep>{separator}</DotSep> : null;
        if (e.dots) {
          return (
            <Fragment key="dots">
              {sep}
              <button
                type="button"
                className="mut-crumbs__dots"
                aria-label={`show ${last - 1} hidden crumbs`}
                onClick={() => setExpanded(true)}
              >
                …
              </button>
            </Fragment>
          );
        }
        const crumb = e.crumb!;
        const isLast = e.index === last;
        return (
          <Fragment key={e.index}>
            {sep}
            <span
              className="mut-crumbs__item"
              aria-current={isLast ? "page" : undefined}
              data-entered={expanded && collapsed === false && e.index > 0 && e.index < last ? "true" : undefined}
            >
              {isLast || !crumb.href ? (
                <span className="mut-crumbs__label">{crumb.label}</span>
              ) : (
                <a className="mut-crumbs__link" href={crumb.href}>
                  {crumb.label}
                </a>
              )}
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}
