import {
  useCallback,
  useId,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";
import { CheckIcon } from "./icons.js";

export interface DropzoneProps {
  /** outline flavor (default dashed) */
  style?: "dashed" | "dotted" | "solid";
  /** accepted file types, like a native input */
  accept?: string;
  /** allow selecting multiple files */
  multiple?: boolean;
  /** short line under the main label */
  hint?: string;
  label?: string;
  disabled?: boolean;
  onFiles?: (files: File[]) => void;
  className?: string;
}

/**
 * a quiet invitation: hairline outline, a corner trace while something
 * hovers over it, and a check that draws in when files land.
 * click to browse or drop straight onto it.
 */
export function Dropzone({
  style = "dashed",
  accept,
  multiple = false,
  hint,
  label = "drop files or click to browse",
  disabled,
  onFiles,
  className,
  ...rest
}: DropzoneProps) {
  const [over, setOver] = useState(false);
  const [dropped, setDropped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const depth = useRef(0);

  const emit = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      setDropped(true);
      setTimeout(() => setDropped(false), 1000);
      onFiles?.(files);
    },
    [onFiles],
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    depth.current = 0;
    setOver(false);
    if (disabled) return;
    emit(Array.from(e.dataTransfer.files));
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    depth.current += 1;
    setOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setOver(false);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.querySelector<HTMLInputElement>(`#${inputId}`)?.click();
  };

  return (
    <div
      className={["mut-drop", className].filter(Boolean).join(" ")}
      data-style={style}
      data-over={over || undefined}
      data-disabled={disabled || undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={typeof label === "string" ? label : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      {...rest}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          emit(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {dropped ? (
        <CheckIcon size={16} />
      ) : (
        <span className="mut-drop__label">{label}</span>
      )}
      {hint && !dropped ? (
        <span className="mut-drop__hint">{hint}</span>
      ) : null}
    </div>
  );
}
