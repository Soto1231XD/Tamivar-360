import { type ReactNode, useState } from "react";
import clsx from "clsx";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom" | "right" | "left";
}

const sideClasses: Record<NonNullable<TooltipProps["side"]>, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
};

export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <span
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-surface-950 px-2 py-1 text-xs text-surface-100 shadow-lg border border-surface-700 transition-opacity duration-100",
          sideClasses[side],
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        {label}
      </span>
    </span>
  );
}
