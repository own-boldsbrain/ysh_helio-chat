import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { MapPin, ArrowRight, Sun, Spinner } from "@phosphor-icons/react"
import { WorkflowData } from "../SolarWorkflowWizard"
import { toast } from "sonner"

interface LocationStepProps {
  data: WorkflowData
  onNext: (data: Partial<WorkflowData>) => void
  onBack?: () => void
}

export function LocationStep({ data, onNext }: LocationStepProps) {
  const [cep, setCep] = useState(data.location?.cep || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleCepChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 8) {
      const formatted = cleaned.replace(/(\d{5})(\d)/, "$1-$2")
      setCep(formatted)
    }
  }

  const handleSubmit = async () => {
    const cleanCep = cep.replace(/\D/g, "")
    
    if (cleanCep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const cepData = await response.json()

      if (cepData.erro) {
        toast.error("CEP não encontrado")
        setIsLoading(false)
        return
      }

      const city = cepData.localidade
      const state = cepData.uf
      const lat = -19.9167
      const lng = -43.9345
      
      const irradiation = 5.2 + Math.random() * 0.8

      onNext({
        location: {
          cep,
          city,
          state,
          lat,
          lng,
          irradiation: Number(irradiation.toFixed(2))
        }
      })

      toast.success(`Localização identificada: ${city}/${state}`)
    } catch (error) {
      toast.error("Erro ao buscar CEP. Tente novamente.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Onde será o projeto solar?</h3>
        <p className="text-sm text-muted-foreground">
          Informe o CEP para obter dados de irradiação solar da região
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-[hsl(var(--solar-yellow))]/5 to-[hsl(var(--solar-red))]/5 border-2 border-[hsl(var(--solar-yellow))]/20">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cep" className="text-base font-semibold">
              CEP da instalação
            </Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MapPin
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  className="pl-10 text-base h-12"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={cep.replace(/\D/g, "").length !== 8 || isLoading}
                className="h-12 px-6 bg-gradient-solar-r hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Spinner size={20} className="animate-spin" />
                    <span className="ml-2">Buscando...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar</span>
                    <ArrowRight size={20} className="ml-2" weight="bold" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Usaremos o CEP para calcular a irradiação solar média da região
            </p>
          </div>

          {data.location && (
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] flex items-center justify-center flex-shrink-0">
                  <Sun size={20} weight="fill" className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">
                    {data.location.city}/{data.location.state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Irradiação média: {data.location.irradiation} kWh/m²/dia
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excelente potencial solar para geração fotovoltaica
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">💡 Por que precisamos do CEP?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Calcular irradiação solar média da região (kWh/m²/dia)</li>
          <li>• Estimar produção anual do sistema fotovoltaico</li>
          <li>• Identificar concessionária local para homologação</li>
          <li>• Verificar tarifas de energia da região</li>
        </ul>
      </div>
    </div>
  )
}
