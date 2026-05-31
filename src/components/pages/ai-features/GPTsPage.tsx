import { motion } from "framer-motion"
import { Compass, Sparkle, ArrowRight, Star, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface GPTsPageProps {
  onToggleSidebar: () => void
}

interface GPT {
  id: string
  name: string
  description: string
  category: string
  icon: string
  rating: number
  usageCount: number
  tags: string[]
}

const gpts: GPT[] = [
  {
    id: '1',
    name: 'Hélio - Copiloto Solar',
    description: 'Assistente completo para projetos fotovoltaicos. Auxilia em dimensionamento, análise de consumo, escolha de equipamentos e homologação.',
    category: 'Solar',
    icon: '☀️',
    rating: 5.0,
    usageCount: 3420,
    tags: ['solar', 'fotovoltaico', 'dimensionamento', 'energia']
  },
  {
    id: '2',
    name: 'Agente Técnico',
    description: 'Especialista em especificações técnicas, análise de eficiência, cálculos de geração e validação de projetos fotovoltaicos.',
    category: 'Solar',
    icon: '⚡',
    rating: 4.9,
    usageCount: 1850,
    tags: ['técnico', 'engenharia', 'eficiência', 'projeto']
  },
  {
    id: '3',
    name: 'Agente Comercial',
    description: 'Auxilia na elaboração de propostas comerciais, análise de viabilidade, ROI e estratégias de venda de sistemas solares.',
    category: 'Solar',
    icon: '💼',
    rating: 4.8,
    usageCount: 2240,
    tags: ['comercial', 'proposta', 'roi', 'vendas']
  },
  {
    id: '4',
    name: 'Agente Financeiro',
    description: 'Especialista em financiamento, análise de crédito multi-bancos, simulações de payback e viabilidade econômica.',
    category: 'Solar',
    icon: '💰',
    rating: 4.8,
    usageCount: 1620,
    tags: ['financeiro', 'crédito', 'payback', 'análise']
  },
  {
    id: '5',
    name: 'Agente de Homologação',
    description: 'Automatiza processos de homologação junto às distribuidoras. Preenche formulários e valida documentação técnica.',
    category: 'Solar',
    icon: '📋',
    rating: 4.7,
    usageCount: 980,
    tags: ['homologação', 'distribuidora', 'documentação', 'regulatório']
  },
  {
    id: '6',
    name: 'Consultor de Eficiência',
    description: 'Analisa faturas de energia, identifica padrões de consumo e sugere otimizações para maximizar economia.',
    category: 'Análise',
    icon: '📊',
    rating: 4.9,
    usageCount: 1340,
    tags: ['eficiência', 'consumo', 'economia', 'análise']
  },
  {
    id: '7',
    name: 'Designer de Sistemas',
    description: 'Otimiza layout de painéis solares considerando sombreamento, orientação, inclinação e características do telhado.',
    category: 'Técnico',
    icon: '🗺️',
    rating: 4.8,
    usageCount: 1120,
    tags: ['layout', 'design', 'otimização', 'telhado']
  },
  {
    id: '8',
    name: 'Expert em Equipamentos',
    description: 'Recomenda inversores, módulos fotovoltaicos e estruturas de fixação baseado em características específicas do projeto.',
    category: 'Técnico',
    icon: '🔧',
    rating: 4.7,
    usageCount: 1560,
    tags: ['equipamentos', 'inversores', 'módulos', 'especificação']
  },
  {
    id: '9',
    name: 'Analista de Crédito Solar',
    description: 'Compara taxas e condições de múltiplos bancos para financiamento de sistemas fotovoltaicos, incluindo linhas sustentáveis.',
    category: 'Financeiro',
    icon: '🏦',
    rating: 4.9,
    usageCount: 890,
    tags: ['crédito', 'bancos', 'financiamento', 'taxas']
  },
  {
    id: '10',
    name: 'Gerador de Propostas',
    description: 'Cria propostas comerciais profissionais e personalizadas com cálculos de economia, payback e simulações de geração.',
    category: 'Comercial',
    icon: '📄',
    rating: 4.8,
    usageCount: 2180,
    tags: ['proposta', 'orçamento', 'apresentação', 'documentação']
  },
  {
    id: '11',
    name: 'Monitor de Geração',
    description: 'Acompanha performance de sistemas instalados, identifica anomalias e sugere manutenções preventivas.',
    category: 'Monitoramento',
    icon: '📈',
    rating: 4.7,
    usageCount: 740,
    tags: ['monitoramento', 'performance', 'manutenção', 'análise']
  },
  {
    id: '12',
    name: 'Especialista em Regulação',
    description: 'Consultoria sobre normas ANEEL, REN 482, REN 687, Marco Legal da Geração Distribuída e legislação estadual.',
    category: 'Regulatório',
    icon: '⚖️',
    rating: 4.6,
    usageCount: 620,
    tags: ['regulação', 'aneel', 'legislação', 'normas']
  }
]

const categories = Array.from(new Set(gpts.map(g => g.category)))

export function GPTsPage({ onToggleSidebar }: GPTsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredGPTs = gpts.filter(gpt => {
    const matchesSearch = gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gpt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gpt.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || gpt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onToggleSidebar}
              className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <List size={22} weight="bold" />
            </button>
            <motion.div 
              className="w-11 h-11 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Compass className="text-white" size={24} weight="fill" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-solar-r bg-clip-text text-transparent">
                Agentes Inteligentes Solar
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {filteredGPTs.length} agentes especializados em energia fotovoltaica
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar agentes por nome, descrição ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/60 backdrop-blur-sm border-2"
              />
            </div>
            <Button 
              className="gap-2 w-full sm:w-auto bg-gradient-solar-br hover:opacity-90 text-white shadow-lg"
            >
              <Sparkle size={20} weight="fill" />
              Criar Agente Personalizado
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredGPTs.map((gpt, index) => (
              <motion.div
                key={gpt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 border-2 hover:border-accent/60 hover:shadow-2xl transition-all duration-300 h-full flex flex-col group cursor-pointer bg-card/80 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {gpt.icon}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs font-semibold",
                        gpt.category === 'Solar' && "bg-gradient-solar-r text-white"
                      )}
                    >
                      {gpt.category}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:bg-gradient-solar-r group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {gpt.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">
                    {gpt.description}
                  </p>

                  <div className="flex gap-2 flex-wrap mb-4">
                    {gpt.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star size={14} weight="fill" className="text-yellow-500" />
                        <span className="font-semibold">{gpt.rating}</span>
                      </div>
                      <div>
                        {gpt.usageCount.toLocaleString('pt-BR')} usos
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        className="gap-1 bg-gradient-solar-r text-white hover:opacity-90 shadow-md"
                      >
                        Usar Agora
                        <ArrowRight size={14} weight="bold" />
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredGPTs.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-solar-br opacity-20 flex items-center justify-center mb-4">
                <Compass size={40} className="text-accent" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum agente encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou limpar os filtros
              </p>
              <Button 
                className="mt-4 bg-gradient-solar-r text-white"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory(null)
                }}
              >
                Limpar Filtros
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
