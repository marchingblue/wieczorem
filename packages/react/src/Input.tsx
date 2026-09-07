import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** label above the field */
  label?: ReactNode;
  /** quiet hint under the field (hidden while an error shows) */
  description?: ReactNode;
  /** error text — paints the field invalid */
  error?: ReactNode;
  /** mark invalid without a message (combines with error) */
  invalid?: boolean;
  /** fixed content glued to the start (icon, currency, …) */
  prefix?: ReactNode;
  /** fixed content glued to the end (unit, shortcut, …) */
  suffix?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/**
 * a quiet text field: opaque surface, hairline border that wakes to ink
 * on focus and danger on error. label, description, and error stack in
 * the field wrapper; prefix/suffix glue addons inside the frame.
 * natively supports text, password, number, file, … via type.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      description,
      error,
      invalid,
      prefix,
      suffix,
      size = "md",
      required,
      disabled,
      id: idProp,
      className,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const isInvalid = invalid || error != null;
    const descId = description != null ? `${id}-desc` : undefined;
    const errId = error != null ? `${id}-err` : undefined;
    const describedBy =
      [ariaDescribedBy, descId, errId].filter(Boolean).join(" ") || undefined;

    return (
      <div
        className={["mut-field", className].filter(Boolean).join(" ")}
        data-size={size}
        data-disabled={disabled || undefined}
        data-invalid={isInvalid || undefined}
      >
        {label != null ? (
          <label className="mut-field__label" htmlFor={id}>
            <span>{label}</span>
            {required ? (
              <span className="mut-field__required" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        <div className="mut-input">
          {prefix != null ? (
            <span className="mut-input__addon" aria-hidden="true">
              {prefix}
            </span>
          ) : null}
          <input
            ref={ref}
            id={id}
            className="mut-input__box"
            required={required}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-invalid={isInvalid || undefined}
            {...rest}
          />
          {suffix != null ? (
            <span className="mut-input__addon" aria-hidden="true">
              {suffix}
            </span>
          ) : null}
        </div>
        {error != null ? (
          <p id={errId} className="mut-field__error">
            {error}
          </p>
        ) : description != null ? (
          <p id={descId} className="mut-field__desc">
            {description}
          </p>
        ) : null}
      </div>
    );
  },
);
