import { create } from "zustand";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import clsx from "clsx";

type ToastKind = "success" | "warning" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, kind, message }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  warning: (message: string) => useToastStore.getState().push("warning", message),
  error: (message: string) => useToastStore.getState().push("error", message),
};

const icons: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const colors: Record<ToastKind, string> = {
  success: "border-accent-600/50 text-accent-400",
  warning: "border-amber-500/50 text-amber-400",
  error: "border-red-500/50 text-red-400",
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.kind];
        return (
          <div
            key={t.id}
            className={clsx(
              "flex items-center gap-2 rounded-lg border bg-surface-900 px-3.5 py-2.5 text-sm text-surface-100 shadow-xl",
              colors[t.kind]
            )}
          >
            <Icon size={16} className="shrink-0" />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
