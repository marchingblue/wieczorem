import {
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDownIcon } from "./icons.js";

export interface TreeItem {
  value: string;
  label: ReactNode;
  children?: TreeItem[];
  disabled?: boolean;
}

export interface TreeProps {
  items: TreeItem[];
  /** controlled expanded values */
  expandedValue?: string[];
  /** initially expanded for uncontrolled usage */
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** controlled selected value */
  selected?: string;
  defaultSelected?: string;
  onSelect?: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * a quiet file-tree: rows indent under a hairline guide, the chevron
 * answers instantly, right expands, left collapses, enter picks.
 */
export function Tree({
  items,
  expandedValue,
  defaultExpanded = [],
  onExpandedChange,
  selected: selectedProp,
  defaultSelected,
  onSelect,
  className,
  ...rest
}: TreeProps) {
  const [internalExp, setInternalExp] = useState<string[]>(defaultExpanded);
  const expanded = expandedValue ?? internalExp;
  const [internalSel, setInternalSel] = useState<string | undefined>(defaultSelected);
  const selected = selectedProp ?? internalSel;

  const setExpanded = (next: string[]) => {
    if (expandedValue === undefined) setInternalExp(next);
    onExpandedChange?.(next);
  };

  const toggle = (v: string) => {
    setExpanded(
      expanded.includes(v)
        ? expanded.filter((x) => x !== v)
        : [...expanded, v],
    );
  };

  const select = (v: string) => {
    if (selectedProp === undefined) setInternalSel(v);
    onSelect?.(v);
  };

  const onRowKeyDown = (item: TreeItem) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (item.disabled) return;
    if (e.key === "ArrowRight" && item.children && !expanded.includes(item.value)) {
      e.preventDefault();
      toggle(item.value);
    } else if (e.key === "ArrowLeft" && item.children && expanded.includes(item.value)) {
      e.preventDefault();
      toggle(item.value);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(item.value);
    }
  };

  const renderItems = (list: TreeItem[], depth: number): ReactNode => (
    <div
      className={depth === 0 ? "mut-tree" : "mut-tree__kids"}
      role={depth === 0 ? "tree" : "group"}
    >
      {list.map((item) => {
        const open = expanded.includes(item.value);
        return (
          <div key={item.value} className="mut-tree__node">
            <div
              role="treeitem"
              tabIndex={item.disabled ? -1 : 0}
              aria-expanded={item.children ? open : undefined}
              aria-selected={selected === item.value}
              aria-disabled={item.disabled || undefined}
              data-selected={selected === item.value || undefined}
              data-disabled={item.disabled || undefined}
              className="mut-tree__row"
              onClick={() => {
                if (item.disabled) return;
                if (item.children) toggle(item.value);
                select(item.value);
              }}
              onKeyDown={onRowKeyDown(item)}
            >
              {item.children ? (
                <ChevronDownIcon className="mut-tree__chev" data-open={open || undefined} />
              ) : (
                <span className="mut-tree__leaf" aria-hidden="true" />
              )}
              <span className="mut-tree__label">{item.label}</span>
            </div>
            {item.children && open ? renderItems(item.children, depth + 1) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={["mut-tree-root", className].filter(Boolean).join(" ")}
      aria-label={rest["aria-label"]}
    >
      {renderItems(items, 0)}
    </div>
  );
}
