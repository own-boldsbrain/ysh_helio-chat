import { motion } from "framer-motion"
import { 
  ArrowLeft, List, Lightning, MapPin, Calendar, TrendUp,
  SolarPanel, ChartBar, Tree, CurrencyCircleDollar, FileText,
  Download, Share, Check, Warning, Cube
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

interface ProjectDetailPageProps {
  onToggleSidebar: () => void
  projectId: string
  onBack: () => void
}

interface ProjectSpec {
  label: string
  value: string
  icon?: ReactNode
  highlight?: boolean
}

interface Equipment {
  category: string
  model: string
  manufacturer: string
  quantity: number
  power?: string
  specs: string[]
}

type ViewAngle = 'top' | 'oblique' | 'street'

interface MapInstance {
  on: (event: 'load', handler: () => void) => void
  addSource: (id: string, source: unknown) => void
  addLayer: (layer: unknown) => void
  getLayer: (id: string) => unknown
  setPaintProperty: (layerId: string, name: string, value: unknown) => void
  easeTo: (options: { pitch: number; bearing: number; zoom: number; duration: number }) => void
  remove: () => void
}

interface MapConstructor {
  new (options: {
    container: HTMLDivElement
    style: string
    center: [number, number]
    zoom: number
    pitch: number
    bearing: number
    antialias: boolean
  }): MapInstance
}

interface SolarPanelFeature {
  type: 'Feature'
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  properties: {
    id: number
  }
}

interface SolarPanelFeatureCollection {
  type: 'FeatureCollection'
  features: SolarPanelFeature[]
}

declare global {
  interface Window {
    maplibregl?: {
      Map: MapConstructor
    }
  }
}

export function ProjectDetailPage({ onToggleSidebar, projectId, onBack }: ProjectDetailPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const [selectedAngle, setSelectedAngle] = useState<ViewAngle>('oblique')
  
  const project = {
    id: projectId,
    name: 'Residencial São Paulo - 8.8kWp',
    type: 'Residencial',
    status: 'Em Execução',
    location: 'São Paulo, SP - Jardim Paulista',
    client: 'João Silva',
    installDate: '15/03/2024',
    
    // Especificações Principais
    systemPower: '8.8 kWp',
    panelCount: 20,
    inverterType: 'String',
    monthlyGeneration: '1.089 kWh',
    annualGeneration: '13.068 kWh',
    roofArea: '52 m²',
    roofOrientation: 'Norte (12°)',
    efficiency: '87%',
    
    // Financeiro
    investment: 'R$ 38.500',
    monthlySavings: 'R$ 817',
    payback: '3.9 anos',
    roi25years: 'R$ 245.100',
    financing: 'Banco BV - 48x de R$ 1.087',
    
    // Ambiental
    co2Offset: '6.534 kg/ano',
    treesEquivalent: '75 árvores',
    
    // Equipamentos
    equipment: [
      {
        category: 'Módulos Fotovoltaicos',
        model: 'Canadian Solar HiKu7 Mono PERC',
        manufacturer: 'Canadian Solar',
        quantity: 20,
        power: '440W',
        specs: [
          'Eficiência: 21.2%',
          'Tensão Máxima: 37.8V',
          'Corrente Máxima: 11.64A',
          'Garantia: 25 anos',
          'Certificação: INMETRO Classe A'
        ]
      },
      {
        category: 'Inversor',
        model: 'Fronius Primo 8.2-1',
        manufacturer: 'Fronius',
        quantity: 1,
        power: '8.2kW',
        specs: [
          'Eficiência: 98.1%',
          'MPPT: 2 trackers',
          'Tensão Máxima DC: 1000V',
          'Monitoramento WiFi integrado',
          'Garantia: 10 anos'
        ]
      },
      {
        category: 'Estrutura de Fixação',
        model: 'K2 Systems SingleRail',
        manufacturer: 'K2 Systems',
        quantity: 1,
        specs: [
          'Material: Alumínio anodizado',
          'Tipo de telhado: Cerâmica',
          'Inclinação: 15°',
          'Garantia: 10 anos',
          'Suporta ventos: até 150 km/h'
        ]
      },
      {
        category: 'String Box',
        model: 'Steca PV-DCGB 1000V 2MPPT',
        manufacturer: 'Steca',
        quantity: 1,
        specs: [
          'Proteção: DPS Tipo II',
          'Fusíveis: 15A',
          'Disjuntor DC: 32A',
          'Certificação: IEC 61439',
          'Grau de proteção: IP65'
        ]
      },
      {
        category: 'Cabeamento DC',
        model: 'Cabo Solar 6mm²',
        manufacturer: 'Nexans',
        quantity: 100,
        specs: [
          'Dupla isolação',
          'Resistente UV',
          'Temperatura: -40°C a +90°C',
          'Norma: EN 50618',
          'Cor: Preto e Vermelho'
        ]
      },
      {
        category: 'Proteções AC',
        model: 'Disjuntor DIN 40A',
        manufacturer: 'Schneider Electric',
        quantity: 1,
        specs: [
          'Curva C',
          'Capacidade: 6kA',
          'Polo: Tripolar',
          'Certificação: IEC 60898'
        ]
      }
    ] as Equipment[],
    
    // Dados Técnicos Detalhados
    technicalData: {
      irradiation: {
        daily: '5.18 kWh/m²',
        monthly: '155.4 kWh/m²',
        annual: '1.890 kWh/m²',
        source: 'NREL NSRDB 2022'
      },
      performance: {
        peakSunHours: '5.18 h/dia',
        performanceRatio: '87%',
        systemLosses: '13%',
        temperature: '-0.38%/°C',
        soiling: '2%',
        wiring: '1.5%',
        inverter: '1.9%',
        mismatch: '2%'
      },
      electrical: {
        dcPower: '8.800 W',
        acPower: '8.200 W',
        strings: '2 strings de 10 módulos',
        voltageSystem: '380V (3F + N)',
        maxCurrent: '12.8A',
        minVoltage: '200V',
        maxVoltage: '780V',
        optimalVoltage: '600V'
      }
    },
    
    // Documentação
    documents: [
      { name: 'Memorial Descritivo', status: 'Aprovado', date: '10/03/2024' },
      { name: 'Projeto Elétrico', status: 'Aprovado', date: '10/03/2024' },
      { name: 'Diagrama Unifilar', status: 'Aprovado', date: '10/03/2024' },
      { name: 'ART Projeto', status: 'Emitida', date: '12/03/2024' },
      { name: 'ART Execução', status: 'Emitida', date: '15/03/2024' },
      { name: 'Solicitação de Acesso (Enel)', status: 'Em Análise', date: '15/03/2024' },
      { name: 'Laudo de Vistoria do Telhado', status: 'Aprovado', date: '08/03/2024' },
      { name: 'Análise Estrutural', status: 'Aprovado', date: '08/03/2024' }
    ],
    
    // Timeline
    timeline: [
      { 
        date: '01/03/2024', 
        title: 'Projeto Criado', 
        description: 'Visita técnica realizada e levantamento inicial',
        status: 'completed'
      },
      { 
        date: '10/03/2024', 
        title: 'Projeto Aprovado', 
        description: 'Cliente aprovou proposta comercial e técnica',
        status: 'completed'
      },
      { 
        date: '15/03/2024', 
        title: 'Início da Instalação', 
        description: 'Equipe mobilizada para instalação dos equipamentos',
        status: 'current'
      },
      { 
        date: '22/03/2024', 
        title: 'Finalização Prevista', 
        description: 'Conclusão da instalação e testes',
        status: 'pending'
      },
      { 
        date: '29/03/2024', 
        title: 'Homologação', 
        description: 'Vistoria da concessionária e ativação do sistema',
        status: 'pending'
      }
    ]
  }

  useEffect(() => {
    if (!mapContainerRef.current) return

    const maplibregl = window.maplibregl
    if (!maplibregl) return

    const initialCenter: [number, number] = [-46.6653, -23.5505]
    const initialZoom = 19
    const initialPitch = 60
    const initialBearing = 30

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
      center: initialCenter,
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: initialBearing,
      antialias: true
    })

    mapRef.current.on('load', () => {
      mapRef.current.addSource('roof-outline', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-46.66540, -23.55040],
              [-46.66540, -23.55060],
              [-46.66520, -23.55060],
              [-46.66520, -23.55040],
              [-46.66540, -23.55040]
            ]]
          }
        }
      })

      mapRef.current.addLayer({
        id: 'roof-base',
        type: 'fill',
        source: 'roof-outline',
        paint: {
          'fill-color': '#FFD60A',
          'fill-opacity': 0.15
        }
      })

      mapRef.current.addLayer({
        id: 'roof-border',
        type: 'line',
        source: 'roof-outline',
        paint: {
          'line-color': '#FFD60A',
          'line-width': 3,
          'line-opacity': 0.8
        }
      })

      const panelData: SolarPanelFeatureCollection = {
        type: 'FeatureCollection',
        features: []
      }

      const panelsPerRow = 5
      const rows = 4
      const panelWidth = 0.00003
      const panelHeight = 0.00005
      const spacingX = 0.000035
      const spacingY = 0.000055
      const startLon = -46.66537
      const startLat = -23.55042

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < panelsPerRow; col++) {
          const lon1 = startLon + (col * spacingX)
          const lat1 = startLat + (row * spacingY)
          const lon2 = lon1 + panelWidth
          const lat2 = lat1 + panelHeight

          panelData.features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [lon1, lat1],
                [lon2, lat1],
                [lon2, lat2],
                [lon1, lat2],
                [lon1, lat1]
              ]]
            },
            properties: {
              id: row * panelsPerRow + col + 1
            }
          })
        }
      }

      mapRef.current.addSource('solar-panels', {
        type: 'geojson',
        data: panelData
      })

      mapRef.current.addLayer({
        id: 'solar-panels-fill',
        type: 'fill',
        source: 'solar-panels',
        paint: {
          'fill-color': '#1a1a2e',
          'fill-opacity': 0.9
        }
      })

      mapRef.current.addLayer({
        id: 'solar-panels-border',
        type: 'line',
        source: 'solar-panels',
        paint: {
          'line-color': '#FFD60A',
          'line-width': 1.5
        }
      })

      if (mapRef.current.getLayer('building')) {
        mapRef.current.setPaintProperty('building', 'fill-extrusion-opacity', 0.6)
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    const angles: Record<ViewAngle, { pitch: number; bearing: number; zoom: number }> = {
      top: { pitch: 0, bearing: 0, zoom: 19 },
      oblique: { pitch: 60, bearing: 30, zoom: 19 },
      street: { pitch: 75, bearing: 45, zoom: 19.5 }
    }

    const config = angles[selectedAngle]
    mapRef.current.easeTo({
      pitch: config.pitch,
      bearing: config.bearing,
      zoom: config.zoom,
      duration: 1000
    })
  }, [selectedAngle])

  const specs: ProjectSpec[] = [
    { label: 'Potência Instalada', value: project.systemPower, icon: <Lightning size={18} weight="fill" />, highlight: true },
    { label: 'Geração Mensal', value: project.monthlyGeneration, icon: <ChartBar size={18} weight="fill" /> },
    { label: 'Geração Anual', value: project.annualGeneration, icon: <TrendUp size={18} weight="fill" /> },
    { label: 'Economia Mensal', value: project.monthlySavings, icon: <CurrencyCircleDollar size={18} weight="fill" /> },
    { label: 'Payback', value: project.payback, icon: <Calendar size={18} weight="fill" /> },
    { label: 'ROI 25 anos', value: project.roi25years, icon: <TrendUp size={18} weight="fill" />, highlight: true },
  ]

  const handleExportPDF = () => {
    toast.success("Gerando PDF do projeto...")
  }

  const handleShare = () => {
    toast.success("Link de compartilhamento copiado!")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  aria-label="Abrir menu lateral"
                  title="Abrir menu lateral"
                  className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors shrink-0"
                >
                  <List size={22} weight="bold" />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft size={18} weight="bold" />
                  Voltar
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                  <Share size={18} weight="bold" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                  <Download size={18} weight="bold" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[oklch(0.60_0.18_270)] text-white font-bold text-2xl shadow-xl shrink-0"
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-xl font-bold">{project.name}</h1>
                  <Badge variant="outline" className="gap-1.5">
                    <SolarPanel size={14} weight="fill" />
                    {project.type}
                  </Badge>
                  <Badge 
                    variant={project.status === 'Em Execução' ? 'default' : 'secondary'}
                    className="gap-1.5"
                  >
                    {project.status === 'Em Execução' && <Lightning size={14} weight="fill" />}
                    {project.status}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} weight="fill" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} weight="fill" />
                    Início: {project.installDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specs.map((spec, index) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 ${spec.highlight ? 'border-2 border-accent/40 bg-accent/5' : ''}`}>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    {spec.icon}
                    <span className="text-xs font-medium">{spec.label}</span>
                  </div>
                  <div className={`text-lg font-bold ${spec.highlight ? 'text-accent' : ''}`}>
                    {spec.value}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="gap-2">
                <FileText size={18} weight="fill" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="equipment" className="gap-2">
                <SolarPanel size={18} weight="fill" />
                Equipamentos
              </TabsTrigger>
              <TabsTrigger value="technical" className="gap-2">
                <ChartBar size={18} weight="fill" />
                Dados Técnicos
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText size={18} weight="fill" />
                Documentação
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Calendar size={18} weight="fill" />
                Timeline
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Visualização 3D do Telhado */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Cube size={22} weight="fill" className="text-accent" />
                    Visualização 3D do Sistema
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedAngle === 'top' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedAngle('top')}
                      className="gap-2"
                    >
                      Vista Superior
                    </Button>
                    <Button
                      variant={selectedAngle === 'oblique' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedAngle('oblique')}
                      className="gap-2"
                    >
                      Vista Oblíqua
                    </Button>
                    <Button
                      variant={selectedAngle === 'street' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedAngle('street')}
                      className="gap-2"
                    >
                      Vista Rua
                    </Button>
                  </div>
                </div>
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-[500px] rounded-xl overflow-hidden border-2 border-border shadow-lg"
                />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{project.panelCount}</div>
                    <div className="text-xs text-muted-foreground">Módulos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.roofArea}</div>
                    <div className="text-xs text-muted-foreground">Área Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.systemPower}</div>
                    <div className="text-xs text-muted-foreground">Potência</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.roofOrientation.split(' ')[0]}</div>
                    <div className="text-xs text-muted-foreground">Orientação</div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sistema */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <SolarPanel size={22} weight="fill" className="text-accent" />
                    Sistema Fotovoltaico
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potência Total:</span>
                      <span className="font-semibold">{project.systemPower}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Módulos:</span>
                      <span className="font-semibold">{project.panelCount} unidades</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo de Inversor:</span>
                      <span className="font-semibold">{project.inverterType}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Área Ocupada:</span>
                      <span className="font-semibold">{project.roofArea}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orientação:</span>
                      <span className="font-semibold">{project.roofOrientation}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eficiência:</span>
                      <span className="font-semibold text-accent">{project.efficiency}</span>
                    </div>
                  </div>
                </Card>

                {/* Financeiro */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CurrencyCircleDollar size={22} weight="fill" className="text-accent" />
                    Análise Financeira
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investimento:</span>
                      <span className="font-semibold">{project.investment}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Economia Mensal:</span>
                      <span className="font-semibold text-success">{project.monthlySavings}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payback:</span>
                      <span className="font-semibold">{project.payback}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROI (25 anos):</span>
                      <span className="font-semibold text-accent">{project.roi25years}</span>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Financiamento:</span>
                      <span className="font-semibold text-sm">{project.financing}</span>
                    </div>
                  </div>
                </Card>

                {/* Impacto Ambiental */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Tree size={22} weight="fill" className="text-success" />
                    Impacto Ambiental
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-success/10 rounded-xl p-4">
                      <div className="text-3xl font-bold text-success mb-1">
                        {project.co2Offset}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        CO₂ evitado por ano
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tree size={32} weight="fill" className="text-success" />
                      <div>
                        <div className="font-semibold">Equivalente a {project.treesEquivalent}</div>
                        <div className="text-sm text-muted-foreground">árvores plantadas</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Geração */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ChartBar size={22} weight="fill" className="text-accent" />
                    Estimativa de Geração
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mensal:</span>
                      <span className="font-semibold">{project.monthlyGeneration}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anual:</span>
                      <span className="font-semibold">{project.annualGeneration}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Irradiação:</span>
                      <span className="font-semibold">{project.technicalData.irradiation.daily}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horas de Sol Pico:</span>
                      <span className="font-semibold">{project.technicalData.performance.peakSunHours}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Performance Ratio:</span>
                      <span className="font-semibold">{project.technicalData.performance.performanceRatio}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 gap-6">
                {project.equipment.map((item, index) => (
                  <motion.div
                    key={`${item.category}-${item.model}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                        <div>
                          <Badge variant="outline" className="mb-2">{item.category}</Badge>
                          <h3 className="text-lg font-bold">{item.model}</h3>
                          <p className="text-muted-foreground">{item.manufacturer}</p>
                        </div>
                        <div className="flex gap-4">
                          {item.power && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-accent">{item.power}</div>
                              <div className="text-xs text-muted-foreground">Potência</div>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-2xl font-bold">{item.quantity}</div>
                            <div className="text-xs text-muted-foreground">Unidades</div>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.specs.map((spec) => (
                          <div key={`${item.model}-${spec}`} className="flex items-center gap-2 text-sm">
                            <Check size={16} weight="bold" className="text-success shrink-0" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Irradiação */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    ☀️ Dados de Irradiação
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Irradiação Diária:</span>
                      <span className="font-semibold">{project.technicalData.irradiation.daily}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Irradiação Mensal:</span>
                      <span className="font-semibold">{project.technicalData.irradiation.monthly}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Irradiação Anual:</span>
                      <span className="font-semibold">{project.technicalData.irradiation.annual}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fonte:</span>
                      <span className="font-semibold text-sm">{project.technicalData.irradiation.source}</span>
                    </div>
                  </div>
                </Card>

                {/* Performance */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📊 Performance do Sistema
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horas de Sol Pico:</span>
                      <span className="font-semibold">{project.technicalData.performance.peakSunHours}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Performance Ratio:</span>
                      <span className="font-semibold text-accent">{project.technicalData.performance.performanceRatio}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Perdas Totais:</span>
                      <span className="font-semibold">{project.technicalData.performance.systemLosses}</span>
                    </div>
                    <Separator />
                    <div className="text-sm space-y-2 pt-3">
                      <div className="font-semibold text-muted-foreground mb-2">Detalhamento de Perdas:</div>
                      <div className="flex justify-between text-xs">
                        <span>Temperatura:</span>
                        <span>{project.technicalData.performance.temperature}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Sujidade:</span>
                        <span>{project.technicalData.performance.soiling}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Cabeamento:</span>
                        <span>{project.technicalData.performance.wiring}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Inversor:</span>
                        <span>{project.technicalData.performance.inverter}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Mismatch:</span>
                        <span>{project.technicalData.performance.mismatch}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Elétrico */}
                <Card className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    ⚡ Especificações Elétricas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Potência DC</div>
                      <div className="text-xl font-bold">{project.technicalData.electrical.dcPower}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Potência AC</div>
                      <div className="text-xl font-bold text-accent">{project.technicalData.electrical.acPower}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Configuração</div>
                      <div className="text-sm font-semibold">{project.technicalData.electrical.strings}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm mb-1">Tensão do Sistema</div>
                      <div className="text-xl font-bold">{project.technicalData.electrical.voltageSystem}</div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Corrente Máx.</div>
                      <div className="font-semibold">{project.technicalData.electrical.maxCurrent}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Tensão Mín.</div>
                      <div className="font-semibold">{project.technicalData.electrical.minVoltage}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Tensão Máx.</div>
                      <div className="font-semibold">{project.technicalData.electrical.maxVoltage}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Tensão Ótima</div>
                      <div className="font-semibold text-accent">{project.technicalData.electrical.optimalVoltage}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4 mt-6">
              {project.documents.map((doc, index) => (
                <motion.div
                  key={`${doc.name}-${doc.date}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:border-accent/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <FileText size={20} weight="fill" className="text-accent" />
                        </div>
                        <div>
                          <div className="font-semibold">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">{doc.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            doc.status === 'Aprovado' || doc.status === 'Emitida'
                              ? 'default'
                              : doc.status === 'Em Análise'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="gap-1.5"
                        >
                          {(doc.status === 'Aprovado' || doc.status === 'Emitida') && (
                            <Check size={14} weight="bold" />
                          )}
                          {doc.status === 'Em Análise' && (
                            <Warning size={14} weight="fill" />
                          )}
                          {doc.status}
                        </Badge>
                        <Button variant="ghost" size="sm" aria-label={`Baixar ${doc.name}`}>
                          <Download size={18} weight="bold" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-6">
              <Card className="p-6">
                <div className="space-y-6">
                  {project.timeline.map((item, index) => (
                    <motion.div
                      key={`${item.date}-${item.title}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.status === 'completed'
                              ? 'bg-success text-white'
                              : item.status === 'current'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.status === 'completed' && <Check size={20} weight="bold" />}
                          {item.status === 'current' && <Lightning size={20} weight="fill" />}
                          {item.status === 'pending' && <Calendar size={20} weight="bold" />}
                        </div>
                        {index < project.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              item.status === 'completed' ? 'bg-success' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="text-sm text-muted-foreground mb-1">{item.date}</div>
                        <div className="font-bold mb-1">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
