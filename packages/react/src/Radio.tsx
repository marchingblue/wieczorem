import {
  forwardRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  /** value this item represents */
  value?: string;
  /** fully controlled checked state (overrides group) */
  checked?: boolean;
  name?: string;
  onChange?: (value: string | undefined) => void;
  label?: ReactNode;
  disabled?: boolean;
}

/**
 * one dot in a circle. space/arrow keys work natively; the dot pops in
 * with the spring — no stroke traced, state is fills.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio(
    {
      value,
      checked,
      name,
      onChange,
      label,
      disabled,
      className,
      ...rest
    },
    ref,
  ) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked ? (value ?? label?.toString()) : undefined);
    };

    return (
      <label
        className={["mut-radio", className].filter(Boolean).join(" ")}
        data-disabled={disabled || undefined}
      >
        <input
          ref={ref}
          type="radio"
          className="mut-radio__input"
          value={value}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          {...rest}
        />
        <span className="mut-radio__circle" aria-hidden="true">
          <span className="mut-radio__dot" aria-hidden="true" />
        </span>
        {label != null ? <span className="mut-radio__label">{label}</span> : null}
      </label>
    );
  },
);

export interface RadioItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** the options */
  items: RadioItem[];
  /** controlled selected value */
  value?: string;
  /** initial selection for uncontrolled usage */
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

/**
 * owns the group value; arrows move between items natively because every
 * input shares a name. render <RadioGroup items> or compose <Radio> by
 * hand with your own name when you need custom wiring.
 */
export function RadioGroup({
  items,
  value,
  defaultValue,
  onChange,
  name,
  disabled,
  className,
  ...rest
}: RadioGroupProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  return (
    <div
      role="radiogroup"
      className={className}
      aria-label={rest["aria-label"]}
      style={{ display: "inline-flex", gap: 14, flexWrap: "wrap" }}
    >
      {items.map((it) => (
        <Radio
          key={it.value}
          value={it.value}
          name={name}
          label={it.label}
          disabled={disabled ?? it.disabled}
          checked={current === it.value}
          onChange={(v) => {
            if (value === undefined && v !== undefined) setInternal(v);
            if (v !== undefined) onChange?.(v);
          }}
        />
      ))}
    </div>
  );
}
