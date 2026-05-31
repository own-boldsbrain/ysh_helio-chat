import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, CloudSun, Lightning, MapPin, TrendUp } from "@phosphor-icons/react"
import { Progress } from "@/components/ui/progress"

interface IrradiationData {
  location: string
  latitude: number
  longitude: number
  ghi: number
  dni: number
  dhi: number
  avgSolarHours: number
  annualProduction?: number
  dataSource: 'CAMS' | 'NASA POWER'
  quality: 'excellent' | 'good' | 'fair'
}

interface SolarIrradiationWidgetProps {
  data: IrradiationData
}

export function SolarIrradiationWidget({ data }: SolarIrradiationWidgetProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-[#00D98C]'
      case 'good': return 'text-[hsl(var(--solar-yellow))]'
      default: return 'text-[hsl(var(--solar-orange))]'
    }
  }

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Bom'
      default: return 'Regular'
    }
  }

  const qualityPercentage = data.quality === 'excellent' ? 95 : data.quality === 'good' ? 75 : 60

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] flex items-center justify-center shadow-lg">
            <Sun size={24} weight="bold" className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Dados de Irradiação Solar</h3>
            <p className="text-sm text-muted-foreground">Recurso solar de alta precisão</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <MapPin size={18} weight="fill" className="text-[hsl(var(--solar-red))]" />
            <div className="flex-1">
              <span className="text-sm font-semibold">{data.location}</span>
              <div className="text-xs text-muted-foreground">
                {data.latitude.toFixed(4)}°, {data.longitude.toFixed(4)}°
              </div>
            </div>
            <Badge variant="outline" className="border-[#0066FF] text-[#0066FF]">
              {data.dataSource}
            </Badge>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-4 bg-gradient-to-br from-[hsl(var(--solar-yellow))]/20 to-[hsl(var(--solar-orange))]/20 rounded-xl border border-[hsl(var(--solar-yellow))]/40">
              <div className="flex items-center gap-2 mb-2">
                <Sun size={20} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">GHI</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{data.ghi.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">kWh/m²/dia</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[hsl(var(--solar-orange))]/20 to-[hsl(var(--solar-red))]/20 rounded-xl border border-[hsl(var(--solar-orange))]/40">
              <div className="flex items-center gap-2 mb-2">
                <Lightning size={20} weight="fill" className="text-[hsl(var(--solar-red))]" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">DNI</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{data.dni.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">kWh/m²/dia</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#00C9FF]/20 to-[#0066FF]/20 rounded-xl border border-[#00C9FF]/40">
              <div className="flex items-center gap-2 mb-2">
                <CloudSun size={20} weight="fill" className="text-[#0066FF]" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">DHI</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{data.dhi.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">kWh/m²/dia</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Horas de sol pleno (HSP)</div>
                <div className="text-3xl font-bold text-foreground">{data.avgSolarHours.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">horas/dia (média anual)</div>
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sun size={48} weight="duotone" className="text-[hsl(var(--solar-yellow))]" />
              </motion.div>
            </div>

            {data.annualProduction && (
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendUp size={16} weight="bold" className="text-[#00D98C]" />
                  <span className="text-xs text-muted-foreground">Produção estimada (sistema 1kWp):</span>
                </div>
                <div className="text-lg font-bold text-[#00D98C]">
                  {data.annualProduction.toLocaleString('pt-BR')} kWh/ano
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Qualidade do recurso solar</span>
              <span className={`text-sm font-bold ${getQualityColor(data.quality)}`}>
                {getQualityLabel(data.quality)}
              </span>
            </div>
            <Progress value={qualityPercentage} className="h-2" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-3 bg-muted/30 rounded-lg border border-border/50"
          >
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Lightning size={14} weight="fill" className="text-[hsl(var(--solar-yellow))] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Sobre os dados:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>GHI</strong> - Irradiação Horizontal Global (total)</li>
                    <li><strong>DNI</strong> - Irradiação Normal Direta (raios diretos)</li>
                    <li><strong>DHI</strong> - Irradiação Difusa Horizontal (céu)</li>
                  </ul>
                </div>
              </div>
              <p className="pt-2 border-t border-border/30">
                Dados validados para o Brasil com precisão {'<'}5% de viés GHI.
                Fonte: {data.dataSource === 'CAMS' ? 'Copernicus CAMS Radiation Service' : 'NASA POWER'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Card>
  )
}
