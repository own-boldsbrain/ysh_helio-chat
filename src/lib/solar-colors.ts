// Solar brand colors for use in JS contexts (MapLibre, SVG, charts)
// These MUST match the CSS variables in src/index.css
export const SOLAR_COLORS = {
  yellow: '#FFD60A',
  red: '#FF3D3D',
  pink: '#FF0066',
  orange: '#FF8C00',
} as const;

export const SOLAR_GRADIENT = {
  from: SOLAR_COLORS.yellow,
  via: SOLAR_COLORS.red,
  to: SOLAR_COLORS.pink,
} as const;

export const MAP_COLORS = {
  polygon: SOLAR_COLORS.yellow,
  polygonFill: SOLAR_COLORS.yellow + '33', // 20% opacity
  drawingLine: SOLAR_COLORS.orange,
  horizonStroke: SOLAR_COLORS.red,
  horizonFill: '#8B4513',
} as const;
