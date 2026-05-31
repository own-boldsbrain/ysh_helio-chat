import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { List, CreditCard, QrCode, Bank, ChartLine, Plus, Minus, X, Check } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import yelloIconJpg from "@/assets/images/yello-icon.svg"

interface CheckoutPageProps {
  onToggleSidebar: () => void
}

interface CartItem {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  power?: string
}

interface CoPayerData {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  relationship: string
}

interface CreditAnalysis {
  status: "pending" | "analyzing" | "approved" | "rejected"
  amount?: number
  rate?: number
  term?: number
}

export function CheckoutPage({ onToggleSidebar }: CheckoutPageProps) {
  const [cartItems, setCartItems] = useKV<CartItem[]>("cart-items", [
    {
      id: "1",
      name: "Sistema Solar Residencial 5kWp",
      description: "Kit completo com painéis, inversor e estruturas",
      quantity: 1,
      price: 25000,
      power: "5kWp"
    }
  ])

  const [paymentMethod, setPaymentMethod] = useState("traditional")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [installments, setInstallments] = useState("1")
  const [pixGenerated, setPixGenerated] = useState(false)
  const [boletoGenerated, setBoletoGenerated] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [coPayers, setCoPayers] = useKV<CoPayerData[]>("co-payers", [])
  const [income, setIncome] = useState("")
  const [employment, setEmployment] = useState("")
  const [hasDebts, setHasDebts] = useState(false)
  const [creditAnalysis, setCreditAnalysis] = useState<CreditAnalysis | null>(null)

  const totalAmount = (cartItems || []).reduce((sum, item) => sum + item.price * item.quantity, 0)
  const installmentAmount = totalAmount / parseInt(installments)

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems((current) =>
      (current || []).map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((current) => (current || []).filter(item => item.id !== id))
    toast.success("Item removido do carrinho")
  }

  const handleAddCoPayer = () => {
    const newCoPayer: CoPayerData = {
      id: Date.now().toString(),
      name: "",
      cpf: "",
      email: "",
      phone: "",
      relationship: ""
    }
    setCoPayers((current) => [...(current || []), newCoPayer])
  }

  const handleRemoveCoPayer = (id: string) => {
    setCoPayers((current) => (current || []).filter(cp => cp.id !== id))
  }

  const handleUpdateCoPayer = (id: string, field: keyof CoPayerData, value: string) => {
    setCoPayers((current) =>
      (current || []).map(cp =>
        cp.id === id ? { ...cp, [field]: value } : cp
      )
    )
  }

  const handleRequestCredit = () => {
    if (!income || !employment) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setIsProcessing(true)
    setCreditAnalysis({ status: "analyzing" })

    setTimeout(() => {
      setCreditAnalysis({
        status: "approved",
        amount: totalAmount,
        rate: 1.99,
        term: 60
      })
      setIsProcessing(false)
      toast.success("Crédito pré-aprovado!")
    }, 3000)
  }

  const handleGeneratePix = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setPixGenerated(true)
      toast.success("QR Code PIX gerado!")
    }, 1000)
  }

  const handleGenerateBoleto = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setBoletoGenerated(true)
      setIsProcessing(false)
      toast.success("Boleto gerado! Código de barras disponível.")
    }, 1000)
  }

  const handleFinishOrder = () => {
    if (paymentMethod === "traditional" && !cardNumber && !pixGenerated && !boletoGenerated) {
      toast.error("Selecione e complete um método de pagamento")
      return
    }

    if (paymentMethod === "financing" && creditAnalysis?.status !== "approved") {
      toast.error("Complete a análise de crédito primeiro")
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      toast.success("Pedido finalizado com sucesso!")
      setCartItems([])
    }, 2000)
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors"
          >
            <List size={22} weight="bold" />
          </button>
          <motion.div 
            className="w-11 h-11 rounded-xl overflow-hidden shadow-lg"
            whileHover={{ scale: 1.08, rotate: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img src={yelloIconJpg} alt="Yello Logo" className="w-full h-full object-cover" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Checkout</h1>
            <p className="text-xs text-muted-foreground font-medium">Finalize sua compra</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Itens do Carrinho</CardTitle>
                  <CardDescription>Revise os produtos selecionados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(cartItems || []).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Seu carrinho está vazio</p>
                  ) : (
                    (cartItems || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          {item.power && (
                            <Badge variant="secondary" className="mt-2">{item.power}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Diminuir quantidade de ${item.name}`}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Aumentar quantidade de ${item.name}`}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X size={16} className="mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Co-Pagadores</CardTitle>
                  <CardDescription>Adicione outras pessoas que pagarão junto (opcional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(coPayers || []).map((coPayer) => (
                    <div key={coPayer.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Co-Pagador</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCoPayer(coPayer.id)}
                          className="text-destructive"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Nome Completo</Label>
                          <Input
                            value={coPayer.name}
                            onChange={(e) => handleUpdateCoPayer(coPayer.id, "name", e.target.value)}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CPF</Label>
                          <Input
                            value={coPayer.cpf}
                            onChange={(e) => handleUpdateCoPayer(coPayer.id, "cpf", e.target.value)}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <Input
                            value={coPayer.email}
                            onChange={(e) => handleUpdateCoPayer(coPayer.id, "email", e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input
                            value={coPayer.phone}
                            onChange={(e) => handleUpdateCoPayer(coPayer.id, "phone", e.target.value)}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Parentesco/Relação</Label>
                          <Input
                            value={coPayer.relationship}
                            onChange={(e) => handleUpdateCoPayer(coPayer.id, "relationship", e.target.value)}
                            placeholder="Ex: Cônjuge, Sócio, etc."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleAddCoPayer}
                  >
                    <Plus size={18} className="mr-2" />
                    Adicionar Co-Pagador
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Método de Pagamento</CardTitle>
                  <CardDescription>Escolha como deseja pagar</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="traditional">Pagamento Tradicional</TabsTrigger>
                      <TabsTrigger value="financing">Financiamento</TabsTrigger>
                    </TabsList>

                    <TabsContent value="traditional" className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <Card className="cursor-pointer hover:border-accent transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <CreditCard size={24} className="text-accent" />
                              <div>
                                <CardTitle className="text-base">Cartão de Crédito</CardTitle>
                                <CardDescription className="text-xs">Parcele em até 12x</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <Label>Número do Cartão</Label>
                              <Input
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Nome no Cartão</Label>
                              <Input
                                placeholder="Como está no cartão"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-1 space-y-2">
                                <Label>Validade</Label>
                                <Input
                                  placeholder="MM/AA"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                />
                              </div>
                              <div className="col-span-1 space-y-2">
                                <Label>CVV</Label>
                                <Input
                                  placeholder="000"
                                  value={cardCvv}
                                  maxLength={4}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                />
                              </div>
                              <div className="col-span-1 space-y-2">
                                <Label>Parcelas</Label>
                                <Select value={installments} onValueChange={setInstallments}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 6, 10, 12].map(num => (
                                      <SelectItem key={num} value={num.toString()}>
                                        {num}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentAmount)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:border-accent transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <QrCode size={24} className="text-accent" />
                              <div>
                                <CardTitle className="text-base">PIX</CardTitle>
                                <CardDescription className="text-xs">Pagamento instantâneo</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {!pixGenerated ? (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleGeneratePix}
                                disabled={isProcessing}
                              >
                                Gerar QR Code PIX
                              </Button>
                            ) : (
                              <div className="space-y-3">
                                <div className="bg-white p-6 rounded-lg flex items-center justify-center">
                                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                                    <QrCode size={160} />
                                  </div>
                                </div>
                                <p className="text-xs text-center text-muted-foreground">
                                  Escaneie o QR Code ou copie o código abaixo
                                </p>
                                <Input
                                  value="00020126580014br.gov.bcb.pix..."
                                  readOnly
                                  className="font-mono text-xs"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:border-accent transition-colors">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Bank size={24} className="text-accent" />
                              <div>
                                <CardTitle className="text-base">Boleto Bancário</CardTitle>
                                <CardDescription className="text-xs">Vencimento em 3 dias úteis</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {!boletoGenerated ? (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleGenerateBoleto}
                                disabled={isProcessing}
                              >
                                Gerar Boleto
                              </Button>
                            ) : (
                              <div className="space-y-3">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium mb-2">Código de Barras</p>
                                  <Input
                                    value="23793.12345 60000.123456 78901.234567 1 12345678901234"
                                    readOnly
                                    className="font-mono text-xs"
                                  />
                                </div>
                                <Button variant="outline" className="w-full">
                                  <Bank size={18} className="mr-2" />
                                  Baixar Boleto PDF
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="financing" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <ChartLine size={24} className="text-accent" />
                            <div>
                              <CardTitle className="text-base">Análise de Crédito</CardTitle>
                              <CardDescription className="text-xs">Pré-aprovação em minutos</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {creditAnalysis?.status === "analyzing" && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="font-medium">Analisando sua solicitação...</span>
                              </div>
                              <Progress value={60} className="h-2" />
                            </div>
                          )}

                          {creditAnalysis?.status === "approved" && (
                            <div className="p-4 bg-success/10 border border-success/20 rounded-lg space-y-2">
                              <div className="flex items-center gap-2 text-success">
                                <Check size={24} weight="bold" />
                                <span className="font-bold">Crédito Pré-Aprovado!</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Você foi aprovado para financiar até {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                              </p>
                              <Separator className="my-2" />
                              <div className="space-y-1 text-sm">
                                <p><strong>Taxa:</strong> 1.99% a.m.</p>
                                <p><strong>Prazo:</strong> Até 60 meses</p>
                                <p><strong>Parcela estimada:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount / 60)}/mês</p>
                              </div>
                            </div>
                          )}

                          {!creditAnalysis && (
                            <>
                              <div className="space-y-2">
                                <Label>Renda Mensal</Label>
                                <Input
                                  placeholder="R$ 0,00"
                                  value={income}
                                  onChange={(e) => setIncome(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Vínculo Empregatício</Label>
                                <Select value={employment} onValueChange={setEmployment}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="clt">CLT</SelectItem>
                                    <SelectItem value="pj">PJ</SelectItem>
                                    <SelectItem value="autonomous">Autônomo</SelectItem>
                                    <SelectItem value="retired">Aposentado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="has-debts"
                                  checked={hasDebts}
                                  onCheckedChange={(checked) => setHasDebts(checked as boolean)}
                                />
                                <label htmlFor="has-debts" className="text-sm cursor-pointer">
                                  Possuo dívidas ou restrições no CPF
                                </label>
                              </div>
                              <Button
                                className="w-full"
                                onClick={handleRequestCredit}
                                disabled={isProcessing}
                              >
                                Solicitar Análise de Crédito
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-success">Grátis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                      <span>Garantia de 25 anos nos painéis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                      <span>Suporte técnico especializado</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                      <span>Instalação profissional inclusa</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                      <span>Homologação junto à concessionária</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-solar-br hover:opacity-90 text-foreground"
                    onClick={handleFinishOrder}
                    disabled={isProcessing || (cartItems || []).length === 0}
                  >
                    {isProcessing ? "Processando..." : "Finalizar Pedido"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
