import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Sparkle, 
  PencilLine, 
  MagnifyingGlass, 
  ImageSquare, 
  Code, 
  Compass,
  Lightning,
  FolderOpen,
  DotsThree,
  Chat,
  X,
  List,
  Package,
  ChartBar,
  Question,
  FileText,
  Bug,
  DownloadSimple,
  Keyboard,
  CaretDown,
  CaretRight,
  Microphone,
  User,
  ShoppingCart,
  Sun,
  ClockCounterClockwise
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import yelloLogoWhite from "@/assets/images/yello-white_logomark.svg"
import yelloLogoBlack from "@/assets/images/yello-black_logomark.svg"

interface ChatHistoryItem {
  id: string
  title: string
  timestamp: number
}

interface Project {
  id: string
  name: string
  color: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  chatHistory: ChatHistoryItem[]
  onChatSelect: (chatId: string) => void
  currentChatId?: string
  onNewChat: () => void
  onNavigate?: (route: string) => void
  currentRoute?: string
  isLoggedIn?: boolean
}

function EquipmentSection({ 
  currentRoute, 
  onNavigate 
}: { 
  currentRoute: string
  onNavigate?: (route: string) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent h-10",
          (currentRoute === 'equipment' || currentRoute === 'technical-sheets') && !isExpanded && "bg-sidebar-accent"
        )}
      >
        <div className="flex items-center min-w-0">
          <Package size={18} weight="regular" className="mr-3 flex-shrink-0" />
          <span className="truncate text-[13px]">Equipamentos</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <CaretRight size={14} weight="bold" />
        </motion.div>
      </Button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1 pl-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('equipment')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-[13px]",
                  currentRoute === 'equipment' && "bg-sidebar-accent"
                )}
              >
                <Package size={16} weight="regular" className="mr-3 flex-shrink-0" />
                <span className="truncate">Catálogo</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('technical-sheets')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-[13px]",
                  currentRoute === 'technical-sheets' && "bg-sidebar-accent"
                )}
              >
                <FileText size={16} weight="regular" className="mr-3 flex-shrink-0" />
                <span className="truncate">Fichas Técnicas</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SizingSection({ 
  currentRoute, 
  onNavigate 
}: { 
  currentRoute: string
  onNavigate?: (route: string) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-1 mb-1">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent h-10",
          (currentRoute === 'sizing' || currentRoute === 'shading-analysis' || currentRoute === 'temporal-analysis' || currentRoute === 'solar-workflow' || currentRoute === 'pdf-proposal') && !isExpanded && "bg-sidebar-accent"
        )}
      >
        <div className="flex items-center min-w-0">
          <ImageSquare size={17} weight="regular" className="mr-3 flex-shrink-0" />
          <span className="truncate">Dimensionamento</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <CaretRight size={15} weight="bold" />
        </motion.div>
      </Button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1 pl-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('solar-workflow')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'solar-workflow' && "bg-sidebar-accent"
                )}
              >
                <Sparkle size={15} weight="fill" className="mr-3 flex-shrink-0 text-[hsl(var(--solar-yellow))]" />
                <span className="truncate">Workflow Completo</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('sizing')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'sizing' && "bg-sidebar-accent"
                )}
              >
                <ImageSquare size={15} weight="regular" className="mr-3 flex-shrink-0" />
                <span className="truncate">Calculadora</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('shading-analysis')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'shading-analysis' && "bg-sidebar-accent"
                )}
              >
                <Sun size={15} weight="duotone" className="mr-3 flex-shrink-0" />
                <span className="truncate">Análise de Sombreamento</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('temporal-analysis')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'temporal-analysis' && "bg-sidebar-accent"
                )}
              >
                <ClockCounterClockwise size={15} weight="duotone" className="mr-3 flex-shrink-0" />
                <span className="truncate">Análise Temporal</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('pdf-proposal')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'pdf-proposal' && "bg-sidebar-accent"
                )}
              >
                <FileText size={15} weight="duotone" className="mr-3 flex-shrink-0" />
                <span className="truncate">Gerar Proposta PDF</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResourcesSection({ 
  currentRoute, 
  onNavigate 
}: { 
  currentRoute: string
  onNavigate?: (route: string) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-1 mb-1">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent h-10",
          (currentRoute === 'earth-observation' || currentRoute === 'realtime-voice' || currentRoute === 'homologation' || currentRoute === 'credit') && !isExpanded && "bg-sidebar-accent"
        )}
      >
        <div className="flex items-center min-w-0">
          <Compass size={17} weight="regular" className="mr-3 flex-shrink-0" />
          <span className="truncate">Recursos</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <CaretRight size={15} weight="bold" />
        </motion.div>
      </Button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1 pl-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('earth-observation')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'earth-observation' && "bg-sidebar-accent"
                )}
              >
                <Compass size={15} weight="duotone" className="mr-3 flex-shrink-0" />
                <span className="truncate">Earth Observation</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('realtime-voice')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm bg-gradient-to-r from-accent/10 to-transparent",
                  currentRoute === 'realtime-voice' && "bg-sidebar-accent"
                )}
              >
                <Microphone size={15} weight="fill" className="mr-3 text-accent flex-shrink-0" />
                <span className="font-semibold text-xs truncate">Faça uma chamada de voz</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('homologation')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'homologation' && "bg-sidebar-accent"
                )}
              >
                <Code size={15} weight="duotone" className="mr-3 flex-shrink-0" />
                <span className="truncate">Homologação</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('credit')}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 text-sm",
                  currentRoute === 'credit' && "bg-sidebar-accent"
                )}
              >
                <Lightning size={15} weight="duotone" className="mr-3 flex-shrink-0" />
                <span className="truncate">Análise de crédito</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ChatSidebar({ 
  isOpen, 
  onToggle, 
  chatHistory, 
  onChatSelect, 
  currentChatId,
  onNewChat,
  onNavigate,
  currentRoute = 'chat',
  isLoggedIn = false
}: ChatSidebarProps) {
  const [showMoreProjects, setShowMoreProjects] = useState(false)
  const [isAgentsExpanded, setIsAgentsExpanded] = useState(true)

  const projects: Project[] = [
    { id: "1", name: "YelloDesignHub", color: "text-yellow-500" },
    { id: "2", name: "OpsHub", color: "text-green-500" },
    { id: "3", name: "Marketplace", color: "text-foreground" },
    { id: "4", name: "GenAI, LLMs, Human Capabilit...", color: "text-pink-500" },
    { id: "5", name: "YelloDataHub", color: "text-blue-500" },
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={onToggle}
              style={{ overscrollBehavior: 'contain' }}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar text-sidebar-foreground z-50 flex flex-col shadow-2xl border-r border-sidebar-border"
              role="navigation"
              aria-label="Menu de navegação principal"
              style={{ 
                paddingTop: 'env(safe-area-inset-top)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingBottom: 'env(safe-area-inset-bottom)'
              }}
            >
              <div className="flex items-center justify-between h-[60px] px-4 border-b border-sidebar-border flex-shrink-0">
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <img 
                    src={yelloLogoBlack} 
                    alt="Yello Logo" 
                    className="w-24 h-auto dark:hidden"
                  />
                  <img 
                    src={yelloLogoWhite} 
                    alt="Yello Logo" 
                    className="w-24 h-auto hidden dark:block"
                  />
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="lg:hidden hover:bg-sidebar-accent text-sidebar-foreground w-9 h-9 flex-shrink-0"
                  aria-label="Fechar menu"
                >
                  <X size={19} weight="bold" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                  <div className="text-xs font-semibold text-sidebar-foreground/60 px-3 mb-2 uppercase tracking-wider leading-[1.4]">
                    Acesso Rápido
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      onClick={() => onNavigate?.('login')}
                      className={cn(
                        "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10",
                        currentRoute === 'login' && "bg-sidebar-accent"
                      )}
                    >
                      <User size={18} weight="regular" className="mr-3 flex-shrink-0" />
                      <span className="truncate text-[13px]">Login / Cadastro</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      onClick={() => onNavigate?.('checkout')}
                      className={cn(
                        "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10",
                        currentRoute === 'checkout' && "bg-sidebar-accent"
                      )}
                    >
                      <ShoppingCart size={18} weight="regular" className="mr-3 flex-shrink-0" />
                      <span className="truncate text-[13px]">Checkout</span>
                    </Button>
                  </motion.div>

                  <Separator className="my-2.5" />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => {
                        onNewChat()
                        onNavigate?.('chat')
                      }}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent font-medium h-10",
                        currentRoute === 'chat' && "bg-sidebar-accent"
                      )}
                    >
                      <Chat size={18} weight="regular" className="mr-3 flex-shrink-0" />
                      <span className="truncate text-[13px]">Novo Chat</span>
                    </Button>
                  </motion.div>

                  {isLoggedIn && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate?.('dashboard')}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10",
                          currentRoute === 'dashboard' && "bg-sidebar-accent"
                        )}
                      >
                        <ChartBar size={18} weight="regular" className="mr-3 flex-shrink-0" />
                        <span className="truncate text-[13px]">Dashboard</span>
                      </Button>
                    </motion.div>
                  )}

                  <Separator className="my-2.5" />

                  <EquipmentSection
                    currentRoute={currentRoute}
                    onNavigate={onNavigate}
                  />

                  <SizingSection
                    currentRoute={currentRoute}
                    onNavigate={onNavigate}
                  />

                  <ResourcesSection
                    currentRoute={currentRoute}
                    onNavigate={onNavigate}
                  />

                </div>

                <Separator className="my-2.5 bg-sidebar-border" />

                <div className="px-3">
                  <button
                    onClick={() => setIsAgentsExpanded(!isAgentsExpanded)}
                    className="w-full flex items-center justify-between px-3 mb-2 hover:bg-sidebar-accent/50 rounded-md py-1.5 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider leading-tight">
                      Agentes IA
                    </div>
                    <motion.div
                      animate={{ rotate: isAgentsExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CaretDown size={13} weight="bold" className="text-sidebar-foreground/60" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isAgentsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1 overflow-hidden"
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="ghost"
                            onClick={() => onNavigate?.('gpts')}
                            className={cn(
                              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10 relative group",
                              currentRoute === 'gpts' && "bg-sidebar-accent"
                            )}
                          >
                            <div className="absolute left-3 w-2 h-2 rounded-full bg-gradient-solar-r animate-pulse mr-3 flex-shrink-0" />
                            <span className="ml-5 font-semibold bg-gradient-solar-r bg-clip-text text-transparent truncate">
                              Hélio - Copiloto Solar
                            </span>
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent h-9 cursor-not-allowed opacity-60"
                            disabled
                          >
                            <Lightning size={16} weight="regular" className="mr-3 flex-shrink-0" />
                            <span className="text-xs truncate">Agente Técnico</span>
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground/50 flex-shrink-0">Em breve</span>
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent h-9 cursor-not-allowed opacity-60"
                            disabled
                          >
                            <Lightning size={16} weight="regular" className="mr-3 flex-shrink-0" />
                            <span className="text-xs truncate">Agente Comercial</span>
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground/50 flex-shrink-0">Em breve</span>
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent h-9 cursor-not-allowed opacity-60"
                            disabled
                          >
                            <Lightning size={16} weight="regular" className="mr-3 flex-shrink-0" />
                            <span className="text-xs truncate">Agente Financeiro</span>
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground/50 flex-shrink-0">Em breve</span>
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="ghost"
                            onClick={() => onNavigate?.('gpts')}
                            className={cn(
                              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9 mt-1.5",
                              currentRoute === 'gpts' && "bg-sidebar-accent"
                            )}
                          >
                            <Compass size={16} weight="regular" className="mr-3 flex-shrink-0" />
                            <span className="text-xs truncate">Explorar todos</span>
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Separator className="my-2.5 bg-sidebar-border" />

                <div className="px-3">
                  <div className="text-xs font-semibold text-sidebar-foreground/60 px-3 mb-2 uppercase tracking-wider leading-[1.4]">
                    Projetos
                  </div>
                  <div className="space-y-1">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate?.('projects')}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10",
                          currentRoute === 'projects' && "bg-sidebar-accent"
                        )}
                      >
                        <FolderOpen size={18} weight="regular" className="mr-3 flex-shrink-0" />
                        <span className="truncate text-[13px]">Ver projetos</span>
                      </Button>
                    </motion.div>

                    {projects.slice(0, showMoreProjects ? projects.length : 3).map((project) => (
                      <motion.div 
                        key={project.id}
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10"
                        >
                          <FolderOpen size={18} weight="regular" className={cn("mr-3 flex-shrink-0", project.color)} />
                          <span className="truncate text-[13px]">{project.name}</span>
                        </Button>
                      </motion.div>
                    ))}

                    {!showMoreProjects && projects.length > 3 && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="ghost"
                          onClick={() => setShowMoreProjects(true)}
                          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10"
                        >
                          <DotsThree size={18} weight="bold" className="mr-3 flex-shrink-0" />
                          <span className="truncate text-[13px]">Ver mais</span>
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <Separator className="my-2.5 bg-sidebar-border" />

                <div className="px-3 pb-4">
                  <div className="text-xs font-semibold text-sidebar-foreground/60 px-3 mb-2 uppercase tracking-wider leading-[1.4]">
                    Chats
                  </div>
                  <div className="space-y-1">
                    {chatHistory.length === 0 ? (
                      <div className="text-xs text-sidebar-foreground/40 px-3 py-2 leading-[1.4]">
                        Nenhum chat ainda
                      </div>
                    ) : (
                      chatHistory.map((chat) => (
                        <motion.div 
                          key={chat.id}
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => onChatSelect(chat.id)}
                            className={cn(
                              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-10",
                              currentChatId === chat.id && "bg-sidebar-accent"
                            )}
                          >
                            <Chat size={18} weight="regular" className="mr-3 flex-shrink-0" />
                            <span className="truncate text-[13px]">{chat.title}</span>
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
                </ScrollArea>
              </div>

              <div className="border-t border-sidebar-border flex-shrink-0">
                <div className="p-3">
                  <div className="text-xs font-semibold text-sidebar-foreground/60 px-3 mb-2 uppercase tracking-wider leading-[1.4]">
                    Ajuda & Compliance
                  </div>
                  <div className="space-y-1">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate?.('release-notes')}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent h-8 text-xs",
                          currentRoute === 'release-notes' && "bg-sidebar-accent"
                        )}
                      >
                        <Sparkle size={15} weight="regular" className="mr-3 flex-shrink-0" />
                        <span className="truncate">Notas de versão</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate?.('terms')}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent h-8 text-xs",
                          currentRoute === 'terms' && "bg-sidebar-accent"
                        )}
                      >
                        <FileText size={15} weight="regular" className="mr-3 flex-shrink-0" />
                        <span className="truncate">Termos e políticas</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate?.('bug-report')}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent h-8 text-xs",
                          currentRoute === 'bug-report' && "bg-sidebar-accent"
                        )}
                      >
                        <Bug size={15} weight="regular" className="mr-3 flex-shrink-0" />
                        <span className="truncate">Informar bug</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate?.('downloads')}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent h-8 text-xs",
                          currentRoute === 'downloads' && "bg-sidebar-accent"
                        )}
                      >
                        <DownloadSimple size={15} weight="regular" className="mr-3 flex-shrink-0" />
                        <span className="truncate">Baixar aplicativos</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="ghost"
                        onClick={() => onNavigate?.('shortcuts')}
                        className={cn(
                          "w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent h-8 text-xs",
                          currentRoute === 'shortcuts' && "bg-sidebar-accent"
                        )}
                      >
                        <Keyboard size={15} weight="regular" className="mr-3 flex-shrink-0" />
                        <span className="truncate">Atalhos de teclado</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="border-t border-sidebar-border p-3 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center text-accent-foreground font-bold text-[13px] flex-shrink-0">
                    FT
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-sidebar-foreground truncate leading-[1.3]">Fernando Teixeira</div>
                    <div className="text-[11px] text-sidebar-foreground/60 leading-[1.3] mt-0.5">Plus</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ x: -60 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 w-10 h-10 rounded-xl bg-sidebar text-sidebar-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform lg:hidden border border-sidebar-border"
        >
          <List size={22} weight="bold" />
        </motion.button>
      )}
    </>
  );
}
