import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, CurrencyCircleDollar, Bank, TrendUp } from "@phosphor-icons/react"
import { WorkflowData } from "../SolarWorkflowWizard"
import { toast } from "sonner"

interface FinancingStepProps {
  data: WorkflowData
  onNext: (data: Partial<WorkflowData>) => void
  onBack: () => void
}

const banks = [
  { id: "bb", name: "Banco do Brasil", maxTerms: 120, rate: 1.29 },
  { id: "caixa", name: "Caixa Econômica", maxTerms: 240, rate: 1.35 },
  { id: "bv", name: "BV Financeira", maxTerms: 96, rate: 1.89 },
  { id: "santander", name: "Santander", maxTerms: 84, rate: 1.79 },
]

export function FinancingStep({ data, onNext, onBack }: FinancingStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "financed">("financed")
  const [selectedBank, setSelectedBank] = useState(banks[0].id)
  const [termMonths, setTermMonths] = useState("120")
  const [downPayment, setDownPayment] = useState("0")

  if (!data.equipment || !data.consumption) {
    toast.error("Dados de equipamentos ou consumo não encontrados")
    return null
  }

  const { totalCost } = data.equipment
  const { averageBill } = data.consumption

  const bank = banks.find(b => b.id === selectedBank) || banks[0]
  const terms = Number(termMonths)
  const down = Number(downPayment)
  const financeAmount = totalCost - down

  const calculateMonthlyPayment = () => {
    const monthlyRate = bank.rate / 100
    const payment = financeAmount * (monthlyRate * Math.pow(1 + monthlyRate, terms)) / (Math.pow(1 + monthlyRate, terms) - 1)
    return payment
  }

  const calculateTotalWithInterest = () => {
    return calculateMonthlyPayment() * terms + down
  }

  const monthlyPayment = calculateMonthlyPayment()
  const totalWithInterest = calculateTotalWithInterest()
  const netMonthlySavings = paymentMethod === "cash" ? averageBill : averageBill - monthlyPayment

  const handleSubmit = () => {
    if (paymentMethod === "financed") {
      onNext({
        financing: {
          method: "financed",
          bank: bank.name,
          term: terms,
          monthlyPayment,
          totalWithInterest
        }
      })
    } else {
      onNext({
        financing: {
          method: "cash"
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Forma de Pagamento</h3>
        <p className="text-sm text-muted-foreground">
          Escolha como deseja investir no seu sistema solar
        </p>
      </div>

      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
        <div className="grid gap-4">
          <Card
            className={`p-6 cursor-pointer transition-all ${
              paymentMethod === "cash"
                ? "border-2 border-accent bg-accent/5"
                : "border-2 border-transparent hover:border-accent/30"
            }`}
            onClick={() => setPaymentMethod("cash")}
          >
            <div className="flex items-start gap-4">
              <RadioGroupItem value="cash" id="cash" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CurrencyCircleDollar size={24} weight="fill" className="text-green-600" />
                  <Label htmlFor="cash" className="text-lg font-bold cursor-pointer">
                    Pagamento à Vista
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Economize nos juros e tenha o melhor retorno sobre investimento
                </p>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor total</p>
                      <p className="text-3xl font-bold text-green-600">
                        R$ {totalCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Economia mensal</p>
                      <p className="text-2xl font-bold">
                        R$ {averageBill.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-500/20">
                    <p className="text-sm font-semibold text-green-600">
                      ✓ Sem juros • ✓ Payback em {(totalCost / (averageBill * 12)).toFixed(1)} anos • ✓ ROI 25 anos: {((averageBill * 12 * 25 / totalCost - 1) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all ${
              paymentMethod === "financed"
                ? "border-2 border-accent bg-accent/5"
                : "border-2 border-transparent hover:border-accent/30"
            }`}
            onClick={() => setPaymentMethod("financed")}
          >
            <div className="flex items-start gap-4">
              <RadioGroupItem value="financed" id="financed" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Bank size={24} weight="fill" className="text-blue-600" />
                  <Label htmlFor="financed" className="text-lg font-bold cursor-pointer">
                    Financiamento Bancário
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Parcele o investimento e comece a economizar imediatamente
                </p>

                {paymentMethod === "financed" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank">Banco</Label>
                        <Select value={selectedBank} onValueChange={setSelectedBank}>
                          <SelectTrigger id="bank">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank.id} value={bank.id}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="term">Prazo (meses)</Label>
                        <Select value={termMonths} onValueChange={setTermMonths}>
                          <SelectTrigger id="term">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 meses</SelectItem>
                            <SelectItem value="36">36 meses</SelectItem>
                            <SelectItem value="48">48 meses</SelectItem>
                            <SelectItem value="60">60 meses</SelectItem>
                            <SelectItem value="72">72 meses</SelectItem>
                            <SelectItem value="84">84 meses</SelectItem>
                            <SelectItem value="96">96 meses</SelectItem>
                            <SelectItem value="120">120 meses</SelectItem>
                            {bank.maxTerms >= 240 && <SelectItem value="240">240 meses</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="downPayment">Entrada (opcional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="downPayment"
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(e.target.value)}
                          className="pl-9"
                          min="0"
                          max={totalCost}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Taxa de juros</span>
                        <span className="font-semibold">{bank.rate}% a.m.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor financiado</span>
                        <span className="font-semibold">R$ {financeAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-blue-500/20">
                        <div>
                          <p className="text-sm text-muted-foreground">Parcela mensal</p>
                          <p className="text-3xl font-bold text-blue-600">
                            R$ {monthlyPayment.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Conta de luz atual</p>
                          <p className="text-2xl font-bold line-through text-muted-foreground">
                            R$ {averageBill.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {netMonthlySavings > 0 ? (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                          <TrendUp size={20} weight="bold" className="text-green-600 flex-shrink-0" />
                          <p className="text-sm font-semibold text-green-600">
                            Economia líquida de R$ {netMonthlySavings.toFixed(2)}/mês desde o início!
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                          <p className="text-sm font-semibold text-yellow-600">
                            Parcela maior que conta atual. Considere prazo maior ou entrada.
                          </p>
                        </div>
                      )}
                      <div className="pt-3 border-t border-blue-500/20">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total pago (juros inclusos)</span>
                          <span className="font-semibold">R$ {totalWithInterest.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </RadioGroup>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">💡 Qual a melhor opção?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>À vista:</strong> Melhor ROI, payback mais rápido, economia imediata de 100% da conta
          </li>
          <li>
            <strong>Financiado:</strong> Não compromete capital, permite investir em outras áreas, economia líquida desde o primeiro mês
          </li>
          <li>
            <strong>Dica:</strong> Compare a parcela com sua conta atual - se for menor, você já economiza desde o início!
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
