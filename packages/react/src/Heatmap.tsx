export interface HeatmapCell {
  /** 0 (empty floor) … 4 (full ink) */
  level: number;
  /** tooltip text, e.g. "12 commits, march 4" */
  title?: string;
}

export interface HeatmapProps {
  /** row-major cells, column-major columns expected: index = week * rows + day */
  cells: HeatmapCell[];
  /** days per column (default 7) */
  rows?: number;
  /** quiet line under the grid */
  legend?: boolean;
  className?: string;
}

/**
 * github-style contribution grid, all greyscale. five levels of ink,
 * square cells that lean in on hover. purely presentational — hand it
 * cells and it stays quiet.
 */
export function Heatmap({
  cells,
  rows = 7,
  legend = false,
  className,
  ...rest
}: HeatmapProps) {
  return (
    <div
      className={["mut-heat", className].filter(Boolean).join(" ")}
      style={{ "--mut-heat-rows": rows } as React.CSSProperties}
      {...rest}
    >
      <div className="mut-heat__grid" role="img" aria-label="activity heatmap">
        {cells.map((c, i) => (
          <div
            key={i}
            className="mut-heat__cell"
            data-level={Math.max(0, Math.min(4, Math.round(c.level)))}
            title={c.title}
          />
        ))}
      </div>
      {legend ? (
        <div className="mut-heat__legend" aria-hidden="true">
          less
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className="mut-heat__cell" data-level={l} />
          ))}
          more
        </div>
      ) : null}
    </div>
  );
}
