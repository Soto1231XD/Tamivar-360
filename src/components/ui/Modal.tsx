import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
}

export function Modal({ open, onClose, title, children, footer, widthClassName = "max-w-md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={clsx(
          "w-full rounded-xl border border-surface-700 bg-surface-900 shadow-2xl",
          "animate-[fadeIn_0.15s_ease-out]",
          widthClassName
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-surface-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-surface-400 hover:bg-surface-800 hover:text-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-surface-800 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
