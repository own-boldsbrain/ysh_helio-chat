import { motion } from "framer-motion"
import { Code, Copy, Play, CheckCircle, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { toast } from "sonner"

interface CodexPageProps {
  onToggleSidebar: () => void
}

interface CodeSnippet {
  id: string
  title: string
  description: string
  language: string
  code: string
  tags: string[]
  category: string
}

const codeSnippets: CodeSnippet[] = [
  {
    id: '1',
    title: 'Componente React com Hooks',
    description: 'Exemplo de componente funcional usando useState e useEffect',
    language: 'typescript',
    category: 'React',
    code: `import { useState, useEffect } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    document.title = \`Count: \${count}\`
  }, [count])
  
  return (
    <div>
      <p>Você clicou {count} vezes</p>
      <button onClick={() => setCount(count + 1)}>
        Clique aqui
      </button>
    </div>
  )
}`,
    tags: ['react', 'hooks', 'typescript']
  },
  {
    id: '2',
    title: 'Custom Hook useLocalStorage',
    description: 'Hook personalizado para gerenciar estado no localStorage',
    language: 'typescript',
    category: 'React',
    code: `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}`,
    tags: ['react', 'hooks', 'localStorage']
  },
  {
    id: '3',
    title: 'Fetch com Async/Await',
    description: 'Função assíncrona para buscar dados de uma API',
    language: 'typescript',
    category: 'API',
    code: `async function fetchUserData(userId: string) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`)
    
    if (!response.ok) {
      throw new Error('Falha ao buscar usuário')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro:', error)
    throw error
  }
}`,
    tags: ['api', 'async', 'fetch']
  },
  {
    id: '4',
    title: 'Debounce Function',
    description: 'Função utilitária para debounce de eventos',
    language: 'typescript',
    category: 'Utils',
    code: `export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const handleSearch = debounce((query: string) => {
  console.log('Buscando:', query)
}, 300)`,
    tags: ['utils', 'performance', 'debounce']
  },
  {
    id: '5',
    title: 'Validação de Formulário com Zod',
    description: 'Schema de validação usando a biblioteca Zod',
    language: 'typescript',
    category: 'Validação',
    code: `import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Deve ser maior de 18 anos'),
  role: z.enum(['admin', 'user', 'guest'])
})

type User = z.infer<typeof userSchema>

function validateUser(data: unknown): User {
  return userSchema.parse(data)
}`,
    tags: ['zod', 'validação', 'formulário']
  },
  {
    id: '6',
    title: 'Animação com Framer Motion',
    description: 'Exemplo de animações declarativas',
    language: 'typescript',
    category: 'Animação',
    code: `import { motion } from 'framer-motion'

export function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      <h2>Card Animado</h2>
      <p>Passe o mouse para ver o efeito</p>
    </motion.div>
  )
}`,
    tags: ['framer-motion', 'animação', 'react']
  }
]

const categories = Array.from(new Set(codeSnippets.map(s => s.category)))

export function CodexPage({ onToggleSidebar }: CodexPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredSnippets = codeSnippets.filter(
    snippet => snippet.category === selectedCategory
  )

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success("Código copiado!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onToggleSidebar}
              className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <List size={22} weight="bold" />
            </button>
            <motion.div 
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Code className="text-accent-foreground" size={24} weight="fill" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">Codex</h1>
              <p className="text-xs text-muted-foreground font-medium">
                {codeSnippets.length} snippets de código
              </p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-6">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-6">
                {filteredSnippets.map((snippet, index) => (
                  <motion.div
                    key={snippet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 border-2 hover:border-accent/40 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2">{snippet.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {snippet.description}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {snippet.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(snippet.code, snippet.id)}
                            >
                              {copiedId === snippet.id ? (
                                <CheckCircle size={18} weight="fill" className="text-success" />
                              ) : (
                                <Copy size={18} weight="bold" />
                              )}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="sm" variant="ghost">
                              <Play size={18} weight="fill" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code className="text-foreground font-mono">
                            {snippet.code}
                          </code>
                        </pre>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
