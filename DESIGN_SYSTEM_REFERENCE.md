# Design System Quick Reference

## 🎨 Color Palette

### Primary Actions (Emerald)
```typescript
import { semanticColors } from '@/components/ui/designSystem';

// Backgrounds
semanticColors.primary.bg          // bg-emerald-600
semanticColors.primary.bgHover     // hover:bg-emerald-500
semanticColors.primary.bgLight     // bg-emerald-50

// Text
semanticColors.primary.text        // text-emerald-600
semanticColors.primary.textHover   // hover:text-emerald-500

// Borders
semanticColors.primary.border      // border-emerald-600
```

### Neutral/Secondary
```typescript
semanticColors.neutral.bg           // bg-neutral-100
semanticColors.neutral.text         // text-neutral-900
semanticColors.neutral.textSecondary // text-neutral-600
semanticColors.neutral.border       // border-neutral-200
```

### Status Colors
```typescript
semanticColors.danger   // Red - errors, destructive actions
semanticColors.warning  // Amber - warnings, cautions
semanticColors.success  // Emerald - confirmations, success
semanticColors.info     // Sky - informational content
```

---

## 📏 Border Radius

```typescript
import { radius } from '@/components/ui/designSystem';

radius.sm    // rounded-lg   - inputs, small cards
radius.md    // rounded-xl   - cards, sections
radius.lg    // rounded-2xl  - hero sections
radius.full  // rounded-full - buttons, avatars
```

**Standard Usage:**
- Inputs & Form Elements: `rounded-lg`
- Cards & Content Blocks: `rounded-xl`
- Large Hero Sections: `rounded-2xl`
- Buttons & Avatars: `rounded-full`

---

## 🌓 Shadows

```typescript
import { shadows } from '@/components/ui/designSystem';

shadows.sm  // shadow-sm  - cards at rest
shadows.md  // shadow-md  - interactive elements
shadows.lg  // shadow-lg  - elevated modals
shadows.xl  // shadow-xl  - floating overlays
```

---

## ⚡ Transitions

```typescript
import { transitions } from '@/components/ui/designSystem';

transitions.default // transition-all duration-200 (most common)
transitions.fast    // transition-all duration-150 (quick feedback)
transitions.slow    // transition-all duration-300 (complex animations)
transitions.colors  // transition-colors duration-200 (color changes only)
```

---

## 📦 Component Templates

### Card
```typescript
import { components } from '@/components/ui/designSystem';

<div className={components.card}>
  {/* Content */}
</div>

// With hover effect
<div className={`${components.card} ${components.cardHover}`}>
  {/* Interactive content */}
</div>
```

### Input
```typescript
<input className={components.input} />
```

### Page Container
```typescript
<main className={components.page}>
  {/* Centered content with gradient background */}
</main>
```

---

## 🎯 Common Patterns

### Button
```tsx
<button className={`
  ${radius.sm}
  ${semanticColors.primary.bg}
  ${semanticColors.primary.bgHover}
  ${transitions.default}
  px-4 py-2 text-white font-medium
`}>
  Click Me
</button>
```

### Card with Border
```tsx
<div className={`
  ${radius.md}
  ${shadows.sm}
  border ${semanticColors.neutral.border}
  bg-white p-6
  ${components.cardHover}
`}>
  {/* Card content */}
</div>
```

### Alert/Notice
```tsx
// Error
<div className={`
  ${radius.sm}
  border ${semanticColors.danger.border}
  ${semanticColors.danger.bg}
  ${semanticColors.danger.textDark}
  p-4
`}>
  Error message
</div>

// Warning
<div className={`
  ${radius.sm}
  border ${semanticColors.warning.border}
  ${semanticColors.warning.bg}
  ${semanticColors.warning.textDark}
  p-4
`}>
  Warning message
</div>
```

---

## ✅ Do's

✅ Use semantic color tokens from `designSystem.ts`
✅ Stick to standardized border radius values
✅ Apply consistent shadows for elevation
✅ Use defined transitions for smooth UX
✅ Follow the color usage guidelines

---

## ❌ Don'ts

❌ Don't hardcode colors like `bg-blue-500`
❌ Don't use custom border radius values
❌ Don't create custom transitions inline
❌ Don't mix color palettes (emerald + indigo)
❌ Don't use black (#000) for focus rings

---

## 🔍 Finding Inconsistencies

Search for these patterns to find areas that need updating:

```bash
# Hardcoded colors
grep -r "bg-blue-" src/
grep -r "bg-purple-" src/
grep -r "bg-indigo-" src/

# Inconsistent radius
grep -r "rounded-2xl" src/

# Custom transitions
grep -r "duration-" src/
```

---

## 📚 Examples in Codebase

**Good Examples:**
- `src/components/ui/Button.tsx` - Uses consistent colors and tokens
- `src/components/ui/Card.tsx` - Standardized card component
- `src/app/login/page.tsx` - Clean, consistent auth page

**Reference Files:**
- Design System: `src/components/ui/designSystem.ts`
- Global Styles: `src/app/globals.css`

---

## 🚀 Quick Start

1. Import the design system:
```typescript
import { 
  semanticColors, 
  radius, 
  shadows, 
  transitions 
} from '@/components/ui/designSystem';
```

2. Build your component with tokens:
```tsx
<div className={`
  ${radius.md}
  ${shadows.sm}
  ${semanticColors.neutral.border}
  ${transitions.default}
  border bg-white p-6
`}>
  Consistent component!
</div>
```

3. Verify no hardcoded values remain

---

**Last Updated**: January 16, 2026
