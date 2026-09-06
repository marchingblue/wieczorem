import {
  useCallback,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

export interface OtpProps {
  /** number of cells (default 6) */
  length?: number;
  /** controlled value */
  value?: string;
  /** initial value for uncontrolled usage */
  defaultValue?: string;
  /** called with the full digit string on every change */
  onChange?: (value: string) => void;
  /** called once every cell is filled */
  onComplete?: (value: string) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

const isDigit = (s: string) => /^\d$/.test(s);

/**
 * one-time code: digits only, auto-advance on type, backspace steps back,
 * paste distributes across cells, arrows wander. keyboard-native.
 */
export function Otp({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  size = "md",
  disabled,
  className,
  ...rest
}: OtpProps) {
  const [internal, setInternal] = useState(
    defaultValue.replace(/\D/g, "").slice(0, length),
  );
  const current = value ?? internal;
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => current[i] ?? "");

  const commit = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
      // a full-length string means every cell is filled (empties drop out of the join)
      if (next.length === length) onComplete?.(next);
    },
    [value, onChange, length, onComplete],
  );

  const focusCell = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setDigit = (i: number, d: string) => {
    const arr = [...digits];
    arr[i] = d;
    commit(arr.join("").replace(/\s/g, ""));
  };

  const handleInput = (i: number, raw: string) => {
    const chars = raw.replace(/\D/g, "");
    if (!chars) return;
    if (chars.length > 1) {
      // fast typing / autofill: spread across cells from here
      const arr = [...digits];
      for (let k = 0; k < chars.length && i + k < length; k++) {
        arr[i + k] = chars.charAt(k);
      }
      commit(arr.join(""));
      focusCell(i + chars.length);
      return;
    }
    setDigit(i, chars);
    focusCell(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        setDigit(i, "");
      } else {
        setDigit(i - 1, "");
        focusCell(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(i + 1);
    }
  };

  const handlePaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleInput(i, e.clipboardData.getData("text"));
  };

  return (
    <div
      className={["mut-otp", className].filter(Boolean).join(" ")}
      data-size={size === "md" ? undefined : size}
      data-disabled={disabled || undefined}
      role="group"
      {...rest}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="mut-otp__cell"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length} /* let autofill paste the whole code */
          value={d}
          disabled={disabled}
          aria-label={`digit ${i + 1} of ${length}`}
          data-filled={d ? "true" : undefined}
          onInput={(e) => handleInput(i, e.currentTarget.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.currentTarget.select()}
        />
      ))}
    </div>
  );
}
