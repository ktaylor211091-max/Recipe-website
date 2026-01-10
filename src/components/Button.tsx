import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost" | "purple" | "amber" | "indigo";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  asChild?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-600 hover:border-emerald-500",
  secondary:
    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300",
  outline:
    "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-400",
  ghost: "bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
  purple: "bg-white text-purple-700 hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300",
  amber: "bg-white text-amber-700 hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-300",
  indigo: "bg-white text-indigo-700 hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-300",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs font-medium min-h-[36px]",
  md: "px-4 py-2 text-sm font-medium min-h-[40px]",
  lg: "px-6 py-3 text-base font-semibold min-h-[44px]",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  asChild = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `;

  if (asChild) {
    return (
      <div className={baseClasses}>
        {children}
      </div>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={baseClasses}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
