import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash, Check, MapPin, ArrowsClockwise } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Location {
  lat: number
  lon: number
  displayName: string
}

interface RoofDrawingWidgetProps {
  data: {
    location: Location
  }
  onAction?: (action: { type: string; payload: any }) => void
}

interface Point {
  lat: number
  lon: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

export function RoofDrawingWidget({ data, onAction }: RoofDrawingWidgetProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Point[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [area, setArea] = useState<number>(0)
  const [azimuth, setAzimuth] = useState<number>(0)
  const [perimeter, setPerimeter] = useState<number>(0)
  const drawingLayer = useRef<any>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initMap = () => {
      if (!window.maplibregl) {
        setTimeout(initMap, 100)
        return
      }

      map.current = new window.maplibregl.Map({
        container: mapContainer.current!,
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [data.location.lon, data.location.lat],
        zoom: 19,
        pitch: 0,
        bearing: 0
      })

      map.current.on('load', () => {
        map.current.addSource('satellite', {
          type: 'raster',
          tiles: [
            'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
          ],
          tileSize: 256
        })

        map.current.addLayer({
          id: 'satellite',
          type: 'raster',
          source: 'satellite',
          paint: {}
        })

        map.current.addSource('drawing', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        })

        map.current.addLayer({
          id: 'drawing-fill',
          type: 'fill',
          source: 'drawing',
          paint: {
            'fill-color': '#FFD60A',
            'fill-opacity': 0.4
          }
        })

        map.current.addLayer({
          id: 'drawing-outline',
          type: 'line',
          source: 'drawing',
          paint: {
            'line-color': '#FF3D3D',
            'line-width': 3
          }
        })

        map.current.addLayer({
          id: 'drawing-points',
          type: 'circle',
          source: 'drawing',
          paint: {
            'circle-radius': 6,
            'circle-color': '#FF0066',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF'
          },
          filter: ['==', '$type', 'Point']
        })
      })

      map.current.on('click', handleMapClick)
    }

    initMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [data.location])

  const handleMapClick = (e: any) => {
    if (!isDrawing) return

    const { lng, lat } = e.lngLat
    const newPoint = { lat, lon: lng }

    if (points.length > 2) {
      const firstPoint = points[0]
      const distance = calculateDistance(lat, lng, firstPoint.lat, firstPoint.lon)
      
      if (distance < 0.00005) {
        completeDrawing()
        return
      }
    }

    setPoints(prev => [...prev, newPoint])
    updateDrawingLayer([...points, newPoint])
  }

  const updateDrawingLayer = (currentPoints: Point[]) => {
    if (!map.current) return

    const coordinates = currentPoints.map(p => [p.lon, p.lat])
    
    const features: any[] = []

    if (coordinates.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      })
    }

    if (coordinates.length >= 3 && isComplete) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...coordinates, coordinates[0]]]
        }
      })
    }

    currentPoints.forEach(point => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lon, point.lat]
        }
      })
    })

    const source = map.current.getSource('drawing')
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: features
      })
    }
  }

  const completeDrawing = () => {
    if (points.length < 3) {
      toast.error("Desenhe pelo menos 3 pontos para formar um polígono")
      return
    }

    setIsDrawing(false)
    setIsComplete(true)

    const calculatedArea = calculateArea(points)
    const calculatedPerimeter = calculatePerimeter(points)
    const calculatedAzimuth = calculateAzimuth(points)

    setArea(calculatedArea)
    setPerimeter(calculatedPerimeter)
    setAzimuth(calculatedAzimuth)

    updateDrawingLayer(points)

    toast.success(`Telhado desenhado: ${calculatedArea.toFixed(1)} m²`)

    onAction?.({
      type: "drawing_complete",
      payload: {
        area: calculatedArea,
        perimeter: calculatedPerimeter,
        azimuth: calculatedAzimuth,
        coordinates: points.map(p => [p.lat, p.lon])
      }
    })
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const calculateArea = (polygon: Point[]) => {
    if (polygon.length < 3) return 0

    let area = 0
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length
      const xi = polygon[i].lon * Math.PI / 180
      const yi = polygon[i].lat * Math.PI / 180
      const xj = polygon[j].lon * Math.PI / 180
      const yj = polygon[j].lat * Math.PI / 180

      area += xi * yj - xj * yi
    }

    area = Math.abs(area) / 2
    const R = 6371000
    return area * R * R * Math.cos(polygon[0].lat * Math.PI / 180)
  }

  const calculatePerimeter = (polygon: Point[]) => {
    let perimeter = 0
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length
      perimeter += calculateDistance(
        polygon[i].lat,
        polygon[i].lon,
        polygon[j].lat,
        polygon[j].lon
      )
    }
    return perimeter
  }

  const calculateAzimuth = (polygon: Point[]) => {
    if (polygon.length < 2) return 0

    const p1 = polygon[0]
    const p2 = polygon[1]

    const dLon = (p2.lon - p1.lon) * Math.PI / 180
    const lat1 = p1.lat * Math.PI / 180
    const lat2 = p2.lat * Math.PI / 180

    const y = Math.sin(dLon) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

    let azimuth = Math.atan2(y, x) * 180 / Math.PI
    azimuth = (azimuth + 360) % 360

    return Math.round(azimuth)
  }

  const getOrientationLabel = (azimuthValue: number) => {
    if (azimuthValue >= 337.5 || azimuthValue < 22.5) return "Norte"
    if (azimuthValue >= 22.5 && azimuthValue < 67.5) return "Nordeste"
    if (azimuthValue >= 67.5 && azimuthValue < 112.5) return "Leste"
    if (azimuthValue >= 112.5 && azimuthValue < 157.5) return "Sudeste"
    if (azimuthValue >= 157.5 && azimuthValue < 202.5) return "Sul"
    if (azimuthValue >= 202.5 && azimuthValue < 247.5) return "Sudoeste"
    if (azimuthValue >= 247.5 && azimuthValue < 292.5) return "Oeste"
    return "Noroeste"
  }

  const getQualityScore = (azimuthValue: number) => {
    const deviation = Math.min(Math.abs(azimuthValue), Math.abs(360 - azimuthValue))
    return Math.max(0, Math.round(100 - (deviation / 180) * 100))
  }

  const handleStartDrawing = () => {
    setIsDrawing(true)
    setPoints([])
    setIsComplete(false)
    setArea(0)
    setAzimuth(0)
    setPerimeter(0)
    toast.info("Clique nos cantos do telhado. Clique no primeiro ponto novamente para fechar o polígono.")
  }

  const handleClearDrawing = () => {
    setIsDrawing(false)
    setPoints([])
    setIsComplete(false)
    setArea(0)
    setAzimuth(0)
    setPerimeter(0)
    
    const source = map.current?.getSource('drawing')
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      })
    }
  }

  const handleRedraw = () => {
    handleClearDrawing()
    handleStartDrawing()
  }

  const orientationLabel = getOrientationLabel(azimuth)
  const qualityScore = getQualityScore(azimuth)

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="max-w-4xl border-2 shadow-xl overflow-hidden bg-card">
        <div className="bg-gradient-to-br from-[hsl(var(--solar-yellow))]/20 via-[hsl(var(--solar-red))]/10 to-[hsl(var(--solar-pink))]/20 p-6 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.08, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Pencil className="text-white" size={24} weight="fill" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Desenhar Telhado</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Contorne o telhado no mapa para calcular a área
                </p>
              </div>
            </div>
            {!isComplete && (
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={isDrawing ? "default" : "outline"}
                    size="sm"
                    onClick={isDrawing ? completeDrawing : handleStartDrawing}
                    disabled={isDrawing && points.length < 3}
                    className={isDrawing ? "bg-gradient-solar-r" : ""}
                  >
                    {isDrawing ? (
                      <>
                        <Check className="mr-2" size={18} weight="bold" />
                        Finalizar
                      </>
                    ) : (
                      <>
                        <Pencil className="mr-2" size={18} weight="bold" />
                        Iniciar Desenho
                      </>
                    )}
                  </Button>
                </motion.div>
                {points.length > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearDrawing}
                    >
                      <Trash className="mr-2" size={18} weight="bold" />
                      Limpar
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
            {isComplete && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedraw}
                >
                  <ArrowsClockwise className="mr-2" size={18} weight="bold" />
                  Redesenhar
                </Button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm bg-background/60 backdrop-blur-sm rounded-lg p-3">
            <MapPin size={16} weight="fill" className="text-accent flex-shrink-0" />
            <p className="text-foreground font-medium truncate">{data.location.displayName}</p>
          </div>
        </div>

        <div className="relative">
          <div ref={mapContainer} className="w-full h-[500px]" />
          
          {isDrawing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-6 py-3 rounded-xl shadow-xl font-bold text-sm"
            >
              {points.length === 0 && "Clique para adicionar o primeiro ponto"}
              {points.length === 1 && "Continue clicando para desenhar o contorno"}
              {points.length === 2 && "Clique mais pontos ou no primeiro ponto para fechar"}
              {points.length >= 3 && "Clique no primeiro ponto para fechar ou continue adicionando"}
            </motion.div>
          )}

          {isDrawing && points.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 right-4 bg-background/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg"
            >
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                Pontos Marcados
              </p>
              <p className="text-2xl font-bold text-foreground">{points.length}</p>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 space-y-4 border-t border-border/40"
            >
              <div>
                <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                  📐 Medições do Telhado
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/40 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Área Total
                    </p>
                    <p className="text-3xl font-bold text-foreground">{area.toFixed(1)} m²</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Orientação
                    </p>
                    <p className="text-2xl font-bold text-foreground">{orientationLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {azimuth}° • Qualidade: {qualityScore}%
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Perímetro
                    </p>
                    <p className="text-3xl font-bold text-foreground">{perimeter.toFixed(1)} m</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                qualityScore >= 85 ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' :
                qualityScore >= 65 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' :
                'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {qualityScore >= 85 ? '🌟' : qualityScore >= 65 ? '✨' : '💡'}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold mb-1 ${
                      qualityScore >= 85 ? 'text-green-800 dark:text-green-200' :
                      qualityScore >= 65 ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-orange-800 dark:text-orange-200'
                    }`}>
                      {qualityScore >= 85 ? 'Excelente orientação solar!' :
                       qualityScore >= 65 ? 'Boa orientação solar' :
                       'Orientação regular para solar'}
                    </p>
                    <p className={`text-xs ${
                      qualityScore >= 85 ? 'text-green-700 dark:text-green-300' :
                      qualityScore >= 65 ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-orange-700 dark:text-orange-300'
                    }`}>
                      {qualityScore >= 85 ? 'Este telhado está muito bem orientado para captação solar, com máximo aproveitamento da irradiação.' :
                       qualityScore >= 65 ? 'A orientação permite boa captação solar, com pequena perda em relação ao ideal.' :
                       'A orientação não é ideal, mas ainda é viável para geração solar fotovoltaica.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
