import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Calendar, ShoppingCart, Package, Star, Check, TrendUp, TrendDown, CheckCircle, Lightning, ChartBar, ArrowUp, Repeat, PencilSimple, Sun, CurrencyCircleDollar, Calculator } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { SolarLocationSearchWidget } from "./SolarLocationSearchWidget"
import { RoofDrawingWidget } from "./RoofDrawingWidget"
import { SolarAnalysisResultsWidget } from "./SolarAnalysisResultsWidget"

export type WidgetAction = {
  type: string
  payload?: Record<string, unknown>
}

export type WidgetType = "card" | "list" | "form" | "product" | "calendar" | "poll" | "progress" | "stats" | "utility-analysis" | "solar-kit" | "financing-calc" | "solar-location-search" | "roof-drawing" | "solar-analysis-results"

export interface Widget {
  id: string
  type: WidgetType
  data: Record<string, unknown>
}

interface WidgetRendererProps {
  widget: Widget
  onAction?: (action: WidgetAction) => void
}

interface BaseWidgetProps {
  data: Record<string, unknown>
  onAction?: (action: WidgetAction) => void
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

export function WidgetRenderer({ widget, onAction }: WidgetRendererProps) {
  return (
    <AnimatePresence mode="wait">
      {(() => {
        switch (widget.type) {
          case "card":
            return <CardWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "list":
            return <ListWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "form":
            return <FormWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "product":
            return <ProductWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "calendar":
            return <CalendarWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "poll":
            return <PollWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "progress":
            return <ProgressWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "stats":
            return <StatsWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "utility-analysis":
            return <UtilityAnalysisWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "solar-kit":
            return <SolarKitWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "financing-calc":
            return <FinancingCalcWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "solar-location-search":
            return <SolarLocationSearchWidget key={widget.id} data={widget.data} onAction={onAction} />
          case "roof-drawing":
            return <RoofDrawingWidget key={widget.id} data={widget.data as any} onAction={onAction} />
          case "solar-analysis-results":
            return <SolarAnalysisResultsWidget key={widget.id} data={widget.data as any} onAction={onAction} />
          default:
            return null
        }
      })()}
    </AnimatePresence>
  )
}

function CardWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="p-6 space-y-5 max-w-md border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        {data.title && (
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-foreground tracking-tight">{data.title}</h3>
            {data.subtitle && <p className="text-sm text-muted-foreground leading-relaxed">{data.subtitle}</p>}
          </div>
        )}
        
        {data.content && <p className="text-sm leading-relaxed text-foreground/90">{data.content}</p>}
        
        {data.badges && (
          <div className="flex flex-wrap gap-2.5">
            {data.badges.map((badge: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <Badge variant={badge.variant || "secondary"} className="font-semibold px-3 py-1">
                  {badge.label}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
        
        {data.actions && (
          <div className="flex gap-2.5 pt-3">
            {data.actions.map((action: any, idx: number) => (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.04 }} 
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={() => onAction?.({ type: action.type, payload: action.payload })}
                  className="shadow-md"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
        
        {data.status && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
            {data.status.icon && <span>{data.status.icon}</span>}
            <span className="font-medium">{data.status.text}</span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function ListWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="max-w-md overflow-hidden border-2 shadow-lg">
        {data.header && (
          <div className="px-5 py-4 border-b bg-gradient-to-br from-muted/70 to-muted/40 backdrop-blur-sm">
            <h3 className="font-bold text-base text-foreground">{data.header}</h3>
          </div>
        )}
        
        <div className="divide-y divide-border/50">
          {data.items.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="px-5 py-4 hover:bg-accent/5 transition-colors cursor-pointer group"
              onClick={() =>
                item.action && onAction?.({ type: item.action.type, payload: item.action.payload })
              }
            >
              <div className="flex items-start gap-4">
                {item.icon && (
                  <motion.div 
                    className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-accent shadow-sm group-hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {item.icon}
                  </motion.div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm text-foreground leading-tight">{item.title}</p>
                    {item.badge && (
                      <Badge variant="secondary" className="flex-shrink-0 font-semibold">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.subtitle}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {data.footer && (
          <div className="px-5 py-3.5 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center font-medium">{data.footer}</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function FormWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const values = Object.fromEntries(formData)
    onAction?.({ type: "form_submit", payload: { formId: data.id, values } })
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="p-6 max-w-md border-2 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {data.title && <h3 className="text-xl font-bold text-foreground tracking-tight">{data.title}</h3>}
          
          {data.fields?.map((field: any, idx: number) => (
            <motion.div 
              key={idx} 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <label className="text-sm font-semibold text-foreground">{field.label}</label>
              {field.type === "select" ? (
                <Select name={field.name} defaultValue={field.defaultValue}>
                  <SelectTrigger className="border-2 focus:border-accent transition-colors">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option: any, optIdx: number) => (
                      <SelectItem key={optIdx} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  className="w-full px-4 py-2.5 border-2 border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors bg-background"
                  required={field.required}
                />
              )}
            </motion.div>
          ))}
          
          <div className="flex gap-2.5 pt-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
              <Button type="submit" className="w-full shadow-md">
                {data.submitLabel || "Enviar"}
              </Button>
            </motion.div>
            {data.cancelLabel && (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onAction?.({ type: "form_cancel", payload: { formId: data.id } })}
                  className="border-2"
                >
                  {data.cancelLabel}
                </Button>
              </motion.div>
            )}
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

function ProductWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="overflow-hidden max-w-xl border-2 shadow-xl hover:shadow-2xl transition-all duration-300">
        {data.image && (
          <div className="aspect-[4/3] bg-gradient-to-br from-muted/80 to-muted/40 relative overflow-hidden">
            <motion.img 
              src={data.image} 
              alt={data.name} 
              className="w-full h-full object-contain p-8"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
            {data.badge && (
              <motion.div 
                className="absolute top-4 right-4"
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
              >
                <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 text-sm font-bold shadow-lg">
                  {data.badge}
                </Badge>
              </motion.div>
            )}
            {data.rating && (
              <motion.div 
                className="absolute top-4 left-4 bg-background/95 backdrop-blur-md rounded-xl px-3.5 py-2 shadow-lg"
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="flex items-center gap-2">
                  <Star weight="fill" className="text-yellow-500" size={20} />
                  <span className="font-bold text-base">{data.rating}</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
        
        <div className="p-7 space-y-6 bg-card">
          <div className="space-y-2.5">
            <h3 className="text-2xl font-bold text-foreground leading-tight tracking-tight">{data.name}</h3>
            {data.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
            )}
          </div>
          
          {data.features && (
            <motion.div 
              className="space-y-3 py-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {data.features.map((feature: string, idx: number) => (
                <motion.div 
                  key={idx} 
                  className="flex items-start gap-3.5 text-sm group"
                  variants={{
                    hidden: { opacity: 0, x: -15 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mt-0.5 shadow-sm">
                    <Check className="text-green-600" size={16} weight="bold" />
                  </div>
                  <span className="text-foreground/90 leading-relaxed font-medium">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <Separator className="my-5" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">{data.price}</p>
                {data.originalPrice && (
                  <p className="text-lg text-muted-foreground line-through">{data.originalPrice}</p>
                )}
              </div>
              {data.originalPrice && (
                <p className="text-sm text-green-600 font-bold">
                  Economia de {data.badge}
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {data.actions?.map((action: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={idx === 0 ? "flex-1 sm:flex-initial" : ""}
                >
                  <Button
                    variant={action.variant || "default"}
                    size="lg"
                    className={`${
                      idx === 0 
                        ? "w-full sm:w-auto bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 shadow-xl hover:shadow-2xl" 
                        : "w-full sm:w-auto shadow-md"
                    }`}
                    onClick={() => onAction?.({ type: action.type, payload: { ...action.payload, product: data } })}
                  >
                    {action.icon === "cart" && <ShoppingCart className="mr-2.5" size={20} weight="bold" />}
                    <span className="font-semibold">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function CalendarWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="p-6 max-w-md space-y-5 border-2 shadow-lg">
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-sm"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Calendar className="text-accent" size={28} weight="bold" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{data.title}</h3>
            <p className="text-sm text-muted-foreground font-medium">{data.date}</p>
          </div>
          {data.status && (
            <Badge variant={data.status === "confirmed" ? "default" : "secondary"} className="font-semibold">
              {data.status}
            </Badge>
          )}
        </div>
        
        {data.details && (
          <div className="space-y-2.5 text-sm bg-muted/30 rounded-lg p-4">
            {data.details.map((detail: any, idx: number) => (
              <motion.div 
                key={idx} 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <span className="text-muted-foreground font-medium min-w-[80px]">{detail.label}:</span>
                <span className="font-semibold text-foreground">{detail.value}</span>
              </motion.div>
            ))}
          </div>
        )}
        
        {data.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
        )}
        
        {data.actions && (
          <div className="flex gap-2.5 pt-3">
            {data.actions.map((action: any, idx: number) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1"
              >
                <Button
                  variant={action.variant || "default"}
                  size="sm"
                  className="w-full shadow-md"
                  onClick={() => onAction?.({ type: action.type, payload: action.payload })}
                >
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function PollWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  const [voted, setVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [localVotes, setLocalVotes] = useState(data.options)
  const [totalVotes, setTotalVotes] = useState(data.totalVotes || 0)

  const handleVote = (optionId: string) => {
    if (voted) return
    
    setSelectedOption(optionId)
    setVoted(true)
    
    const updatedVotes = localVotes.map((opt: any) => ({
      ...opt,
      votes: opt.id === optionId ? opt.votes + 1 : opt.votes
    }))
    
    setLocalVotes(updatedVotes)
    setTotalVotes(totalVotes + 1)
    
    onAction?.({ 
      type: "poll_vote", 
      payload: { pollId: data.id, optionId, question: data.question } 
    })
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="p-6 max-w-md space-y-5 border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <div>
          <h3 className="font-bold text-xl mb-2 text-foreground tracking-tight">{data.question}</h3>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
          </p>
        </div>

        <div className="space-y-3">
          {localVotes.map((option: any, idx: number) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
            const isSelected = selectedOption === option.id
            
            return (
              <motion.button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={voted}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                className={`w-full text-left relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  voted
                    ? isSelected
                      ? 'border-accent bg-accent/10 shadow-md'
                      : 'border-border/50 bg-muted/40'
                    : 'border-border hover:border-accent/60 hover:bg-accent/5 cursor-pointer hover:shadow-sm'
                }`}
                whileHover={!voted ? { scale: 1.02, y: -2 } : {}}
                whileTap={!voted ? { scale: 0.98 } : {}}
              >
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{option.label}</span>
                  {voted && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-foreground min-w-[48px] text-right">{Math.round(percentage)}%</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <CheckCircle weight="fill" className="text-accent" size={22} />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
                {voted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    className={`absolute inset-y-0 left-0 ${
                      isSelected ? 'bg-accent/25' : 'bg-muted/70'
                    }`}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {voted && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-center text-accent font-bold pt-2"
          >
            ✓ Obrigado por votar! 
          </motion.p>
        )}
      </Card>
    </motion.div>
  )
}

function ProgressWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="p-7 max-w-md space-y-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <div>
          <h3 className="font-bold text-xl text-foreground tracking-tight">{data.title}</h3>
          {data.subtitle && <p className="text-sm text-muted-foreground mt-1.5 font-medium">{data.subtitle}</p>}
        </div>

        <div className="space-y-3 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold text-foreground uppercase tracking-wide text-xs">Progresso Geral</span>
            <span className="font-bold text-accent text-xl">{data.overallProgress}%</span>
          </div>
          <Progress value={data.overallProgress} className="h-4 bg-muted shadow-inner" />
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-4">
          {data.items.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx, type: "spring", stiffness: 200, damping: 20 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-foreground">{item.label}</span>
                  {item.status === "complete" && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1, type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <CheckCircle weight="fill" className="text-green-600" size={20} />
                    </motion.div>
                  )}
                </div>
                <span className={`text-sm font-bold ${
                  item.status === "complete" ? "text-green-600" :
                  item.status === "active" ? "text-accent" :
                  "text-muted-foreground"
                }`}>
                  {item.progress}%
                </span>
              </div>
              <Progress 
                value={item.progress} 
                className={`h-3 bg-muted shadow-inner ${
                  item.status === "complete" ? "[&>div]:bg-gradient-to-r [&>div]:from-green-600 [&>div]:to-green-500" :
                  item.status === "active" ? "[&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-accent/80" :
                  ""
                }`}
              />
            </motion.div>
          ))}
        </div>

        {data.dueDate && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center font-semibold uppercase tracking-wide">
              Meta de conclusão: {data.dueDate}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function StatsWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="p-7 max-w-md space-y-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <div>
          <h3 className="font-bold text-xl text-foreground tracking-tight">{data.title}</h3>
          {data.period && <p className="text-xs text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">{data.period}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {data.metrics.map((metric: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="p-5 rounded-xl bg-gradient-to-br from-muted/90 to-muted/50 space-y-3 border-2 border-border/40 hover:border-accent/30 hover:shadow-lg transition-all duration-200"
            >
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground tracking-tight">{metric.value}</p>
              <div className={`flex items-center gap-2 text-sm font-bold ${
                metric.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                <motion.div
                  initial={{ opacity: 0, y: metric.trend === "up" ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  {metric.trend === "up" ? (
                    <TrendUp size={18} weight="bold" />
                  ) : (
                    <TrendDown size={18} weight="bold" />
                  )}
                </motion.div>
                <span>{metric.change}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function UtilityAnalysisWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="max-w-2xl border-2 shadow-xl overflow-hidden bg-card">
        <div className="bg-gradient-to-br from-muted/50 to-muted/20 p-6 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.08, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Lightning className="text-white" size={24} weight="fill" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{data.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{data.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onAction?.({ type: "edit_analysis" })}
                  className="hover:bg-accent/10"
                  aria-label="Editar análise"
                >
                  <PencilSimple size={20} weight="bold" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onAction?.({ type: "refresh_analysis" })}
                  className="hover:bg-accent/10"
                  aria-label="Atualizar análise"
                >
                  <Repeat size={20} weight="bold" />
                </Button>
              </motion.div>
            </div>
          </div>

          {data.question && (
            <div className="flex justify-end">
              <div className="inline-block bg-accent/10 border border-accent/30 rounded-xl px-5 py-3 max-w-sm">
                <p className="text-sm font-semibold text-foreground">{data.question}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div>
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left group"
              whileHover={{ x: 2 }}
            >
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                {data.analysisTitle || "Analyzed past bills"}
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.span>
              </span>
            </motion.button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-accent/30">
                    {data.steps?.map((step: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <CheckCircle weight="fill" className="text-green-600 flex-shrink-0" size={18} />
                        <span className="text-muted-foreground">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {data.summary && (
            <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl p-6 space-y-4"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">
                {data.averageLabel || "6 month average"}
              </p>
              <p className="text-4xl font-bold text-foreground tracking-tight">{data.averageValue}</p>
            </div>

            {data.chartData && (
              <div className="pt-4">
                <div className="flex items-end justify-between h-32 gap-2">
                  {data.chartData.map((value: number, idx: number) => {
                    const maxValue = Math.max(...data.chartData)
                    const heightPercent = (value / maxValue) * 100
                    const colors = ['#00D98C', '#00D98C', '#70D6FF', '#70D6FF', '#00D98C', '#00D98C', '#70D6FF']
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${heightPercent}%`, opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                        className="flex-1 rounded-t-md relative group cursor-pointer"
                        style={{ backgroundColor: colors[idx] }}
                        whileHover={{ scale: 1.05, y: -4 }}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: -10 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-2 py-1 rounded whitespace-nowrap shadow-lg"
                        >
                          {value} kWh
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
                {data.chartLabels && (
                  <div className="flex justify-between mt-3">
                    {data.chartLabels.map((label: string, idx: number) => (
                      <span key={idx} className="text-xs text-muted-foreground font-medium flex-1 text-center">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {data.actions && (
            <div className="flex gap-3 pt-4">
              {data.actions.map((action: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={idx === 0 ? "flex-1" : ""}
                >
                  <Button
                    variant={action.variant || "default"}
                    size="sm"
                    onClick={() => onAction?.({ type: action.type, payload: action.payload })}
                    className={`${idx === 0 ? 'w-full' : ''} shadow-md`}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function SolarKitWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="max-w-2xl border-2 shadow-xl overflow-hidden bg-card">
        <div className="bg-gradient-to-br from-[hsl(var(--solar-yellow))]/20 via-[hsl(var(--solar-red))]/10 to-[hsl(var(--solar-pink))]/20 p-6 border-b border-border/40">
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              className="w-14 h-14 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Sun className="text-white" size={28} weight="fill" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{data.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{data.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {data.specs?.map((spec: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="bg-background/60 backdrop-blur-sm rounded-lg p-4 text-center"
              >
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1">{spec.label}</p>
                <p className="text-xl font-bold text-foreground">{spec.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {data.components && (
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Componentes Inclusos</h4>
              <div className="space-y-3">
                {data.components.map((component: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                        <span className="text-lg">{component.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{component.name}</p>
                        <p className="text-xs text-muted-foreground">{component.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {component.quantity}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Investimento Total</p>
                <p className="text-3xl font-bold bg-gradient-solar-r bg-clip-text text-transparent">
                  {data.price}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium">Economia Mensal</p>
                <p className="text-2xl font-bold text-green-600">{data.monthlySavings}</p>
              </div>
            </div>

            {data.paybackPeriod && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-xl border border-green-200 dark:border-green-800"
              >
                <p className="text-xs text-green-800 dark:text-green-200 font-bold uppercase tracking-wide mb-1">
                  Retorno do Investimento
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{data.paybackPeriod}</p>
              </motion.div>
            )}
          </div>

          {data.actions && (
            <div className="flex gap-3 pt-4">
              {data.actions.map((action: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={idx === 0 ? "flex-1" : ""}
                >
                  <Button
                    variant={action.variant || "default"}
                    size="lg"
                    onClick={() => onAction?.({ type: action.type, payload: action.payload })}
                    className={`${idx === 0 ? 'w-full bg-gradient-solar-r hover:opacity-90' : 'w-full'} shadow-md font-semibold`}
                  >
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function FinancingCalcWidget({ data, onAction }: { data: any; onAction?: (action: WidgetAction) => void }) {
  const [selectedBank, setSelectedBank] = useState(data.options?.[0]?.bank || "")

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="max-w-2xl border-2 shadow-xl overflow-hidden bg-card">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <CurrencyCircleDollar className="text-white" size={24} weight="fill" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{data.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{data.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-muted/40 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground font-medium">Valor Total</span>
              <span className="text-2xl font-bold text-foreground">{data.totalAmount}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground font-medium">Entrada</span>
              <span className="text-lg font-bold text-foreground">{data.downPayment}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground font-medium">Valor Financiado</span>
              <span className="text-xl font-bold text-accent">{data.financedAmount}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Opções de Financiamento</h4>
            <div className="space-y-3">
              {data.options?.map((option: any, idx: number) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setSelectedBank(option.bank)
                    onAction?.({ type: "select_financing", payload: option })
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    selectedBank === option.bank
                      ? 'border-accent bg-accent/10 shadow-lg'
                      : 'border-border hover:border-accent/50 hover:bg-accent/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {option.bank.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{option.bank}</p>
                        <p className="text-xs text-muted-foreground">{option.term}</p>
                      </div>
                    </div>
                    {selectedBank === option.bank && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <CheckCircle weight="fill" className="text-accent" size={24} />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Taxa</p>
                      <p className="text-lg font-bold text-foreground">{option.rate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Parcela</p>
                      <p className="text-lg font-bold text-accent">{option.monthlyPayment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-lg font-bold text-foreground">{option.totalPayment}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {data.actions && (
            <div className="flex gap-3 pt-4">
              {data.actions.map((action: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1"
                >
                  <Button
                    variant={action.variant || "default"}
                    size="lg"
                    onClick={() => onAction?.({ type: action.type, payload: { ...action.payload, selectedBank } })}
                    className="w-full shadow-md font-semibold"
                  >
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
