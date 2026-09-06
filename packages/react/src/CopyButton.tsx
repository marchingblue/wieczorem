import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";
import { CheckIcon, CopyIcon } from "./icons.js";

export interface CopyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onCopy"> {
  /** the text to put on the clipboard */
  value: string;
  /** ms before the check quietly resets (default 900) */
  resetAfter?: number;
  /** called after a successful copy */
  onCopied?: () => void;
}

/**
 * a small square that copies and admits it: the copy icon shrinks away,
 * a check draws itself in, then everything resets. the admit is quick —
 * long enough to register, never long enough to wait for.
 */
export function CopyButton({
  value,
  resetAfter = 900,
  onCopied,
  onClick,
  className,
  type = "button",
  ...rest
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      navigator.clipboard?.writeText(value).then(
        () => {
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), resetAfter);
          onCopied?.();
        },
        () => {
          /* clipboard blocked — stay quiet */
        },
      );
      onClick?.(e);
    },
    [value, resetAfter, onCopied, onClick],
  );

  return (
    <button
      type={type}
      className={["mut-copy", className].filter(Boolean).join(" ")}
      data-copied={copied}
      aria-label={copied ? "copied" : "copy"}
      onClick={handleCopy}
      {...rest}
    >
      <span className="mut-copy__icons" aria-hidden="true">
        <CopyIcon className="mut-copy__icon-copy" size={15} />
        <svg
          className="mut-copy__icon-check"
          width="15"
          height="15"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 6.4 L4.8 9 L10 3.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
          />
        </svg>
      </span>
    </button>
  );
}

/** a whole value + copy button row, for code/paths/ids */
export function CopyField({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      className={["mut-copyfield", className].filter(Boolean).join(" ")}
    >
      <code className="mut-copyfield__value">{value}</code>
      <CopyButton value={value} aria-label={`copy ${value}`} />
    </span>
  );
}
