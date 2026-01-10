import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <div className="text-neutral-400">{icon}</div>
          </div>
        )}
        <input
          className={`
            w-full rounded-lg border px-4 py-2.5 text-sm
            bg-white text-neutral-900 placeholder-neutral-500
            border-neutral-300 hover:border-neutral-400
            focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200
            transition-colors
            disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
            ${icon ? "pl-10" : ""}
            ${error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>}
    </div>
  );
}

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

export function TextArea({
  label,
  error,
  helperText,
  rows = 4,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full rounded-lg border px-4 py-2.5 text-sm
          bg-white text-neutral-900 placeholder-neutral-500
          border-neutral-300 hover:border-neutral-400
          focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200
          transition-colors resize-none
          disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
          ${error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>}
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full rounded-lg border px-4 py-2.5 text-sm
          bg-white text-neutral-900
          border-neutral-300 hover:border-neutral-400
          focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200
          transition-colors
          disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
          ${error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
