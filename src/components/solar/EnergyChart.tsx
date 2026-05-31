import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EnergyDataPoint {
  time: string;
  production: number;
  consumption: number;
  gridImport?: number;
  gridExport?: number;
  batteryCharge?: number;
  batteryDischarge?: number;
}

export interface EnergyChartProps {
  data: EnergyDataPoint[];
  title?: string;
  description?: string;
  height?: number | string;
  className?: string;
  variant?: "daily" | "weekly" | "monthly" | "yearly";
  unit?: string;
}

export const SolarEnergyChart: React.FC<EnergyChartProps> = ({
  data,
  title = "Energy Overview",
  description,
  height = 400,
  className,
  variant = "daily",
  unit = "kWh",
}) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.production, d.consumption)));

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height }} className="flex items-end gap-2 pt-4">
          {data.map((point, index) => {
            const productionHeight = (point.production / maxValue) * 100;
            const consumptionHeight = (point.consumption / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end" style={{ height: height }}>
                  <div 
                    className="flex-1 bg-gradient-to-t from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] rounded-t transition-all duration-500"
                    style={{ height: `${productionHeight}%` }}
                    title={`Production: ${point.production} ${unit}`}
                  />
                  <div 
                    className="flex-1 bg-gradient-to-t from-[hsl(var(--solar-red))] to-[hsl(var(--solar-pink))] rounded-t transition-all duration-500"
                    style={{ height: `${consumptionHeight}%` }}
                    title={`Consumption: ${point.consumption} ${unit}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{point.time}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--solar-yellow))]" />
            <span className="text-sm">Production</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--solar-red))]" />
            <span className="text-sm">Consumption</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolarEnergyChart;
