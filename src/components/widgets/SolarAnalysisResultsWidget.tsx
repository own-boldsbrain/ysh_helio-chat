import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sun, Lightning, CurrencyCircleDollar, Leaf, 
  MapPin, FilePdf, Share, ChartBar, TrendUp 
} from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface SolarAnalysisResultsWidgetProps {
  data: {
    location: {
      displayName: string
      lat: number
      lon: number
      city: string
      state: string
    }
    roof: {
      area: number
      azimuth: number
      orientation: string
      qualityScore: number
    }
    irradiation: {
      daily: number
      monthly: number
      annual: number
      source: string
    }
    system: {
      recommendedPower: number
      panelCount: number
      annualProduction: number
      efficiency: number
    }
    financial: {
      estimatedCost: number
      monthlySavings: number
      annualSavings: number
      paybackYears: number
      roi25Years: number
    }
    environmental: {
      co2Offset: number
      treesEquivalent: number
    }
    demographics?: {
      population: number
      averageIncome: number
    }
  }
  onAction?: (action: { type: string; payload: any }) => void
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

export function SolarAnalysisResultsWidget({ data, onAction }: SolarAnalysisResultsWidgetProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const handleExportReport = () => {
    toast.success("Gerando relatório PDF...")
    onAction?.({ type: "export_report", payload: {} })
  }

  const handleRequestProposal = () => {
    onAction?.({ type: "request_proposal", payload: {} })
  }

  const handleSimulateFinancing = () => {
    onAction?.({ type: "simulate_financing", payload: {} })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number, decimals: number = 1) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="max-w-4xl border-2 shadow-2xl overflow-hidden bg-card">
        <div className="bg-gradient-to-br from-[hsl(var(--solar-yellow))]/20 via-[hsl(var(--solar-red))]/10 to-[hsl(var(--solar-pink))]/20 p-6 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-14 h-14 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.08, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Sun className="text-white" size={28} weight="fill" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Análise Solar Completa</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Relatório técnico e viabilidade financeira
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-solar-r text-foreground font-bold px-4 py-2 text-sm">
              ✓ Análise Concluída
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm bg-background/60 backdrop-blur-sm rounded-lg p-3">
            <MapPin size={16} weight="fill" className="text-accent flex-shrink-0" />
            <p className="text-foreground font-medium truncate">{data.location.displayName}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b px-6 h-14 bg-muted/30">
            <TabsTrigger value="overview" className="font-semibold">
              <ChartBar className="mr-2" size={18} weight="bold" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="technical" className="font-semibold">
              <Lightning className="mr-2" size={18} weight="bold" />
              Técnico
            </TabsTrigger>
            <TabsTrigger value="financial" className="font-semibold">
              <CurrencyCircleDollar className="mr-2" size={18} weight="bold" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="environmental" className="font-semibold">
              <Leaf className="mr-2" size={18} weight="bold" />
              Ambiental
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 p-5 rounded-xl border-2 border-yellow-200 dark:border-yellow-800"
              >
                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-bold uppercase tracking-wide mb-2">
                  Sistema Recomendado
                </p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formatNumber(data.system.recommendedPower, 2)} kWp
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {data.system.panelCount} painéis solares
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-5 rounded-xl border-2 border-green-200 dark:border-green-800"
              >
                <p className="text-xs text-green-700 dark:text-green-300 font-bold uppercase tracking-wide mb-2">
                  Geração Anual
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {formatNumber(data.system.annualProduction / 1000, 1)} MWh
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  ~{formatNumber(data.system.annualProduction / 12, 0)} kWh/mês
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800"
              >
                <p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wide mb-2">
                  Investimento
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(data.financial.estimatedCost)}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Valor total do projeto
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-5 rounded-xl border-2 border-purple-200 dark:border-purple-800"
              >
                <p className="text-xs text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wide mb-2">
                  Retorno (Payback)
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {formatNumber(data.financial.paybackYears, 1)} anos
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Economia: {formatCurrency(data.financial.monthlySavings)}/mês
                </p>
              </motion.div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                📊 Projeção Financeira (25 anos)
              </h4>
              <div className="bg-muted/40 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Economia Total</p>
                    <p className="text-3xl font-bold text-foreground">
                      {formatCurrency(data.financial.roi25Years)}
                    </p>
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <TrendUp size={48} weight="bold" className="text-green-600" />
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ano 1</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(data.financial.annualSavings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ano 10</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(data.financial.annualSavings * 10)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ano 25</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(data.financial.roi25Years)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 min-w-[200px]">
                <Button
                  onClick={handleRequestProposal}
                  className="w-full bg-gradient-solar-r hover:opacity-90 shadow-lg font-semibold h-12"
                >
                  <Sun className="mr-2" size={20} weight="fill" />
                  Solicitar Proposta Comercial
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  onClick={handleSimulateFinancing}
                  className="border-2 h-12 font-semibold"
                >
                  <CurrencyCircleDollar className="mr-2" size={20} weight="bold" />
                  Simular Financiamento
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  onClick={handleExportReport}
                  className="border-2 h-12 font-semibold"
                >
                  <FilePdf className="mr-2" size={20} weight="bold" />
                  Exportar PDF
                </Button>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                ☀️ Dados de Irradiação Solar
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/40 rounded-xl p-5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    Irradiação Diária
                  </p>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(data.irradiation.daily, 2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">kWh/m²/dia</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    Irradiação Mensal
                  </p>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(data.irradiation.monthly, 1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">kWh/m²/mês</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    Irradiação Anual
                  </p>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(data.irradiation.annual, 1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">kWh/m²/ano</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                📡 Fonte: {data.irradiation.source}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                📐 Características do Telhado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/40 rounded-xl p-5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    Área Disponível
                  </p>
                  <p className="text-4xl font-bold text-foreground">{formatNumber(data.roof.area, 1)} m²</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    Orientação
                  </p>
                  <p className="text-3xl font-bold text-foreground">{data.roof.orientation}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.roof.azimuth}° • Qualidade: {data.roof.qualityScore}%
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                ⚡ Especificações do Sistema
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <span className="text-sm font-semibold text-foreground">Potência Instalada</span>
                  <span className="text-lg font-bold text-foreground">{formatNumber(data.system.recommendedPower, 2)} kWp</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <span className="text-sm font-semibold text-foreground">Número de Painéis</span>
                  <span className="text-lg font-bold text-foreground">{data.system.panelCount} unidades</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <span className="text-sm font-semibold text-foreground">Geração Anual Estimada</span>
                  <span className="text-lg font-bold text-foreground">{formatNumber(data.system.annualProduction, 0)} kWh</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <span className="text-sm font-semibold text-foreground">Eficiência do Sistema</span>
                  <span className="text-lg font-bold text-foreground">{data.system.efficiency}%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                💰 Análise de Investimento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wide mb-2">
                    Investimento Inicial
                  </p>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    {formatCurrency(data.financial.estimatedCost)}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Kit completo: painéis + inversor + estrutura + instalação
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 font-bold uppercase tracking-wide mb-2">
                    Economia Mensal
                  </p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100 mb-2">
                    {formatCurrency(data.financial.monthlySavings)}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Economia anual: {formatCurrency(data.financial.annualSavings)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wide mb-2">
                    ⏱️ Tempo de Retorno (Payback)
                  </p>
                  <p className="text-5xl font-bold text-purple-900 dark:text-purple-100">
                    {formatNumber(data.financial.paybackYears, 1)} anos
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                    Após esse período, toda economia é lucro líquido!
                  </p>
                </div>
                <div className="text-6xl">💎</div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                📈 Retorno em 25 Anos
              </h4>
              <div className="bg-muted/40 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Economizado</p>
                    <p className="text-5xl font-bold bg-gradient-solar-r bg-clip-text text-transparent">
                      {formatCurrency(data.financial.roi25Years)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">ROI</p>
                    <p className="text-4xl font-bold text-green-600">
                      {formatNumber((data.financial.roi25Years / data.financial.estimatedCost - 1) * 100, 0)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">5 anos:</span>
                    <span className="font-bold text-foreground">{formatCurrency(data.financial.annualSavings * 5)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">10 anos:</span>
                    <span className="font-bold text-foreground">{formatCurrency(data.financial.annualSavings * 10)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">15 anos:</span>
                    <span className="font-bold text-foreground">{formatCurrency(data.financial.annualSavings * 15)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-3">
                    <span className="text-muted-foreground font-semibold">25 anos:</span>
                    <span className="font-bold text-green-600 text-lg">{formatCurrency(data.financial.roi25Years)}</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSimulateFinancing}
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-2"
              >
                <CurrencyCircleDollar className="mr-2" size={24} weight="bold" />
                Simular Financiamento com Bancos
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="environmental" className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                🌍 Impacto Ambiental Positivo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-8 rounded-xl border-2 border-green-200 dark:border-green-800 text-center"
                >
                  <div className="text-6xl mb-4">🌳</div>
                  <p className="text-xs text-green-700 dark:text-green-300 font-bold uppercase tracking-wide mb-2">
                    Equivalente ao Plantio de
                  </p>
                  <p className="text-5xl font-bold text-green-900 dark:text-green-100 mb-2">
                    {data.environmental.treesEquivalent}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    árvores adultas
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-8 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center"
                >
                  <div className="text-6xl mb-4">💨</div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wide mb-2">
                    Redução de CO₂ (25 anos)
                  </p>
                  <p className="text-5xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    {formatNumber(data.environmental.co2Offset / 1000, 1)}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    toneladas de CO₂
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 p-6 rounded-xl border-2 border-teal-200 dark:border-teal-800">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🌱</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-teal-900 dark:text-teal-100 mb-2">
                    Você estará contribuindo para um futuro mais sustentável
                  </p>
                  <ul className="space-y-2 text-xs text-teal-700 dark:text-teal-300">
                    <li>✓ Redução da dependência de combustíveis fósseis</li>
                    <li>✓ Diminuição da emissão de gases de efeito estufa</li>
                    <li>✓ Preservação de recursos naturais para as próximas gerações</li>
                    <li>✓ Incentivo à transição energética limpa no Brasil</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                📊 Comparativos Ambientais
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚗</span>
                    <span className="text-sm font-semibold text-foreground">Equivalente a tirar carros das ruas</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {Math.round(data.environmental.co2Offset / 4600)} veículos
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <span className="text-sm font-semibold text-foreground">Energia limpa gerada</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatNumber(data.system.annualProduction * 25 / 1000, 0)} MWh
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏭</span>
                    <span className="text-sm font-semibold text-foreground">Carvão não queimado</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatNumber(data.environmental.co2Offset * 0.4, 0)} kg
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  )
}
