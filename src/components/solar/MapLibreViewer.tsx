import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Polygon, Pencil, Trash, Check } from "@phosphor-icons/react"
import { MAP_COLORS } from "@/lib/solar-colors"

interface MapLibreViewerProps {
  className?: string
  center?: [number, number]
  zoom?: number
  pitch?: number
  onPolygonDrawn?: (polygon: any) => void
  polygons?: any[]
  enableDrawing?: boolean
}

declare global {
  interface Window {
    maplibregl: any
  }
}

export function MapLibreViewer({ 
  className, 
  center = [11.39085, 47.27574],
  zoom = 12,
  pitch = 70,
  onPolygonDrawn,
  polygons = [],
  enableDrawing = false
}: MapLibreViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [drawMode, setDrawMode] = useState<'polygon' | 'line' | null>(null)
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([])
  const [allShapes, setAllShapes] = useState<any[]>([])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initMap = () => {
      if (!window.maplibregl) {
        setTimeout(initMap, 100)
        return
      }

      map.current = new window.maplibregl.Map({
        container: mapContainer.current!,
        zoom: zoom,
        center: center,
        pitch: pitch,
        maxPitch: 95
      })

      map.current.setStyle('https://tiles.openfreemap.org/styles/bright', {
        transformStyle: (previousStyle: any, nextStyle: any) => {
          nextStyle.projection = { type: 'globe' }
          nextStyle.sources = {
            ...nextStyle.sources,
            satelliteSource: {
              type: 'raster',
              tiles: [
                'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'
              ],
              tileSize: 256
            },
            terrainSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256
            },
            hillshadeSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256
            }
          }
          nextStyle.terrain = {
            source: 'terrainSource',
            exaggeration: 1
          }

          nextStyle.sky = {
            'atmosphere-blend': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              2, 0
            ],
          }

          nextStyle.layers.push({
            id: 'hills',
            type: 'hillshade',
            source: 'hillshadeSource',
            layout: { visibility: 'visible' },
            paint: { 'hillshade-shadow-color': '#473B24' }
          })

          const firstNonFillLayer = nextStyle.layers.find((layer: any) => layer.type !== 'fill' && layer.type !== 'background')
          nextStyle.layers.splice(nextStyle.layers.indexOf(firstNonFillLayer), 0, {
            id: 'satellite',
            type: 'raster',
            source: 'satelliteSource',
            layout: { visibility: 'visible' },
            paint: { 'raster-opacity': 1 }
          })

          return nextStyle
        }
      })

      map.current.addControl(
        new window.maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true
        })
      )

      map.current.addControl(
        new window.maplibregl.GlobeControl()
      )

      map.current.addControl(
        new window.maplibregl.TerrainControl({
          source: 'terrainSource',
          exaggeration: 1
        })
      )

      map.current.on('load', () => {
        map.current.addSource('drawing-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        })

        map.current.addLayer({
          id: 'polygon-fill',
          type: 'fill',
          source: 'drawing-source',
          filter: ['==', ['geometry-type'], 'Polygon'],
          paint: {
            'fill-color': MAP_COLORS.polygon,
            'fill-opacity': 0.3
          }
        })

        map.current.addLayer({
          id: 'polygon-outline',
          type: 'line',
          source: 'drawing-source',
          filter: ['==', ['geometry-type'], 'Polygon'],
          paint: {
            'line-color': MAP_COLORS.polygon,
            'line-width': 3
          }
        })

        map.current.addLayer({
          id: 'line-layer',
          type: 'line',
          source: 'drawing-source',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: {
            'line-color': MAP_COLORS.horizonStroke,
            'line-width': 4,
            'line-dasharray': [2, 2]
          }
        })

        map.current.addLayer({
          id: 'points-layer',
          type: 'circle',
          source: 'drawing-source',
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': MAP_COLORS.horizonFill,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        })
      })

      map.current.on('click', (e: any) => {
        if (!drawMode) return

        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat]
        setCurrentPoints(prev => [...prev, lngLat])

        updateDrawingLayer([...currentPoints, lngLat])
      })
    }

    initMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return
    
    map.current.flyTo({
      center: center,
      zoom: zoom,
      pitch: pitch,
      duration: 2000
    })
  }, [center, zoom, pitch])

  const updateDrawingLayer = (points: [number, number][]) => {
    if (!map.current || !map.current.isStyleLoaded() || points.length === 0) return

    const features: any[] = [...allShapes]

    if (drawMode === 'polygon' && points.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...points, points[0]]]
        },
        properties: { type: 'temp-polygon' }
      })
    } else if (drawMode === 'line' && points.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: points
        },
        properties: { type: 'temp-line' }
      })
    }

    points.forEach(point => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: point
        },
        properties: { type: 'vertex' }
      })
    })

    const source = map.current.getSource('drawing-source')
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: features
      })
    }
  }

  const finishDrawing = () => {
    if (currentPoints.length < 2) return

    const newShape = {
      type: 'Feature',
      geometry: {
        type: drawMode === 'polygon' ? 'Polygon' : 'LineString',
        coordinates: drawMode === 'polygon' 
          ? [[...currentPoints, currentPoints[0]]]
          : currentPoints
      },
      properties: { 
        type: drawMode,
        id: Date.now(),
        area: drawMode === 'polygon' ? calculatePolygonArea(currentPoints) : null
      }
    }

    setAllShapes(prev => [...prev, newShape])
    
    if (onPolygonDrawn) {
      onPolygonDrawn(newShape)
    }

    setCurrentPoints([])
    updateFinalShapes([...allShapes, newShape])
  }

  const updateFinalShapes = (shapes: any[]) => {
    if (!map.current || !map.current.isStyleLoaded()) return

    const source = map.current.getSource('drawing-source')
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: shapes
      })
    }
  }

  const calculatePolygonArea = (points: [number, number][]) => {
    let area = 0
    const j = points.length - 1

    for (let i = 0; i < points.length; i++) {
      area += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1])
    }

    return Math.abs(area / 2) * 111320 * 111320
  }

  const clearDrawing = () => {
    setCurrentPoints([])
    setAllShapes([])
    updateFinalShapes([])
  }

  const startDrawing = (mode: 'polygon' | 'line') => {
    setDrawMode(mode)
    setCurrentPoints([])
  }

  const cancelDrawing = () => {
    setDrawMode(null)
    setCurrentPoints([])
    updateFinalShapes(allShapes)
  }

  return (
    <div className={cn("relative", className)}>
      {enableDrawing && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-background/95 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          {!drawMode ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startDrawing('polygon')}
                className="border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/10"
              >
                <Polygon className="mr-2" size={16} weight="bold" />
                Polígono
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startDrawing('line')}
                className="border-[hsl(var(--solar-red))] hover:bg-[hsl(var(--solar-red))]/10"
              >
                <Pencil className="mr-2" size={16} weight="bold" />
                String
              </Button>
              {allShapes.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearDrawing}
                >
                  <Trash size={16} weight="bold" />
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="text-xs font-medium px-2 py-1 bg-primary text-primary-foreground rounded">
                Clique no mapa para adicionar pontos
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={finishDrawing}
                disabled={currentPoints.length < 2}
                className="bg-[#10B981] hover:bg-[#059669]"
              >
                <Check className="mr-2" size={16} weight="bold" />
                Concluir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelDrawing}
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      )}
      
      {allShapes.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs">
          <h4 className="text-sm font-semibold mb-2">Formas Desenhadas</h4>
          <div className="space-y-1 text-xs">
            {allShapes.map((shape, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span>
                  {shape.properties.type === 'polygon' ? '🔷 Polígono' : '📍 String'} {idx + 1}
                </span>
                {shape.properties.area && (
                  <span className="text-muted-foreground">
                    {shape.properties.area.toFixed(2)} m²
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className={cn("overflow-hidden p-0", className)}>
        <div 
          ref={mapContainer} 
          className="w-full h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
        />
      </Card>
    </div>
  )
}
