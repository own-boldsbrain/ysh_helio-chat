---
description: "Use when editing solar business logic, sizing rules, Hélio prompt flow, pricing text, Brazilian energy regulation references, or API integrations for solar analysis."
name: "Solar Domain"
applyTo:
  - "src/App.tsx"
  - "src/components/widgets/**"
  - "src/components/pages/solar-analysis/**"
  - "src/lib/**"
  - "aneel*.py"
  - "nasa*.py"
  - "pvgis*.py"
---

# Solar Domain

- Keep user-facing copy in pt-BR and grounded in the Brazilian market; values should be formatted in R$.
- Preserve the Hélio conversation cadence: CEP, consumo, fase, dimensionamento, financiamento.
- Treat [src/App.tsx](../../src/App.tsx) and [docs/SOLAR_SIZING_WIDGETS_GUIDE.md](../../docs/SOLAR_SIZING_WIDGETS_GUIDE.md) as the primary references for sizing behavior and widget expectations.
- When touching regulation, distributed generation, or credits, stay aligned with Lei 14.300/2022 and ANEEL terminology.
- If the roof is not adequate, prefer guidance that includes Geração Compartilhada as a fallback path.
- Keep solar terminology consistent: `kWp`, `PR`, `MPPT`, payback, and ROI should match existing product language.

Links:

- [PRD.md](../../PRD.md)
- [docs/SOLAR_SIZING_WIDGETS_GUIDE.md](../../docs/SOLAR_SIZING_WIDGETS_GUIDE.md)
- [docs/PLANO_INCORPORACAO_RECURSOS.md](../../docs/PLANO_INCORPORACAO_RECURSOS.md)
