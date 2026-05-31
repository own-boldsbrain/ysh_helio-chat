import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cube, Lightning, SunHorizon, ArrowsClockwise } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { MAP_COLORS, SOLAR_COLORS } from "@/lib/solar-colors"

interface RooftopVisualization3DProps {
  systemSize?: number
  panelCount?: number
  location?: { lat: number; lng: number }
  address?: string
}

export function RooftopVisualization3D({ 
  systemSize = 10, 
  panelCount = 22,
  location = { lat: -19.9167, lng: -43.9345 },
  address = "Belo Horizonte, MG"
}: RooftopVisualization3DProps) {
  const [currentView, setCurrentView] = useState<"aerial" | "south" | "east">("aerial")
  const [isLoading, setIsLoading] = useState(true)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const initializeMap = async () => {
      if (typeof window === 'undefined' || !window.maplibregl) {
        console.error('MapLibre GL not loaded')
        setIsLoading(false)
        return
      }

      try {
        const map = new window.maplibregl.Map({
          container: mapContainerRef.current!,
          style: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
          center: [location.lng, location.lat],
          zoom: 19,
          pitch: 60,
          bearing: 0,
          antialias: true
        })

        map.on('load', () => {
          map.addLayer({
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                15.05, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          })

          const panelWidth = 0.00001
          const panelLength = 0.00002
          const cols = Math.ceil(Math.sqrt(panelCount))
          const rows = Math.ceil(panelCount / cols)

          const coordinates: [number, number][][][] = []
          for (let i = 0; i < panelCount; i++) {
            const row = Math.floor(i / cols)
            const col = i % cols
            const offsetLat = row * panelLength
            const offsetLng = col * panelWidth
            
            coordinates.push([
              [
                [location.lng + offsetLng, location.lat + offsetLat] as [number, number],
                [location.lng + offsetLng + panelWidth, location.lat + offsetLat] as [number, number],
                [location.lng + offsetLng + panelWidth, location.lat + offsetLat + panelLength] as [number, number],
                [location.lng + offsetLng, location.lat + offsetLat + panelLength] as [number, number],
                [location.lng + offsetLng, location.lat + offsetLat] as [number, number]
              ]
            ])
          }

          map.addSource('solar-panels', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': coordinates.map((coords, i) => ({
                'type': 'Feature',
                'properties': {
                  'height': 0.3,
                  'base': 6,
                  'panel': i + 1
                },
                'geometry': {
                  'type': 'Polygon',
                  'coordinates': coords
                }
              }))
            }
          })

          map.addLayer({
            'id': 'solar-panels-3d',
            'type': 'fill-extrusion',
            'source': 'solar-panels',
            'paint': {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'panel'],
                1, MAP_COLORS.polygon,
                panelCount / 2, MAP_COLORS.horizonStroke,
                panelCount, SOLAR_COLORS.pink
              ],
              'fill-extrusion-height': 6.3,
              'fill-extrusion-base': 6,
              'fill-extrusion-opacity': 0.9
            }
          })

          new window.maplibregl.Marker({ color: MAP_COLORS.polygon })
            .setLngLat([location.lng, location.lat])
            .addTo(map)

          setIsLoading(false)
        })

        mapRef.current = map

        return () => map.remove()
      } catch (error) {
        console.error('Error initializing map:', error)
        setIsLoading(false)
      }
    }

    initializeMap()
  }, [location.lat, location.lng, panelCount])

  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current
    
    const viewSettings = {
      aerial: { pitch: 60, bearing: 0, zoom: 19 },
      south: { pitch: 75, bearing: 180, zoom: 20 },
      east: { pitch: 75, bearing: -90, zoom: 20 }
    }

    const settings = viewSettings[currentView]
    
    map.easeTo({
      pitch: settings.pitch,
      bearing: settings.bearing,
      zoom: settings.zoom,
      duration: 1500
    })
  }, [currentView])

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cube size={24} className="text-accent" />
              Visualização 3D do Telhado
            </CardTitle>
            <CardDescription className="mt-2">{address}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <Lightning size={14} />
              {systemSize} kWp
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <SunHorizon size={14} />
              {panelCount} painéis
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="px-6">
          <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="aerial">Vista Aérea</TabsTrigger>
              <TabsTrigger value="south">Vista Sul</TabsTrigger>
              <TabsTrigger value="east">Vista Leste</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[500px] bg-muted"
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center space-y-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowsClockwise size={48} className="text-accent mx-auto" />
                </motion.div>
                <p className="text-sm text-muted-foreground">Carregando visualização 3D...</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            className="p-4 bg-gradient-to-br from-[hsl(var(--solar-yellow))]/10 to-[hsl(var(--solar-orange))]/10 rounded-lg border border-[hsl(var(--solar-yellow))]/20"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Área Ocupada</p>
            <p className="text-xl font-bold">{(panelCount * 2.2).toFixed(1)} m²</p>
          </motion.div>
          
          <motion.div 
            className="p-4 bg-gradient-to-br from-[hsl(var(--solar-red))]/10 to-[hsl(var(--solar-pink))]/10 rounded-lg border border-[hsl(var(--solar-red))]/20"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Produção Anual</p>
            <p className="text-xl font-bold">{(systemSize * 1320).toFixed(0)} kWh</p>
          </motion.div>
          
          <motion.div 
            className="p-4 bg-gradient-to-br from-[#00D98C]/10 to-[#00A86B]/10 rounded-lg border border-[#00D98C]/20"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Economia Anual</p>
            <p className="text-xl font-bold">R$ {(systemSize * 1320 * 0.75).toFixed(0)}</p>
          </motion.div>
        </div>

        <div className="px-6 pb-6">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Detalhes do Dimensionamento</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Orientação</p>
                <p className="font-medium">Norte (Ótimo)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Inclinação</p>
                <p className="font-medium">20° (Recomendado)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Irradiação Média</p>
                <p className="font-medium">5.2 kWh/m²/dia</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fator de Sombreamento</p>
                <p className="font-medium">2% (Muito Baixo)</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
