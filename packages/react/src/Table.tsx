import type { TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

/**
 * quiet table primitives — hairline header, softer row rules, hover
 * wash, sunken selected rows. compose freely; nothing is imposed.
 */
export function Table({
  children,
  className,
  ...rest
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="mut-table-wrap">
      <table className={["mut-table", className].filter(Boolean).join(" ")} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function THead({
  children,
  className,
  ...rest
}: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
}

export function TBody({
  children,
  className,
  ...rest
}: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
}

export function TR({
  children,
  selected,
  className,
  ...rest
}: TableHTMLAttributes<HTMLTableRowElement> & {
  /** renders the row as the current one (sunken) */
  selected?: boolean;
}) {
  return (
    <tr
      className={className}
      data-selected={selected || undefined}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  numeric,
  className,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & {
  /** right-align tabular numbers */
  numeric?: boolean;
}) {
  return (
    <th
      className={["mut-table__cell", className].filter(Boolean).join(" ")}
      data-numeric={numeric || undefined}
      {...rest}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  numeric,
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & {
  /** right-align tabular numbers */
  numeric?: boolean;
}) {
  return (
    <td
      className={["mut-table__cell", className].filter(Boolean).join(" ")}
      data-numeric={numeric || undefined}
      {...rest}
    >
      {children}
    </td>
  );
}
