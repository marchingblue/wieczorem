import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface TooltipProps {
  /** the element the tip annotates */
  children: ReactNode;
  /** tip text — keep it to a line or two */
  content: ReactNode;
  /** which side of the trigger (default top) */
  side?: "top" | "bottom" | "left" | "right";
  /** hover delay in ms (default 350, keyboard shows instantly) */
  delay?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * a quiet one-liner on hover or focus. mouse waits out the delay,
 * keyboard shows instantly, escape dismisses. no arrows, no noise.
 */
export function Tooltip({
  children,
  content,
  side = "top",
  delay = 350,
  disabled,
  className,
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const timer = useRef<number | null>(null);
  const bubbleId = useId();

  const clear = () => {
    if (timer.current != null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onEnter = () => {
    if (disabled) return;
    clear();
    timer.current = window.setTimeout(() => setShow(true), delay);
  };

  const onLeave = () => {
    clear();
    setShow(false);
  };

  const onFocus = () => {
    if (disabled) return;
    clear();
    setShow(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      clear();
      setShow(false);
    }
  };

  return (
    <span
      className={["mut-tip", className].filter(Boolean).join(" ")}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onFocus}
      onBlur={onLeave}
      onKeyDown={onKeyDown}
    >
      {children}
      {show && !disabled ? (
        <span
          className="mut-tip__bubble"
          role="tooltip"
          id={bubbleId}
          data-side={side}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
