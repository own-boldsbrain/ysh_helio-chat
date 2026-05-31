import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sun, CloudRain, Mountains, Buildings, Cube, Calculator, Download, Play, Warning, Planet } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { getBDCTileLayer, getAvailableImagery, type STACItem } from "@/lib/bdc-stac"
import { toast } from "sonner"
import { MAP_COLORS } from "@/lib/solar-colors"

interface TerrainData {
  elevation: number
  slope: number
  aspect: number
  shadingFactor: number
}

interface BuildingObstruction {
  height: number
  distance: number
  azimuth: number
  shadingImpact: number
}

interface HorizonPoint {
  azimuth: number
  elevation: number
}

interface ShadingAnalysisResult {
  annualShading: number
  monthlyShading: number[]
  hourlyShading: number[][]
  terrainImpact: number
  buildingImpact: number
  horizonProfile: HorizonPoint[]
  recommendations: string[]
}

interface ShadingAnalysis3DProps {
  location: { lat: number; lon: number; address: string }
  roofPolygon?: [number, number][]
  onAnalysisComplete?: (result: ShadingAnalysisResult) => void
}

export function ShadingAnalysis3D({ location, roofPolygon, onAnalysisComplete }: ShadingAnalysis3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<ShadingAnalysisResult | null>(null)
  const [terrainData, setTerrainData] = useState<TerrainData | null>(null)
  const [buildings, setBuildings] = useState<BuildingObstruction[]>([])
  const [selectedView, setSelectedView] = useState<"2d" | "3d" | "terrain">("3d")
  const [satelliteLayer, setSatelliteLayer] = useState<"sentinel" | "cbers" | "default">("default")
  const [availableImagery, setAvailableImagery] = useState<{
    sentinel2: STACItem[]
    cbers4: STACItem[]
  } | null>(null)
  const [isLoadingImagery, setIsLoadingImagery] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return
    if (typeof window === 'undefined' || !window.maplibregl) return

    const initializeMap = async () => {
      map.current = new window.maplibregl.Map({
        container: mapContainer.current!,
        center: [location.lon, location.lat],
        zoom: 18,
        pitch: selectedView === "3d" ? 60 : 0,
        bearing: 0,
        maxPitch: 85,
        style: "https://tiles.openfreemap.org/styles/bright",
      })

      map.current.on("load", async () => {
        if (!map.current) return

        map.current.setStyle("https://tiles.openfreemap.org/styles/bright", {
          transformStyle: (previousStyle, nextStyle) => {
            nextStyle.projection = { type: "globe" }
            nextStyle.sources = {
              ...nextStyle.sources,
              satelliteSource: {
                type: "raster",
                tiles: [
                  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
                ],
                tileSize: 256,
              },
              sentinelSource: {
                type: "raster",
                tiles: [
                  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
                ],
                tileSize: 256,
              },
              cbersSource: {
                type: "raster",
                tiles: [
                  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
                ],
                tileSize: 256,
              },
              terrainSource: {
                type: "raster-dem",
                url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
                tileSize: 256,
              },
              hillshadeSource: {
                type: "raster-dem",
                url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
                tileSize: 256,
              },
            }

            nextStyle.terrain = {
              source: "terrainSource",
              exaggeration: 1.5,
            }

            nextStyle.sky = {
              "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 2, 0],
            }

            nextStyle.layers.push({
              id: "hills",
              type: "hillshade",
              source: "hillshadeSource",
              layout: { visibility: "visible" },
              paint: { "hillshade-shadow-color": "#473B24" },
            })

            const firstNonFillLayer = nextStyle.layers.find(
              (layer) => layer.type !== "fill" && layer.type !== "background"
            )
            if (firstNonFillLayer) {
              nextStyle.layers.splice(nextStyle.layers.indexOf(firstNonFillLayer), 0, {
                id: "satellite",
                type: "raster",
                source: "satelliteSource",
                layout: { visibility: satelliteLayer === "default" ? "visible" : "none" },
                paint: { "raster-opacity": 0.8 },
              })

              nextStyle.layers.splice(nextStyle.layers.indexOf(firstNonFillLayer), 0, {
                id: "sentinel",
                type: "raster",
                source: "sentinelSource",
                layout: { visibility: satelliteLayer === "sentinel" ? "visible" : "none" },
                paint: { "raster-opacity": 0.9 },
              })

              nextStyle.layers.splice(nextStyle.layers.indexOf(firstNonFillLayer), 0, {
                id: "cbers",
                type: "raster",
                source: "cbersSource",
                layout: { visibility: satelliteLayer === "cbers" ? "visible" : "none" },
                paint: { "raster-opacity": 0.9 },
              })
            }

            return nextStyle
          },
        })

        map.current?.addControl(
          new window.maplibregl.NavigationControl({
            visualizePitch: true,
            showZoom: true,
            showCompass: true,
          }),
          "top-right"
        )

        map.current?.addControl(new window.maplibregl.TerrainControl({
          source: "terrainSource",
          exaggeration: 1.5,
        }), "top-right")

        if (roofPolygon && roofPolygon.length > 0) {
          map.current?.on("styledata", () => {
            if (!map.current?.getSource("roof-polygon")) {
              map.current?.addSource("roof-polygon", {
                type: "geojson",
                data: {
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [[...roofPolygon, roofPolygon[0]]],
                  },
                  properties: {},
                },
              })

              map.current?.addLayer({
                id: "roof-fill",
                type: "fill",
                source: "roof-polygon",
                paint: {
                  "fill-color": MAP_COLORS.polygon,
                  "fill-opacity": 0.4,
                },
              })

              map.current?.addLayer({
                id: "roof-outline",
                type: "line",
                source: "roof-polygon",
                paint: {
                  "line-color": MAP_COLORS.horizonStroke,
                  "line-width": 3,
                },
              })
            }
          })
        }

        new window.maplibregl.Marker({ color: MAP_COLORS.horizonStroke })
          .setLngLat([location.lon, location.lat])
          .addTo(map.current)

        loadBDCImagery()
      })
    }

    initializeMap()

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [location, roofPolygon])

  useEffect(() => {
    if (map.current && satelliteLayer) {
      if (map.current.getLayer("satellite")) {
        map.current.setLayoutProperty("satellite", "visibility", satelliteLayer === "default" ? "visible" : "none")
      }
      if (map.current.getLayer("sentinel")) {
        map.current.setLayoutProperty("sentinel", "visibility", satelliteLayer === "sentinel" ? "visible" : "none")
      }
      if (map.current.getLayer("cbers")) {
        map.current.setLayoutProperty("cbers", "visibility", satelliteLayer === "cbers" ? "visible" : "none")
      }
    }
  }, [satelliteLayer])

  useEffect(() => {
    if (map.current && selectedView) {
      const targetPitch = selectedView === "3d" ? 60 : selectedView === "terrain" ? 70 : 0
      const targetBearing = selectedView === "terrain" ? 45 : 0
      
      map.current.easeTo({
        pitch: targetPitch,
        bearing: targetBearing,
        duration: 1000,
      })
    }
  }, [selectedView])

  const loadBDCImagery = async () => {
    setIsLoadingImagery(true)
    try {
      toast.info("Buscando imagens Sentinel-2 e CBERS-4 disponíveis...")
      const imagery = await getAvailableImagery(location.lat, location.lon, 0.05)
      setAvailableImagery(imagery)
      
      if (imagery.sentinel2.length > 0 || imagery.cbers4.length > 0) {
        toast.success(`Encontradas ${imagery.sentinel2.length} imagens Sentinel-2 e ${imagery.cbers4.length} imagens CBERS-4`)
      } else {
        toast.warning("Nenhuma imagem disponível para esta região")
      }
    } catch (error) {
      console.error("Erro ao buscar imagens BDC:", error)
      toast.error("Erro ao carregar imagens do Brazil Data Cube")
    } finally {
      setIsLoadingImagery(false)
    }
  }

  const simulateTerrainAnalysis = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const elevation = 700 + Math.random() * 200
    const slope = Math.random() * 15
    const aspect = Math.random() * 360
    const shadingFactor = 1 - (slope / 100) * 0.3
    
    setTerrainData({
      elevation,
      slope,
      aspect,
      shadingFactor,
    })
  }

  const simulateBuildingAnalysis = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockBuildings: BuildingObstruction[] = [
      { height: 12, distance: 25, azimuth: 180, shadingImpact: 0.15 },
      { height: 8, distance: 35, azimuth: 225, shadingImpact: 0.08 },
      { height: 15, distance: 40, azimuth: 270, shadingImpact: 0.12 },
    ]
    setBuildings(mockBuildings)
  }

  const simulateHorizonProfile = async (): Promise<HorizonPoint[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const profile: HorizonPoint[] = []
    for (let azimuth = 0; azimuth < 360; azimuth += 10) {
      const baseElevation = Math.sin((azimuth * Math.PI) / 180) * 5 + 5
      const noise = (Math.random() - 0.5) * 2
      profile.push({
        azimuth,
        elevation: Math.max(0, baseElevation + noise),
      })
    }
    return profile
  }

  const performShadingAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)

    try {
      setProgress(20)
      await simulateTerrainAnalysis()

      setProgress(45)
      await simulateBuildingAnalysis()

      setProgress(70)
      const horizonProfile = await simulateHorizonProfile()

      setProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const totalBuildingImpact = buildings.reduce((sum, b) => sum + b.shadingImpact, 0)
      const terrainImpact = terrainData ? (1 - terrainData.shadingFactor) * 100 : 0
      const annualShading = (totalBuildingImpact * 100 + terrainImpact) / 2

      const monthlyShading = Array(12)
        .fill(0)
        .map((_, i) => {
          const winterPeak = i === 5 || i === 6 ? 1.3 : 1.0
          return annualShading * winterPeak * (0.9 + Math.random() * 0.2)
        })

      const hourlyShading = Array(12)
        .fill(0)
        .map(() =>
          Array(24)
            .fill(0)
            .map((_, hour) => {
              if (hour < 6 || hour > 18) return 100
              const midday = Math.abs(12 - hour) / 6
              return annualShading * (1 - midday * 0.5)
            })
        )

      const recommendations: string[] = []
      if (annualShading < 5) {
        recommendations.push("✅ Excelente! Praticamente sem sombreamento significativo.")
      } else if (annualShading < 10) {
        recommendations.push("✅ Bom. Sombreamento mínimo, ideal para instalação solar.")
      } else if (annualShading < 20) {
        recommendations.push("⚠️ Sombreamento moderado. Considere otimizar a disposição dos painéis.")
      } else {
        recommendations.push("⚠️ Sombreamento significativo. Avalie se há áreas alternativas.")
      }

      if (terrainData && terrainData.slope > 10) {
        recommendations.push("🏔️ Inclinação do terreno elevada. Estruturas de fixação especiais podem ser necessárias.")
      }

      if (buildings.length > 0) {
        const maxBuildingImpact = Math.max(...buildings.map((b) => b.shadingImpact))
        if (maxBuildingImpact > 0.1) {
          recommendations.push("🏢 Edifícios próximos causam sombreamento. Considere painéis em altura ou inclinação ajustada.")
        }
      }

      const result: ShadingAnalysisResult = {
        annualShading,
        monthlyShading,
        hourlyShading,
        terrainImpact,
        buildingImpact: totalBuildingImpact * 100,
        horizonProfile,
        recommendations,
      }

      setAnalysisResult(result)
      setProgress(100)

      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
    } catch (error) {
      console.error("Erro na análise de sombreamento:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Cube className="text-accent" size={28} weight="duotone" />
                Análise de Sombreamento 3D
              </CardTitle>
              <CardDescription className="mt-2">
                Análise avançada usando dados de elevação do terreno (DEM) e geometria urbana
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm font-bold">
              <Mountains className="mr-1" size={16} weight="fill" />
              DEM + 3D
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sun size={18} weight="duotone" className="text-solar-orange" />
            <span>{location.address}</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={performShadingAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-solar-yellow via-solar-red to-solar-pink hover:opacity-90"
            >
              {isAnalyzing ? (
                <>
                  <Calculator className="mr-2 animate-spin" size={18} weight="bold" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="mr-2" size={18} weight="fill" />
                  Iniciar Análise
                </>
              )}
            </Button>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={selectedView === "2d" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("2d")}
              >
                2D
              </Button>
              <Button
                variant={selectedView === "3d" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("3d")}
              >
                3D
              </Button>
              <Button
                variant={selectedView === "terrain" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("terrain")}
              >
                <Mountains size={16} weight="fill" />
              </Button>
            </div>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={satelliteLayer === "default" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSatelliteLayer("default")}
                title="Sentinel-2 Cloudless (EOX)"
              >
                S2
              </Button>
              <Button
                variant={satelliteLayer === "sentinel" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSatelliteLayer("sentinel")}
                title="AWS BDC Sentinel-2"
                disabled={!availableImagery || availableImagery.sentinel2.length === 0}
              >
                🛰️ Sentinel
              </Button>
              <Button
                variant={satelliteLayer === "cbers" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSatelliteLayer("cbers")}
                title="AWS BDC CBERS-4"
                disabled={!availableImagery || availableImagery.cbers4.length === 0}
              >
                🇧🇷 CBERS
              </Button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progress < 30 && "Consultando dados de elevação do terreno (IBGE DEM)..."}
                {progress >= 30 && progress < 60 && "Analisando geometria de edificações (OSM)..."}
                {progress >= 60 && progress < 85 && "Calculando perfil de horizonte 360°..."}
                {progress >= 85 && "Finalizando análise de sombreamento..."}
              </p>
            </div>
          )}

          <div
            ref={mapContainer}
            className="w-full h-[500px] rounded-xl overflow-hidden border-2 shadow-lg"
          />
        </CardContent>
      </Card>

      {terrainData && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mountains className="text-chart-2" size={24} weight="duotone" />
              Dados do Terreno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Elevação</p>
                <p className="text-2xl font-bold">{terrainData.elevation.toFixed(1)} m</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Inclinação</p>
                <p className="text-2xl font-bold">{terrainData.slope.toFixed(1)}°</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Aspecto</p>
                <p className="text-2xl font-bold">{terrainData.aspect.toFixed(0)}°</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fator Solar</p>
                <p className="text-2xl font-bold">{(terrainData.shadingFactor * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {availableImagery && (availableImagery.sentinel2.length > 0 || availableImagery.cbers4.length > 0) && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Planet className="text-chart-5" size={24} weight="duotone" />
              Imagens de Satélite Disponíveis (AWS BDC)
            </CardTitle>
            <CardDescription>
              Imagens Sentinel-2 e CBERS-4 do Brazil Data Cube hospedadas na AWS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sentinel2" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sentinel2">
                  Sentinel-2 ({availableImagery.sentinel2.length})
                </TabsTrigger>
                <TabsTrigger value="cbers4">
                  CBERS-4 ({availableImagery.cbers4.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sentinel2" className="space-y-3 pt-4">
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    {availableImagery.sentinel2.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {new Date(item.properties.datetime).toLocaleDateString("pt-BR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>Plataforma: {item.properties.platform || "Sentinel-2"}</span>
                            <span>Nuvens: {item.properties["eo:cloud_cover"]?.toFixed(1) || "N/A"}%</span>
                          </div>
                        </div>
                        <Badge variant={item.properties["eo:cloud_cover"] && item.properties["eo:cloud_cover"] < 10 ? "default" : "outline"}>
                          {item.properties["eo:cloud_cover"] && item.properties["eo:cloud_cover"] < 10 ? "Ótima" : "Boa"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground">
                  💡 Dados do AWS S3 Bucket: <code className="text-xs bg-muted px-2 py-0.5 rounded">s3://bdc-sentinel-2</code>
                </p>
              </TabsContent>

              <TabsContent value="cbers4" className="space-y-3 pt-4">
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    {availableImagery.cbers4.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {new Date(item.properties.datetime).toLocaleDateString("pt-BR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>Plataforma: {item.properties.platform || "CBERS-4"}</span>
                            <span>Nuvens: {item.properties["eo:cloud_cover"]?.toFixed(1) || "N/A"}%</span>
                          </div>
                        </div>
                        <Badge variant={item.properties["eo:cloud_cover"] && item.properties["eo:cloud_cover"] < 10 ? "default" : "outline"}>
                          {item.properties["eo:cloud_cover"] && item.properties["eo:cloud_cover"] < 10 ? "Ótima" : "Boa"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground">
                  💡 Dados do AWS S3 Bucket: <code className="text-xs bg-muted px-2 py-0.5 rounded">s3://bdc-cbers</code>
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {buildings.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Buildings className="text-chart-3" size={24} weight="duotone" />
              Obstruções (Edifícios)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {buildings.map((building, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-semibold">Edifício {index + 1}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Altura: {building.height}m</span>
                        <span>Distância: {building.distance}m</span>
                        <span>Azimute: {building.azimuth}°</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-bold">
                      {(building.shadingImpact * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="text-chart-4" size={24} weight="duotone" />
              Resultados da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-solar-yellow/10 to-solar-orange/10 rounded-xl border-2">
                    <p className="text-sm text-muted-foreground mb-1">Sombreamento Anual</p>
                    <p className="text-3xl font-bold text-solar-orange">
                      {analysisResult.annualShading.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-chart-2/10 to-chart-2/20 rounded-xl border-2">
                    <p className="text-sm text-muted-foreground mb-1">Impacto Terreno</p>
                    <p className="text-3xl font-bold text-chart-2">
                      {analysisResult.terrainImpact.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-chart-3/10 to-chart-3/20 rounded-xl border-2">
                    <p className="text-sm text-muted-foreground mb-1">Impacto Edifícios</p>
                    <p className="text-3xl font-bold text-chart-3">
                      {analysisResult.buildingImpact.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Perfil de Horizonte (360°)</h3>
                  <div className="h-[200px] bg-gradient-to-b from-sky-100 dark:from-sky-950 to-amber-100 dark:to-amber-950 rounded-xl border-2 p-4 relative overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 360 100" preserveAspectRatio="none">
                      <polyline
                        points={analysisResult.horizonProfile
                          .map((p) => `${p.azimuth},${100 - p.elevation * 5}`)
                          .join(" ")}
                        fill="none"
                        stroke={MAP_COLORS.horizonStroke}
                        strokeWidth="2"
                      />
                      <polyline
                        points={`0,100 ${analysisResult.horizonProfile
                          .map((p) => `${p.azimuth},${100 - p.elevation * 5}`)
                          .join(" ")} 360,100`}
                        fill="url(#horizon-gradient)"
                        opacity="0.6"
                      />
                      <defs>
                        <linearGradient id="horizon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={MAP_COLORS.horizonFill} stopOpacity="0.8" />
                          <stop offset="100%" stopColor={MAP_COLORS.horizonFill} stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">N (0°)</div>
                    <div className="absolute bottom-2 right-4 text-xs text-muted-foreground">N (360°)</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4 pt-4">
                <div className="space-y-3">
                  {analysisResult.monthlyShading.map((shading, index) => {
                    const months = [
                      "Janeiro",
                      "Fevereiro",
                      "Março",
                      "Abril",
                      "Maio",
                      "Junho",
                      "Julho",
                      "Agosto",
                      "Setembro",
                      "Outubro",
                      "Novembro",
                      "Dezembro",
                    ]
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-24">{months[index]}</span>
                        <div className="flex-1">
                          <Progress value={shading} className="h-3" />
                        </div>
                        <span className="text-sm font-bold w-16 text-right">{shading.toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4 pt-4">
                {analysisResult.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                  >
                    <Warning size={20} weight="duotone" className="text-solar-orange flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{rec}</p>
                  </motion.div>
                ))}

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2" size={18} weight="bold" />
                    Exportar Relatório
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
