# Design System — Green Status: Hex Color Purge

## Status: ✅ Complete

**Branch:** `feature/design-system-green-status`  
**PR:** https://github.com/boldsbrainai/ysh_helio-chat/pull/1  
**Build:** Passes — 7902 modules, zero TypeScript errors

---

## What Was Done

All hardcoded hex color values for the solar brand palette were replaced with CSS custom property references throughout the codebase.

### Violated hex values (now eliminated)
| Hex | CSS Var | Token |
|-----|---------|-------|
| `#FFD60A` | `--solar-yellow` | Solar Yellow |
| `#FF3D3D` | `--solar-red` | Solar Red |
| `#FF0066` | `--solar-pink` | Solar Pink |
| `#FF8800` | `--solar-orange` | Solar Orange |
| `#FF9F1C` | `--solar-orange` | (same token, lighter shade) |

### Replacement strategy
- **Tailwind classes**: `text-[hsl(var(--solar-yellow))]`, `border-[hsl(var(--solar-red))]`, etc.
- **Full gradient backgrounds**: `bg-gradient-solar-r`, `bg-gradient-solar-br` (new utilities)
- **JS/MapLibre/SVG contexts**: `SOLAR_COLORS.*`, `MAP_COLORS.*` from `src/lib/solar-colors.ts`

---

## New Files

### `src/lib/solar-colors.ts`
Central JS constants for non-CSS contexts (MapLibre paint properties, SVG attributes, canvas drawing):

```ts
export const SOLAR_COLORS = { yellow, red, pink, orange }
export const SOLAR_GRADIENT = { start, middle, end }
export const MAP_COLORS = { polygon, polygonFill, drawingLine, horizonStroke, horizonFill }
```

### `tailwind.config.js` additions
```js
backgroundImage: {
  'gradient-solar':    'linear-gradient(to bottom, var(--solar-gradient-start), ...)',
  'gradient-solar-r':  'linear-gradient(to right, var(--solar-gradient-start), ...)',
  'gradient-solar-br': 'linear-gradient(to bottom right, var(--solar-gradient-start), ...)',
}
```

---

## Files Modified (35)

| File | Changes |
|------|---------|
| `tailwind.config.js` | Added backgroundImage gradient utilities |
| `src/App.tsx` | h1 title gradient, welcome h2 gradient, 4 action button cards, submit button |
| `src/components/ChatKitEmbed.tsx` | 2 gradient class replacements |
| `src/components/ChatSidebar.tsx` | Helio sidebar item gradient dot + text, Workflow icon |
| `src/components/RealtimeVoiceAgent.tsx` | Icon box + Connect button |
| `src/components/integration/PlanSelector.tsx` | Badge + Button |
| `src/components/integration/ScenarioComparison.tsx` | Badge + icon box |
| `src/components/pages/ai-features/GPTsPage.tsx` | 7 replacements |
| `src/components/pages/ai-features/RealtimeVoicePage.tsx` | 2 icon divs |
| `src/components/pages/auth/LoginPage.tsx` | Title + Login + Register buttons |
| `src/components/pages/commerce/CheckoutPage.tsx` | Finish order button |
| `src/components/pages/project-management/DashboardPage.tsx` | 2 icon colors |
| `src/components/pages/project-management/PDFProposalPage.tsx` | Icon + 2 download buttons |
| `src/components/pages/solar-analysis/SizingPage.tsx` | 13 replacements (borders, icons, cards, buttons) |
| `src/components/pages/solar-analysis/TemporalAnalysisPage.tsx` | Title + 2 buttons |
| `src/components/solar/EnergyChart.tsx` | 4 bar chart colors |
| `src/components/solar/MapLibreViewer.tsx` | 4 JS paint colors + 2 button classes |
| `src/components/solar/RooftopVisualization3D.tsx` | Map layer interpolation + marker + 2 cards |
| `src/components/solar/ShadingAnalysis3D.tsx` | 3 map colors + SVG stroke/stopColor + invalid class fix |
| `src/components/solar/SolarWorkflowWizard.tsx` | Header icon box |
| `src/components/solar/steps/ConsumptionStep.tsx` | Lightning icon + Continue button |
| `src/components/solar/steps/EquipmentSelectionStep.tsx` | 4 replacements |
| `src/components/solar/steps/FinancingStep.tsx` | Continue button |
| `src/components/solar/steps/LocationStep.tsx` | Card bg + Continue button + Sun icon box |
| `src/components/solar/steps/ResultsStep.tsx` | 5 replacements |
| `src/components/solar/steps/SystemSizingStep.tsx` | Badge + Continue button |
| `src/components/widgets/RoofDrawingWidget.tsx` | Header bg + icon box + Draw button |
| `src/components/widgets/SolarAnalysisResultsWidget.tsx` | Header bg + icon box + Badge + button + gradient text |
| `src/components/widgets/SolarEquipmentWidget.tsx` | 4 replacements |
| `src/components/widgets/SolarFinancingWidget.tsx` | getScoreColor function + Lightning icon |
| `src/components/widgets/SolarIrradiationWidget.tsx` | getQualityColor function + icon box + map pin + 2 stat cards + Sun icon + Lightning icon |
| `src/components/widgets/SolarLocationSearchWidget.tsx` | Header bg + icon div |
| `src/components/widgets/SolarSizingWidget.tsx` | Icon box + map pin + Sun icon + 2 focus borders + Badge + Calculate button |
| `src/components/widgets/WidgetRenderer.tsx` | 2 icon boxes + 1 header bg + gradient text + action button |

---

## Intentionally NOT Changed

- **`src/components/integration/ChatKitIntegration.tsx`** — `primaryColor: '#FFD60A'` is an external ChatKit widget theme config object passed to a third-party SDK. This is not a Tailwind class and cannot use CSS vars.
- **Green/blue non-brand colors** — `#00D98C`, `#00A86B`, `#0066FF`, `#00C9FF`, `#10B981`, `#059669` are not solar brand colors and have no corresponding CSS custom properties.
- **`.enhanced.` files** — `SizingPage.enhanced.tsx`, `EarthObservationPage.enhanced.ts`, `App.enhanced.tsx` are alternative source variants, not compiled into the production build.

---

## Technical Notes

- CSS var format: `--solar-yellow: 49 100% 52%` (HSL components, no wrapper). Must be used as `hsl(var(--solar-yellow))` in Tailwind arbitrary values.
- Gradient vars: `--solar-gradient-start/middle/end` are already full `hsl(...)` values, used directly in `backgroundImage` strings.
- Opacity modifiers work with arbitrary CSS vars in Tailwind v4: `from-[hsl(var(--solar-yellow))]/10`
- `group-hover:bg-gradient-solar-r` and other state variants are generated automatically by Tailwind JIT.
