# Animation Guidelines - Yello Solar Hub

## Core Principles

### 1. Performance First (60fps Target)

- **MUST**: Use compositor-only properties (`transform`, `opacity`)
- **NEVER**: Animate `top`, `left`, `width`, `height`, `margin`, `padding` (causes layout/paint)
- **ALWAYS**: Add `will-change` hints for animated properties
- **REMOVE**: `will-change` after animation completes (or use sparingly)

### 2. Accessibility (prefers-reduced-motion)

- **MUST**: Honor `prefers-reduced-motion: reduce` media query
- **MUST**: Use `usePrefersReducedMotion` hook in React components
- **SHOULD**: Provide reduced motion variants (instant state changes)
- **CONSIDER**: Backend header `Sec-CH-Prefers-Reduced-Motion` for server-side optimization

### 3. Animation Hierarchy (Prefer CSS → Web Animations API → JS Libraries)

1. **CSS animations/transitions** - Most performant, declarative
2. **Web Animations API** - When you need programmatic control
3. **Framer Motion** - Complex orchestration, spring physics

## Implementation Patterns

### CSS-Based Animations (Preferred)

```css
/* Good: Uses transform and opacity */
.button-hover {
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button-hover:hover {
  transform: scale(1.05);
}

/* Bad: Animates width (layout thrashing) */
.button-bad {
  transition: width 300ms;
}

/* Accessibility: Disable for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .button-hover {
    transition: none !important;
  }
}
```

### Framer Motion with Reduced Motion

```tsx
import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

function Component() {
  const prefersReducedMotion = usePrefersReducedMotion()
  
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.3 }}
      style={{ willChange: 'transform, opacity' }}
    >
      Content
    </motion.div>
  )
}
```

### Conditional Interactions

```tsx
<motion.button
  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
  style={{ willChange: 'transform' }}
>
  Click me
</motion.button>
```

## Animation Timing

### Duration Guidelines

- **Micro-interactions**: 100-150ms (hover, focus)
- **State changes**: 200-300ms (modal open, tab switch)
- **Page transitions**: 300-500ms (route changes, large UI shifts)
- **Attention-directing**: 200-400ms (tooltips, notifications)

### Easing Functions

- **Ease-out**: Default for most UI (elements entering screen)
- **Ease-in**: Elements leaving screen
- **Ease-in-out**: Symmetrical motion (modals, overlays)
- **Spring**: Organic feel (buttons, cards, micro-interactions)

## Transform Origin

Always set appropriate `transform-origin`:

```css
/* Scale from center (default) */
transform-origin: center;

/* Scale from top-left */
transform-origin: top left;

/* Rotate around bottom */
transform-origin: bottom center;
```

## Will-Change Optimization

```tsx
// Good: Set during animation, remove after
<motion.div
  style={{ willChange: 'transform' }}
  animate={{ x: 100 }}
  onAnimationComplete={() => {
    // Will-change automatically removed by Framer Motion
  }}
/>

// Bad: Permanent will-change (wastes memory)
<div style={{ willChange: 'transform, opacity, left, top' }} />
```

## Common Patterns

### Fade In on Mount

```tsx
<motion.div
  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={prefersReducedMotion ? {} : { duration: 0.2 }}
>
  Content
</motion.div>
```

### Staggered List Animation

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item.id} variants={item}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

### Button Hover/Tap

```tsx
<motion.button
  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
  style={{ willChange: 'transform' }}
>
  Click
</motion.button>
```

### Loading Spinner

```tsx
<motion.div
  animate={prefersReducedMotion ? {} : { rotate: 360 }}
  transition={
    prefersReducedMotion 
      ? {} 
      : { duration: 1, repeat: Infinity, ease: "linear" }
  }
  style={{ willChange: 'transform' }}
>
  <Icon />
</motion.div>
```

## Interruptible Animations

Use spring physics for interruptible feel:

```tsx
// Good: Spring can be interrupted mid-animation
<motion.div
  animate={{ x: 100 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>

// Less good: Duration-based locks animation
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 0.5 }}
/>
```

## Testing Reduced Motion

### Browser DevTools

1. Chrome: DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`
2. Firefox: about:config → `ui.prefersReducedMotion` = 1
3. Safari: Develop → Experimental Features → Prefers Reduced Motion

### Manual Testing

```tsx
// Force reduced motion for testing
const usePrefersReducedMotion = () => true
```

## Performance Checklist

- [ ] Only animate `transform` and `opacity`
- [ ] Add `will-change` hints
- [ ] Remove `will-change` after animation
- [ ] Honor `prefers-reduced-motion`
- [ ] Use CSS transitions when possible
- [ ] Set appropriate `transform-origin`
- [ ] Keep animations under 500ms
- [ ] Use spring physics for interruptible feel
- [ ] Test on low-end devices
- [ ] Verify 60fps in Chrome DevTools Performance tab
