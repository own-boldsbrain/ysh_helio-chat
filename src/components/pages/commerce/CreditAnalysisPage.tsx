import { motion } from "framer-motion"
import { CreditCard, CheckCircle, XCircle, Clock, TrendUp, User, Bank, ChartLineUp, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

interface CreditAnalysisPageProps {
  onToggleSidebar: () => void
}

interface CreditAnalysis {
  id: string
  clientName: string
  cpfCnpj: string
  requestedAmount: number
  creditScore: number
  monthlyIncome: number
  status: 'pending' | 'analyzing' | 'approved' | 'rejected'
  approvedAmount?: number
  interestRate?: number
  installments?: number
  bank?: string
  submittedAt: number
  analyzedAt?: number
}

const banks = [
  "Banco do Brasil",
  "Caixa Econômica Federal",
  "Santander",
  "Bradesco",
  "Itaú",
  "BNB - Banco do Nordeste"
]

export function CreditAnalysisPage({ onToggleSidebar }: CreditAnalysisPageProps) {
  const [analyses, setAnalyses] = useKV<CreditAnalysis[]>("credit-analyses", [
    {
      id: '1',
      clientName: 'João Silva',
      cpfCnpj: '123.456.789-00',
      requestedAmount: 35000,
      creditScore: 750,
      monthlyIncome: 8500,
      status: 'approved',
      approvedAmount: 35000,
      interestRate: 1.49,
      installments: 60,
      bank: 'Banco do Brasil',
      submittedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      analyzedAt: Date.now() - 1000 * 60 * 60 * 24 * 3
    },
    {
      id: '2',
      clientName: 'Maria Santos Comercial LTDA',
      cpfCnpj: '12.345.678/0001-90',
      requestedAmount: 120000,
      creditScore: 680,
      monthlyIncome: 45000,
      status: 'analyzing',
      bank: 'Santander',
      submittedAt: Date.now() - 1000 * 60 * 60 * 48
    },
    {
      id: '3',
      clientName: 'Pedro Costa',
      cpfCnpj: '987.654.321-00',
      requestedAmount: 25000,
      creditScore: 520,
      monthlyIncome: 3200,
      status: 'rejected',
      bank: 'Bradesco',
      submittedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      analyzedAt: Date.now() - 1000 * 60 * 60 * 24 * 6
    }
  ])

  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    cpfCnpj: '',
    requestedAmount: '',
    monthlyIncome: '',
    bank: banks[0]
  })

  const handleSubmitAnalysis = async () => {
    if (!formData.clientName || !formData.cpfCnpj || !formData.requestedAmount || !formData.monthlyIncome) {
      toast.error("Preencha todos os campos")
      return
    }

    const requestedAmount = parseFloat(formData.requestedAmount)
    const monthlyIncome = parseFloat(formData.monthlyIncome)
    const creditScore = Math.floor(Math.random() * 400) + 400

    const newAnalysis: CreditAnalysis = {
      id: Date.now().toString(),
      clientName: formData.clientName,
      cpfCnpj: formData.cpfCnpj,
      requestedAmount,
      creditScore,
      monthlyIncome,
      status: 'analyzing',
      bank: formData.bank,
      submittedAt: Date.now()
    }

    setAnalyses((current) => [newAnalysis, ...(current || [])])
    setShowNewForm(false)
    setFormData({
      clientName: '',
      cpfCnpj: '',
      requestedAmount: '',
      monthlyIncome: '',
      bank: banks[0]
    })
    toast.success("Análise de crédito enviada!")

    setTimeout(() => {
      const shouldApprove = creditScore >= 600
      setAnalyses((current) =>
        (current || []).map(a =>
          a.id === newAnalysis.id
            ? {
                ...a,
                status: shouldApprove ? 'approved' : 'rejected',
                approvedAmount: shouldApprove ? requestedAmount : undefined,
                interestRate: shouldApprove ? 1.49 + (800 - creditScore) / 100 : undefined,
                installments: shouldApprove ? 60 : undefined,
                analyzedAt: Date.now()
              }
            : a
        )
      )
      toast.success(
        shouldApprove 
          ? "Crédito aprovado! ✓" 
          : "Crédito não aprovado"
      )
    }, 3000)
  }

  const getStatusConfig = (status: CreditAnalysis['status']) => {
    const configs = {
      pending: {
        label: 'Pendente',
        variant: 'outline' as const,
        icon: Clock,
        color: 'text-yellow-600'
      },
      analyzing: {
        label: 'Analisando',
        variant: 'secondary' as const,
        icon: ChartLineUp,
        color: 'text-blue-600'
      },
      approved: {
        label: 'Aprovado',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-success'
      },
      rejected: {
        label: 'Reprovado',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600'
      }
    }
    return configs[status]
  }

  const getCreditScoreColor = (score: number) => {
    if (score >= 700) return 'text-success'
    if (score >= 600) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleSidebar}
                aria-label="Abrir menu lateral"
                title="Abrir menu lateral"
                className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors shrink-0"
              >
                <List size={22} weight="bold" />
              </button>
              <motion.div 
                className="w-11 h-11 rounded-xl bg-linear-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.08, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <CreditCard className="text-accent-foreground" size={24} weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">Análise de Crédito</h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {(analyses || []).length} solicitações de financiamento
                </p>
              </div>
            </div>
            
            <Button 
              variant="gradient" 
              size="lg" 
              className="gap-2"
              onClick={() => setShowNewForm(!showNewForm)}
            >
              <TrendUp size={20} weight="bold" />
              Nova Análise
            </Button>
          </div>

          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <Card className="p-6 border-2 border-accent/40 bg-card/80 backdrop-blur-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <User size={20} weight="bold" />
                  Solicitar Análise de Crédito
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Nome do Cliente</Label>
                    <Input
                      id="client-name"
                      placeholder="Ex: João Silva"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf-cnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpf-cnpj"
                      placeholder="Ex: 123.456.789-00"
                      value={formData.cpfCnpj}
                      onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor Solicitado (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Ex: 35000"
                      value={formData.requestedAmount}
                      onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="income">Renda Mensal (R$)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="Ex: 8500"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bank">Instituição Financeira</Label>
                    <select
                      id="bank"
                      title="Instituição Financeira"
                      aria-label="Instituição Financeira"
                      value={formData.bank}
                      onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                      className="w-full mt-1.5 px-3 py-2 rounded-lg border-2 border-input bg-background focus:border-accent focus:outline-none"
                    >
                      {banks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleSubmitAnalysis} className="flex-1">
                    <TrendUp size={18} weight="bold" className="mr-2" />
                    Solicitar Análise
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 gap-5">
            {(analyses || []).map((analysis, index) => {
              const statusConfig = getStatusConfig(analysis.status)
              const StatusIcon = statusConfig.icon

              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 border-2 hover:border-accent/40 hover:shadow-lg transition-all">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold mb-1">{analysis.clientName}</h3>
                            <p className="text-sm text-muted-foreground font-mono mb-2">
                              {analysis.cpfCnpj}
                            </p>
                            <div className="flex items-center gap-2">
                              <Bank size={14} className="text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{analysis.bank}</span>
                            </div>
                          </div>
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon size={14} weight="fill" className="mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Valor Solicitado</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(analysis.requestedAmount)}
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Score de Crédito</div>
                            <div className={`text-lg font-bold ${getCreditScoreColor(analysis.creditScore)}`}>
                              {analysis.creditScore}
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Renda Mensal</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(analysis.monthlyIncome)}
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Solicitado em</div>
                            <div className="text-sm font-bold">
                              {formatDate(analysis.submittedAt)}
                            </div>
                          </div>
                        </div>

                        {analysis.status === 'approved' && analysis.approvedAmount && (
                          <div className="mt-4 p-4 bg-success/10 border-2 border-success/20 rounded-lg">
                            <h4 className="text-sm font-bold text-success mb-2">
                              ✓ Crédito Aprovado
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-success">Valor aprovado:</span>
                                <div className="font-bold text-success">
                                  {formatCurrency(analysis.approvedAmount)}
                                </div>
                              </div>
                              <div>
                                <span className="text-success">Taxa de juros:</span>
                                <div className="font-bold text-success">
                                  {analysis.interestRate}% a.m.
                                </div>
                              </div>
                              <div>
                                <span className="text-success">Parcelas:</span>
                                <div className="font-bold text-success">
                                  {analysis.installments}x
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {analysis.status === 'analyzing' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Analisando documentação...</span>
                              <span className="font-bold">65%</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {(analyses || []).length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <CreditCard size={40} className="text-muted-foreground" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhuma análise de crédito</h3>
              <p className="text-muted-foreground mb-6">
                Inicie uma nova solicitação de financiamento para seu cliente
              </p>
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => setShowNewForm(true)}
              >
                <TrendUp size={20} weight="bold" />
                Solicitar Primeira Análise
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
