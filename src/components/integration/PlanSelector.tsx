import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "@phosphor-icons/react"
import { motion } from "framer-motion"

export interface Plan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: number
  period: 'month' | 'year'
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

interface PlanSelectorProps {
  plans: Plan[]
  currentPlanId?: string
  onSelectPlan: (planId: string) => void
  className?: string
}

export function PlanSelector({ plans, currentPlanId, onSelectPlan, className = "" }: PlanSelectorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(currentPlanId || null)

  const handleSelect = (planId: string) => {
    setSelectedPlanId(planId)
    onSelectPlan(planId)
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {plans.map((plan, index) => {
        const isSelected = selectedPlanId === plan.id
        const isCurrent = currentPlanId === plan.id

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`
                relative h-full flex flex-col transition-all duration-200
                ${plan.highlighted ? 'border-accent border-2 shadow-lg scale-105' : 'border-border'}
                ${isSelected ? 'ring-2 ring-accent ring-offset-2' : ''}
              `}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-solar-r text-foreground px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm">
                        /{plan.period === 'month' ? 'mês' : 'ano'}
                      </span>
                    )}
                  </div>
                  
                  {plan.period === 'year' && plan.price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      R$ {(plan.price / 12).toFixed(2)}/mês
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check 
                        size={18} 
                        weight="bold" 
                        className="text-accent mt-0.5 flex-shrink-0" 
                      />
                      <span className="text-sm leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button 
                    variant="secondary" 
                    disabled
                    className="w-full"
                  >
                    Plano Atual
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSelect(plan.id)}
                    variant={plan.highlighted ? "default" : "outline"}
                    className={`
                      w-full
                      ${plan.highlighted ? 'bg-gradient-solar-r hover:opacity-90' : ''}
                    `}
                  >
                    {plan.price === 0 ? 'Começar Grátis' : 'Selecionar Plano'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    period: 'month',
    description: 'Para começar a explorar',
    features: [
      'Até 3 projetos',
      'Até 10 análises/mês',
      'Dimensionamento básico',
      'Acesso ao catálogo de equipamentos',
      'Suporte via email',
    ],
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 97,
    period: 'month',
    description: 'Para integradores ativos',
    features: [
      'Até 50 projetos',
      'Até 500 análises/mês',
      'Acesso a imagens Sentinel-2',
      'Análise de sombreamento 3D',
      'Relatórios técnicos em PDF',
      'Suporte prioritário',
    ],
    highlighted: true,
    badge: 'Mais Popular',
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 297,
    period: 'month',
    description: 'Para grandes empresas',
    features: [
      'Projetos ilimitados',
      'Análises ilimitadas',
      'White-label',
      'API dedicada',
      'Treinamento personalizado',
      'Suporte 24/7',
      'Gerente de conta dedicado',
    ],
  },
]
