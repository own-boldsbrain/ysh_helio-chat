import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Microphone,
  Stop,
  SpeakerHigh,
  ChatCircle,
  WaveformSlash,
  Circle,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { RealtimeClient } from "@/lib/openai/realtime";
import { cn } from "@/lib/utils";

interface RealtimeVoiceAgentProps {
  onTranscriptUpdate?: (text: string, isFinal: boolean) => void;
  className?: string;
}

interface ConversationItem {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export function RealtimeVoiceAgent({
  onTranscriptUpdate,
  className = "",
}: RealtimeVoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const clientRef = useRef<RealtimeClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const initAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current || !isListening) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel((average / 255) * 100);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      console.error("Error initializing audio analysis:", error);
      toast.error("Erro ao acessar microfone");
    }
  }, [isListening]);

  const connect = useCallback(async () => {
    try {
      clientRef.current = new RealtimeClient();

      clientRef.current.on("session.created", () => {
        setIsConnected(true);
        toast.success("Conectado ao Hélio");
      });

      clientRef.current.on("conversation.item.added", (message) => {
        if (message.item?.role && message.item.content) {
          const textContent = message.item.content.find(
            (c) => c.type === "output_text" || c.type === "text"
          );
          if (textContent?.text && (message.item.role === "user" || message.item.role === "assistant")) {
            setConversation((prev) => [
              ...prev,
              {
                id: message.item!.id,
                role: message.item!.role as "user" | "assistant",
                text: textContent.text!,
                timestamp: new Date(),
              },
            ]);
          }
        }
      });

      clientRef.current.on("response.output_text.delta", (message) => {
        if (message.delta) {
          setCurrentTranscript((prev) => prev + message.delta);
          onTranscriptUpdate?.(message.delta, false);
        }
      });

      clientRef.current.on("response.output_audio_transcript.delta", (message) => {
        if (message.delta) {
          setCurrentTranscript((prev) => prev + message.delta);
          onTranscriptUpdate?.(message.delta, false);
        }
      });

      clientRef.current.on("response.output_audio.delta", () => {
        setIsSpeaking(true);
      });

      clientRef.current.on("response.done", () => {
        setIsSpeaking(false);
        if (currentTranscript) {
          setConversation((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              text: currentTranscript,
              timestamp: new Date(),
            },
          ]);
          onTranscriptUpdate?.(currentTranscript, true);
          setCurrentTranscript("");
        }
      });

      clientRef.current.on("error", (message) => {
        console.error("Realtime API error:", message.error);
        toast.error("Erro na conexão", {
          description: message.error?.message,
        });
        setIsConnected(false);
      });

      await clientRef.current.connect({
        type: "realtime",
        instructions:
          "Você é o Hélio, Co-Piloto Solar da Yello Solar Hub. Você é especializado em energia solar fotovoltaica para o mercado brasileiro. Seja conversacional, técnico mas acessível, e proativo em suas respostas.",
      });

      await initAudioAnalysis();
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Erro ao conectar", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, [currentTranscript, initAudioAnalysis, onTranscriptUpdate]);

  const disconnect = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  return (
    <Card className={cn("p-6 space-y-6 border-2 shadow-xl", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={
              isSpeaking
                ? { scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 2, repeat: isSpeaking ? Infinity : 0 }}
            className="w-12 h-12 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg"
          >
            <SpeakerHigh size={24} weight="fill" className="text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-lg">Hélio - Copiloto Solar</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={isConnected ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  isConnected && "bg-green-500 hover:bg-green-600"
                )}
              >
                <Circle
                  size={8}
                  weight="fill"
                  className={cn(
                    "mr-1",
                    isConnected ? "animate-pulse" : ""
                  )}
                />
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
              {isListening && (
                <Badge className="bg-red-500 hover:bg-red-600 text-xs animate-pulse">
                  <Circle size={8} weight="fill" className="mr-1" />
                  Escutando
                </Badge>
              )}
            </div>
          </div>
        </div>

        {!isConnected ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={connect}
              className="bg-gradient-solar-br shadow-lg"
            >
              <ChatCircle className="mr-2" size={20} weight="bold" />
              Conectar
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={disconnect} variant="destructive" className="shadow-lg">
              <WaveformSlash className="mr-2" size={20} weight="bold" />
              Desconectar
            </Button>
          </motion.div>
        )}
      </div>

      <Separator />

      {isConnected && (
        <>
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="space-y-3"
                >
                  <motion.div
                    animate={
                      isListening
                        ? { scale: [1, 1.15, 1] }
                        : { scale: 1 }
                    }
                    transition={{
                      duration: 1.5,
                      repeat: isListening ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className={cn(
                      "inline-flex w-24 h-24 rounded-full items-center justify-center shadow-2xl",
                      isListening
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : "bg-gradient-to-br from-muted to-muted/60"
                    )}
                  >
                    <Microphone
                      size={40}
                      weight={isListening ? "fill" : "bold"}
                      className={isListening ? "text-white" : "text-muted-foreground"}
                    />
                  </motion.div>

                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-sm font-bold text-foreground">
                        Fale agora...
                      </p>
                      <div className="flex items-center justify-center gap-1 h-12">
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              height: [
                                "20%",
                                `${Math.max(20, audioLevel * (0.5 + Math.random()))}%`,
                                "20%",
                              ],
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.05,
                            }}
                            className="w-1 bg-gradient-to-t from-red-500 to-red-600 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={toggleListening}
                  disabled={!isConnected}
                  className={cn(
                    "shadow-lg",
                    isListening
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gradient-to-br from-accent to-accent/80"
                  )}
                >
                  {isListening ? (
                    <>
                      <Stop className="mr-2" size={20} weight="fill" />
                      Parar
                    </>
                  ) : (
                    <>
                      <Microphone className="mr-2" size={20} weight="bold" />
                      Falar
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>

          {conversation.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Conversa
                </h4>
                <ScrollArea className="h-64 rounded-lg border bg-muted/20 p-4">
                  <div className="space-y-3">
                    {conversation.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-3 rounded-lg",
                          item.role === "user"
                            ? "bg-accent/10 ml-8"
                            : "bg-muted/50 mr-8"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.role === "user" ? "Você" : "Hélio"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{item.text}</p>
                      </motion.div>
                    ))}
                    {currentTranscript && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-muted/50 mr-8"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Hélio
                          </Badge>
                          <Badge className="text-xs animate-pulse">
                            Digitando...
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed">{currentTranscript}</p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </>
      )}

      {!isConnected && (
        <div className="text-center py-8 space-y-3">
          <div className="inline-flex w-20 h-20 rounded-full bg-muted items-center justify-center">
            <Microphone size={32} weight="bold" className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Conecte-se para começar uma conversa por voz
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Fale naturalmente sobre dimensionamento, equipamentos e análise solar
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
