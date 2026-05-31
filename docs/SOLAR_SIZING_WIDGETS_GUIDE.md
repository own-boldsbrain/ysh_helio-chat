# Solar Sizing Widgets Guide

## Overview

This guide documents the three new interactive solar sizing widgets that enable remote roof analysis and solar system dimensioning within conversational flows.

## Widgets

- Integration with Nominatim Ope

- Search result cards with full a

```typescript

  data: {
  }
- Integration with Nominatim OpenStreetMap API
- Brazil-focused results (`countrycodes=br`)
- Auto-search when `initialAddress` is provided
- Visual feedback with loading states
- Search result cards with full address details
- Location confirmation with coordinates display

**Data Structure**:
```typescript
{
  id: string
  type: "solar-location-search"
  data: {
    initialAddress?: string  // Optional: pre-fill and auto-search
  }
}
   

- **Endpoint**: `htt
- **Requireme
-
### 2. RoofDrawingWidget
**Type**: `r
**Purpose**: In
**Features**:
- Satellite imagery ove
- Real-time po
- Area calculation 
- Quality score based on so
- Visual feedback wit

```typescript
  id: string
  data: {
     
   
 
```

{
  payload: {
    perimeter: n
    coordinates: [[
}


2. 

- N

**API Integration**:

- **Service**: OpenStreetMap Nominatim
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Rate Limit**: 1 request per second (handled by 500ms debounce)
- **Requirements**: Must include User-Agent header

---

### 2. RoofDrawingWidget

**Type**: `roof-drawing`

**Purpose**: Interactive map interface for users to draw roof contours and calculate area, orientation, and quality score.

**Features**:
- MapLibre GL JS integration
- Satellite imagery overlay (Google Maps tiles)
- Click-to-draw polygon interface
- Real-time point counting
- Automatic polygon closure detection
- Area calculation using Haversine formula
- Azimuth (orientation) calculation
- Quality score based on solar orientation
- Perimeter calculation
- Visual feedback with color-coded drawing layers
- Redraw capability

**Data Structure**:

{
  id: string
  type: "roof-drawing"
- Detaile
    location: {
      lat: number
      lon: number
      displayName: string
     
  }
 
```

**Actions Emitted**:
```typescript
 
  type: "drawing_complete"
  payload: {
    area: number          // Square meters
    perimeter: number     // Meters
    azimuth: number       // Degrees (0-360)
    coordinates: [[number, number]]  // [lat, lon] pairs
```
}
```

**Calculation Methods**:

1. **Area Calculation**: Uses spherical geometry with Earth radius (6,371,000m)
2. **Azimuth Calculation**: Bearing from first to second point
3. **Quality Score**: `100 - (deviation_from_north / 180 * 100)`

**Orientation Labels**:
1. **Overview Tab**:
   - 25-year financial projection

   - Irradiation data (daily, monthly,
   - System specifications (po
3. **Financial Tab**:
   - Monthly/annual savings
   - 25-year ROI with milestones (5, 10

   - CO₂ offset (tons)
   - Comparative metrics (cars, coal, 

```typescript

  data: {
      display
      lon: -46.6
      state: "SP"
    roof: {
      azi
      qualitySc
    irradiation: {
      monthly: 155.4
      source: "NREL NSRDB 2022"
    s
   
 
   

      paybackYear
    },
      co2Offset: 4356,
    }
}







  type: "solar-location-search",

}


```typescript
  type: "location_selected",
    lat: -23.5505,
    displayName: "Rua d
  }
```
**Bot Response**: "Perfeito! Agora v
Display `RoofDrawingWidget`

  id: "drawing-1",
  data: {
 
      displa
  }
```
### Step 3: Use
**Action Received**:
{
  payload: {
    perimeter: 28.
    coordinates: [.
}


1. Fetch irradiation data from AWS Ope
3. Calculate financial projections




{
  type: "solar-analysis-results",
    location: { ... },
    i
    financial
  }
```
### Step 5: User Actions
User can:
- Req
- Switch between
---
## Widget Trigger Keywords
Add these to `widgetDemoMessages` in `widget
```typescript
  // Location search triggers
  "di
  "endereço": widget
  // Roof drawing triggers
  "desenhar": widgetExamples.roofDrawing,
  
  "resultados": widg
  "relatório": widgetExa
  // ... existing triggers
```
---
#
###

- `framer-motion`
- shadcn/ui c
### External API
1
   - Rate limit: 1 req/

 

   - Base map layer



 

   - Demographics dat

   - Sentinel-2 imagery




try {

1. **Overview Tab**:
   - 4 key metric cards (Power, Generation, Investment, Payback)
   - 25-year financial projection
   - Action buttons (Proposal, Financing, Export)

2. **Technical Tab**:
   - Irradiation data (daily, monthly, annual)
   - Roof characteristics (area, orientation)
   - System specifications (power, panels, production, efficiency)

3. **Financial Tab**:
   - Investment breakdown
   - Monthly/annual savings
   - Payback period
   - 25-year ROI with milestones (5, 10, 15, 25 years)
   - Financing simulation button

4. **Environmental Tab**:
   - CO₂ offset (tons)
   - Tree planting equivalent
   - Comparative metrics (cars, coal, energy)
   - Sustainability benefits list

**Usage Example**:
```typescript
const widget = {
  id: "results-1",
  type: "solar-analysis-results",
  data: {
    location: {
      displayName: "Rua das Flores, 123 - São Paulo, SP",
      lat: -23.5505,
      lon: -46.6333,
      city: "São Paulo",
      state: "SP"
    },
    roof: {
      area: 48.7,
      azimuth: 12,
      orientation: "Norte",
      qualityScore: 94
    },
    irradiation: {
      daily: 5.18,
      monthly: 155.4,
      annual: 1890.7,
      source: "NREL NSRDB 2022"
    },
    system: {
      recommendedPower: 6.05,
      panelCount: 11,
      annualProduction: 9075,
      efficiency: 85
    },
    financial: {
      estimatedCost: 30250,
      monthlySavings: 574,
      annualSavings: 6888,
      paybackYears: 4.39,
      roi25Years: 172200
    },
    environmental: {
      co2Offset: 4356,
      treesEquivalent: 50
    }
  }
3
```

---

## Complete User Journey Example

### Step 1: Location Search

**User**: "Quero fazer um dimensionamento remoto do meu telhado"

**Bot Response**: Display `SolarLocationSearchWidget`

```typescript
{
  id: "location-1",
  type: "solar-location-search",
  data: {
    initialAddress: ""
  }
}
```

### Step 2: User Selects Location

**Action Received**:
```typescript
{
  type: "location_selected",
  payload: {
    lat: -23.5505,
    lon: -46.6333,
    displayName: "Rua das Flores, 123 - Jardim Paulista, São Paulo, SP",
    address: { ... }
  }
}
```

**Bot Response**: "Perfeito! Agora vou precisar que você desenhe o contorno do telhado."

Display `RoofDrawingWidget`:

```typescript
{
  id: "drawing-1",
  type: "roof-drawing",
  data: {
    location: {
      lat: -23.5505,
      lon: -46.6333,
      displayName: "Rua das Flores, 123 - São Paulo, SP"
    }
  }
}
```

### Step 3: User Draws Roof

**Action Received**:
```typescript
{
  type: "drawing_complete",
  payload: {
    area: 48.7,
    perimeter: 28.4,
    azimuth: 12,
    coordinates: [...]
  }
}
```

**Bot Response**: "Excelente! Medi o telhado e encontrei: 48.7 m², orientação Norte (94% qualidade). Agora vou fazer uma análise completa..."

**Backend Processing**:
1. Fetch irradiation data from AWS OpenData (NSRDB)
2. Calculate recommended system size
3. Calculate financial projections
4. Calculate environmental impact

### Step 4: Display Results

**Bot Response**: "Análise concluída! 🎉"

Display `SolarAnalysisResultsWidget`:

```typescript
{
  id: "results-1",
  type: "solar-analysis-results",
  data: {
    location: { ... },
    roof: { ... },
    irradiation: { ... },
    system: { ... },
    financial: { ... },
    environmental: { ... }
  }
}
```

### Step 5: User Actions

User can:
- Export report (PDF)
- Request commercial proposal
- Simulate financing options
- Switch between tabs to explore details

---

## Widget Trigger Keywords

Add these to `widgetDemoMessages` in `widgetExamples.ts`:

```typescript
export const widgetDemoMessages = {
  // Location search triggers
  "dimensionamento": widgetExamples.solarLocationSearch,
  "dimensionar": widgetExamples.solarLocationSearch,
  "localização": widgetExamples.solarLocationSearch,
  "endereço": widgetExamples.solarLocationSearch,
  
  // Roof drawing triggers
  "telhado": widgetExamples.roofDrawing,
  "desenhar": widgetExamples.roofDrawing,
  "área": widgetExamples.roofDrawing,
  
  // Results triggers
  "resultados": widgetExamples.solarAnalysisResults,
  "análise completa": widgetExamples.solarAnalysisResults,
  "relatório": widgetExamples.solarAnalysisResults,
  
  // ... existing triggers
}
```

---

## Integration Requirements

### Dependencies

All required dependencies are already installed:
- `maplibre-gl` (loaded via CDN in index.html)
- `framer-motion`
- `@phosphor-icons/react`
- shadcn/ui components

### External APIs

1. **Nominatim OpenStreetMap**
   - No API key required
   - Rate limit: 1 req/sec
   - User-Agent header required

2. **Google Maps Satellite Tiles**
   - Public tile server
   - No API key required for low volume

3. **MapLibre Free Tiles**
   - Base map layer
   - No API key required

### Future Integrations

For production implementation, connect to:

1. **AWS OpenData (NSRDB)**
   - Solar irradiation data
   - S3 bucket access

2. **IBGE APIs**
   - Demographics data
   - DEM (elevation) data

3. **Brazil Data Cube (BDC)**
   - Sentinel-2 imagery
   - CBERS-4 imagery

---

## Best Practices

### Error Handling

```typescript
try {
  const response = await nominatim.search(address)
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    toast.error("Muitas buscas. Aguarde 1 segundo.")
  } else if (error.code === 'NO_RESULTS') {
    toast.error("Endereço não encontrado. Tente ser mais específico.")
  } else {
    toast.error("Erro ao buscar endereço. Tente novamente.")
  }
}
```

### Data Persistence

```typescript

const analysisSession = {

  timestamp: Date.now(),

  drawing: drawingData,
  results: analysisData
}

await spark.kv.set('solar-analysis-sessions', analysisSession)





// During processing

toast.info("Calculando sistema fotovoltaico ideal...")
toast.info("Gerando análise financeira...")
toast.success("Análise completa! 🎉")
```





All widgets follow the Yello Solar Hub brand gradient:
- Primary: `#FFD60A` (Yellow)

- End: `#FF0066` (Pink)

Applied via:
```css
bg-gradient-to-br from-[#FFD60A] via-[#FF3D3D] to-[#FF0066]






### Manual Test Scenarios


   - Search by street address
   - Search by CEP
   - Search by city name
   - Handle no results
   - Handle multiple results

2. **Roof Drawing**:
   - Draw 3-point triangle
   - Draw 4-point rectangle
   - Draw complex polygon (5+ points)
   - Close polygon by clicking first point
   - Test redraw functionality
   - Verify calculations for different orientations

3. **Results Display**:
   - Verify all tabs render correctly
   - Test action buttons
   - Verify calculations display properly
   - Test responsive layout

---

## Future Enhancements

1. **Advanced Drawing Tools**:

   - Edit existing points
   - Multiple roof sections
   - Obstruction marking (chimneys, etc.)

2. **Enhanced Calculations**:
   - Shading analysis
   - 3D terrain consideration
   - Monthly production curves
   - Real-time weather data

3. **Additional Widgets**:
   - Equipment comparison widget
   - Installation timeline widget
   - Regulatory compliance widget
   - ROI calculator widget

---

## Support

For questions or issues:
1. Check widget implementation in `/src/components/widgets/`
2. Review examples in `widgetExamples.ts`
3. Test with trigger keywords in chat interface
4. Monitor browser console for errors
