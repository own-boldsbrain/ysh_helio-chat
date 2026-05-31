import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle, SolarPanel, Lightning } from "@phosphor-icons/react"
import { WorkflowData } from "../SolarWorkflowWizard"
import { toast } from "sonner"

interface EquipmentSelectionStepProps {
  data: WorkflowData
  onNext: (data: Partial<WorkflowData>) => void
  onBack: () => void
}

interface Equipment {
  id: string
  brand: string
  model: string
  power: number
  price: number
  efficiency?: number
  warranty?: number
}

const panelOptions: Equipment[] = [
  { id: "p1", brand: "Canadian Solar", model: "HiKu7 Mono PERC", power: 550, price: 850, efficiency: 21.2, warranty: 25 },
  { id: "p2", brand: "JA Solar", model: "JAM72S30 MR", power: 545, price: 820, efficiency: 21.0, warranty: 25 },
  { id: "p3", brand: "Trina Solar", model: "Vertex S+ TSM", power: 550, price: 830, efficiency: 21.1, warranty: 25 },
]

const inverterOptions: Equipment[] = [
  { id: "i1", brand: "Growatt", model: "MIC MAX", power: 15, price: 4500, efficiency: 98.5, warranty: 10 },
  { id: "i2", brand: "Deye", model: "SUN-12K-SG04LP3", power: 12, price: 4200, efficiency: 98.3, warranty: 10 },
  { id: "i3", brand: "Sungrow", model: "SG12RT", power: 12, price: 4800, efficiency: 98.6, warranty: 10 },
]

const structureOptions = [
  { id: "s1", type: "Fibrocimento (telha colonial)", price: 150 },
  { id: "s2", type: "Metálico (telha metálica)", price: 180 },
  { id: "s3", type: "Solo (carport/estrutura livre)", price: 250 },
]

export function EquipmentSelectionStep({ data, onNext, onBack }: EquipmentSelectionStepProps) {
  const [selectedPanel, setSelectedPanel] = useState(panelOptions[0])
  const [selectedInverter, setSelectedInverter] = useState(inverterOptions[0])
  const [selectedStructure, setSelectedStructure] = useState(structureOptions[0])

  if (!data.sizing) {
    toast.error("Dados de dimensionamento não encontrados")
    return null
  }

  const { panels, systemPowerKWp } = data.sizing

  const findBestInverter = (systemPower: number) => {
    return inverterOptions.find(inv => inv.power >= systemPower * 0.8 && inv.power <= systemPower * 1.2) || inverterOptions[0]
  }

  const bestInverter = findBestInverter(systemPowerKWp)

  const calculateTotalCost = () => {
    const panelsCost = (panels || 0) * selectedPanel.price
    const inverterCost = selectedInverter.price
    const structureCost = (panels || 0) * selectedStructure.price
    const installationCost = systemPowerKWp * 800
    const additionalCost = systemPowerKWp * 400
    
    return panelsCost + inverterCost + structureCost + installationCost + additionalCost
  }

  const totalCost = calculateTotalCost()

  const handleSubmit = () => {
    onNext({
      equipment: {
        panel: selectedPanel,
        inverter: selectedInverter,
        structures: [selectedStructure],
        totalCost
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Seleção de Equipamentos</h3>
        <p className="text-sm text-muted-foreground">
          Escolha os equipamentos para seu sistema de {systemPowerKWp} kWp
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <SolarPanel size={24} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
            <h4 className="text-lg font-bold">Módulos Fotovoltaicos ({panels} unidades)</h4>
          </div>
          <div className="grid gap-3">
            {panelOptions.map((panel) => (
              <Card
                key={panel.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedPanel.id === panel.id
                    ? "border-2 border-accent bg-accent/5"
                    : "border-2 border-transparent hover:border-accent/30"
                }`}
                onClick={() => setSelectedPanel(panel)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedPanel.id === panel.id
                          ? "border-accent bg-accent"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedPanel.id === panel.id && (
                        <CheckCircle size={12} weight="fill" className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold">{panel.brand}</p>
                        <Badge variant="outline">{panel.power}W</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{panel.model}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Eficiência: {panel.efficiency}%</span>
                        <span>Garantia: {panel.warranty} anos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">R$ {panel.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">por unidade</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightning size={24} weight="fill" className="text-[hsl(var(--solar-red))]" />
            <h4 className="text-lg font-bold">Inversor Solar</h4>
          </div>
          <div className="grid gap-3">
            {inverterOptions.map((inverter) => {
              const isCompatible = inverter.power >= systemPowerKWp * 0.8 && inverter.power <= systemPowerKWp * 1.2
              
              return (
                <Card
                  key={inverter.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedInverter.id === inverter.id
                      ? "border-2 border-accent bg-accent/5"
                      : "border-2 border-transparent hover:border-accent/30"
                  } ${!isCompatible ? "opacity-50" : ""}`}
                  onClick={() => isCompatible && setSelectedInverter(inverter)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedInverter.id === inverter.id
                            ? "border-accent bg-accent"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedInverter.id === inverter.id && (
                          <CheckCircle size={12} weight="fill" className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">{inverter.brand}</p>
                          <Badge variant="outline">{inverter.power} kW</Badge>
                          {isCompatible && inverter.id === bestInverter.id && (
                            <Badge className="bg-gradient-solar-r text-foreground">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{inverter.model}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Eficiência: {inverter.efficiency}%</span>
                          <span>Garantia: {inverter.warranty} anos</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">R$ {inverter.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">unidade</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4">Estrutura de Fixação</h4>
          <div className="grid gap-3">
            {structureOptions.map((structure) => (
              <Card
                key={structure.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedStructure.id === structure.id
                    ? "border-2 border-accent bg-accent/5"
                    : "border-2 border-transparent hover:border-accent/30"
                }`}
                onClick={() => setSelectedStructure(structure)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedStructure.id === structure.id
                          ? "border-accent bg-accent"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedStructure.id === structure.id && (
                        <CheckCircle size={12} weight="fill" className="text-white" />
                      )}
                    </div>
                    <p className="font-semibold">{structure.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {structure.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">por painel</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-green-500/5 to-green-600/5 border-2 border-green-500/20">
        <h4 className="font-bold mb-4">Resumo do Investimento</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Painéis ({panels || 0}x)</span>
            <span className="font-semibold">R$ {((panels || 0) * selectedPanel.price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Inversor</span>
            <span className="font-semibold">R$ {selectedInverter.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estrutura de fixação</span>
            <span className="font-semibold">R$ {((panels || 0) * selectedStructure.price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Instalação e mão de obra</span>
            <span className="font-semibold">R$ {(systemPowerKWp * 800).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Projeto, homologação e materiais</span>
            <span className="font-semibold">R$ {(systemPowerKWp * 400).toLocaleString()}</span>
          </div>
          <div className="pt-3 border-t-2 border-border flex justify-between">
            <span className="font-bold text-lg">Investimento Total</span>
            <span className="font-bold text-2xl text-green-600">
              R$ {totalCost.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12">
          <ArrowLeft size={20} weight="bold" />
          <span className="ml-2">Voltar</span>
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 h-12 bg-gradient-solar-r hover:opacity-90 text-foreground"
        >
          <span>Continuar</span>
          <ArrowRight size={20} className="ml-2" weight="bold" />
        </Button>
      </div>
    </div>
  )
}
