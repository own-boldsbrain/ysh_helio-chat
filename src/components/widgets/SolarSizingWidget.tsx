import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calculator, Lightning, Sun, TrendUp, MapPin } from "@phosphor-icons/react"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

interface SizingResult {
  panels: number
  power: number
  area: number
  cost: number
  savings: number
  annualProduction: number
  paybackYears: number
}

interface SolarSizingWidgetProps {
  onCalculate?: (result: SizingResult) => void
  initialConsumption?: number
  location?: string
}

export function SolarSizingWidget({ onCalculate, initialConsumption, location }: SolarSizingWidgetProps) {
  const [monthlyConsumption, setMonthlyConsumption] = useState(initialConsumption?.toString() || "")
  const [roofArea, setRoofArea] = useState("")
  const [result, setResult] = useState<SizingResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateSystem = () => {
    const consumption = parseFloat(monthlyConsumption)
    const area = parseFloat(roofArea)

    if (!consumption || !area || consumption <= 0 || area <= 0) {
      return
    }

    setIsCalculating(true)

    setTimeout(() => {
      const dailyConsumption = consumption / 30
      const solarHours = 5.2
      const panelPower = 0.55
      const efficiency = 0.8

      const requiredPower = dailyConsumption / (solarHours * efficiency)
      const numberOfPanels = Math.ceil(requiredPower / panelPower)
      const totalPower = numberOfPanels * panelPower
      const requiredArea = numberOfPanels * 2
      const estimatedCost = numberOfPanels * 1200
      const monthlySavings = consumption * 0.75 * 0.85
      const annualProduction = totalPower * solarHours * 365 * efficiency
      const paybackYears = estimatedCost / (monthlySavings * 12)

      const calculatedResult: SizingResult = {
        panels: numberOfPanels,
        power: totalPower,
        area: requiredArea,
        cost: estimatedCost,
        savings: monthlySavings,
        annualProduction,
        paybackYears
      }

      setResult(calculatedResult)
      setIsCalculating(false)
      onCalculate?.(calculatedResult)
    }, 800)
  }

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] flex items-center justify-center shadow-lg">
            <Calculator size={24} weight="bold" className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Dimensionamento Solar</h3>
            <p className="text-sm text-muted-foreground">Calcule o sistema ideal</p>
          </div>
        </div>

        {location && (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <MapPin size={16} weight="fill" className="text-[hsl(var(--solar-red))]" />
            <span className="text-sm font-medium">{location}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consumption" className="text-sm font-semibold">
              Consumo Mensal (kWh)
            </Label>
            <Input
              id="consumption"
              type="number"
              placeholder="Ex: 450"
              value={monthlyConsumption}
              onChange={(e) => setMonthlyConsumption(e.target.value)}
              className="border-2 focus:border-[hsl(var(--solar-yellow))]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-semibold">
              Área Disponível (m²)
            </Label>
            <Input
              id="area"
              type="number"
              placeholder="Ex: 50"
              value={roofArea}
              onChange={(e) => setRoofArea(e.target.value)}
              className="border-2 focus:border-[hsl(var(--solar-yellow))]"
            />
          </div>

          <Button
            onClick={calculateSystem}
            disabled={!monthlyConsumption || !roofArea || isCalculating}
            className="w-full bg-gradient-solar-r hover:opacity-90 text-foreground font-semibold h-12"
          >
            {isCalculating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Lightning size={20} weight="fill" />
              </motion.div>
            ) : (
              <>
                <Calculator size={20} weight="bold" className="mr-2" />
                Calcular Sistema
              </>
            )}
          </Button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 pt-4 border-t-2 border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sun size={20} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
              <h4 className="font-bold text-base">Resultado do Dimensionamento</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl"
              >
                <div className="text-3xl font-bold text-foreground mb-1">{result.panels}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Painéis 550W</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl"
              >
                <div className="text-3xl font-bold text-foreground mb-1">{result.power.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">kWp Total</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl"
              >
                <div className="text-3xl font-bold text-foreground mb-1">{result.area}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">m² Necessários</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl"
              >
                <div className="text-xl font-bold text-foreground mb-1">
                  R$ {(result.cost / 1000).toFixed(0)}k
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Investimento</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 bg-gradient-to-br from-[#00D98C]/10 to-[#00A86B]/10 rounded-xl border border-[#00D98C]/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendUp size={20} weight="bold" className="text-[#00D98C]" />
                <span className="font-semibold text-sm">Economia e Retorno</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Economia mensal:</span>
                  <span className="text-lg font-bold text-[#00D98C]">
                    R$ {result.savings.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Produção anual:</span>
                  <span className="text-base font-semibold text-foreground">
                    {result.annualProduction.toFixed(0)} kWh
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Payback:</span>
                  <span className="text-base font-semibold text-foreground">
                    {result.paybackYears.toFixed(1)} anos
                  </span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Retorno do investimento</span>
                  <span className="font-semibold">{((result.paybackYears / 25) * 100).toFixed(0)}% de 25 anos</span>
                </div>
                <Progress value={(result.paybackYears / 25) * 100} className="h-2" />
              </div>
            </motion.div>

            <Badge variant="outline" className="w-full justify-center py-2 border-[hsl(var(--solar-yellow))] text-[hsl(var(--solar-orange))]">
              <Lightning size={16} weight="fill" className="mr-1" />
              Sistema calculado com irradiação média de 5.2 kWh/m²/dia
            </Badge>
          </motion.div>
        )}
      </div>
    </Card>
  )
}
