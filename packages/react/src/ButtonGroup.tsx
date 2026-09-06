import { forwardRef, type HTMLAttributes } from "react";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

/**
 * buttons joined at the hip: one border between neighbors, outer corners
 * keep the rounding, press feel stays per-button. drop any mut buttons in.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    { orientation = "horizontal", className, role = "group", ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role={role}
        className={["mut-bgroup", className].filter(Boolean).join(" ")}
        data-orientation={orientation === "horizontal" ? undefined : orientation}
        {...rest}
      />
    );
  },
);
