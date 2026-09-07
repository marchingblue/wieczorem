import { useRef, type ReactNode } from "react";
import { Input, type InputProps } from "./Input.js";
import { CalendarIcon } from "./icons.js";

export interface DateInputProps
  extends Omit<InputProps, "type" | "suffix"> {
  /** trailing affordance (default a calendar button opening the picker) */
  suffix?: ReactNode;
}

/**
 * a date field in input clothing: label, hint, and error included, the
 * native picker behind one quiet calendar button. value is YYYY-MM-DD.
 */
export function DateInput({ suffix, ...rest }: DateInputProps) {
  const boxRef = useRef<HTMLInputElement>(null);

  return (
    <Input
      ref={boxRef}
      type="date"
      suffix={
        suffix ?? (
          <button
            type="button"
            className="mut-input__picker"
            aria-label="open calendar"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const el = boxRef.current;
              if (el && typeof el.showPicker === "function") {
                try {
                  el.showPicker();
                } catch {
                  el.focus();
                }
              } else {
                el?.focus();
              }
            }}
          >
            <CalendarIcon size={13} />
          </button>
        )
      }
      {...rest}
    />
  );
}
