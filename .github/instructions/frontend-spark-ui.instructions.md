---
description: "Use when editing Spark UI, React components, widgets, App.tsx, animations, accessibility, vite config, or frontend state flow in this repo."
name: "Frontend Spark UI"
applyTo:
  - "src/App.tsx"
  - "src/components/**"
  - "src/contexts/**"
  - "src/hooks/**"
  - "src/styles/**"
  - "src/index.css"
  - "src/main.css"
  - "vite.config.ts"
  - "eslint-rules/**"
---

# Frontend Spark UI

- Preserve the Spark app shape in [src/App.tsx](../../src/App.tsx): route state lives in `useKV`, not in React Router or browser storage.
- Keep page-level UX contracts already used by the repo, especially `onToggleSidebar` on page headers and menus.
- If a widget is added or renamed, update both [src/components/widgets/WidgetRenderer.tsx](../../src/components/widgets/WidgetRenderer.tsx) and [src/components/widgets/widgetExamples.ts](../../src/components/widgets/widgetExamples.ts) together.
- Do not remove `sparkPlugin()` or `createIconImportProxy()` from [vite.config.ts](../../vite.config.ts).
- Icon-only `Button` usage must include `aria-label`; use `npm run check:icon-aria` or `npm run lint` after related changes.
- For motion work, use `usePrefersReducedMotion()`, animate only `transform` and `opacity`, and follow [docs/ANIMATION_GUIDELINES.md](../../docs/ANIMATION_GUIDELINES.md).

Links:

- [docs/ANIMATION_GUIDELINES.md](../../docs/ANIMATION_GUIDELINES.md)
- [docs/WIDGET_TEMPLATES_GUIDE.md](../../docs/WIDGET_TEMPLATES_GUIDE.md)
- [docs/WIDGET_INVENTORY.md](../../docs/WIDGET_INVENTORY.md)
