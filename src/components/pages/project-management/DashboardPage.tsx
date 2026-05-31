import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Lightning, BatteryCharging, CloudSun, Info, List } from "@phosphor-icons/react";
import { EnergyStatusCard } from "@/components/solar/EnergyStatusCard";
import { SolarEnergyChart } from "@/components/solar/EnergyChart";

interface DashboardPageProps {
  onToggleSidebar: () => void
}

export function DashboardPage({ onToggleSidebar }: DashboardPageProps) {
  const energyData = [
    { time: "00h", production: 0, consumption: 12 },
    { time: "04h", production: 0, consumption: 10 },
    { time: "08h", production: 45, consumption: 25 },
    { time: "12h", production: 85, consumption: 35 },
    { time: "16h", production: 60, consumption: 40 },
    { time: "20h", production: 10, consumption: 30 },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <List size={22} weight="bold" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-solar-gradient mb-2">
                  Dashboard Solar
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Monitoramento em tempo real do seu sistema de energia solar
                </p>
              </div>
            </div>
            <Button variant="default" className="bg-solar-gradient text-white w-full sm:w-auto">
              <Info className="mr-2" size={18} weight="bold" />
              Ver Relatório
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EnergyStatusCard
              title="Produção Solar"
              value={8.5}
              unit="kWh"
              status="medium"
              icon="sun"
              description="Produção atual"
              change={{ value: 12.5, type: "increase", period: "ontem" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <EnergyStatusCard
              title="Consumo"
              value={6.2}
              unit="kWh"
              status="low"
              icon="zap"
              description="Consumo atual"
              change={{ value: 8.3, type: "decrease", period: "ontem" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <EnergyStatusCard
              title="Bateria"
              value={85}
              unit="%"
              status="low"
              icon="battery"
              description="Carga atual"
              change={{ value: 5, type: "increase", period: "1h atrás" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <EnergyStatusCard
              title="Economia"
              value={45.8}
              unit="R$"
              status="low"
              icon="export"
              description="Economia hoje"
              change={{ value: 15.2, type: "increase", period: "ontem" }}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <SolarEnergyChart
            data={energyData}
            title="Produção vs Consumo - Hoje"
            description="Acompanhamento da produção e consumo de energia ao longo do dia"
            height={300}
            variant="daily"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun size={24} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse-solar" />
                      <span className="font-medium">Painéis Solares</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Operando</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse-solar" />
                      <span className="font-medium">Inversor</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Conectado</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse-solar" />
                      <span className="font-medium">Bateria</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Carregando</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse-solar" />
                      <span className="font-medium">Rede Elétrica</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Sincronizado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudSun size={24} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                  Condições Climáticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Temperatura</span>
                    <span className="text-2xl font-bold">28°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Irradiação Solar</span>
                    <span className="text-2xl font-bold">850 W/m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Condição</span>
                    <span className="text-lg font-semibold">Ensolarado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Eficiência Estimada</span>
                    <span className="text-lg font-semibold text-success">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
