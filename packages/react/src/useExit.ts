import { useEffect, useRef, useState } from "react";

/**
 * drives `data-closing` while a component animates out.
 * mount with the control visible; when it flips false, play the exit
 * animation (css `[data-closing="true"]`), then actually unmount.
 * returns [show, closing] for spreading onto the overlay + panel.
 */
export function useExit(open: boolean, ms = 120): [boolean, boolean] {
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) {
      if (timer.current) clearTimeout(timer.current);
      setShow(true);
      setClosing(false);
      return;
    }
    if (!show) return;
    setClosing(true);
    timer.current = setTimeout(() => {
      setShow(false);
      setClosing(false);
    }, ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ms]);

  return [show, closing];
}
