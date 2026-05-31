import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bank, CreditCard, TrendUp, CheckCircle, Lightning } from "@phosphor-icons/react"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

interface FinancingOption {
  id: string
  bank: string
  interestRate: number
  installments: number
  monthlyPayment: number
  totalAmount: number
  approved: boolean
  score: number
}

interface SolarFinancingWidgetProps {
  projectValue: number
  options?: FinancingOption[]
  onSelectOption?: (option: FinancingOption) => void
}

export function SolarFinancingWidget({ projectValue, options, onSelectOption }: SolarFinancingWidgetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const defaultOptions: FinancingOption[] = options || [
    {
      id: '1',
      bank: 'Banco do Brasil',
      interestRate: 1.49,
      installments: 60,
      monthlyPayment: projectValue * 0.0224,
      totalAmount: projectValue * 1.344,
      approved: true,
      score: 95
    },
    {
      id: '2',
      bank: 'Caixa Econômica Federal',
      interestRate: 1.69,
      installments: 60,
      monthlyPayment: projectValue * 0.0236,
      totalAmount: projectValue * 1.416,
      approved: true,
      score: 88
    },
    {
      id: '3',
      bank: 'Santander',
      interestRate: 1.89,
      installments: 48,
      monthlyPayment: projectValue * 0.0268,
      totalAmount: projectValue * 1.286,
      approved: true,
      score: 82
    },
    {
      id: '4',
      bank: 'BNB - Banco do Nordeste',
      interestRate: 1.25,
      installments: 72,
      monthlyPayment: projectValue * 0.0195,
      totalAmount: projectValue * 1.404,
      approved: true,
      score: 98
    }
  ]

  const handleSelect = (option: FinancingOption) => {
    setSelectedId(option.id)
    onSelectOption?.(option)
  }

  const getBankIcon = (bank: string) => {
    return <Bank size={24} weight="duotone" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-[#00D98C]"
    if (score >= 80) return "text-[hsl(var(--solar-yellow))]"
    return "text-[hsl(var(--solar-orange))]"
  }

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D98C] to-[#00A86B] flex items-center justify-center shadow-lg">
            <CreditCard size={24} weight="bold" className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Simulação de Financiamento</h3>
            <p className="text-sm text-muted-foreground">
              Valor do projeto: <span className="font-semibold text-foreground">
                R$ {projectValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {defaultOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card
                className={`p-4 transition-all border-2 hover:shadow-lg cursor-pointer ${
                  selectedId === option.id
                    ? 'border-[#00D98C] bg-[#00D98C]/5'
                    : 'border-border hover:border-[#00D98C]/50'
                }`}
                onClick={() => handleSelect(option)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {getBankIcon(option.bank)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground">{option.bank}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {option.approved && (
                            <Badge variant="outline" className="border-[#00D98C] text-[#00D98C] py-0">
                              <CheckCircle size={12} weight="fill" className="mr-1" />
                              Aprovado
                            </Badge>
                          )}
                          <Badge variant="secondary" className="py-0">
                            Score: <span className={`ml-1 font-bold ${getScoreColor(option.score)}`}>
                              {option.score}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {selectedId === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <CheckCircle size={24} weight="fill" className="text-[#00D98C]" />
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Taxa ao mês
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {option.interestRate.toFixed(2)}%
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Parcelas
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {option.installments}x
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-[#00D98C]/10 to-[#00A86B]/10 rounded-xl border border-[#00D98C]/30">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm text-muted-foreground">Parcela mensal:</span>
                      <span className="text-2xl font-bold text-[#00D98C]">
                        R$ {option.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Valor total:</span>
                      <span className="text-base font-semibold text-foreground">
                        R$ {option.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Pontuação de aprovação</span>
                      <span className={`font-semibold ${getScoreColor(option.score)}`}>{option.score}/100</span>
                    </div>
                    <Progress value={option.score} className="h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4 border-t-2 border-border"
        >
          <Button
            disabled={!selectedId}
            className="w-full bg-gradient-to-r from-[#00D98C] to-[#00A86B] hover:opacity-90 text-white font-semibold h-12"
          >
            <TrendUp size={20} weight="bold" className="mr-2" />
            {selectedId ? 'Prosseguir com Financiamento' : 'Selecione uma opção'}
          </Button>

          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightning size={16} weight="fill" className="text-[hsl(var(--solar-yellow))] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Simulação baseada em análise de crédito pré-aprovada. Taxas e condições sujeitas a confirmação pelos bancos.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
