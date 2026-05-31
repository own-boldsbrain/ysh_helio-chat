import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, ArrowLeft, Lightning, CurrencyCircleDollar } from "@phosphor-icons/react"
import { WorkflowData } from "../SolarWorkflowWizard"
import { toast } from "sonner"

interface ConsumptionStepProps {
  data: WorkflowData
  onNext: (data: Partial<WorkflowData>) => void
  onBack: () => void
}

export function ConsumptionStep({ data, onNext, onBack }: ConsumptionStepProps) {
  const [monthlyKWh, setMonthlyKWh] = useState(data.consumption?.monthlyKWh?.toString() || "")
  const [electricalPhase, setElectricalPhase] = useState<"monofasico" | "bifasico" | "trifasico">(
    data.consumption?.electricalPhase || "monofasico"
  )

  const handleSubmit = () => {
    const kwh = Number(monthlyKWh)
    
    if (!kwh || kwh < 50) {
      toast.error("Consumo deve ser maior que 50 kWh/mês")
      return
    }

    if (kwh > 50000) {
      toast.error("Para consumos acima de 50.000 kWh, entre em contato para dimensionamento personalizado")
      return
    }

    const tariff = 0.85
    const averageBill = kwh * tariff

    onNext({
      consumption: {
        monthlyKWh: kwh,
        electricalPhase,
        averageBill
      }
    })
  }

  const estimatedBill = Number(monthlyKWh) * 0.85

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Qual é o consumo de energia?</h3>
        <p className="text-sm text-muted-foreground">
          Informe o consumo médio mensal em kWh (encontrado na sua conta de luz)
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consumption" className="text-base font-semibold">
              Consumo médio mensal (kWh)
            </Label>
            <div className="relative">
              <Lightning
                size={20}
                weight="fill"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--solar-yellow))]"
              />
              <Input
                id="consumption"
                type="number"
                value={monthlyKWh}
                onChange={(e) => setMonthlyKWh(e.target.value)}
                placeholder="500"
                className="pl-10 text-base h-12"
                min="50"
                max="50000"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Exemplo: residências consomem entre 150-500 kWh/mês, comércios 500-2000 kWh/mês
            </p>
          </div>

          {monthlyKWh && Number(monthlyKWh) >= 50 && (
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <CurrencyCircleDollar size={20} weight="fill" className="text-white" />
                </div>
                <div>
                  <p className="font-semibold">Conta de luz estimada</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {estimatedBill.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Baseado na tarifa média de R$ 0,85/kWh
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-border/40">
          <Label className="text-base font-semibold">Tipo de instalação elétrica</Label>
          <RadioGroup value={electricalPhase} onValueChange={(value) => setElectricalPhase(value as any)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                <RadioGroupItem value="monofasico" id="monofasico" />
                <Label htmlFor="monofasico" className="flex-1 cursor-pointer">
                  <p className="font-semibold">Monofásico (127V)</p>
                  <p className="text-sm text-muted-foreground">
                    Residências pequenas - até 12 kW
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                <RadioGroupItem value="bifasico" id="bifasico" />
                <Label htmlFor="bifasico" className="flex-1 cursor-pointer">
                  <p className="font-semibold">Bifásico (127V/220V)</p>
                  <p className="text-sm text-muted-foreground">
                    Residências médias - até 25 kW
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                <RadioGroupItem value="trifasico" id="trifasico" />
                <Label htmlFor="trifasico" className="flex-1 cursor-pointer">
                  <p className="font-semibold">Trifásico (220V/380V)</p>
                  <p className="text-sm text-muted-foreground">
                    Comércios e indústrias - acima de 25 kW
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">💡 Como encontrar seu consumo?</h4>
        <p className="text-sm text-muted-foreground">
          Procure na sua conta de luz o campo <strong>"Consumo (kWh)"</strong> ou{" "}
          <strong>"Consumo no mês"</strong>. Use a média dos últimos 12 meses para um cálculo mais preciso.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12">
          <ArrowLeft size={20} weight="bold" />
          <span className="ml-2">Voltar</span>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!monthlyKWh || Number(monthlyKWh) < 50}
          className="flex-1 h-12 bg-gradient-solar-r hover:opacity-90"
        >
          <span>Continuar</span>
          <ArrowRight size={20} className="ml-2" weight="bold" />
        </Button>
      </div>
    </div>
  )
}
