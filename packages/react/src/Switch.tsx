import {
  forwardRef,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** controlled checked state */
  checked?: boolean;
  /** initial state for uncontrolled usage */
  defaultChecked?: boolean;
  /** called with the next state on every flip */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * a latch: low-radius track, knob that is rounder than its housing.
 * press nudges the knob toward its travel, release springs it across.
 * uncontrolled by default; pass `checked` to control it.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      onClick,
      className,
      type = "button",
      role = "switch",
      ...rest
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultChecked);
    const isChecked = checked ?? internal;

    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        const next = !isChecked;
        if (checked === undefined) setInternal(next);
        onCheckedChange?.(next);
        onClick?.(e);
      },
      [isChecked, checked, onCheckedChange, onClick],
    );

    return (
      <button
        ref={ref}
        type={type}
        role={role}
        className={["mut-switch", className].filter(Boolean).join(" ")}
        aria-checked={isChecked}
        data-checked={isChecked}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);
