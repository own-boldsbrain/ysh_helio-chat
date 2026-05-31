import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Microphone, Info, Code } from "@phosphor-icons/react";
import { RealtimeVoiceAgent } from "@/components/RealtimeVoiceAgent";
import { motion } from "framer-motion";

interface RealtimeVoicePageProps {
  onToggleSidebar: () => void;
}

export function RealtimeVoicePage({ onToggleSidebar }: RealtimeVoicePageProps) {
  const [transcripts, setTranscripts] = useState<string[]>([]);

  const handleTranscriptUpdate = (text: string, isFinal: boolean) => {
    if (isFinal) {
      setTranscripts((prev) => [...prev, text]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors"
          >
            <List size={22} weight="bold" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-md">
              <Microphone size={20} weight="fill" className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Realtime Voice API</h1>
              <p className="text-xs text-muted-foreground">
                Conversa por voz em tempo real
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 border-2 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg flex-shrink-0">
                  <Info size={24} weight="bold" className="text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">OpenAI Realtime API (GA)</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Experimente conversas por voz em tempo real com o Hélio, seu
                    copiloto solar. A API Realtime usa WebSocket para comunicação
                    bidirecional de baixa latência com suporte nativo a
                    speech-to-speech, incluindo detecção automática de voz (VAD) e
                    síntese de áudio em tempo real.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-xs font-medium">
                      WebSocket
                    </span>
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-xs font-medium">
                      Server VAD
                    </span>
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-xs font-medium">
                      Streaming Audio
                    </span>
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-xs font-medium">
                      Multimodal
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <Tabs defaultValue="demo" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="demo">
                <Microphone className="mr-2" size={16} weight="bold" />
                Demo
              </TabsTrigger>
              <TabsTrigger value="docs">
                <Code className="mr-2" size={16} weight="bold" />
                Documentação
              </TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <RealtimeVoiceAgent onTranscriptUpdate={handleTranscriptUpdate} />
              </motion.div>

              {transcripts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card className="p-6 border-2 shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">
                      Histórico de Transcrições
                    </h3>
                    <div className="space-y-2">
                      {transcripts.map((transcript, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <p className="text-sm leading-relaxed">{transcript}</p>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="docs" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="p-6 border-2 shadow-lg">
                  <h3 className="text-lg font-bold mb-4">Características Principais</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold mb-2">1. Conexão WebSocket</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Conexão persistente de baixa latência via WebSocket para
                        comunicação bidirecional em tempo real com o modelo GPT-4o
                        Realtime.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-2">
                        2. Detecção Automática de Voz (VAD)
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        O servidor detecta automaticamente quando você começa e para de
                        falar, eliminando a necessidade de botões push-to-talk.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-2">
                        3. Streaming de Áudio Bidirecional
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Áudio PCM16 é transmitido em chunks incrementais, permitindo
                        respostas em tempo real com latência mínima.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-2">4. Suporte Multimodal</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Suporta entrada e saída de texto e áudio simultaneamente, com
                        transcrições automáticas disponíveis.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="p-6 border-2 shadow-lg">
                  <h3 className="text-lg font-bold mb-4">Eventos da API (GA)</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <code className="text-xs font-mono text-accent">
                        session.created
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Emitido quando a sessão é estabelecida
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <code className="text-xs font-mono text-accent">
                        conversation.item.added
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Novo item adicionado à conversa (substitui .created)
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <code className="text-xs font-mono text-accent">
                        response.output_audio.delta
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chunk de áudio da resposta (renomeado de response.audio.delta)
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <code className="text-xs font-mono text-accent">
                        response.output_text.delta
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chunk de texto da resposta (renomeado de response.text.delta)
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <code className="text-xs font-mono text-accent">
                        response.done
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resposta completamente gerada
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="p-6 border-2 shadow-lg">
                  <h3 className="text-lg font-bold mb-4">Configuração de Sessão</h3>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <pre className="text-xs font-mono overflow-x-auto">
                      <code>{`{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "model": "gpt-4o-realtime-preview",
    "modalities": ["text", "audio"],
    "instructions": "Você é o Hélio...",
    "audio": {
      "input": { "format": "pcm16" },
      "output": {
        "voice": "alloy",
        "format": "pcm16"
      }
    },
    "turn_detection": {
      "type": "server_vad",
      "threshold": 0.5,
      "prefix_padding_ms": 300,
      "silence_duration_ms": 500
    }
  }
}`}</code>
                    </pre>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
