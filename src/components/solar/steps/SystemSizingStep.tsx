import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle, Sun, TrendUp } from "@phosphor-icons/react"
import { WorkflowData } from "../SolarWorkflowWizard"
import { toast } from "sonner"

interface SystemSizingStepProps {
  data: WorkflowData
  onNext: (data: Partial<WorkflowData>) => void
  onBack: () => void
}

type Scenario = "conservador" | "equilibrado" | "otimizado"

interface ScenarioData {
  multiplier: number
  systemPowerKWp: number
  estimatedProduction: number
  panels: number
  inverterPower: number
  coverage: string
  description: string
  recommended: boolean
}

export function SystemSizingStep({ data, onNext, onBack }: SystemSizingStepProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("equilibrado")

  if (!data.consumption || !data.location) {
    toast.error("Dados de consumo ou localização não encontrados")
    return null
  }

  const { monthlyKWh } = data.consumption
  const { irradiation } = data.location

  const calculateScenario = (multiplier: number): ScenarioData => {
    const PR = 0.80
    const daysMonth = 30

    const systemPowerKWp = (monthlyKWh * multiplier) / (irradiation * daysMonth * PR)
    const estimatedProduction = systemPowerKWp * irradiation * daysMonth * PR
    
    const panelPower = 550
    const panels = Math.ceil((systemPowerKWp * 1000) / panelPower)
    const actualSystemPower = (panels * panelPower) / 1000
    
    const inverterPower = actualSystemPower * 1.2

    let coverage = ""
    let description = ""
    
    if (multiplier === 1.14) {
      coverage = "85-90%"
      description = "Sistema menor e mais conservador. Ideal para investimento inicial reduzido."
    } else if (multiplier === 1.30) {
      coverage = "95-100%"
      description = "Balanço entre investimento e retorno. Compensa perdas e dias nublados."
    } else {
      coverage = "100% + excedente"
      description = "Sistema maior que gera créditos extras para consumo futuro."
    }

    return {
      multiplier,
      systemPowerKWp: Number(actualSystemPower.toFixed(2)),
      estimatedProduction: Number(estimatedProduction.toFixed(0)),
      panels,
      inverterPower: Number(inverterPower.toFixed(2)),
      coverage,
      description,
      recommended: multiplier === 1.30
    }
  }

  const scenarios: Record<Scenario, ScenarioData> = {
    conservador: calculateScenario(1.14),
    equilibrado: calculateScenario(1.30),
    otimizado: calculateScenario(1.45)
  }

  const handleSubmit = () => {
    const scenario = scenarios[selectedScenario]
    
    onNext({
      sizing: {
        scenario: selectedScenario,
        systemPowerKWp: scenario.systemPowerKWp,
        estimatedProduction: scenario.estimatedProduction,
        panels: scenario.panels,
        inverterPower: scenario.inverterPower
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Dimensionamento do Sistema</h3>
        <p className="text-sm text-muted-foreground">
          Escolha o cenário que melhor atende suas necessidades
        </p>
      </div>

      <div className="grid gap-4">
        {(Object.keys(scenarios) as Scenario[]).map((scenarioKey) => {
          const scenario = scenarios[scenarioKey]
          const isSelected = selectedScenario === scenarioKey
          
          return (
            <Card
              key={scenarioKey}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? "border-2 border-accent shadow-lg bg-accent/5"
                  : "border-2 border-transparent hover:border-accent/30"
              }`}
              onClick={() => setSelectedScenario(scenarioKey)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && <CheckCircle size={16} weight="fill" className="text-white" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold capitalize">{scenarioKey}</h4>
                    {scenario.recommended && (
                      <Badge className="mt-1 bg-gradient-solar-r">
                        ⭐ Recomendado
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  {scenario.systemPowerKWp} kWp
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/40">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Painéis</p>
                  <p className="text-lg font-bold">{scenario.panels} un</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Inversor</p>
                  <p className="text-lg font-bold">{scenario.inverterPower} kW</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Produção/mês</p>
                  <p className="text-lg font-bold">{scenario.estimatedProduction} kWh</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cobertura</p>
                  <p className="text-lg font-bold">{scenario.coverage}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-2 border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Sun size={24} weight="fill" className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-2">Detalhes do Sistema Selecionado</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Potência</p>
                <p className="font-bold">{scenarios[selectedScenario].systemPowerKWp} kWp</p>
              </div>
              <div>
                <p className="text-muted-foreground">Irradiação</p>
                <p className="font-bold">{data.location.irradiation} kWh/m²/dia</p>
              </div>
              <div>
                <p className="text-muted-foreground">Performance Ratio</p>
                <p className="font-bold">80%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Produção anual</p>
                <p className="font-bold">
                  {(scenarios[selectedScenario].estimatedProduction * 12).toLocaleString()} kWh
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Área necessária</p>
                <p className="font-bold">
                  {(scenarios[selectedScenario].panels * 2.5).toFixed(0)} m²
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Vida útil</p>
                <p className="font-bold">25+ anos</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">💡 Como escolher o cenário ideal?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>Conservador (1.14x):</strong> Se busca menor investimento inicial e não se importa em manter
            parte da conta de luz
          </li>
          <li>
            <strong>Equilibrado (1.30x):</strong> Recomendado para maioria dos casos - elimina a conta e tem
            margem de segurança
          </li>
          <li>
            <strong>Otimizado (1.45x):</strong> Se planeja aumentar consumo futuro ou quer gerar créditos extras
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12">
          <ArrowLeft size={20} weight="bold" />
          <span className="ml-2">Voltar</span>
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 h-12 bg-gradient-solar-r hover:opacity-90"
        >
          <span>Continuar</span>
          <ArrowRight size={20} className="ml-2" weight="bold" />
        </Button>
      </div>
    </div>
  )
}
