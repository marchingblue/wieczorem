import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type ButtonVariant = "outline" | "primary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "square" | "pill" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** visual weight — outline is the quiet default */
  variant?: ButtonVariant;
  /** smart rounding: size drives radius unless shape="pill" */
  size?: ButtonSize;
  /** pill for capsules and badges; icon for equal-padding square buttons */
  shape?: ButtonShape;
  children?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  outline: "",
  primary: "is-mut-primary",
  ghost: "is-mut-ghost",
  danger: "is-mut-danger",
};

/**
 * a key that compresses and springs back when released.
 * press feel is entirely in css (@mut/styles) — this is just semantics.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "outline",
      size = "md",
      shape = "square",
      type = "button",
      className,
      ...rest
    },
    ref,
  ) {
    const cls = ["mut-btn", variantClass[variant], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={cls}
        data-size={size === "md" ? undefined : size}
        data-shape={shape === "square" ? undefined : shape}
        {...rest}
      />
    );
  },
);
