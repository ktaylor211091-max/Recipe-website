/**
 * Design System - Colors, Typography, Spacing, and UI Tokens
 * Use these tokens for consistent styling across the application
 */

// Color Palette
export const colors = {
  primary: "emerald",
  secondary: "neutral",
  danger: "red",
  warning: "amber",
  success: "emerald",
  info: "sky",
};

// Semantic Color Classes
export const semanticColors = {
  // Primary actions and branding
  primary: {
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-600",
    textHover: "hover:text-emerald-500",
    border: "border-emerald-600",
  },
  // Neutral/Secondary UI elements
  neutral: {
    bg: "bg-neutral-100",
    bgHover: "hover:bg-neutral-200",
    bgDark: "bg-neutral-900",
    text: "text-neutral-900",
    textSecondary: "text-neutral-600",
    textLight: "text-neutral-500",
    border: "border-neutral-200",
    borderDark: "border-neutral-300",
  },
  // Error states
  danger: {
    bg: "bg-red-50",
    bgHover: "hover:bg-red-100",
    text: "text-red-700",
    textDark: "text-red-800",
    border: "border-red-200",
  },
  // Warning states
  warning: {
    bg: "bg-amber-50",
    bgHover: "hover:bg-amber-100",
    text: "text-amber-700",
    textDark: "text-amber-800",
    border: "border-amber-200",
  },
  // Success states
  success: {
    bg: "bg-emerald-50",
    bgHover: "hover:bg-emerald-100",
    text: "text-emerald-700",
    textDark: "text-emerald-800",
    border: "border-emerald-200",
  },
  // Informational states
  info: {
    bg: "bg-sky-50",
    bgHover: "hover:bg-sky-100",
    text: "text-sky-700",
    textDark: "text-sky-800",
    border: "border-sky-200",
  },
};

// Typography
export const typography = {
  h1: "text-5xl md:text-6xl font-bold tracking-tight",
  h2: "text-3xl md:text-4xl font-bold",
  h3: "text-2xl font-bold",
  h4: "text-xl font-bold",
  h5: "text-lg font-semibold",
  body: "text-base",
  bodySm: "text-sm",
  bodyXs: "text-xs",
};

// Spacing
export const spacing = {
  xs: "space-y-2",
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-8",
  xl: "space-y-12",
  "2xl": "space-y-16",
};

// Border Radius (standardized)
export const radius = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

// Shadows (consistent elevation)
export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

// Transitions
export const transitions = {
  default: "transition-all duration-200",
  fast: "transition-all duration-150",
  slow: "transition-all duration-300",
  colors: "transition-colors duration-200",
};

// Common Component Styles
export const components = {
  card: `${radius.sm} border ${semanticColors.neutral.border} bg-white p-6 ${shadows.sm}`,
  cardHover: `${transitions.default} hover:${shadows.md} hover:${semanticColors.neutral.borderDark}`,
  input: `w-full ${radius.sm} border ${semanticColors.neutral.borderDark} bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200`,
  page: `min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4`,
};
