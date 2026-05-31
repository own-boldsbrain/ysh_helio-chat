import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Sparkle } from "@phosphor-icons/react"
import { LocationStep } from "./steps/LocationStep"
import { ConsumptionStep } from "./steps/ConsumptionStep"
import { SizingStep } from "./steps/SizingStep"
import { EquipmentStep } from "./steps/EquipmentStep"
import { FinancingStep } from "./steps/FinancingStep"
import { SummaryStep } from "./steps/SummaryStep"

export interface WorkflowData {
  location?: {
    cep: string
    city: string
    state: string
    lat: number
    lng: number
    irradiation: number
  }
  consumption?: {
    monthlyKWh: number
    electricalPhase: "monofasico" | "bifasico" | "trifasico"
    averageBill: number
  }
  sizing?: {
    scenario: "conservador" | "equilibrado" | "otimizado"
    systemPowerKWp: number
    estimatedProduction: number
    panelCount?: number
    panels?: number
    inverterPower?: number
  }
  equipment?: {
    panels?: any[]
    inverters?: any[]
    structures?: any[]
    panel?: any
    inverter?: any
    totalCost: number
  }
  financing?: {
    method: "cash" | "financed"
    bank?: string
    months?: number
    term?: number
    monthlyPayment?: number
    totalInterest?: number
    totalWithInterest?: number
  }
}

const steps = [
  { id: 1, name: "Localização", description: "CEP e irradiação" },
  { id: 2, name: "Consumo", description: "Conta de energia" },
  { id: 3, name: "Dimensionamento", description: "Potência do sistema" },
  { id: 4, name: "Equipamentos", description: "Painéis e inversores" },
  { id: 5, name: "Financiamento", description: "Forma de pagamento" },
  { id: 6, name: "Resumo", description: "Proposta final" },
]

interface SolarWorkflowWizardProps {
  onComplete?: (data: WorkflowData) => void
  onCancel?: () => void
}

export function SolarWorkflowWizard({ onComplete, onCancel }: SolarWorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [workflowData, setWorkflowData] = useState<WorkflowData>({})

  const progress = (currentStep / steps.length) * 100

  const handleNext = (stepData: Partial<WorkflowData>) => {
    const updatedData = { ...workflowData, ...stepData }
    setWorkflowData(updatedData)

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete?.(updatedData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LocationStep data={workflowData} onNext={handleNext} onBack={handleBack} />
      case 2:
        return <ConsumptionStep data={workflowData} onNext={handleNext} onBack={handleBack} />
      case 3:
        return <SizingStep data={workflowData} onNext={handleNext} onBack={handleBack} />
      case 4:
        return <EquipmentStep data={workflowData} onNext={handleNext} onBack={handleBack} />
      case 5:
        return <FinancingStep data={workflowData} onNext={handleNext} onBack={handleBack} />
      case 6:
        return <SummaryStep data={workflowData} onNext={handleNext} onBack={handleBack} />
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-solar-br flex items-center justify-center">
              <Sparkle size={24} weight="fill" className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Dimensionamento Solar Completo</h2>
              <p className="text-sm text-muted-foreground">
                Etapa {currentStep} de {steps.length}
              </p>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-6" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  step.id === currentStep
                    ? "bg-accent/10 border-2 border-accent"
                    : step.id < currentStep
                    ? "bg-muted/50"
                    : "bg-muted/20"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all">
                  {step.id < currentStep ? (
                    <CheckCircle size={24} weight="fill" className="text-green-600" />
                  ) : step.id === currentStep ? (
                    <Circle size={24} weight="fill" className="text-accent" />
                  ) : (
                    <Circle size={24} weight="regular" className="text-muted-foreground" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold truncate">{step.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </Card>

      {onCancel && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">
            Cancelar workflow
          </Button>
        </div>
      )}
    </div>
  )
}
