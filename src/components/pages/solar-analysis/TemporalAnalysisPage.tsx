import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { List, CalendarBlank, SlidersHorizontal, CloudArrowDown, PlayCircle, PauseCircle, ArrowsClockwise, TrendUp, TrendDown, Minus, Leaf, Buildings, TreeEvergreen, ChartLine, Download, MapPin, Sparkle, ArrowsLeftRight } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useKV } from "@github/spark/hooks"
import { ImageComparisonSlider } from "@/components/solar/ImageComparisonSlider"

declare const maplibregl: any

interface TemporalAnalysisPageProps {
  onToggleSidebar: () => void
}

interface SatelliteImage {
  id: string
  date: string
  timestamp: number
  source: "Sentinel-2" | "CBERS-4" | "Landsat-8"
  cloudCoverage: number
  resolution: string
  url: string
  thumbnail: string
  collection?: string
  ndvi?: number
  ndbi?: number
  ndwi?: number
  metadata?: {
    bbox?: number[]
    assets?: Record<string, any>
    stacUrl?: string
  }
}

interface ChangeDetection {
  type: "vegetation_gain" | "vegetation_loss" | "construction" | "deforestation" | "urbanization" | "water_change"
  area: number
  location: { lat: number; lon: number }
  severity: "low" | "medium" | "high"
  confidence: number
  changeValue: number
  period: { start: string; end: string }
}

interface TimeSeriesData {
  date: string
  ndvi: number
  ndbi: number
  ndwi: number
  ghi?: number
}

interface AnalysisResult {
  changes: ChangeDetection[]
  timeSeries: TimeSeriesData[]
  statistics: {
    meanNDVI: number
    meanNDBI: number
    meanNDWI: number
    trend: "increasing" | "decreasing" | "stable"
    trendValue: number
  }
}

export function TemporalAnalysisPage({ onToggleSidebar }: TemporalAnalysisPageProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [dateRange, setDateRange] = useState<[string, string]>(["2020-01", "2024-12"])
  const [selectedSource, setSelectedSource] = useState<"all" | "Sentinel-2" | "CBERS-4" | "Landsat-8">("all")
  const [timelinePosition, setTimelinePosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedMetric, setSelectedMetric] = useState<"ndvi" | "ndbi" | "ndwi" | "rgb">("ndvi")
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const [availableImages, setAvailableImages] = useState<SatelliteImage[]>([])
  const [currentImage, setCurrentImage] = useState<SatelliteImage | null>(null)
  const [changeDetections, setChangeDetections] = useState<ChangeDetection[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showChangeLayer, setShowChangeLayer] = useState(true)
  const [analysisHistory, setAnalysisHistory] = useKV<any[]>("temporal-analysis-history", [])
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonImages, setComparisonImages] = useState<{ before: SatelliteImage | null; after: SatelliteImage | null }>({
    before: null,
    after: null
  })

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      center: [-47.8825, -15.7942],
      zoom: 11,
      pitch: 0,
      maxPitch: 85,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tiles.openfreemap.org/styles/bright/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
          },
          satelliteSource: {
            type: "raster",
            tiles: [
              "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg"
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: "satellite",
            type: "raster",
            source: "satelliteSource",
            paint: {
              "raster-opacity": 0.7
            }
          }
        ]
      }
    })

    map.current.addControl(new maplibregl.NavigationControl(), "top-right")
    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    })
    map.current.addControl(geolocateControl, "top-right")

    map.current.on("click", (e) => {
      setSelectedLocation({ lat: e.lngLat.lat, lon: e.lngLat.lng })
      
      if (map.current) {
        const markers = document.getElementsByClassName("maplibregl-marker")
        while (markers.length > 0) {
          markers[0].remove()
        }

        new maplibregl.Marker({ color: "#FFD60A" })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map.current)
      }
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      loadAvailableImages()
    }
  }, [selectedLocation, selectedSource])

  const loadAvailableImages = async () => {
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockImages: SatelliteImage[] = [
      {
        id: "s2-2020-01",
        date: "2020-01-15",
        timestamp: new Date("2020-01-15").getTime(),
        source: "Sentinel-2",
        cloudCoverage: 5,
        resolution: "10m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/sentinel2-2020-01-thumb.jpg",
        collection: "sentinel-2-l2a",
        ndvi: 0.72,
        ndbi: 0.15,
        ndwi: 0.32
      },
      {
        id: "s2-2020-07",
        date: "2020-07-15",
        timestamp: new Date("2020-07-15").getTime(),
        source: "Sentinel-2",
        cloudCoverage: 12,
        resolution: "10m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/sentinel2-2020-07-thumb.jpg",
        collection: "sentinel-2-l2a",
        ndvi: 0.68,
        ndbi: 0.18,
        ndwi: 0.28
      },
      {
        id: "c4-2021-01",
        date: "2021-01-10",
        timestamp: new Date("2021-01-10").getTime(),
        source: "CBERS-4",
        cloudCoverage: 8,
        resolution: "20m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/cbers4-2021-01-thumb.jpg",
        collection: "cbers-4-mux",
        ndvi: 0.65,
        ndbi: 0.22,
        ndwi: 0.25
      },
      {
        id: "s2-2021-07",
        date: "2021-07-20",
        timestamp: new Date("2021-07-20").getTime(),
        source: "Sentinel-2",
        cloudCoverage: 3,
        resolution: "10m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/sentinel2-2021-07-thumb.jpg",
        collection: "sentinel-2-l2a",
        ndvi: 0.58,
        ndbi: 0.28,
        ndwi: 0.22
      },
      {
        id: "s2-2022-01",
        date: "2022-01-25",
        timestamp: new Date("2022-01-25").getTime(),
        source: "Sentinel-2",
        cloudCoverage: 15,
        resolution: "10m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/sentinel2-2022-01-thumb.jpg",
        collection: "sentinel-2-l2a",
        ndvi: 0.52,
        ndbi: 0.35,
        ndwi: 0.18
      },
      {
        id: "c4-2022-07",
        date: "2022-07-12",
        timestamp: new Date("2022-07-12").getTime(),
        source: "CBERS-4",
        cloudCoverage: 6,
        resolution: "20m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/cbers4-2022-07-thumb.jpg",
        collection: "cbers-4-mux",
        ndvi: 0.48,
        ndbi: 0.42,
        ndwi: 0.15
      },
      {
        id: "s2-2023-01",
        date: "2023-01-18",
        timestamp: new Date("2023-01-18").getTime(),
        source: "Sentinel-2",
        cloudCoverage: 4,
        resolution: "10m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/sentinel2-2023-01-thumb.jpg",
        collection: "sentinel-2-l2a",
        ndvi: 0.45,
        ndbi: 0.48,
        ndwi: 0.12
      },
      {
        id: "s2-2023-07",
        date: "2023-07-22",
        timestamp: new Date("2023-07-22").getTime(),
        source: "Sentinel-2",
        cloudCoverage: 9,
        resolution: "10m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/sentinel2-2023-07-thumb.jpg",
        collection: "sentinel-2-l2a",
        ndvi: 0.41,
        ndbi: 0.52,
        ndwi: 0.10
      },
      {
        id: "c4-2024-01",
        date: "2024-01-14",
        timestamp: new Date("2024-01-14").getTime(),
        source: "CBERS-4",
        cloudCoverage: 7,
        resolution: "20m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/cbers4-2024-01-thumb.jpg",
        collection: "cbers-4-mux",
        ndvi: 0.38,
        ndbi: 0.55,
        ndwi: 0.08
      },
      {
        id: "s2-2024-07",
        date: "2024-07-28",
        timestamp: new Date("2024-07-28").getTime(),
        source: "Sentinel-2",
        cloudCoverage: 2,
        resolution: "10m",
        url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        thumbnail: "https://cdn.yellosolarhub.com/satellite/sentinel2-2024-07-thumb.jpg",
        collection: "sentinel-2-l2a",
        ndvi: 0.35,
        ndbi: 0.58,
        ndwi: 0.06
      }
    ]

    const filteredImages = selectedSource === "all" 
      ? mockImages 
      : mockImages.filter(img => img.source === selectedSource)
    
    setAvailableImages(filteredImages.sort((a, b) => a.timestamp - b.timestamp))
    setCurrentImage(filteredImages[0])
    
    const mockTimeSeries: TimeSeriesData[] = filteredImages.map(img => ({
      date: img.date,
      ndvi: img.ndvi || 0,
      ndbi: img.ndbi || 0,
      ndwi: img.ndwi || 0
    }))
    
    setTimeSeriesData(mockTimeSeries)
    
    const mockChanges: ChangeDetection[] = [
      {
        type: "deforestation",
        area: 2.4,
        location: { lat: selectedLocation!.lat + 0.01, lon: selectedLocation!.lon + 0.01 },
        severity: "high",
        confidence: 94,
        changeValue: -0.37,
        period: { start: "2020-01-15", end: "2024-07-28" }
      },
      {
        type: "construction",
        area: 0.8,
        location: { lat: selectedLocation!.lat - 0.005, lon: selectedLocation!.lon + 0.008 },
        severity: "medium",
        confidence: 87,
        changeValue: 0.43,
        period: { start: "2021-07-20", end: "2023-07-22" }
      },
      {
        type: "urbanization",
        area: 1.5,
        location: { lat: selectedLocation!.lat + 0.008, lon: selectedLocation!.lon - 0.01 },
        severity: "medium",
        confidence: 91,
        changeValue: 0.40,
        period: { start: "2020-01-15", end: "2024-07-28" }
      }
    ]
    
    setChangeDetections(mockChanges)
    setIsLoading(false)
    
    toast.success(`${filteredImages.length} imagens encontradas para análise temporal`)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    if (!isPlaying || availableImages.length === 0) return

    const interval = setInterval(() => {
      setTimelinePosition(prev => {
        const next = prev + 1
        if (next >= availableImages.length) {
          setIsPlaying(false)
          return availableImages.length - 1
        }
        setCurrentImage(availableImages[next])
        return next
      })
    }, 1000 / playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, availableImages])

  const handleTimelineChange = (value: number[]) => {
    const position = value[0]
    setTimelinePosition(position)
    setCurrentImage(availableImages[position])
  }

  const handleAnalyzeChanges = async () => {
    if (availableImages.length < 2) {
      toast.error("Selecione pelo menos 2 imagens para análise de mudanças")
      return
    }

    setIsAnalyzing(true)
    toast.info("Analisando mudanças temporais com IA...")
    
    try {
      const firstImage = availableImages[0]
      const lastImage = availableImages[availableImages.length - 1]
      
      const promptText = `Analise as mudanças temporais detectadas em imagens de satélite entre ${firstImage.date} e ${lastImage.date}.
      
Localização: Lat ${selectedLocation!.lat.toFixed(4)}, Lon ${selectedLocation!.lon.toFixed(4)}

Dados das imagens:
${availableImages.map(img => `- ${img.date}: NDVI=${img.ndvi?.toFixed(2)}, NDBI=${img.ndbi?.toFixed(2)}, NDWI=${img.ndwi?.toFixed(2)}, Nuvens=${img.cloudCoverage}%`).join('\n')}

Mudanças detectadas:
${changeDetections.map(c => `- ${c.type}: ${c.area}km² (${c.severity} severity, ${c.confidence}% confidence)`).join('\n')}

Gere um relatório conciso de análise temporal em português brasileiro incluindo:
1. Principais mudanças observadas (vegetação, urbanização, construção)
2. Tendências dos índices espectrais (NDVI, NDBI, NDWI)
3. Impacto para instalação de sistemas solares fotovoltaicos
4. Recomendações técnicas

Limite a 4 parágrafos curtos.`

      const analysis = await window.spark.llm(promptText, "gpt-4o")
      
      const ndviValues = timeSeriesData.map(d => d.ndvi)
      const meanNDVI = ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length
      const ndviTrend = ndviValues[ndviValues.length - 1] - ndviValues[0]
      
      const result: AnalysisResult = {
        changes: changeDetections,
        timeSeries: timeSeriesData,
        statistics: {
          meanNDVI,
          meanNDBI: timeSeriesData.reduce((a, b) => a + b.ndbi, 0) / timeSeriesData.length,
          meanNDWI: timeSeriesData.reduce((a, b) => a + b.ndwi, 0) / timeSeriesData.length,
          trend: ndviTrend > 0.1 ? "increasing" : ndviTrend < -0.1 ? "decreasing" : "stable",
          trendValue: ndviTrend
        }
      }
      
      setAnalysisResult(result)
      
      setAnalysisHistory(prev => [{
        id: Date.now().toString(),
        location: selectedLocation,
        date: new Date().toISOString(),
        result,
        analysis
      }, ...(prev || []).slice(0, 9)])
      
      toast.success("Análise de mudanças concluída", {
        description: analysis.substring(0, 100) + "..."
      })
    } catch (error) {
      toast.error("Erro ao analisar mudanças")
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getChangeIcon = (type: ChangeDetection["type"]) => {
    switch (type) {
      case "vegetation_gain": return <Leaf className="text-success" size={20} weight="fill" />
      case "vegetation_loss": return <Leaf className="text-destructive" size={20} weight="fill" />
      case "construction": return <Buildings className="text-warning" size={20} weight="fill" />
      case "deforestation": return <TreeEvergreen className="text-destructive" size={20} weight="fill" />
      case "urbanization": return <Buildings className="text-info" size={20} weight="fill" />
      case "water_change": return <TrendUp className="text-blue-500" size={20} weight="fill" />
    }
  }

  const getChangeLabel = (type: ChangeDetection["type"]) => {
    const labels = {
      vegetation_gain: "Crescimento de Vegetação",
      vegetation_loss: "Perda de Vegetação",
      construction: "Nova Construção",
      deforestation: "Desmatamento",
      urbanization: "Urbanização",
      water_change: "Mudança Hídrica"
    }
    return labels[type]
  }

  const getSeverityColor = (severity: ChangeDetection["severity"]) => {
    const colors = {
      low: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
      high: "bg-red-500/10 text-red-700 dark:text-red-300"
    }
    return colors[severity]
  }

  const handleCompareImages = () => {
    if (availableImages.length < 2) {
      toast.error("Selecione pelo menos 2 imagens para comparar")
      return
    }

    setComparisonImages({
      before: availableImages[0],
      after: availableImages[availableImages.length - 1]
    })
    setShowComparison(true)
  }

  const handleComparisonAnalysis = async () => {
    if (!comparisonImages.before || !comparisonImages.after) return

    setShowComparison(false)
    await handleAnalyzeChanges()
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-accent/10"
            aria-label="Abrir menu de navegação"
          >
            <List size={22} weight="bold" />
          </Button>
          <div>
            <h1 className="text-lg font-bold bg-gradient-solar-r bg-clip-text text-transparent">
              Análise Temporal de Satélite
            </h1>
            <p className="text-xs text-muted-foreground">
              Detecte mudanças ao longo do tempo com imagens Sentinel-2 e CBERS-4
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />
          
          {!selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
            >
              <Card className="w-80 shadow-2xl border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarBlank className="text-accent" size={24} weight="bold" />
                    Selecione uma Localização
                  </CardTitle>
                  <CardDescription>
                    Clique no mapa para iniciar a análise temporal
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {currentImage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 right-4 md:right-auto"
            >
              <Card className="md:w-96 shadow-lg backdrop-blur-xl bg-card/90">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{new Date(currentImage.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">{currentImage.source} • {currentImage.resolution} • {currentImage.cloudCoverage}% nuvens</p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10">
                      {timelinePosition + 1}/{availableImages.length}
                    </Badge>
                  </div>

                  {currentImage.ndvi !== undefined && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-500/10 rounded-lg p-2">
                        <p className="text-muted-foreground">NDVI</p>
                        <p className="font-bold text-green-700 dark:text-green-300">{currentImage.ndvi.toFixed(2)}</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-2">
                        <p className="text-muted-foreground">NDBI</p>
                        <p className="font-bold text-orange-700 dark:text-orange-300">{currentImage.ndbi?.toFixed(2)}</p>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-2">
                        <p className="text-muted-foreground">NDWI</p>
                        <p className="font-bold text-blue-700 dark:text-blue-300">{currentImage.ndwi?.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePlayPause}
                      disabled={isLoading || availableImages.length === 0}
                    >
                      {isPlaying ? (
                        <PauseCircle size={18} weight="fill" />
                      ) : (
                        <PlayCircle size={18} weight="fill" />
                      )}
                    </Button>

                    <Slider
                      value={[timelinePosition]}
                      onValueChange={handleTimelineChange}
                      max={Math.max(0, availableImages.length - 1)}
                      step={1}
                      disabled={isLoading || isPlaying}
                      className="flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Velocidade:</span>
                    {[0.5, 1, 2, 4].map(speed => (
                      <Button
                        key={speed}
                        size="sm"
                        variant={playbackSpeed === speed ? "default" : "outline"}
                        onClick={() => setPlaybackSpeed(speed)}
                        className="h-6 px-2"
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="w-full md:w-96 border-l border-border/40 bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border/40">
            <h3 className="font-semibold flex items-center gap-2">
              <SlidersHorizontal size={20} weight="bold" />
              Controles de Análise
            </h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Fonte de Dados</label>
                <Select value={selectedSource} onValueChange={(value: any) => setSelectedSource(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Fontes</SelectItem>
                    <SelectItem value="Sentinel-2">Sentinel-2 (ESA)</SelectItem>
                    <SelectItem value="CBERS-4">CBERS-4 (INPE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Métrica de Análise</label>
                <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ndvi">NDVI (Vegetação)</SelectItem>
                    <SelectItem value="ndbi">NDBI (Construções)</SelectItem>
                    <SelectItem value="ndwi">NDWI (Água)</SelectItem>
                    <SelectItem value="rgb">RGB (Natural)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Imagens Disponíveis</h4>
                  <Badge variant="secondary">{availableImages.length}</Badge>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <ArrowsClockwise className="animate-spin text-accent" size={32} weight="bold" />
                  </div>
                ) : availableImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Selecione uma localização no mapa
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableImages.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            currentImage?.id === image.id ? "ring-2 ring-accent" : ""
                          }`}
                          onClick={() => {
                            setTimelinePosition(index)
                            setCurrentImage(image)
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(image.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-muted-foreground">{image.source}</p>
                              </div>
                              <Badge variant={image.cloudCoverage < 10 ? "default" : "secondary"}>
                                {image.cloudCoverage}% ☁️
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {availableImages.length >= 2 && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleCompareImages}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowsLeftRight size={18} weight="bold" className="mr-2" />
                      Comparar
                    </Button>
                    <Button
                      onClick={handleAnalyzeChanges}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-solar-r hover:opacity-90"
                    >
                      {isAnalyzing ? (
                        <>
                          <ArrowsClockwise size={18} weight="bold" className="mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkle size={18} weight="fill" className="mr-2" />
                          Analisar IA
                        </>
                      )}
                    </Button>
                  </div>

                  <Separator />

                  <Tabs defaultValue="changes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="changes">Mudanças</TabsTrigger>
                      <TabsTrigger value="series">Séries</TabsTrigger>
                    </TabsList>

                    <TabsContent value="changes" className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Mudanças Detectadas</h4>
                        <Badge variant="secondary">{changeDetections.length}</Badge>
                      </div>

                      {changeDetections.length > 0 && (
                        <div className="space-y-2">
                          {changeDetections.map((change, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-3 space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      {getChangeIcon(change.type)}
                                      <div>
                                        <p className="text-sm font-medium">{getChangeLabel(change.type)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Área: {change.area.toFixed(2)} km²
                                        </p>
                                      </div>
                                    </div>
                                    <Badge className={getSeverityColor(change.severity)}>
                                      {change.severity}
                                    </Badge>
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span>Confiança:</span>
                                      <span className="font-medium">{change.confidence}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span>Mudança:</span>
                                      <span className={`font-medium ${change.changeValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {change.changeValue > 0 ? '+' : ''}{(change.changeValue * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="text-muted-foreground pt-1 border-t">
                                      <p>{new Date(change.period.start).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} → {new Date(change.period.end).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="series" className="space-y-3 mt-4">
                      {analysisResult && (
                        <>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Estatísticas</h4>
                            <Card>
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">NDVI Médio</span>
                                  <span className="font-medium text-green-700 dark:text-green-300">
                                    {analysisResult.statistics.meanNDVI.toFixed(3)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">NDBI Médio</span>
                                  <span className="font-medium text-orange-700 dark:text-orange-300">
                                    {analysisResult.statistics.meanNDBI.toFixed(3)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">NDWI Médio</span>
                                  <span className="font-medium text-blue-700 dark:text-blue-300">
                                    {analysisResult.statistics.meanNDWI.toFixed(3)}
                                  </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Tendência</span>
                                  <Badge variant={analysisResult.statistics.trend === 'increasing' ? 'default' : analysisResult.statistics.trend === 'decreasing' ? 'destructive' : 'secondary'}>
                                    {analysisResult.statistics.trend === 'increasing' && <TrendUp size={14} className="mr-1" />}
                                    {analysisResult.statistics.trend === 'decreasing' && <TrendDown size={14} className="mr-1" />}
                                    {analysisResult.statistics.trend === 'stable' && <Minus size={14} className="mr-1" />}
                                    {analysisResult.statistics.trend === 'increasing' ? 'Crescimento' : analysisResult.statistics.trend === 'decreasing' ? 'Declínio' : 'Estável'}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Série Temporal</h4>
                            <div className="space-y-1">
                              {timeSeriesData.map((point, index) => (
                                <div key={index} className="text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{new Date(point.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <span className="text-muted-foreground">NDVI</span>
                                      <div className="w-full bg-green-500/20 rounded-full h-1.5 mt-1">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${point.ndvi * 100}%` }} />
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">NDBI</span>
                                      <div className="w-full bg-orange-500/20 rounded-full h-1.5 mt-1">
                                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${point.ndbi * 100}%` }} />
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">NDWI</span>
                                      <div className="w-full bg-blue-500/20 rounded-full h-1.5 mt-1">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${point.ndwi * 100}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {!analysisResult && timeSeriesData.length > 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Clique em "Analisar com IA" para gerar estatísticas
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowsLeftRight size={24} weight="bold" className="text-accent" />
              Comparação Temporal de Imagens
            </DialogTitle>
            <DialogDescription>
              Compare visualmente as mudanças entre duas datas
            </DialogDescription>
          </DialogHeader>

          {comparisonImages.before && comparisonImages.after && (
            <ImageComparisonSlider
              beforeImage={{
                url: comparisonImages.before.url,
                date: comparisonImages.before.date,
                source: comparisonImages.before.source,
                metadata: {
                  cloudCoverage: comparisonImages.before.cloudCoverage,
                  resolution: comparisonImages.before.resolution,
                  satellite: comparisonImages.before.source
                }
              }}
              afterImage={{
                url: comparisonImages.after.url,
                date: comparisonImages.after.date,
                source: comparisonImages.after.source,
                metadata: {
                  cloudCoverage: comparisonImages.after.cloudCoverage,
                  resolution: comparisonImages.after.resolution,
                  satellite: comparisonImages.after.source
                }
              }}
              title="Análise de Mudanças Temporais"
              description="Use o controle deslizante para comparar as imagens lado a lado"
              onAnalysisRequest={handleComparisonAnalysis}
            />
          )}

          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Sparkle size={16} weight="fill" className="text-accent" />
              Próximos Passos
            </h4>
            <p className="text-sm text-muted-foreground">
              Após comparar as imagens visualmente, clique em "Analisar Mudanças" para gerar um relatório detalhado com IA identificando áreas de vegetação, construção, desmatamento e urbanização.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (availableImages.length > 2) {
                    setComparisonImages({
                      before: availableImages[Math.floor(availableImages.length / 2)],
                      after: availableImages[availableImages.length - 1]
                    })
                  }
                }}
              >
                Outras Datas
              </Button>
              <Button
                size="sm"
                className="bg-gradient-solar-r hover:opacity-90 flex-1"
                onClick={handleComparisonAnalysis}
              >
                <Sparkle size={16} weight="fill" className="mr-2" />
                Analisar Mudanças com IA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
