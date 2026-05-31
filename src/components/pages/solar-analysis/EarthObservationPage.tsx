import { motion } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  List, 
  Rocket, 
  Globe, 
  Database, 
  CloudArrowDown,
  Bell,
  MapTrifold,
  ChartBar,
  Info,
  Copy,
  CheckCircle,
  Sun
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { MapLibreViewer } from "@/components/solar/MapLibreViewer"
import { SolarAnalysisPanel } from "@/components/solar/SolarAnalysisPanel"
import { Separator } from "@/components/ui/separator"

interface EarthObservationPageProps {
  onToggleSidebar: () => void
}

interface DatasetInfo {
  id: string
  name: string
  description: string
  type: "S3 Bucket" | "SNS Topic"
  arn: string
  region: string
  cliCommand?: string
  stacEndpoint?: string
  icon: string
  color: string
}

const datasets: DatasetInfo[] = [
  {
    id: "sentinel-2",
    name: "Sentinel 2A/2B",
    description: "Earth Observation Data Cubes for Brazil - Sentinel 2A/2B",
    type: "S3 Bucket",
    arn: "arn:aws:s3:::bdc-sentinel-2",
    region: "us-west-2",
    cliCommand: "aws s3 ls --no-sign-request s3://bdc-sentinel-2/",
    stacEndpoint: "https://brazildatacube.dpi.inpe.br/stac/",
    icon: "🛰️",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "cbers-4",
    name: "CBERS 4",
    description: "Earth Observation Data Cubes for Brazil - CBERS 4",
    type: "S3 Bucket",
    arn: "arn:aws:s3:::bdc-cbers",
    region: "us-west-2",
    cliCommand: "aws s3 ls --no-sign-request s3://bdc-cbers/",
    stacEndpoint: "https://brazildatacube.dpi.inpe.br/stac/",
    icon: "🌍",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "sentinel-2-sns",
    name: "Sentinel-2 Notifications",
    description: "Notifications for new EO Data Cubes Sentinel-2 scenes",
    type: "SNS Topic",
    arn: "arn:aws:sns:us-west-2:896627514407:bdc-sentinel-2-object_created",
    region: "us-west-2",
    icon: "🔔",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "cbers-sns",
    name: "CBERS Notifications",
    description: "Notifications for new EO Data Cubes CBERS scenes",
    type: "SNS Topic",
    arn: "arn:aws:sns:us-west-2:896627514407:bdc-cbers-object_created",
    region: "us-west-2",
    icon: "📡",
    color: "from-orange-500 to-red-500"
  }
]

export function EarthObservationPage({ onToggleSidebar }: EarthObservationPageProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(label)
    toast.success(`${label} copiado!`)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const brazilCenter: [number, number] = [-47.9292, -15.7801]

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
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
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Earth Observation Data
                </h1>
                <p className="text-muted-foreground">
                  Dados públicos de observação da Terra do Brasil via AWS + PVGIS + NASA POWER
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-blue-500 hover:bg-blue-500/10"
              onClick={() => window.open("https://registry.opendata.aws/bdc/", "_blank")}
            >
              <Info className="mr-2" size={18} weight="bold" />
              Documentação AWS
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Sun size={18} weight="fill" />
                Análise Solar & Geocoding
              </TabsTrigger>
              <TabsTrigger value="datasets" className="flex items-center gap-2">
                <Database size={18} weight="fill" />
                Datasets AWS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <SolarAnalysisPanel />
            </TabsContent>

            <TabsContent value="datasets" className="space-y-6">
              <Card className="border-2 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapTrifold size={24} weight="fill" className="text-blue-600" />
                    Visualização Geográfica do Brasil
                  </CardTitle>
                  <CardDescription>
                    Região de cobertura dos datasets de observação da Terra
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MapLibreViewer 
                    center={brazilCenter}
                    zoom={4}
                    pitch={45}
                    className="rounded-lg overflow-hidden shadow-lg border-2 border-blue-500/20"
                  />
                  <p className="text-xs text-muted-foreground mt-3">
                    Os datasets cobrem todo o território brasileiro com imagens de satélite de alta resolução
                  </p>
                </CardContent>
              </Card>

              <Tabs defaultValue="sentinel-2" className="space-y-6">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
                  {datasets.map((dataset) => (
                    <TabsTrigger
                      key={dataset.id}
                      value={dataset.id}
                      className="flex items-center gap-2"
                    >
                      <span className="text-lg">{dataset.icon}</span>
                      <span className="hidden sm:inline">{dataset.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {datasets.map((dataset) => (
                  <TabsContent key={dataset.id} value={dataset.id}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <Card className={`border-2 bg-linear-to-br ${dataset.color} bg-opacity-5`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${dataset.color} flex items-center justify-center text-3xl shadow-lg`}>
                                  {dataset.icon}
                                </div>
                                <div>
                                  <CardTitle className="text-2xl">{dataset.name}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {dataset.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {dataset.type}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                                <Database size={20} weight="bold" className="text-muted-foreground mt-1 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold mb-1">Amazon Resource Name (ARN)</p>
                                  <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                                    {dataset.arn}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(dataset.arn, "ARN")}
                                    className="mt-2 h-7 text-xs"
                                  >
                                    {copiedItem === "ARN" ? (
                                      <CheckCircle className="mr-1" size={14} weight="fill" />
                                    ) : (
                                      <Copy className="mr-1" size={14} weight="bold" />
                                    )}
                                    {copiedItem === "ARN" ? "Copiado!" : "Copiar ARN"}
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                                <Globe size={20} weight="bold" className="text-muted-foreground mt-1 shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold mb-1">AWS Region</p>
                                  <Badge variant="outline" className="font-mono">
                                    {dataset.region}
                                  </Badge>
                                </div>
                              </div>

                              {dataset.cliCommand && (
                                <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                                  <CloudArrowDown size={20} weight="bold" className="text-muted-foreground mt-1 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold mb-1">AWS CLI Access</p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Sem necessidade de conta AWS
                                    </p>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                                      {dataset.cliCommand}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopy(dataset.cliCommand, "Comando CLI")}
                                      className="mt-2 h-7 text-xs"
                                    >
                                      {copiedItem === "Comando CLI" ? (
                                        <CheckCircle className="mr-1" size={14} weight="fill" />
                                      ) : (
                                        <Copy className="mr-1" size={14} weight="bold" />
                                      )}
                                      {copiedItem === "Comando CLI" ? "Copiado!" : "Copiar Comando"}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {dataset.stacEndpoint && (
                                <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                                  <ChartBar size={20} weight="bold" className="text-muted-foreground mt-1 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold mb-1">STAC Endpoint</p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      BDC STAC V0.9.0
                                    </p>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                                      {dataset.stacEndpoint}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(dataset.stacEndpoint, "_blank")}
                                      className="mt-2 h-7 text-xs"
                                    >
                                      <Globe className="mr-1" size={14} weight="bold" />
                                      Explorar STAC
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Rocket size={20} weight="fill" className="text-blue-600" />
                              Sobre o Dataset
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {dataset.id === "sentinel-2" && (
                              <div className="space-y-3 text-sm">
                                <p>
                                  <strong>Sentinel-2</strong> é uma missão de imageamento de alta resolução da ESA que fornece dados ópticos multiespectrais.
                                </p>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Características:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Resolução: 10-60m</li>
                                    <li>• 13 bandas espectrais</li>
                                    <li>• Revisita: 5 dias</li>
                                    <li>• Cobertura: Global</li>
                                  </ul>
                                </div>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Aplicações:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Agricultura de precisão</li>
                                    <li>• Monitoramento florestal</li>
                                    <li>• Análise de uso do solo</li>
                                    <li>• Gestão de recursos hídricos</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                            {dataset.id === "cbers-4" && (
                              <div className="space-y-3 text-sm">
                                <p>
                                  <strong>CBERS-4</strong> (China-Brazil Earth Resources Satellite) é um satélite sino-brasileiro para observação da Terra.
                                </p>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Características:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Resolução: 5-80m</li>
                                    <li>• Múltiplos sensores (MUX, PAN, WFI)</li>
                                    <li>• Revisita: 5 dias (WFI)</li>
                                    <li>• Foco: América do Sul</li>
                                  </ul>
                                </div>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Aplicações:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Desmatamento</li>
                                    <li>• Planejamento urbano</li>
                                    <li>• Recursos naturais</li>
                                    <li>• Estudos ambientais</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                            {dataset.id === "sentinel-2-sns" && (
                              <div className="space-y-3 text-sm">
                                <p>
                                  <strong>SNS Topic</strong> para notificações automáticas quando novas cenas Sentinel-2 são adicionadas ao bucket.
                                </p>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Funcionalidades:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Notificações em tempo real</li>
                                    <li>• Integração com Lambda</li>
                                    <li>• Webhooks personalizados</li>
                                    <li>• Processamento automatizado</li>
                                  </ul>
                                </div>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Casos de Uso:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Pipeline de dados automatizado</li>
                                    <li>• Alertas de novas imagens</li>
                                    <li>• Sincronização de sistemas</li>
                                    <li>• Processamento em lote</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                            {dataset.id === "cbers-sns" && (
                              <div className="space-y-3 text-sm">
                                <p>
                                  <strong>SNS Topic</strong> para notificações automáticas quando novas cenas CBERS são adicionadas ao bucket.
                                </p>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Funcionalidades:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Notificações em tempo real</li>
                                    <li>• Integração com Lambda</li>
                                    <li>• Webhooks personalizados</li>
                                    <li>• Processamento automatizado</li>
                                  </ul>
                                </div>
                                <Separator />
                                <div>
                                  <p className="font-semibold mb-2">Casos de Uso:</p>
                                  <ul className="space-y-1 text-muted-foreground">
                                    <li>• Pipeline de dados automatizado</li>
                                    <li>• Alertas de novas imagens</li>
                                    <li>• Sincronização de sistemas</li>
                                    <li>• Processamento em lote</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="bg-linear-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Info size={20} weight="fill" className="text-blue-600" />
                              Acesso aos Dados
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <p className="text-muted-foreground">
                              Todos os datasets são de acesso público e não requerem autenticação AWS.
                            </p>
                            <div className="p-3 bg-card rounded-lg border">
                              <p className="font-semibold mb-1">Pré-requisitos:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• AWS CLI instalado (opcional)</li>
                                <li>• Cliente STAC compatível</li>
                                <li>• Conhecimento básico de S3</li>
                              </ul>
                            </div>
                            <Button 
                              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-90"
                              onClick={() => window.open("https://registry.opendata.aws/bdc/", "_blank")}
                            >
                              <Globe className="mr-2" size={16} weight="bold" />
                              Ver Documentação Completa
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell size={24} weight="fill" className="text-purple-600" />
                    Sobre o Brazil Data Cube
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O <strong>Brazil Data Cube (BDC)</strong> é um projeto do INPE (Instituto Nacional de Pesquisas Espaciais) 
                    que fornece cubos de dados de observação da Terra prontos para análise (Analysis Ready Data - ARD). 
                    Os datasets estão disponíveis gratuitamente na AWS como parte do programa Open Data Sponsorship.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 bg-linear-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
                      <div className="text-2xl mb-2">🌐</div>
                      <h4 className="font-semibold mb-1">Acesso Global</h4>
                      <p className="text-xs text-muted-foreground">
                        Dados acessíveis de qualquer lugar do mundo sem custos
                      </p>
                    </div>
                    <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="text-2xl mb-2">📊</div>
                      <h4 className="font-semibold mb-1">Analysis Ready</h4>
                      <p className="text-xs text-muted-foreground">
                        Dados pré-processados e prontos para uso imediato
                      </p>
                    </div>
                    <div className="p-4 bg-linear-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
                      <div className="text-2xl mb-2">🔄</div>
                      <h4 className="font-semibold mb-1">Atualizações Regulares</h4>
                      <p className="text-xs text-muted-foreground">
                        Novas cenas adicionadas continuamente ao catálogo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
