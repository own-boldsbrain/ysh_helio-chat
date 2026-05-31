import { motion } from "framer-motion"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Lightning, CheckCircle, Info } from "@phosphor-icons/react"

interface Equipment {
  id: string
  name: string
  category: string
  power: string
  price: number
  manufacturer: string
  efficiency?: string
  warranty?: string
  description?: string
  image?: string
}

interface SolarEquipmentWidgetProps {
  equipment: Equipment[]
  onSelect?: (equipment: Equipment) => void
  onAddToCart?: (equipment: Equipment) => void
}

export function SolarEquipmentWidget({ equipment, onSelect, onAddToCart }: SolarEquipmentWidgetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (item: Equipment) => {
    setSelectedId(item.id)
    onSelect?.(item)
  }

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] flex items-center justify-center shadow-lg">
            <Package size={24} weight="bold" className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Seleção de Equipamentos</h3>
            <p className="text-sm text-muted-foreground">Escolha os componentes do sistema</p>
          </div>
        </div>

        <div className="space-y-3">
          {equipment.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card
                className={`p-4 transition-all border-2 hover:shadow-lg cursor-pointer ${
                  selectedId === item.id
                    ? 'border-[hsl(var(--solar-yellow))] bg-[hsl(var(--solar-yellow))]/5'
                    : 'border-border hover:border-[hsl(var(--solar-yellow))]/50'
                }`}
                onClick={() => handleSelect(item)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Package size={24} weight="duotone" className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base text-foreground truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Lightning size={12} weight="fill" className="mr-1" />
                            {item.power}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {selectedId === item.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="flex-shrink-0"
                      >
                        <CheckCircle size={24} weight="fill" className="text-[hsl(var(--solar-yellow))]" />
                      </motion.div>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Fabricante</div>
                      <div className="font-semibold">{item.manufacturer}</div>
                    </div>
                    {item.efficiency && (
                      <div>
                        <div className="text-sm text-muted-foreground">Eficiência</div>
                        <div className="font-semibold">{item.efficiency}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-2xl font-bold text-foreground">
                      R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddToCart?.(item)
                      }}
                      size="sm"
                      className="bg-gradient-to-r from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] hover:opacity-90 text-foreground"
                    >
                      <ShoppingCart size={16} weight="bold" className="mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}
