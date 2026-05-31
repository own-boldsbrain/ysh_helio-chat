/** @format */

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  PaperPlaneRight,
  Sparkle,
  List,
  Lightning,
  MagnifyingGlass,
  Share,
  Gear,
  ImageSquare,
  Code,
  Compass,
  FolderOpen,
  Sun,
} from "@phosphor-icons/react";
import { Message } from "@/components/Message";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatSidebar } from "@/components/ChatSidebar";
import { PromptLibrary } from "@/components/PromptLibrary";
import { SearchDialog } from "@/components/SearchDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useTheme } from "@/hooks/use-theme";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { toast } from "sonner";
import { Widget, WidgetAction } from "@/components/widgets/WidgetRenderer";
import { widgetDemoMessages } from "@/components/widgets/widgetExamples";
import { motion } from "framer-motion";
// Documentation
import { GalleryPage, CodexPage } from "@/components/pages/documentation";
// AI Features
import {
  ChatKitDemoPage,
  RealtimeVoicePage,
  GPTsPage,
  PromptsPage,
} from "@/components/pages/ai-features";
// Project Management
import {
  ProjectsPage,
  DashboardPage,
  PDFProposalGenerator,
} from "@/components/pages/project-management";
// Commerce
import {
  EquipmentPage,
  CheckoutPage,
  CreditAnalysisPage,
  TechnicalSheetsPage,
} from "@/components/pages/commerce";
// Solar Analysis
import {
  EarthObservationPage,
  ShadingAnalysisPage,
  TemporalAnalysisPage,
  SizingPage,
  SolarWorkflowPage,
  HomologationPage,
} from "@/components/pages/solar-analysis";
// Auth
import { LoginPage } from "@/components/pages/auth";
// Compliance
import {
  ReleaseNotesPage,
  TermsPage,
  BugReportPage,
  DownloadsPage,
  KeyboardShortcutsPage,
} from "@/components/pages/compliance";
import yelloIconJpg from "@/assets/images/yello-icon.svg";
import yelloVideoMp4 from "@/assets/video/Tipo_phototovideo__202510220124_uir1y.mp4";
import LogoVideo from "@/components/ui/LogoVideo";
import { useVideoPlayback } from "@/contexts/VideoPlaybackContext";
import { AnalyticsPanel } from "@/components/devtools/AnalyticsPanel";
import { exchangeFacebookCode } from "@/lib/api/facebook-auth";
import { AuthUser, ensureAuthUserSession, useAuth } from "@/hooks/use-auth";

export type RouteId =
  | "chat"
  | "gallery"
  | "codex"
  | "gpts"
  | "projects"
  | "prompts"
  | "equipment"
  | "sizing"
  | "homologation"
  | "credit"
  | "dashboard"
  | "earth-observation"
  | "chatkit-demo"
  | "realtime-voice"
  | "technical-sheets"
  | "release-notes"
  | "terms"
  | "bug-report"
  | "downloads"
  | "shortcuts"
  | "login"
  | "checkout"
  | "shading-analysis"
  | "temporal-analysis"
  | "solar-workflow"
  | "pdf-proposal";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  widget?: Widget;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

function App() {
  useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [chatSessions, setChatSessions] = useKV<ChatSession[]>(
    "chat-sessions",
    []
  );
  const [currentSessionId, setCurrentSessionId] = useKV<string | null>(
    "current-session-id",
    null
  );
  const [currentRoute, setCurrentRoute] = useKV<RouteId>(
    "current-route",
    "chat"
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState<{ login: string; isOwner: boolean } | null>(
    null
  );
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [isProcessingFacebookOAuth, setIsProcessingFacebookOAuth] = useState(
    () =>
      typeof window !== "undefined" &&
      window.location.pathname === "/auth/callback"
  );
  const { showVideo, requestReplay } = useVideoPlayback();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sessions = chatSessions || [];
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const chatMessages = currentSession?.messages || [];

  const scrollRef = useAutoScroll(chatMessages);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await window.spark.user();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    requestReplay();
  }, [requestReplay]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/auth/callback") return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error") || params.get("error_description");
    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    const sendToLogin = (message?: string) => {
      if (message) {
        toast.error(message);
      }
      setCurrentRoute("login");
      window.history.replaceState({}, "", "/login");
      setIsProcessingFacebookOAuth(false);
    };

    if (error) {
      sendToLogin("Login via Facebook cancelado. Tente novamente.");
      return;
    }

    if (!code) {
      sendToLogin("Código de autorização do Facebook ausente.");
      return;
    }

    const finalizeSuccess = () => {
      window.history.replaceState({}, "", "/");
      setIsProcessingFacebookOAuth(false);
    };

    const completeCallback = async () => {
      try {
        const userFromServer = await exchangeFacebookCode(code, redirectUri);
        const normalizedUser = ensureAuthUserSession(userFromServer);
        setAuthUser(normalizedUser);
        setCurrentRoute("chat");
        toast.success(
          `Bem-vindo, ${normalizedUser.name?.split(" ")[0] || "integrador"}!`
        );
        finalizeSuccess();
      } catch (callbackError) {
        console.error("Erro ao concluir login com Facebook", callbackError);
        sendToLogin("Não foi possível validar seu login com o Facebook.");
      }
    };

    completeCallback();
  }, [setAuthUser, setCurrentRoute, setIsProcessingFacebookOAuth]);

  useEffect(() => {
    if (!currentSessionId && sessions.length === 0) {
      const newSessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: newSessionId,
        title: "Nova conversa",
        messages: [],
        timestamp: Date.now(),
      };
      setChatSessions([newSession]);
      setCurrentSessionId(newSessionId);
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
  }, []);

  const updateCurrentSession = (messages: ChatMessage[]) => {
    if (!currentSessionId) return;

    setChatSessions((current) => {
      const sessions = current || [];
      const sessionIndex = sessions.findIndex((s) => s.id === currentSessionId);

      if (sessionIndex === -1) return sessions;

      const updatedSession = { ...sessions[sessionIndex], messages };

      if (messages.length > 0 && updatedSession.title === "Nova conversa") {
        const firstUserMessage = messages.find((m) => m.role === "user");
        if (firstUserMessage) {
          updatedSession.title =
            firstUserMessage.content.slice(0, 50) +
            (firstUserMessage.content.length > 50 ? "..." : "");
        }
      }

      const newSessions = [...sessions];
      newSessions[sessionIndex] = updatedSession;
      return newSessions;
    });
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: Date.now(),
    };

    const newMessages = [...chatMessages, userMessage];
    updateCurrentSession(newMessages);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const lowerInput = trimmedInput.toLowerCase();
    const widgetMatch = Object.keys(widgetDemoMessages).find((key) =>
      lowerInput.includes(key)
    );

    try {
      const promptText = widgetMatch
        ? `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub - um assistente especializado em energia solar fotovoltaica para o mercado brasileiro. O usuário solicitou visualizar um widget interativo. Reconheça a solicitação naturalmente em português e explique o que o widget mostra.

Mensagem do usuário: ${trimmedInput}`
        : `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub. Fale em português brasileiro de forma clara e técnico-amigável.

## Sua Missão
Guiar integradores e compradores através de projetos solares fotovoltaicos com foco em: dimensionamento, seleção de equipamentos, análise financeira e conformidade regulatória.

## Conformidade Legal (Lei 14.300/2022)
- **Sistema de Compensação de Energia**: Explique créditos de energia (kWh gerados viram descontos na conta)
- **GD (Geração Distribuída)**: Sistemas residenciais/comerciais conectados à rede
- **GC (Geração Compartilhada)**: Assinatura de usina solar sem precisar de telhado (explique quando o usuário não tem área disponível)
- **Regras de Transição**: Sistemas até 6/1/2023 têm regras antigas, depois disso Lei 14.300 com TUSD fio B

## Linguagem Clara - Sempre Explique Jargões
- **kWp (quilowatt-pico)**: Potência do sistema em condições ideais de sol
- **PR (Performance Ratio)**: Eficiência real do sistema (quanto da energia teórica vira energia real, tipicamente 75-85%)
- **Irradiação**: Quantidade de sol que chega no local (kWh/m²/dia)
- **Payback**: Tempo para recuperar investimento (anos)
- **ROI**: Retorno sobre investimento (% anual)
- **MPPT**: Rastreador de ponto de máxima potência (otimiza produção)
- **String**: Conjunto de painéis conectados em série
- **Fase**: Tipo de ligação elétrica (monofásica 127V, bifásica 127V/220V, trifásica 220V/380V)

## Coleta de Dados - Peça APENAS Essenciais
Não peça informações desnecessárias. Foque no mínimo:
1. **CEP ou cidade**: Para irradiação solar
2. **Consumo médio mensal** (kWh): Para dimensionar o sistema
3. **Fase da instalação**: Monofásica, bifásica ou trifásica

## Cenários de Dimensionamento - Sempre Apresente 3 Opções
Para cada projeto, calcule e apresente:

**Cenário Conservador (1.14x)**
- Sistema menor, mais conservador
- Ideal para quem quer investimento inicial menor
- Cobre ~85-90% do consumo

**Cenário Equilibrado (1.30x)** ⭐ RECOMENDADO
- Balanço entre investimento e retorno
- Compensa perdas e coberturas nubladas
- Cobre 95-100% do consumo + margem de segurança

**Cenário Otimizado (1.45x)**
- Sistema maior, maximiza economia futura
- Gera créditos extras para consumo crescente
- Cobre 100% + excedente para crescimento

## Análise Financeira - Sempre Inclua
- **Investimento total**: Valor do sistema instalado
- **Economia mensal estimada**: Redução na conta de luz (R$/mês)
- **Payback simples**: Anos para retorno (investimento ÷ economia anual)
- **ROI em 25 anos**: Retorno percentual ao longo da vida útil
- **Comparação à vista vs financiado**: "Parcela de R$X vs conta atual de R$Y"

## Opções de Financiamento
Apresente bancos principais com condições típicas:
- **Banco do Brasil**: CDC Energia Renovável (até 120 meses)
- **Caixa Econômica**: Construcard Solar (até 240 meses)
- **BV Financeira**: Crédito Solar (até 96 meses, sem garantia)
- **Santander**: Crédito Sustentável (até 84 meses)
- **FNE Sol (Nordeste)**: Taxa subsidiada para região Nordeste

Sempre mostre: "Parcela R$X/mês vs Conta de luz R$Y/mês = Economia líquida R$Z/mês"

## Geração Compartilhada - Ofereça Quando Aplicável
Se o usuário mencionar:
- "Não tenho telhado disponível"
- "Moro em apartamento"
- "Área sombreada"
- "Telhado em más condições"

→ Apresente **GC (Geração Compartilhada)** ou **assinatura de fazenda solar** como alternativa

## Nota Regulatória - Sempre Inclua
Ao final de cada dimensionamento, adicione breve nota:
"⚠️ **Nota Regulatória (Lei 14.300/2022)**: Este sistema se enquadra em [micro/minigeração] e segue as regras de compensação da ANEEL. É necessário homologação pela concessionária [nome da concessionária local] antes da instalação."

## Próximos Passos - CTAs Curtos e Claros
Termine SEMPRE com 2-3 próximos passos objetivos:
✅ "Ver lista de equipamentos compatíveis"
✅ "Simular financiamento detalhado"
✅ "Analisar sombreamento do telhado"
✅ "Gerar proposta técnico-comercial"
✅ "Consultar requisitos da concessionária"

## Tom e Diretrizes
- **Seja proativo**: Antecipe dúvidas e sugira próximos passos
- **Seja pedagógico**: Explique o "porquê" de cada recomendação
- **Seja preciso**: Use unidades corretas (kWp, kWh, kWh/m²/dia)
- **Seja imparcial**: Ofereça várias marcas de equipamentos
- **Cite fontes**: CAMS, NASA POWER, Lei 14.300, NBR 16690

Mensagem do usuário: ${trimmedInput}`;

      const response = await window.spark.llm(promptText, "gpt-4o");

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        widget: widgetMatch
          ? widgetDemoMessages[widgetMatch as keyof typeof widgetDemoMessages]
          : undefined,
      };

      updateCurrentSession([...newMessages, assistantMessage]);
    } catch (error) {
      toast.error("Falha ao obter resposta. Tente novamente.");
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        handleSend();
      } else if (!e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Nova conversa",
      messages: [],
      timestamp: Date.now(),
    };

    setChatSessions((current) => [newSession, ...(current || [])]);
    setCurrentSessionId(newSessionId);
    setInput("");
    setIsSidebarOpen(false);
    toast.success("Started new chat");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const messageIndex = chatMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessage = {
      ...chatMessages[messageIndex],
      content: newContent,
    };
    const messagesUpToEdit = chatMessages.slice(0, messageIndex);

    const newMessages = [...messagesUpToEdit, updatedMessage];
    updateCurrentSession(newMessages);
    setIsLoading(true);

    const lowerInput = newContent.toLowerCase();
    const widgetMatch = Object.keys(widgetDemoMessages).find((key) =>
      lowerInput.includes(key)
    );

    try {
      const promptText = widgetMatch
        ? `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub - um assistente especializado em energia solar fotovoltaica para o mercado brasileiro. O usuário solicitou visualizar um widget interativo. Reconheça a solicitação naturalmente em português e explique o que o widget mostra.

Mensagem do usuário: ${newContent}`
        : `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub. Fale em português brasileiro de forma clara e técnico-amigável.

## Sua Missão
Guiar integradores e compradores através de projetos solares fotovoltaicos com foco em: dimensionamento, seleção de equipamentos, análise financeira e conformidade regulatória.

## Conformidade Legal (Lei 14.300/2022)
- **Sistema de Compensação de Energia**: Explique créditos de energia (kWh gerados viram descontos na conta)
- **GD (Geração Distribuída)**: Sistemas residenciais/comerciais conectados à rede
- **GC (Geração Compartilhada)**: Assinatura de usina solar sem precisar de telhado (explique quando o usuário não tem área disponível)
- **Regras de Transição**: Sistemas até 6/1/2023 têm regras antigas, depois disso Lei 14.300 com TUSD fio B

## Linguagem Clara - Sempre Explique Jargões
- **kWp (quilowatt-pico)**: Potência do sistema em condições ideais de sol
- **PR (Performance Ratio)**: Eficiência real do sistema (quanto da energia teórica vira energia real, tipicamente 75-85%)
- **Irradiação**: Quantidade de sol que chega no local (kWh/m²/dia)
- **Payback**: Tempo para recuperar investimento (anos)
- **ROI**: Retorno sobre investimento (% anual)
- **MPPT**: Rastreador de ponto de máxima potência (otimiza produção)
- **String**: Conjunto de painéis conectados em série
- **Fase**: Tipo de ligação elétrica (monofásica 127V, bifásica 127V/220V, trifásica 220V/380V)

## Coleta de Dados - Peça APENAS Essenciais
Não peça informações desnecessárias. Foque no mínimo:
1. **CEP ou cidade**: Para irradiação solar
2. **Consumo médio mensal** (kWh): Para dimensionar o sistema
3. **Fase da instalação**: Monofásica, bifásica ou trifásica

## Cenários de Dimensionamento - Sempre Apresente 3 Opções
Para cada projeto, calcule e apresente:

**Cenário Conservador (1.14x)**
- Sistema menor, mais conservador
- Ideal para quem quer investimento inicial menor
- Cobre ~85-90% do consumo

**Cenário Equilibrado (1.30x)** ⭐ RECOMENDADO
- Balanço entre investimento e retorno
- Compensa perdas e coberturas nubladas
- Cobre 95-100% do consumo + margem de segurança

**Cenário Otimizado (1.45x)**
- Sistema maior, maximiza economia futura
- Gera créditos extras para consumo crescente
- Cobre 100% + excedente para crescimento

## Análise Financeira - Sempre Inclua
- **Investimento total**: Valor do sistema instalado
- **Economia mensal estimada**: Redução na conta de luz (R$/mês)
- **Payback simples**: Anos para retorno (investimento ÷ economia anual)
- **ROI em 25 anos**: Retorno percentual ao longo da vida útil
- **Comparação à vista vs financiado**: "Parcela de R$X vs conta atual de R$Y"

## Opções de Financiamento
Apresente bancos principais com condições típicas:
- **Banco do Brasil**: CDC Energia Renovável (até 120 meses)
- **Caixa Econômica**: Construcard Solar (até 240 meses)
- **BV Financeira**: Crédito Solar (até 96 meses, sem garantia)
- **Santander**: Crédito Sustentável (até 84 meses)
- **FNE Sol (Nordeste)**: Taxa subsidiada para região Nordeste

Sempre mostre: "Parcela R$X/mês vs Conta de luz R$Y/mês = Economia líquida R$Z/mês"

## Geração Compartilhada - Ofereça Quando Aplicável
Se o usuário mencionar:
- "Não tenho telhado disponível"
- "Moro em apartamento"
- "Área sombreada"
- "Telhado em más condições"

→ Apresente **GC (Geração Compartilhada)** ou **assinatura de fazenda solar** como alternativa

## Nota Regulatória - Sempre Inclua
Ao final de cada dimensionamento, adicione breve nota:
"⚠️ **Nota Regulatória (Lei 14.300/2022)**: Este sistema se enquadra em [micro/minigeração] e segue as regras de compensação da ANEEL. É necessário homologação pela concessionária [nome da concessionária local] antes da instalação."

## Próximos Passos - CTAs Curtos e Claros
Termine SEMPRE com 2-3 próximos passos objetivos:
✅ "Ver lista de equipamentos compatíveis"
✅ "Simular financiamento detalhado"
✅ "Analisar sombreamento do telhado"
✅ "Gerar proposta técnico-comercial"
✅ "Consultar requisitos da concessionária"

## Tom e Diretrizes
- **Seja proativo**: Antecipe dúvidas e sugira próximos passos
- **Seja pedagógico**: Explique o "porquê" de cada recomendação
- **Seja preciso**: Use unidades corretas (kWp, kWh, kWh/m²/dia)
- **Seja imparcial**: Ofereça várias marcas de equipamentos
- **Cite fontes**: CAMS, NASA POWER, Lei 14.300, NBR 16690

Mensagem do usuário: ${newContent}`;

      const response = await window.spark.llm(promptText, "gpt-4o");

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        widget: widgetMatch
          ? widgetDemoMessages[widgetMatch as keyof typeof widgetDemoMessages]
          : undefined,
      };

      updateCurrentSession([...newMessages, assistantMessage]);
      toast.success("Message edited and regenerated");
    } catch (error) {
      toast.error("Failed to regenerate response. Please try again.");
      console.error("Error regenerating response:", error);
      updateCurrentSession([...messagesUpToEdit, updatedMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateMessage = async () => {
    if (chatMessages.length < 2) return;

    const lastUserMessageIndex = chatMessages.length - 2;
    const lastUserMessage = chatMessages[lastUserMessageIndex];

    if (lastUserMessage.role !== "user") return;

    const messagesWithoutLastAssistant = chatMessages.slice(0, -1);
    updateCurrentSession(messagesWithoutLastAssistant);
    setIsLoading(true);

    try {
      const promptText = `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub. Fale em português brasileiro de forma clara e técnico-amigável.

## Sua Missão
Guiar integradores e compradores através de projetos solares fotovoltaicos com foco em: dimensionamento, seleção de equipamentos, análise financeira e conformidade regulatória.

## Conformidade Legal (Lei 14.300/2022)
- **Sistema de Compensação de Energia**: Explique créditos de energia (kWh gerados viram descontos na conta)
- **GD (Geração Distribuída)**: Sistemas residenciais/comerciais conectados à rede
- **GC (Geração Compartilhada)**: Assinatura de usina solar sem precisar de telhado (explique quando o usuário não tem área disponível)
- **Regras de Transição**: Sistemas até 6/1/2023 têm regras antigas, depois disso Lei 14.300 com TUSD fio B

## Linguagem Clara - Sempre Explique Jargões
- **kWp (quilowatt-pico)**: Potência do sistema em condições ideais de sol
- **PR (Performance Ratio)**: Eficiência real do sistema (quanto da energia teórica vira energia real, tipicamente 75-85%)
- **Irradiação**: Quantidade de sol que chega no local (kWh/m²/dia)
- **Payback**: Tempo para recuperar investimento (anos)
- **ROI**: Retorno sobre investimento (% anual)
- **MPPT**: Rastreador de ponto de máxima potência (otimiza produção)
- **String**: Conjunto de painéis conectados em série
- **Fase**: Tipo de ligação elétrica (monofásica 127V, bifásica 127V/220V, trifásica 220V/380V)

## Coleta de Dados - Peça APENAS Essenciais
Não peça informações desnecessárias. Foque no mínimo:
1. **CEP ou cidade**: Para irradiação solar
2. **Consumo médio mensal** (kWh): Para dimensionar o sistema
3. **Fase da instalação**: Monofásica, bifásica ou trifásica

## Cenários de Dimensionamento - Sempre Apresente 3 Opções
Para cada projeto, calcule e apresente:

**Cenário Conservador (1.14x)**
- Sistema menor, mais conservador
- Ideal para quem quer investimento inicial menor
- Cobre ~85-90% do consumo

**Cenário Equilibrado (1.30x)** ⭐ RECOMENDADO
- Balanço entre investimento e retorno
- Compensa perdas e coberturas nubladas
- Cobre 95-100% do consumo + margem de segurança

**Cenário Otimizado (1.45x)**
- Sistema maior, maximiza economia futura
- Gera créditos extras para consumo crescente
- Cobre 100% + excedente para crescimento

## Análise Financeira - Sempre Inclua
- **Investimento total**: Valor do sistema instalado
- **Economia mensal estimada**: Redução na conta de luz (R$/mês)
- **Payback simples**: Anos para retorno (investimento ÷ economia anual)
- **ROI em 25 anos**: Retorno percentual ao longo da vida útil
- **Comparação à vista vs financiado**: "Parcela de R$X vs conta atual de R$Y"

## Opções de Financiamento
Apresente bancos principais com condições típicas:
- **Banco do Brasil**: CDC Energia Renovável (até 120 meses)
- **Caixa Econômica**: Construcard Solar (até 240 meses)
- **BV Financeira**: Crédito Solar (até 96 meses, sem garantia)
- **Santander**: Crédito Sustentável (até 84 meses)
- **FNE Sol (Nordeste)**: Taxa subsidiada para região Nordeste

Sempre mostre: "Parcela R$X/mês vs Conta de luz R$Y/mês = Economia líquida R$Z/mês"

## Geração Compartilhada - Ofereça Quando Aplicável
Se o usuário mencionar:
- "Não tenho telhado disponível"
- "Moro em apartamento"
- "Área sombreada"
- "Telhado em más condições"

→ Apresente **GC (Geração Compartilhada)** ou **assinatura de fazenda solar** como alternativa

## Nota Regulatória - Sempre Inclua
Ao final de cada dimensionamento, adicione breve nota:
"⚠️ **Nota Regulatória (Lei 14.300/2022)**: Este sistema se enquadra em [micro/minigeração] e segue as regras de compensação da ANEEL. É necessário homologação pela concessionária [nome da concessionária local] antes da instalação."

## Próximos Passos - CTAs Curtos e Claros
Termine SEMPRE com 2-3 próximos passos objetivos:
✅ "Ver lista de equipamentos compatíveis"
✅ "Simular financiamento detalhado"
✅ "Analisar sombreamento do telhado"
✅ "Gerar proposta técnico-comercial"
✅ "Consultar requisitos da concessionária"

## Tom e Diretrizes
- **Seja proativo**: Antecipe dúvidas e sugira próximos passos
- **Seja pedagógico**: Explique o "porquê" de cada recomendação
- **Seja preciso**: Use unidades corretas (kWp, kWh, kWh/m²/dia)
- **Seja imparcial**: Ofereça várias marcas de equipamentos
- **Cite fontes**: CAMS, NASA POWER, Lei 14.300, NBR 16690

Mensagem do usuário: ${lastUserMessage.content}`;

      const response = await window.spark.llm(promptText, "gpt-4o");

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };

      updateCurrentSession([...messagesWithoutLastAssistant, assistantMessage]);
      toast.success("Response regenerated");
    } catch (error) {
      toast.error("Failed to regenerate response. Please try again.");
      console.error("Error regenerating response:", error);
      updateCurrentSession(chatMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWidgetAction = (action: WidgetAction) => {
    console.log("Widget action triggered:", action);
    toast.success(`Action: ${action.type}`, {
      description: action.payload
        ? JSON.stringify(action.payload, null, 2)
        : undefined,
    });
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentSessionId(chatId);
    setCurrentRoute("chat");
    setIsSidebarOpen(false);
  };

  const handleNavigate = (route: RouteId) => {
    setCurrentRoute(route);
    setIsSidebarOpen(false);
    window.history.pushState({}, "", route === "chat" ? "/" : `/${route}`);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(ensureAuthUserSession(user));
    setCurrentRoute("chat");
  };

  const chatHistory = sessions
    .map((s) => ({ id: s.id, title: s.title, timestamp: s.timestamp }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleSelectPrompt = (promptText: string) => {
    setInput(promptText);
    textareaRef.current?.focus();
  };

  const fullSessions = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    timestamp: s.timestamp,
    messages: s.messages,
  }));

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      if (e.key === "Escape") {
        if (isPromptLibraryOpen) {
          setIsPromptLibraryOpen(false);
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isShareOpen) {
          setIsShareOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "n" && !isLoading) {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPromptLibraryOpen,
    isSearchOpen,
    isShareOpen,
    isSettingsOpen,
    isSidebarOpen,
    isLoading,
  ]);

  if (isProcessingFacebookOAuth) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-center p-6'>
        <motion.div
          className='w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin'
          aria-hidden='true'
        />
        <div>
          <p className='text-lg font-semibold'>
            Validando login com o Facebook...
          </p>
          <p className='text-sm text-muted-foreground'>
            Isso pode levar alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-background overflow-hidden'>
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chatHistory={chatHistory}
        onChatSelect={handleChatSelect}
        currentChatId={currentSessionId || undefined}
        onNewChat={handleNewChat}
        onNavigate={handleNavigate}
        currentRoute={currentRoute}
        isLoggedIn={!!user}
      />

      {currentRoute === "login" ? (
        <LoginPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentRoute === "checkout" ? (
        <CheckoutPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "equipment" ? (
        <EquipmentPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "technical-sheets" ? (
        <TechnicalSheetsPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "dashboard" ? (
        user ? (
          <DashboardPage
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <EquipmentPage
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )
      ) : currentRoute === "sizing" ? (
        <SizingPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : currentRoute === "earth-observation" ? (
        <EarthObservationPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "chatkit-demo" ? (
        <ChatKitDemoPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "realtime-voice" ? (
        <RealtimeVoicePage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "homologation" ? (
        <HomologationPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "credit" ? (
        <CreditAnalysisPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "gallery" ? (
        <GalleryPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : currentRoute === "codex" ? (
        <CodexPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : currentRoute === "gpts" ? (
        <GPTsPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : currentRoute === "projects" ? (
        <ProjectsPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "prompts" ? (
        <PromptsPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : currentRoute === "release-notes" ? (
        <ReleaseNotesPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "terms" ? (
        <TermsPage onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : currentRoute === "bug-report" ? (
        <BugReportPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "downloads" ? (
        <DownloadsPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "shortcuts" ? (
        <KeyboardShortcutsPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "shading-analysis" ? (
        <ShadingAnalysisPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "temporal-analysis" ? (
        <TemporalAnalysisPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "solar-workflow" ? (
        <SolarWorkflowPage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentRoute === "pdf-proposal" ? (
        <PDFProposalGenerator
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : (
        <div className='flex flex-col flex-1 h-screen overflow-hidden'>
          <header
            className='flex items-center justify-between h-[60px] px-4 sm:px-6 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm flex-shrink-0'
            style={{
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
              paddingRight: "max(1.5rem, env(safe-area-inset-right))",
            }}>
            <div className='flex items-center gap-3 min-w-0 h-full'>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className='w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0'
                aria-label='Abrir menu de navegação'>
                <List size={20} weight='bold' />
              </button>
              <motion.div
                className='w-10 h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0'
                whileHover={
                  prefersReducedMotion ? {} : { scale: 1.08, rotate: 8 }
                }
                transition={
                  prefersReducedMotion
                    ? {}
                    : { type: "spring", stiffness: 400, damping: 17 }
                }
                style={{ willChange: "transform" }}>
                <LogoVideo
                  videoSrc={yelloVideoMp4}
                  logoSrc={yelloIconJpg}
                  className='w-full h-full'
                  showVideo={showVideo}
                  onRequestPlay={requestReplay}
                  showControls={false}
                  loop={false}
                  autoPlay={true}
                />
              </motion.div>
              <div className='min-w-0 flex flex-col justify-center -mt-px'>
                <h1 className='text-[15px] sm:text-base font-bold bg-gradient-solar-r bg-clip-text text-transparent truncate leading-[1.25]'>
                  Yello Solar Hub
                </h1>
                <p className='text-[11px] text-muted-foreground font-medium hidden sm:block leading-[1.3] -mt-px'>
                  Sistema de gestão de energia solar
                </p>
              </div>
            </div>
            <div className='flex items-center gap-1 sm:gap-1.5 h-full'>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                style={{ willChange: "transform" }}
                className='hidden md:block'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsPromptLibraryOpen(true)}
                  disabled={isLoading}
                  className='hover:bg-accent/10 h-10 w-10'
                  title='Biblioteca de Prompts'
                  aria-label='Abrir biblioteca de prompts'>
                  <Lightning size={19} weight='bold' />
                </Button>
              </motion.div>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                style={{ willChange: "transform" }}
                className='hidden sm:block'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsSearchOpen(true)}
                  className='hover:bg-accent/10 h-10 w-10'
                  title='Buscar (⌘K)'
                  aria-label='Buscar (⌘K)'>
                  <MagnifyingGlass size={19} weight='bold' />
                </Button>
              </motion.div>
              {chatMessages.length > 0 && (
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  style={{ willChange: "transform" }}
                  className='hidden sm:block'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setIsShareOpen(true)}
                    className='hover:bg-accent/10 h-10 w-10'
                    title='Compartilhar Conversa'
                    aria-label='Compartilhar conversa'>
                    <Share size={19} weight='bold' />
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                style={{ willChange: "transform" }}
                className='hidden sm:block'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsSettingsOpen(true)}
                  className='hover:bg-accent/10 h-10 w-10'
                  title='Configurações'
                  aria-label='Abrir configurações'>
                  <Gear size={19} weight='bold' />
                </Button>
              </motion.div>
              <Separator
                orientation='vertical'
                className='h-6 mx-1.5 hidden sm:block'
              />
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                style={{ willChange: "transform" }}>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleNewChat}
                  disabled={isLoading}
                  className='hover:bg-accent/10 font-medium h-10 px-3'>
                  <Plus className='sm:mr-1.5' size={18} weight='bold' />
                  <span className='hidden sm:inline text-[13px]'>
                    Novo Chat
                  </span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                style={{ willChange: "transform" }}>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsAnalyticsOpen((prev) => !prev)}
                  className='hover:bg-accent/10 font-medium h-10 px-3'>
                  <span className='text-[13px]'>Analytics</span>
                </Button>
              </motion.div>
            </div>
          </header>

          <div className='flex-1 overflow-y-auto overflow-x-hidden'>
            <ScrollArea className='h-full'>
              <div className='max-w-4xl mx-auto pb-6 px-4'>
                {isAnalyticsOpen && (
                  <div className='mb-4'>
                    <AnalyticsPanel />
                  </div>
                )}
                {chatMessages.length === 0 && (
                  <div className='flex items-center justify-center min-h-[calc(100vh-180px)] text-center py-8'>
                    <motion.div
                      className='max-w-2xl space-y-6 w-full'
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 20 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        prefersReducedMotion ? {} : { duration: 0.5 }
                      }>
                      <div>
                        <motion.div
                          initial={
                            prefersReducedMotion
                              ? { opacity: 1, scale: 1 }
                              : { scale: 0.8, opacity: 0 }
                          }
                          animate={{ scale: 1, opacity: 1 }}
                          transition={
                            prefersReducedMotion
                              ? {}
                              : { delay: 0.2, type: "spring", stiffness: 200 }
                          }
                          style={{ willChange: "transform, opacity" }}
                          className='inline-flex w-20 h-20 rounded-2xl overflow-hidden mb-5 shadow-xl'>
                          <LogoVideo
                            videoSrc={yelloVideoMp4}
                            logoSrc={yelloIconJpg}
                            className='w-full h-full'
                            showVideo={showVideo}
                            onRequestPlay={requestReplay}
                            showControls={true}
                            loop={false}
                            autoPlay={true}
                          />
                        </motion.div>
                        <h2 className='text-3xl sm:text-4xl font-bold mb-3 bg-gradient-solar-r bg-clip-text text-transparent leading-[1.2]'>
                          Bem-vindo ao Yello Solar Hub
                        </h2>
                        <p className='text-muted-foreground text-base leading-[1.6] mb-1'>
                          Seu copiloto de engenharia solar fotovoltaica
                        </p>
                        <p className='text-sm text-muted-foreground/80 leading-[1.5]'>
                          Converse naturalmente sobre dimensionamento,
                          equipamentos, financiamento, regulamentação e análise
                          de sites com dados de alta precisão
                        </p>
                      </div>

                      <motion.div
                        className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8'
                        initial={
                          prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }
                        }
                        animate={{ opacity: 1 }}
                        transition={prefersReducedMotion ? {} : { delay: 0.4 }}>
                        <motion.div
                          whileHover={
                            prefersReducedMotion ? {} : { scale: 1.03, y: -2 }
                          }
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                          style={{ willChange: "transform" }}>
                          <Button
                            variant='outline'
                            className='h-auto py-4 px-4 flex flex-col items-start gap-2 w-full border-2 hover:border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/5 hover:shadow-lg transition-all group'
                            onClick={() =>
                              setInput(
                                "Analise minha fatura de energia e dimensione um sistema solar"
                              )
                            }>
                            <div className='flex items-center gap-2.5 w-full'>
                              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--solar-yellow))] to-[hsl(var(--solar-orange))] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0'>
                                <span className='text-2xl leading-none'>
                                  📊
                                </span>
                              </div>
                              <div className='flex-1 text-left min-w-0'>
                                <span className='text-[14px] font-bold block leading-[1.3]'>
                                  Dimensionar Sistema
                                </span>
                                <span className='text-[11px] text-muted-foreground leading-[1.3] mt-0.5 block'>
                                  A partir da sua fatura de energia
                                </span>
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={
                            prefersReducedMotion ? {} : { scale: 1.03, y: -2 }
                          }
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                          style={{ willChange: "transform" }}>
                          <Button
                            variant='outline'
                            className='h-auto py-4 px-4 flex flex-col items-start gap-2 w-full border-2 hover:border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/5 hover:shadow-lg transition-all group'
                            onClick={() =>
                              setInput(
                                "Selecione equipamentos para um projeto de 10kWp"
                              )
                            }>
                            <div className='flex items-center gap-2.5 w-full'>
                              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--solar-red))] to-[hsl(var(--solar-pink))] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0'>
                                <span className='text-2xl leading-none'>
                                  ☀️
                                </span>
                              </div>
                              <div className='flex-1 text-left min-w-0'>
                                <span className='text-[14px] font-bold block leading-[1.3]'>
                                  Escolher Equipamentos
                                </span>
                                <span className='text-[11px] text-muted-foreground leading-[1.3] mt-0.5 block'>
                                  Painéis, inversores e estruturas
                                </span>
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={
                            prefersReducedMotion ? {} : { scale: 1.03, y: -2 }
                          }
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                          style={{ willChange: "transform" }}>
                          <Button
                            variant='outline'
                            className='h-auto py-4 px-4 flex flex-col items-start gap-2 w-full border-2 hover:border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/5 hover:shadow-lg transition-all group'
                            onClick={() =>
                              setInput(
                                "Consulte irradiação solar em Belo Horizonte e estime a produção anual"
                              )
                            }>
                            <div className='flex items-center gap-2.5 w-full'>
                              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C9FF] to-[#0066FF] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0'>
                                <span className='text-2xl leading-none'>
                                  🛰️
                                </span>
                              </div>
                              <div className='flex-1 text-left min-w-0'>
                                <span className='text-[14px] font-bold block leading-[1.3]'>
                                  Consultar Irradiação
                                </span>
                                <span className='text-[11px] text-muted-foreground leading-[1.3] mt-0.5 block'>
                                  Dados de satélite (CAMS/NASA)
                                </span>
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={
                            prefersReducedMotion ? {} : { scale: 1.03, y: -2 }
                          }
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                          style={{ willChange: "transform" }}>
                          <Button
                            variant='outline'
                            className='h-auto py-4 px-4 flex flex-col items-start gap-2 w-full border-2 hover:border-[hsl(var(--solar-yellow))] hover:bg-[hsl(var(--solar-yellow))]/5 hover:shadow-lg transition-all group'
                            onClick={() =>
                              setInput(
                                "Simule financiamento para um projeto de R$ 45.000"
                              )
                            }>
                            <div className='flex items-center gap-2.5 w-full'>
                              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D98C] to-[#00A86B] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0'>
                                <span className='text-2xl leading-none'>
                                  💰
                                </span>
                              </div>
                              <div className='flex-1 text-left min-w-0'>
                                <span className='text-[14px] font-bold block leading-[1.3]'>
                                  Simular Financiamento
                                </span>
                                <span className='text-[11px] text-muted-foreground leading-[1.3] mt-0.5 block'>
                                  Comparar bancos e condições
                                </span>
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                )}

                {chatMessages.map((message, index) => (
                  <Message
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    widget={message.widget}
                    onEdit={
                      message.role === "user"
                        ? (newContent) =>
                            handleEditMessage(message.id, newContent)
                        : undefined
                    }
                    onRegenerate={
                      message.role === "assistant" &&
                      index === chatMessages.length - 1
                        ? handleRegenerateMessage
                        : undefined
                    }
                    onWidgetAction={handleWidgetAction}
                    isLastAssistantMessage={
                      message.role === "assistant" &&
                      index === chatMessages.length - 1
                    }
                    isDisabled={isLoading}
                  />
                ))}

                {isLoading && (
                  <div className='bg-card/70 backdrop-blur-md p-6 border-b border-border/30'>
                    <div className='flex gap-4'>
                      <div className='flex-shrink-0'>
                        <motion.div
                          className='w-10 h-10 rounded-xl overflow-hidden shadow-md'
                          animate={
                            prefersReducedMotion
                              ? {}
                              : { rotate: [0, 8, -8, 0] }
                          }
                          transition={
                            prefersReducedMotion
                              ? {}
                              : {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }
                          }
                          style={{ willChange: "transform" }}>
                          <LogoVideo
                            videoSrc={yelloVideoMp4}
                            logoSrc={yelloIconJpg}
                            className='w-full h-full'
                            showVideo={showVideo}
                            onRequestPlay={requestReplay}
                            showControls={false}
                            loop={true}
                            autoPlay={true}
                          />
                        </motion.div>
                      </div>
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </div>

          <div
            className='border-t border-border/40 bg-card/50 backdrop-blur-xl shadow-lg flex-shrink-0'
            style={{
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
              paddingRight: "max(1rem, env(safe-area-inset-right))",
            }}>
            <div className='max-w-4xl mx-auto px-4 sm:px-5 pt-4'>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className='flex gap-3 items-end'>
                <Textarea
                  ref={textareaRef}
                  id='chat-input'
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder='Mensagem para Solar Hub...'
                  disabled={isLoading}
                  className='min-h-[52px] max-h-[200px] resize-none bg-background/60 backdrop-blur-sm border-2 focus-visible:border-accent/60 transition-all shadow-sm text-[15px] leading-[1.5]'
                  rows={1}
                  aria-label='Campo de mensagem'
                  aria-describedby='input-hint'
                />
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.06 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
                  style={{ willChange: "transform" }}>
                  <Button
                    type='submit'
                    disabled={!input.trim() || isLoading}
                    className='bg-gradient-solar-br hover:opacity-90 text-foreground h-[52px] w-[52px] sm:w-auto sm:px-5 shadow-lg hover:shadow-xl transition-all flex-shrink-0'
                    aria-label={isLoading ? "Enviando..." : "Enviar mensagem"}>
                    {isLoading ? (
                      <motion.div
                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                        transition={
                          prefersReducedMotion
                            ? {}
                            : { duration: 1, repeat: Infinity, ease: "linear" }
                        }
                        style={{ willChange: "transform" }}>
                        <PaperPlaneRight size={20} weight='fill' />
                      </motion.div>
                    ) : (
                      <PaperPlaneRight size={20} weight='fill' />
                    )}
                  </Button>
                </motion.div>
              </form>
              <p
                className='text-[11px] text-muted-foreground text-center mt-2 font-medium leading-[1.4]'
                id='input-hint'>
                Pressione Enter para enviar, Shift+Enter para nova linha
              </p>
            </div>
          </div>
        </div>
      )}

      <PromptLibrary
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={handleSelectPrompt}
      />

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        chats={fullSessions}
        onSelectChat={handleChatSelect}
      />

      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        chatTitle={currentSession?.title || "Nova conversa"}
        messages={chatMessages}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
