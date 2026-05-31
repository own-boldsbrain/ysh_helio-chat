import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendUp, Leaf, Lightning } from "@phosphor-icons/react"
import { motion } from "framer-motion"

export interface Scenario {
  id: string
  name: string
  multiplier: number
  systemSize: number
  panelCount: number
  estimatedGeneration: number
  investment: number
  payback: number
  roi25Years: number
  coverage: string
  description: string
  recommended?: boolean
}

interface ScenarioComparisonProps {
  scenarios: Scenario[]
  selectedScenarioId?: string
  onSelectScenario: (scenarioId: string) => void
  className?: string
}

export function ScenarioComparison({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  className = ""
}: ScenarioComparisonProps) {
  const getScenarioIcon = (index: number) => {
    const icons = [Leaf, Star, Lightning]
    const Icon = icons[index] || Star
    return Icon
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {scenarios.map((scenario, index) => {
        const isSelected = selectedScenarioId === scenario.id
        const Icon = getScenarioIcon(index)

        return (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`
                relative h-full flex flex-col transition-all duration-200 cursor-pointer
                ${scenario.recommended ? 'border-accent border-2 shadow-lg' : 'border-border'}
                ${isSelected ? 'ring-2 ring-accent ring-offset-2' : ''}
                hover:shadow-lg hover:scale-[1.02]
              `}
              onClick={() => onSelectScenario(scenario.id)}
            >
              {scenario.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-solar-r text-foreground px-3 py-1">
                    ⭐ Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center
                    ${scenario.recommended 
                    ? 'bg-gradient-solar-br' 
                      : 'bg-muted'
                    }
                  `}>
                    <Icon 
                      size={28} 
                      weight="fill" 
                      className={scenario.recommended ? 'text-white' : 'text-muted-foreground'} 
                    />
                  </div>
                </div>
                
                <CardTitle className="text-xl">{scenario.name}</CardTitle>
                <CardDescription className="text-sm mt-2">
                  {scenario.description}
                </CardDescription>
                
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    Multiplicador: {scenario.multiplier}x
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Potência do Sistema</span>
                    <span className="text-sm font-bold">{scenario.systemSize.toFixed(2)} kWp</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Painéis</span>
                    <span className="text-sm font-bold">{scenario.panelCount} unidades</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Geração Estimada</span>
                    <span className="text-sm font-bold">{scenario.estimatedGeneration} kWh/mês</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cobertura</span>
                    <span className="text-sm font-bold">{scenario.coverage}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Investimento</span>
                    <span className="text-base font-bold text-accent">
                      {formatCurrency(scenario.investment)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payback</span>
                    <span className="text-sm font-bold">{scenario.payback.toFixed(1)} anos</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ROI (25 anos)</span>
                    <span className="text-sm font-bold text-green-600">
                      {scenario.roi25Years.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectScenario(scenario.id)
                  }}
                >
                  {isSelected ? 'Selecionado' : 'Selecionar'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export const generateDemoScenarios = (
  monthlyConsumption: number,
  irradiation: number = 5.5,
  performanceRatio: number = 0.80
): Scenario[] => {
  const calculateScenario = (
    name: string,
    multiplier: number,
    coverage: string,
    description: string,
    recommended: boolean = false
  ): Scenario => {
    const systemSize = (monthlyConsumption * multiplier) / (irradiation * performanceRatio * 30)
    const panelCount = Math.ceil(systemSize / 0.55)
    const estimatedGeneration = systemSize * irradiation * performanceRatio * 30
    const investment = systemSize * 4500
    const monthlySavings = (estimatedGeneration * 0.85) / 100
    const payback = investment / (monthlySavings * 12)
    const roi25Years = ((monthlySavings * 12 * 25) / investment) * 100

    return {
      id: name.toLowerCase(),
      name,
      multiplier,
      systemSize,
      panelCount,
      estimatedGeneration: Math.round(estimatedGeneration),
      investment: Math.round(investment),
      payback: parseFloat(payback.toFixed(1)),
      roi25Years: Math.round(roi25Years),
      coverage,
      description,
      recommended,
    }
  }

  return [
    calculateScenario(
      'Conservador',
      1.14,
      '85-90%',
      'Sistema menor, mais conservador. Ideal para quem quer investimento inicial menor.'
    ),
    calculateScenario(
      'Equilibrado',
      1.30,
      '95-100%',
      'Balanço entre investimento e retorno. Compensa perdas e coberturas nubladas.',
      true
    ),
    calculateScenario(
      'Otimizado',
      1.45,
      '100%+',
      'Sistema maior, maximiza economia futura. Gera créditos extras para consumo crescente.'
    ),
  ]
}
