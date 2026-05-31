import { motion } from "framer-motion"
import { CheckCircle, Clock, XCircle, FileText, Upload, Download, Eye, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

interface HomologationPageProps {
  onToggleSidebar: () => void
}

interface HomologationProject {
  id: string
  clientName: string
  systemSize: number
  distributor: string
  protocol: string
  status: 'pending' | 'in-analysis' | 'approved' | 'rejected'
  progress: number
  submittedAt: number
  documents: {
    name: string
    status: 'uploaded' | 'pending' | 'approved' | 'rejected'
  }[]
}

export function HomologationPage({ onToggleSidebar }: HomologationPageProps) {
  const [projects, setProjects] = useKV<HomologationProject[]>("homologation-projects", [
    {
      id: '1',
      clientName: 'João Silva - Residencial',
      systemSize: 5.5,
      distributor: 'CEMIG - Companhia Energética de Minas Gerais',
      protocol: 'CEMIG-2024-0012345',
      status: 'approved',
      progress: 100,
      submittedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      documents: [
        { name: 'ART do Projeto', status: 'approved' },
        { name: 'Diagrama Unifilar', status: 'approved' },
        { name: 'Memorial Descritivo', status: 'approved' },
        { name: 'Datasheet dos Equipamentos', status: 'approved' }
      ]
    },
    {
      id: '2',
      clientName: 'Maria Santos - Comercial',
      systemSize: 15.4,
      distributor: 'CPFL - Companhia Paulista de Força e Luz',
      protocol: 'CPFL-2024-0098765',
      status: 'in-analysis',
      progress: 65,
      submittedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      documents: [
        { name: 'ART do Projeto', status: 'approved' },
        { name: 'Diagrama Unifilar', status: 'approved' },
        { name: 'Memorial Descritivo', status: 'uploaded' },
        { name: 'Datasheet dos Equipamentos', status: 'pending' }
      ]
    },
    {
      id: '3',
      clientName: 'Pedro Costa - Industrial',
      systemSize: 45.2,
      distributor: 'Enel - Enel Distribuição',
      protocol: 'ENEL-2024-0045678',
      status: 'pending',
      progress: 25,
      submittedAt: Date.now() - 1000 * 60 * 60 * 12,
      documents: [
        { name: 'ART do Projeto', status: 'uploaded' },
        { name: 'Diagrama Unifilar', status: 'pending' },
        { name: 'Memorial Descritivo', status: 'pending' },
        { name: 'Datasheet dos Equipamentos', status: 'pending' }
      ]
    }
  ])

  const [, setShowNewForm] = useState(false)

  const getStatusConfig = (status: HomologationProject['status']) => {
    const configs = {
      pending: {
        label: 'Pendente',
        variant: 'outline' as const,
        icon: Clock,
        color: 'text-yellow-600'
      },
      'in-analysis': {
        label: 'Em Análise',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-blue-600'
      },
      approved: {
        label: 'Aprovado',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-success'
      },
      rejected: {
        label: 'Rejeitado',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600'
      }
    }
    return configs[status]
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} weight="fill" className="text-success" />
      case 'uploaded':
        return <Clock size={16} weight="fill" className="text-blue-600" />
      case 'rejected':
        return <XCircle size={16} weight="fill" className="text-red-600" />
      default:
        return <Clock size={16} weight="regular" className="text-muted-foreground" />
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleUploadDocument = (projectId: string, docName: string) => {
    setProjects((current) =>
      (current || []).map(p =>
        p.id === projectId
          ? {
              ...p,
              documents: p.documents.map(d =>
                d.name === docName ? { ...d, status: 'uploaded' as const } : d
              )
            }
          : p
      )
    )
    toast.success("Documento enviado com sucesso")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleSidebar}
                aria-label="Abrir menu lateral"
                title="Abrir menu lateral"
                className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors shrink-0"
              >
                <List size={22} weight="bold" />
              </button>
              <motion.div 
                className="w-11 h-11 rounded-xl bg-linear-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.08, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <CheckCircle className="text-accent-foreground" size={24} weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">Homologação de Sistemas</h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {(projects || []).length} processos de homologação
                </p>
              </div>
            </div>
            
            <Button 
              variant="gradient" 
              size="lg" 
              className="gap-2"
              onClick={() => setShowNewForm(true)}
            >
              <Upload size={20} weight="bold" />
              Nova Homologação
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 gap-5">
            {(projects || []).map((project, index) => {
              const statusConfig = getStatusConfig(project.status)
              const StatusIcon = statusConfig.icon

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 border-2 hover:border-accent/40 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{project.clientName}</h3>
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon size={14} weight="fill" className="mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {project.distributor}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Protocolo: {project.protocol}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-accent mb-1">
                          {project.systemSize} kWp
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(project.submittedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-bold">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <FileText size={16} weight="bold" />
                        Documentos Requeridos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {project.documents.map((doc) => (
                          <div
                            key={doc.name}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {getDocumentStatusIcon(doc.status)}
                              <span className="text-sm font-medium">{doc.name}</span>
                            </div>
                            {doc.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUploadDocument(project.id, doc.name)}
                              >
                                <Upload size={14} weight="bold" />
                              </Button>
                            )}
                            {doc.status === 'uploaded' && (
                              <Button variant="ghost" size="sm">
                                <Eye size={14} weight="bold" />
                              </Button>
                            )}
                            {doc.status === 'approved' && (
                              <Button variant="ghost" size="sm">
                                <Download size={14} weight="bold" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText size={16} weight="bold" />
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download size={16} weight="bold" />
                        Baixar Documentos
                      </Button>
                      {project.status === 'approved' && (
                        <Button variant="default" size="sm" className="flex-1 bg-success hover:bg-success/90">
                          <CheckCircle size={16} weight="bold" />
                          Parecer de Acesso
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {(projects || []).length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-muted-foreground" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhuma homologação ainda</h3>
              <p className="text-muted-foreground mb-6">
                Inicie um novo processo de homologação junto à distribuidora
              </p>
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => setShowNewForm(true)}
              >
                <Upload size={20} weight="bold" />
                Iniciar Primeira Homologação
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
