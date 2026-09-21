import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

const fieldClasses =
  "w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-50 placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400";

interface FieldWrapperProps {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldWrapperProps>(
  ({ className, label, hint, id, ...props }, ref) => (
    <label className="block text-sm">
      {label && <span className="mb-1.5 block font-medium text-surface-200">{label}</span>}
      <input ref={ref} id={id} className={clsx(fieldClasses, className)} {...props} />
      {hint && <span className="mt-1 block text-xs text-surface-500">{hint}</span>}
    </label>
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapperProps
>(({ className, label, hint, id, ...props }, ref) => (
  <label className="block text-sm">
    {label && <span className="mb-1.5 block font-medium text-surface-200">{label}</span>}
    <textarea ref={ref} id={id} className={clsx(fieldClasses, "resize-none", className)} {...props} />
    {hint && <span className="mt-1 block text-xs text-surface-500">{hint}</span>}
  </label>
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & FieldWrapperProps
>(({ className, label, hint, id, children, ...props }, ref) => (
  <label className="block text-sm">
    {label && <span className="mb-1.5 block font-medium text-surface-200">{label}</span>}
    <select ref={ref} id={id} className={clsx(fieldClasses, "cursor-pointer")} {...props}>
      {children}
    </select>
    {hint && <span className="mt-1 block text-xs text-surface-500">{hint}</span>}
  </label>
));
Select.displayName = "Select";
