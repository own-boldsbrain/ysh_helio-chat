/**
 * ChatKit Integration Component
 *
 * Embeddable OpenAI ChatKit component for agent-powered chat experiences
 */

import { useEffect, useState, useCallback } from "react";
import {
  createChatKitSession,
  refreshChatKitSession,
  getDeviceId,
} from "@/lib/openai";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkle, Lightning, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";

interface ChatKitEmbedProps {
  /**
   * Custom CSS class for the container
   */
  className?: string;

  /**
   * Whether to show the ChatKit in a floating widget
   */
  floating?: boolean;

  /**
   * Initial position for floating widget
   */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";

  /**
   * Custom user ID (optional)
   */
  userId?: string;

  /**
   * Additional metadata to pass to the session
   */
  metadata?: Record<string, any>;

  /**
   * Callback when ChatKit is ready
   */
  onReady?: () => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
}

export function ChatKitEmbed({
  className = "",
  floating = false,
  position = "bottom-right",
  userId,
  metadata,
  onReady,
  onError,
}: ChatKitEmbedProps) {
  const [isOpen, setIsOpen] = useState(!floating);
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize ChatKit session
  useEffect(() => {
    const initChatKit = async () => {
      try {
        setIsLoading(true);
        const deviceId = getDeviceId();
        const secret = await createChatKitSession({
          userId: userId || deviceId,
          deviceId,
          metadata,
        });

        setClientSecret(secret);
        setIsLoading(false);
        onReady?.();
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to initialize ChatKit");
        setError(error);
        setIsLoading(false);
        onError?.(error);
        toast.error("Erro ao inicializar o chat", {
          description: error.message,
        });
      }
    };

    initChatKit();
  }, [userId, metadata, onReady, onError]);

  // Handle session refresh
  const handleRefreshSession = useCallback(async () => {
    if (!clientSecret) return;

    try {
      const newSecret = await refreshChatKitSession(clientSecret);
      setClientSecret(newSecret);
      toast.success("Sessão renovada");
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to refresh session");
      setError(error);
      toast.error("Erro ao renovar sessão", {
        description: error.message,
      });
    }
  }, [clientSecret]);

  // Get position classes
  const getPositionClasses = () => {
    const positions = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "top-right": "top-6 right-6",
      "top-left": "top-6 left-6",
    };
    return positions[position];
  };

  // Render floating trigger button
  if (floating && !isOpen) {
    return (
      <motion.div
        className={`fixed ${getPositionClasses()} z-50`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-solar-br hover:opacity-90"
        >
          <Sparkle size={28} weight="fill" className="text-white" />
        </Button>
      </motion.div>
    );
  }

  // Render ChatKit embed
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${floating ? `fixed ${getPositionClasses()} z-50` : ""}`}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Card
            className={`${className} ${
              floating ? "w-[400px] h-[600px]" : "w-full h-full"
            } overflow-hidden shadow-2xl border-2`}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-muted/50 to-muted/20 p-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-solar-br flex items-center justify-center shadow-lg">
                  <Lightning className="text-white" size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Yello AI Assistant
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Powered by OpenAI
                  </p>
                </div>
              </div>

              {floating && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-accent/10"
                  aria-label="Fechar Chat Assistant"
                >
                  <X size={20} weight="bold" />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="h-[calc(100%-80px)] overflow-hidden">
              {isLoading && (
                <div className="h-full flex items-center justify-center">
                  <div className="w-3/4">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-1/2 h-4" />
                        <Skeleton className="w-1/3 h-3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="w-full h-8" />
                      <Skeleton className="w-full h-8" />
                      <Skeleton className="w-1/2 h-8" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    <div className="text-red-500 text-4xl">⚠️</div>
                    <p className="text-sm text-foreground font-semibold">
                      Erro ao carregar o chat
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {error.message}
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                </div>
              )}

              {!isLoading && !error && clientSecret && (
                <div className="h-full">
                  {/* 
                    ChatKit iframe or custom implementation would go here.
                    For now, we'll show a placeholder since the actual ChatKit 
                    component requires the @openai/chatkit-react package to be properly configured
                  */}
                  <div
                    id="chatkit-container"
                    className="h-full w-full"
                    data-client-secret={clientSecret}
                  >
                    {/* ChatKit will be mounted here via the script tag */}
                    <iframe
                      src={`https://chatkit.studio/embed?secret=${clientSecret}`}
                      className="w-full h-full border-0"
                      title="ChatKit Embed"
                      allow="microphone"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Simple hook to control ChatKit from outside the component
 */
export function useChatKit() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
