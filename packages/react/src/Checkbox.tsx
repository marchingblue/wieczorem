import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** controlled checked state */
  checked?: boolean;
  /** initial state for uncontrolled usage */
  defaultChecked?: boolean;
  /** shows the short bar instead of the dot */
  indeterminate?: boolean;
  /** called with the next state on every change */
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
}

/**
 * a small square that fills to answer — no check mark. a solid ink fill
 * with a counter-dot is quieter and just as clear. space toggles it for
 * free (native input). pass `indeterminate` for partial states.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked = false,
      indeterminate = false,
      onCheckedChange,
      onChange,
      label,
      disabled,
      className,
      ...rest
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultChecked);
    const isChecked = checked ?? internal;
    const inputRef = useRef<HTMLInputElement | null>(null);

    // indeterminate is visual-only and not settable via jsx
    useEffect(() => {
      const el = inputRef.current;
      if (el) el.indeterminate = indeterminate;
    }, [indeterminate]);

    const setRefs = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.checked;
      if (checked === undefined) setInternal(next);
      onCheckedChange?.(next);
      onChange?.(e);
    };

    return (
      <label
        className={["mut-check", className].filter(Boolean).join(" ")}
        data-disabled={disabled || undefined}
      >
        <input
          ref={setRefs}
          type="checkbox"
          className="mut-check__input"
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          {...rest}
        />
        <span className="mut-check__box" aria-hidden="true">
          <span className="mut-check__dot" aria-hidden="true" />
          <span className="mut-check__bar" aria-hidden="true" />
        </span>
        {label != null ? <span className="mut-check__label">{label}</span> : null}
      </label>
    );
  },
);
