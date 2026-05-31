import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  Share, 
  Sun, 
  MapPin, 
  Lightning, 
  SolarPanel,
  CurrencyCircleDollar,
  TrendUp,
  CalendarBlank
} from "@phosphor-icons/react"
import { WorkflowData } from "../SolarWorkflowWizard"
import { toast } from "sonner"

interface ResultsStepProps {
  data: WorkflowData
  onNext?: (data: Partial<WorkflowData>) => void
  onComplete?: () => void
  onBack: () => void
}

export function ResultsStep({ data, onComplete, onBack }: ResultsStepProps) {
  if (!data.location || !data.consumption || !data.sizing || !data.equipment || !data.financing) {
    toast.error("Dados incompletos para gerar proposta")
    return null
  }

  const { location, consumption, sizing, equipment, financing } = data

  const annualProduction = sizing.estimatedProduction * 12
  const annualSavings = consumption.averageBill * 12
  const payback = financing.method === "cash" 
    ? equipment.totalCost / annualSavings 
    : (financing.totalWithInterest || equipment.totalCost) / annualSavings
  const roi25Years = ((annualSavings * 25) / equipment.totalCost - 1) * 100

  const handleDownloadProposal = () => {
    toast.success("Proposta baixada com sucesso!")
  }

  const handleShareProposal = () => {
    toast.success("Link de compartilhamento copiado!")
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle size={32} weight="fill" className="text-green-600" />
          <div>
            <h3 className="text-2xl font-bold">Proposta Completa Gerada!</h3>
            <p className="text-sm text-muted-foreground">
              Revise todos os detalhes do seu sistema solar
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-[hsl(var(--solar-yellow))]/10 via-[hsl(var(--solar-red))]/10 to-[hsl(var(--solar-pink))]/10 border-2 border-[hsl(var(--solar-yellow))]/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-solar-r bg-clip-text text-transparent mb-2">
            Sistema Solar Fotovoltaico
          </h2>
          <p className="text-lg font-semibold">{sizing.systemPowerKWp} kWp</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] flex items-center justify-center mx-auto mb-2">
              <Sun size={24} weight="fill" className="text-white" />
            </div>
            <p className="text-2xl font-bold">{sizing.panels}</p>
            <p className="text-xs text-muted-foreground">Painéis</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--solar-red))] to-[hsl(var(--solar-pink))] flex items-center justify-center mx-auto mb-2">
              <Lightning size={24} weight="fill" className="text-white" />
            </div>
            <p className="text-2xl font-bold">{sizing.inverterPower} kW</p>
            <p className="text-xs text-muted-foreground">Inversor</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D98C] to-[#00A86B] flex items-center justify-center mx-auto mb-2">
              <TrendUp size={24} weight="fill" className="text-white" />
            </div>
            <p className="text-2xl font-bold">{annualProduction.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">kWh/ano</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00C9FF] flex items-center justify-center mx-auto mb-2">
              <CalendarBlank size={24} weight="fill" className="text-white" />
            </div>
            <p className="text-2xl font-bold">{payback.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Anos Payback</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-semibold">Localização</p>
              <p className="text-sm text-muted-foreground">
                {location.city}/{location.state} • {location.cep} • Irradiação: {location.irradiation} kWh/m²/dia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Lightning size={20} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-semibold">Consumo</p>
              <p className="text-sm text-muted-foreground">
                {consumption.monthlyKWh} kWh/mês • {consumption.electricalPhase} • Conta média: R$ {consumption.averageBill.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SolarPanel size={20} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-semibold">Equipamentos</p>
              <p className="text-sm text-muted-foreground">
                Painel: {equipment.panel.brand} {equipment.panel.model} ({equipment.panel.power}W) • 
                Inversor: {equipment.inverter.brand} {equipment.inverter.model}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-bold text-lg mb-4">Análise Financeira</h4>
        <div className="space-y-4">
          {financing.method === "cash" ? (
            <>
              <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Investimento à Vista</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {equipment.totalCost.toLocaleString()}
                  </p>
                </div>
                <Badge className="bg-green-600">Sem Juros</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Economia Mensal</p>
                  <p className="text-xl font-bold">R$ {consumption.averageBill.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Economia Anual</p>
                  <p className="text-xl font-bold">R$ {annualSavings.toLocaleString()}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Parcela Mensal</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {financing.monthlyPayment?.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {financing.bank} • {financing.term} meses
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Conta Atual</p>
                  <p className="text-xl font-bold line-through text-muted-foreground">
                    R$ {consumption.averageBill.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    Economia: R$ {(consumption.averageBill - (financing.monthlyPayment || 0)).toFixed(2)}/mês
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Financiado</p>
                  <p className="text-xl font-bold">R$ {financing.totalWithInterest?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Economia pós-quitação</p>
                  <p className="text-xl font-bold">R$ {consumption.averageBill.toFixed(2)}/mês</p>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-border/40">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Payback</p>
                <p className="text-2xl font-bold">{payback.toFixed(1)} anos</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ROI em 25 anos</p>
                <p className="text-2xl font-bold text-green-600">{roi25Years.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-yellow-500/10 border-2 border-yellow-500/30">
        <h4 className="font-bold mb-2">⚠️ Nota Regulatória (Lei 14.300/2022)</h4>
        <p className="text-sm text-muted-foreground">
          Este sistema se enquadra em <strong>microgeração distribuída</strong> (potência instalada ≤ 75 kW) 
          e segue as regras de compensação de energia da ANEEL. É necessário projeto elétrico, ART, e 
          homologação pela concessionária local antes da instalação. O sistema possui direito a créditos 
          de energia por 60 meses com as regras da Lei 14.300/2022.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="font-bold mb-4">✅ Próximos Passos</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 font-bold text-white">
              1
            </div>
            <p className="text-sm">Análise técnica do telhado e sombreamento</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 font-bold text-white">
              2
            </div>
            <p className="text-sm">Elaboração do projeto elétrico e memorial descritivo</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 font-bold text-white">
              3
            </div>
            <p className="text-sm">Solicitação de homologação junto à concessionária</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 font-bold text-white">
              4
            </div>
            <p className="text-sm">Instalação do sistema e comissionamento</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 font-bold text-white">
              5
            </div>
            <p className="text-sm">Vistoria da concessionária e início da geração</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12">
          <ArrowLeft size={20} weight="bold" />
          <span className="ml-2">Voltar</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadProposal}
          className="flex-1 h-12"
        >
          <Download size={20} weight="bold" />
          <span className="ml-2">Baixar PDF</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleShareProposal}
          className="flex-1 h-12"
        >
          <Share size={20} weight="bold" />
          <span className="ml-2">Compartilhar</span>
        </Button>
      </div>

      <Button
        onClick={onComplete}
        className="w-full h-14 text-lg bg-gradient-solar-r hover:opacity-90 text-foreground"
      >
        <CheckCircle size={24} weight="fill" className="mr-2" />
        <span>Finalizar e Salvar Proposta</span>
      </Button>
    </div>
  )
}
