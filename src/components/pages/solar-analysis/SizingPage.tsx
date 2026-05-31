import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Lightning, Sun, Info, List, MapPin, Polygon, Pencil, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { MapLibreViewer } from "@/components/solar/MapLibreViewer";

interface SizingPageProps {
  onToggleSidebar: () => void
}

export function SizingPage({ onToggleSidebar }: SizingPageProps) {
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [monthlyConsumption, setMonthlyConsumption] = useState("");
  const [roofArea, setRoofArea] = useState("");
  const [drawnPolygons, setDrawnPolygons] = useState<any[]>([]);
  const [result, setResult] = useState<{
    panels: number;
    power: number;
    area: number;
    cost: number;
    savings: number;
  } | null>(null);

  const handleCepChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').slice(0, 8);
    const masked = formatted.replace(/^(\d{5})(\d)/, '$1-$2');
    setCep(masked);
  };

  const searchByCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast.error("CEP inválido. Digite 8 dígitos.");
      return;
    }

    setIsLoadingLocation(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        setIsLoadingLocation(false);
        return;
      }

      const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
      setAddress(fullAddress);

      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.length > 0) {
        const coords: [number, number] = [parseFloat(geocodeData[0].lon), parseFloat(geocodeData[0].lat)];
        setCoordinates(coords);
        toast.success("Localização encontrada!");
      } else {
        toast.warning("Coordenadas não encontradas para este endereço");
      }
    } catch (error) {
      toast.error("Erro ao buscar localização");
      console.error(error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const searchByAddress = async () => {
    if (!address.trim()) {
      toast.error("Digite um endereço");
      return;
    }

    setIsLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        setCoordinates(coords);
        toast.success("Localização encontrada!");
      } else {
        toast.error("Endereço não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar endereço");
      console.error(error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handlePolygonDrawn = (polygon: any) => {
    setDrawnPolygons(prev => [...prev, polygon]);
    toast.success("Polígono adicionado");
  };

  const clearPolygons = () => {
    setDrawnPolygons([]);
    toast.success("Polígonos removidos");
  };

  const calculateSystem = () => {
    const consumption = parseFloat(monthlyConsumption);
    const area = parseFloat(roofArea);

    if (!consumption || !area || consumption <= 0 || area <= 0) {
      toast.error("Por favor, preencha os campos corretamente");
      return;
    }

    const dailyConsumption = consumption / 30;
    const solarHours = 5;
    const panelPower = 0.55;
    const efficiency = 0.8;

    const requiredPower = dailyConsumption / (solarHours * efficiency);
    const numberOfPanels = Math.ceil(requiredPower / panelPower);
    const totalPower = numberOfPanels * panelPower;
    const requiredArea = numberOfPanels * 2;
    const estimatedCost = numberOfPanels * 1200;
    const monthlySavings = consumption * 0.75;

    if (requiredArea > area) {
      toast.warning("A área do telhado pode ser insuficiente");
    }

    setResult({
      panels: numberOfPanels,
      power: totalPower,
      area: requiredArea,
      cost: estimatedCost,
      savings: monthlySavings,
    });

    toast.success("Cálculo realizado com sucesso!");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <List size={22} weight="bold" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-solar-gradient mb-2">
                  Dimensionamento Solar
                </h1>
                <p className="text-muted-foreground">
                  Calcule o tamanho ideal do seu sistema fotovoltaico
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/10">
              <Info className="mr-2" size={18} weight="bold" />
              Ver Guia
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={24} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                Localização e Visualização do Telhado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={9}
                      className="flex-1"
                    />
                    <Button
                      onClick={searchByCep}
                      disabled={isLoadingLocation}
                      variant="outline"
                      className="border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/10"
                    >
                      <MapPin size={18} weight="bold" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Digite o CEP para buscar automaticamente</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      type="text"
                      placeholder="Rua, Bairro, Cidade - Estado"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={searchByAddress}
                      disabled={isLoadingLocation}
                      variant="outline"
                      className="border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/10"
                    >
                      <MapPin size={18} weight="bold" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Ou digite o endereço completo</p>
                </div>
              </div>

              {coordinates && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Coordenadas encontradas:</p>
                  <p className="text-xs text-muted-foreground">
                    Latitude: {coordinates[1].toFixed(6)} | Longitude: {coordinates[0].toFixed(6)}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/10"
                  onClick={() => toast.info("Modo de desenho ativado - clique no mapa para desenhar polígonos")}
                >
                  <Polygon className="mr-2" size={18} weight="bold" />
                  Desenhar Polígono
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[hsl(var(--solar-red))] hover:bg-[hsl(var(--solar-red))]/10"
                  onClick={() => toast.info("Modo de string ativado - desenhe linhas para representar strings")}
                >
                  <Pencil className="mr-2" size={18} weight="bold" />
                  Desenhar String
                </Button>
                <Button
                  variant="outline"
                  onClick={clearPolygons}
                  disabled={drawnPolygons.length === 0}
                >
                  <Trash size={18} weight="bold" />
                </Button>
              </div>

              <MapLibreViewer
                className="rounded-lg overflow-hidden shadow-lg"
                center={coordinates || [-43.9378, -19.9167]}
                zoom={coordinates ? 18 : 12}
                pitch={60}
                onPolygonDrawn={handlePolygonDrawn}
                enableDrawing={true}
              />
              <p className="text-xs text-muted-foreground mt-3">
                Use os controles do mapa para navegar. Desenhe polígonos sobre o telhado para calcular a área disponível automaticamente.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator size={24} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                  Dados do Consumo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="consumption">Consumo Mensal (kWh)</Label>
                  <Input
                    id="consumption"
                    type="number"
                    placeholder="Ex: 350"
                    value={monthlyConsumption}
                    onChange={(e) => setMonthlyConsumption(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Verifique em sua conta de energia elétrica
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área Disponível do Telhado (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="Ex: 30"
                    value={roofArea}
                    onChange={(e) => setRoofArea(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Área aproximada sem sombras
                  </p>
                </div>

                <Button
                  onClick={calculateSystem}
                  className="w-full bg-gradient-solar-r hover:opacity-90 text-foreground"
                  size="lg"
                >
                  <Calculator className="mr-2" size={20} weight="bold" />
                  Calcular Sistema
                </Button>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Info size={18} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                    Premissas do Cálculo
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Média de 5 horas de sol útil por dia</li>
                    <li>• Painéis de 550W cada</li>
                    <li>• Eficiência do sistema: 80%</li>
                    <li>• Custo médio: R$ 1.200 por painel</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {result ? (
              <Card className="border-[hsl(var(--solar-yellow))] border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun size={24} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                    Resultado do Dimensionamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-[hsl(var(--solar-yellow))]/10 to-[hsl(var(--solar-orange))]/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Painéis Necessários</p>
                      <p className="text-3xl font-bold">{result.panels}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[hsl(var(--solar-yellow))]/10 to-[hsl(var(--solar-orange))]/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Potência Total</p>
                      <p className="text-3xl font-bold">{result.power.toFixed(1)} kWp</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[hsl(var(--solar-red))]/10 to-[hsl(var(--solar-pink))]/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Área Necessária</p>
                      <p className="text-3xl font-bold">{result.area} m²</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Economia Mensal</p>
                      <p className="text-3xl font-bold">R$ {result.savings.toFixed(0)}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-solar-br rounded-lg text-foreground">
                    <p className="text-sm opacity-90 mb-1">Investimento Estimado</p>
                    <p className="text-4xl font-bold">
                      R$ {result.cost.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm opacity-90 mt-2">
                      Retorno em aproximadamente {Math.ceil(result.cost / (result.savings * 12))} anos
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightning size={18} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                      Benefícios
                    </h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#10B981]">✓</span>
                        <span>Redução de até 95% na conta de energia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#10B981]">✓</span>
                        <span>Valorização do imóvel em até 10%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#10B981]">✓</span>
                        <span>Energia limpa e renovável</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#10B981]">✓</span>
                        <span>Proteção contra aumento de tarifas</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    className="w-full bg-gradient-solar-r hover:opacity-90 text-foreground"
                    size="lg"
                  >
                    Solicitar Orçamento Detalhado
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Sun size={64} weight="fill" className="text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aguardando Dados</h3>
                  <p className="text-muted-foreground">
                    Preencha os campos ao lado para calcular o dimensionamento do seu sistema solar
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
