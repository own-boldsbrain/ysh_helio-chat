import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { FilePdf, Download, Eye, Sparkle } from "@phosphor-icons/react"
import { downloadSolarProposalPDF, openSolarProposalPDF, SolarProposalData } from "@/lib/pdf-generator"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PDFProposalGeneratorProps {
  onToggleSidebar: () => void
}

export function PDFProposalGenerator({ onToggleSidebar }: PDFProposalGeneratorProps) {
  const [formData, setFormData] = useState({
    clientName: "João Silva",
    clientDocument: "123.456.789-00",
    clientEmail: "joao.silva@email.com",
    clientPhone: "(31) 98765-4321",
    address: "Rua das Flores, 123",
    city: "Belo Horizonte",
    state: "MG",
    cep: "30130-100",
    monthlyConsumption: "450",
    averageBill: "650.00",
    electricalPhase: "bifásica" as "monofásica" | "bifásica" | "trifásica",
    irradiation: "5.5",
    scenario: "equilibrado" as "conservador" | "equilibrado" | "otimizado",
    systemSize: "5.85",
    numberOfPanels: "13",
    panelPower: "450",
    panelBrand: "Canadian Solar",
    panelModel: "HiKu6 Mono PERC",
    inverterBrand: "Growatt",
    inverterModel: "MIN 5000TL-X",
    inverterPower: "5.0",
    numberOfInverters: "1",
    totalInvestment: "28500.00",
    monthlyEconomy: "585.00",
    payback: "4.1",
    roi25Years: "580",
    shadingPercentage: "8.5",
    bank: "Banco do Brasil",
    financingTerm: "120",
    interestRate: "1.29",
    monthlyPayment: "342.50"
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generatePDFData = (): SolarProposalData => {
    const monthlyConsumption = parseFloat(formData.monthlyConsumption)
    const systemSize = parseFloat(formData.systemSize)
    const irradiation = parseFloat(formData.irradiation)
    const performanceRatio = 0.80
    
    const estimatedAnnualProduction = systemSize * irradiation * 365 * performanceRatio
    const coveragePercentage = (estimatedAnnualProduction / (monthlyConsumption * 12)) * 100

    return {
      clientName: formData.clientName,
      clientDocument: formData.clientDocument,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      
      projectLocation: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        cep: formData.cep
      },
      
      consumptionData: {
        monthlyConsumptionKWh: monthlyConsumption,
        averageBillValue: parseFloat(formData.averageBill),
        electricalPhase: formData.electricalPhase,
        tariffKWhValue: parseFloat(formData.averageBill) / monthlyConsumption
      },
      
      solarData: {
        irradiationKWhM2Day: irradiation,
        performanceRatio: performanceRatio,
        averageSunHours: irradiation,
        annualDegradation: 0.005
      },
      
      systemConfiguration: {
        scenario: formData.scenario,
        systemSizeKWp: systemSize,
        numberOfPanels: parseInt(formData.numberOfPanels),
        panelPowerW: parseInt(formData.panelPower),
        panelBrand: formData.panelBrand,
        panelModel: formData.panelModel,
        inverterBrand: formData.inverterBrand,
        inverterModel: formData.inverterModel,
        inverterPowerKW: parseFloat(formData.inverterPower),
        numberOfInverters: parseInt(formData.numberOfInverters),
        mountingStructure: "Estrutura de alumínio para telhado cerâmico",
        estimatedAnnualProductionKWh: estimatedAnnualProduction,
        coveragePercentage: coveragePercentage
      },
      
      financialAnalysis: {
        totalInvestment: parseFloat(formData.totalInvestment),
        equipmentCost: parseFloat(formData.totalInvestment) * 0.65,
        installationCost: parseFloat(formData.totalInvestment) * 0.25,
        projectCost: parseFloat(formData.totalInvestment) * 0.10,
        monthlyEconomyEstimate: parseFloat(formData.monthlyEconomy),
        annualEconomyEstimate: parseFloat(formData.monthlyEconomy) * 12,
        simplePaybackYears: parseFloat(formData.payback),
        roi25Years: parseInt(formData.roi25Years),
        irr: 15.8
      },
      
      shadingAnalysis: {
        annualShadingPercentage: parseFloat(formData.shadingPercentage),
        shadingLevel: parseFloat(formData.shadingPercentage) < 5 ? "excelente" : 
                      parseFloat(formData.shadingPercentage) < 10 ? "bom" : 
                      parseFloat(formData.shadingPercentage) < 20 ? "moderado" : "significativo",
        terrainElevation: 850,
        terrainSlope: 12,
        terrainAspect: 180
      },
      
      financing: formData.bank ? {
        bank: formData.bank,
        termMonths: parseInt(formData.financingTerm),
        interestRateMonthly: parseFloat(formData.interestRate) / 100,
        totalFinanced: parseFloat(formData.totalInvestment),
        monthlyPayment: parseFloat(formData.monthlyPayment)
      } : undefined,
      
      nextSteps: [
        "Análise técnica da instalação elétrica existente",
        "Vistoria técnica no local para validação do projeto",
        "Solicitação de parecer de acesso junto à concessionária",
        "Elaboração do projeto elétrico detalhado",
        "Homologação do sistema pela concessionária",
        "Instalação do sistema fotovoltaico",
        "Comissionamento e ativação do sistema"
      ],
      
      observations: "Esta proposta tem validade de 30 dias. Os valores podem sofrer alterações devido a variações cambiais e disponibilidade de estoque. O sistema possui garantia de 10 anos para inversores e 25 anos para painéis solares.",
      
      generatedBy: "Yello Solar Hub - Hélio Co-Piloto",
      generatedDate: new Date()
    }
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const pdfData = generatePDFData()
      downloadSolarProposalPDF(pdfData)
      toast.success("Proposta PDF gerada com sucesso!", {
        description: "O arquivo foi baixado para seu dispositivo"
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast.error("Erro ao gerar PDF", {
        description: "Por favor, verifique os dados e tente novamente"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreviewPDF = async () => {
    setIsGenerating(true)
    try {
      const pdfData = generatePDFData()
      openSolarProposalPDF(pdfData)
      toast.success("Visualização do PDF aberta em nova janela")
    } catch (error) {
      console.error("Erro ao visualizar PDF:", error)
      toast.error("Erro ao visualizar PDF", {
        description: "Por favor, verifique os dados e tente novamente"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAutoFillSample = () => {
    toast.success("Dados de exemplo carregados!")
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between h-[60px] px-4 sm:px-6 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <FilePdf size={24} weight="fill" className="text-[hsl(var(--solar-red))]" />
              Gerador de Propostas PDF
            </h1>
            <p className="text-xs text-muted-foreground">Crie propostas técnico-comerciais profissionais</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoFillSample}
            className="hidden sm:flex"
          >
            <Sparkle size={16} weight="fill" className="mr-1.5" />
            Dados de Exemplo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewPDF}
            disabled={isGenerating}
          >
            <Eye size={16} weight="bold" className="sm:mr-1.5" />
            <span className="hidden sm:inline">Visualizar</span>
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-gradient-solar-br hover:opacity-90 text-foreground"
          >
            <Download size={16} weight="bold" className="sm:mr-1.5" />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Dados do Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome Completo</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientDocument">CPF/CNPJ</Label>
                <Input
                  id="clientDocument"
                  value={formData.clientDocument}
                  onChange={(e) => handleInputChange("clientDocument", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">E-mail</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              Localização do Projeto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Rua, número"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="irradiation">Irradiação Solar (kWh/m²/dia)</Label>
                <Input
                  id="irradiation"
                  type="number"
                  step="0.1"
                  value={formData.irradiation}
                  onChange={(e) => handleInputChange("irradiation", e.target.value)}
                  placeholder="5.5"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Dados de Consumo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyConsumption">Consumo Mensal (kWh)</Label>
                <Input
                  id="monthlyConsumption"
                  type="number"
                  value={formData.monthlyConsumption}
                  onChange={(e) => handleInputChange("monthlyConsumption", e.target.value)}
                  placeholder="450"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="averageBill">Valor Médio da Conta (R$)</Label>
                <Input
                  id="averageBill"
                  type="number"
                  step="0.01"
                  value={formData.averageBill}
                  onChange={(e) => handleInputChange("averageBill", e.target.value)}
                  placeholder="650.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electricalPhase">Tipo de Ligação</Label>
                <Select
                  value={formData.electricalPhase}
                  onValueChange={(value) => handleInputChange("electricalPhase", value)}
                >
                  <SelectTrigger id="electricalPhase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monofásica">Monofásica</SelectItem>
                    <SelectItem value="bifásica">Bifásica</SelectItem>
                    <SelectItem value="trifásica">Trifásica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">☀️</span>
              Configuração do Sistema
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scenario">Cenário de Dimensionamento</Label>
                <Select
                  value={formData.scenario}
                  onValueChange={(value) => handleInputChange("scenario", value)}
                >
                  <SelectTrigger id="scenario">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservador">Conservador (1.14x)</SelectItem>
                    <SelectItem value="equilibrado">Equilibrado (1.30x) - RECOMENDADO</SelectItem>
                    <SelectItem value="otimizado">Otimizado (1.45x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemSize">Potência do Sistema (kWp)</Label>
                  <Input
                    id="systemSize"
                    type="number"
                    step="0.01"
                    value={formData.systemSize}
                    onChange={(e) => handleInputChange("systemSize", e.target.value)}
                    placeholder="5.85"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfPanels">Número de Painéis</Label>
                  <Input
                    id="numberOfPanels"
                    type="number"
                    value={formData.numberOfPanels}
                    onChange={(e) => handleInputChange("numberOfPanels", e.target.value)}
                    placeholder="13"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panelBrand">Marca dos Painéis</Label>
                  <Input
                    id="panelBrand"
                    value={formData.panelBrand}
                    onChange={(e) => handleInputChange("panelBrand", e.target.value)}
                    placeholder="Canadian Solar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panelModel">Modelo dos Painéis</Label>
                  <Input
                    id="panelModel"
                    value={formData.panelModel}
                    onChange={(e) => handleInputChange("panelModel", e.target.value)}
                    placeholder="HiKu6 Mono PERC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panelPower">Potência do Painel (W)</Label>
                  <Input
                    id="panelPower"
                    type="number"
                    value={formData.panelPower}
                    onChange={(e) => handleInputChange("panelPower", e.target.value)}
                    placeholder="450"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfInverters">Número de Inversores</Label>
                  <Input
                    id="numberOfInverters"
                    type="number"
                    value={formData.numberOfInverters}
                    onChange={(e) => handleInputChange("numberOfInverters", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inverterBrand">Marca do Inversor</Label>
                  <Input
                    id="inverterBrand"
                    value={formData.inverterBrand}
                    onChange={(e) => handleInputChange("inverterBrand", e.target.value)}
                    placeholder="Growatt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inverterModel">Modelo do Inversor</Label>
                  <Input
                    id="inverterModel"
                    value={formData.inverterModel}
                    onChange={(e) => handleInputChange("inverterModel", e.target.value)}
                    placeholder="MIN 5000TL-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inverterPower">Potência do Inversor (kW)</Label>
                  <Input
                    id="inverterPower"
                    type="number"
                    step="0.1"
                    value={formData.inverterPower}
                    onChange={(e) => handleInputChange("inverterPower", e.target.value)}
                    placeholder="5.0"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Análise Financeira
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalInvestment">Investimento Total (R$)</Label>
                <Input
                  id="totalInvestment"
                  type="number"
                  step="0.01"
                  value={formData.totalInvestment}
                  onChange={(e) => handleInputChange("totalInvestment", e.target.value)}
                  placeholder="28500.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyEconomy">Economia Mensal (R$)</Label>
                <Input
                  id="monthlyEconomy"
                  type="number"
                  step="0.01"
                  value={formData.monthlyEconomy}
                  onChange={(e) => handleInputChange("monthlyEconomy", e.target.value)}
                  placeholder="585.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payback">Payback Simples (anos)</Label>
                <Input
                  id="payback"
                  type="number"
                  step="0.1"
                  value={formData.payback}
                  onChange={(e) => handleInputChange("payback", e.target.value)}
                  placeholder="4.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roi25Years">ROI em 25 anos (%)</Label>
                <Input
                  id="roi25Years"
                  type="number"
                  value={formData.roi25Years}
                  onChange={(e) => handleInputChange("roi25Years", e.target.value)}
                  placeholder="580"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏦</span>
              Financiamento (Opcional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Banco</Label>
                <Input
                  id="bank"
                  value={formData.bank}
                  onChange={(e) => handleInputChange("bank", e.target.value)}
                  placeholder="Banco do Brasil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="financingTerm">Prazo (meses)</Label>
                <Input
                  id="financingTerm"
                  type="number"
                  value={formData.financingTerm}
                  onChange={(e) => handleInputChange("financingTerm", e.target.value)}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Taxa de Juros (% a.m.)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange("interestRate", e.target.value)}
                  placeholder="1.29"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyPayment">Parcela Mensal (R$)</Label>
                <Input
                  id="monthlyPayment"
                  type="number"
                  step="0.01"
                  value={formData.monthlyPayment}
                  onChange={(e) => handleInputChange("monthlyPayment", e.target.value)}
                  placeholder="342.50"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🌳</span>
              Análise de Sombreamento
            </h2>
            <div className="space-y-2">
              <Label htmlFor="shadingPercentage">Sombreamento Anual (%)</Label>
              <Input
                id="shadingPercentage"
                type="number"
                step="0.1"
                value={formData.shadingPercentage}
                onChange={(e) => handleInputChange("shadingPercentage", e.target.value)}
                placeholder="8.5"
              />
              <p className="text-xs text-muted-foreground">
                {"< 5% Excelente | 5-10% Bom | 10-20% Moderado | > 20% Significativo"}
              </p>
            </div>
          </Card>

          <div className="flex justify-center gap-4 pb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePreviewPDF}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              <Eye size={20} weight="bold" className="mr-2" />
              Visualizar PDF
            </Button>
            <Button
              size="lg"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-gradient-solar-br hover:opacity-90 text-foreground w-full sm:w-auto"
            >
              <Download size={20} weight="bold" className="mr-2" />
              {isGenerating ? "Gerando PDF..." : "Baixar Proposta PDF"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
