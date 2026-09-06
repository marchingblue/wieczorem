import {
  forwardRef,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { ButtonVariant, ButtonSize, ButtonShape } from "./Button.js";

export interface ToggleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onPress"> {
  /** controlled pressed state */
  pressed?: boolean;
  /** initial pressed state for uncontrolled usage */
  defaultPressed?: boolean;
  /** called with the next state on every toggle */
  onPressedChange?: (pressed: boolean) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  children?: ReactNode;
}

/**
 * a latched key: the on-state stays sunken, like a real switch.
 * uncontrolled by default; pass `pressed` to control it.
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      onClick,
      variant = "outline",
      size = "md",
      shape = "square",
      type = "button",
      className,
      ...rest
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultPressed);
    const isPressed = pressed ?? internal;

    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        const next = !isPressed;
        if (pressed === undefined) setInternal(next);
        onPressedChange?.(next);
        onClick?.(e);
      },
      [isPressed, pressed, onPressedChange, onClick],
    );

    return (
      <button
        ref={ref}
        type={type}
        className={["mut-btn", "mut-toggle", className].filter(Boolean).join(" ")}
        aria-pressed={isPressed}
        data-size={size === "md" ? undefined : size}
        data-shape={shape === "pill" ? "pill" : undefined}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);
