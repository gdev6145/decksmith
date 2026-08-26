import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Sparkles,
  Zap,
  AlertTriangle,
  Tag,
  Trophy,
  X,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { soundFx } from "./lib/soundFx";

export type NotificationType = "studio" | "price_drop" | "hazard" | "badge" | "info";

export interface ToastItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  url?: string;
  actionLabel?: string;
  durationMs?: number;
  timestamp: string;
}

interface NotificationContextType {
  toasts: ToastItem[];
  dispatchToast: (toast: Omit<ToastItem, "id" | "timestamp">) => void;
  removeToast: (id: string) => void;
  requestDesktopPermission: () => Promise<boolean>;
  hasDesktopPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hasDesktopPermission, setHasDesktopPermission] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasDesktopPermission(Notification.permission === "granted");
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dispatchToast = useCallback(
    (toast: Omit<ToastItem, "id" | "timestamp">) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: ToastItem = {
        ...toast,
        id,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Play tactical audio chime
      if (toast.type === "hazard") {
        soundFx.playAlert();
      } else {
        soundFx.playConfirm();
      }

      setToasts((prev) => [...prev.slice(-4), newToast]);

      // Trigger native browser desktop notification if permission granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(toast.title, {
            body: toast.message,
            icon: "/vite.svg",
          });
        } catch {
          // ignore
        }
      }

      // Auto dismiss after duration
      const duration = toast.durationMs || 6000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const requestDesktopPermission = async (): Promise<boolean> => {
    if (typeof window !== "undefined" && "Notification" in window) {
      soundFx.playClick();
      try {
        const permission = await Notification.requestPermission();
        const granted = permission === "granted";
        setHasDesktopPermission(granted);
        if (granted) {
          dispatchToast({
            type: "info",
            title: "🔔 Desktop Alerts Activated",
            message: "You will receive background alerts when watched cyberdeck parts drop in price or restock.",
          });
        }
        return granted;
      } catch {
        return false;
      }
    }
    return false;
  };

  const getToastIcon = (type: NotificationType) => {
    switch (type) {
      case "hazard":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case "price_drop":
        return <Tag className="w-5 h-5 text-amber-400" />;
      case "badge":
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case "studio":
        return <Layers className="w-5 h-5 text-neon-green" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getToastBorder = (type: NotificationType) => {
    switch (type) {
      case "hazard":
        return "border-rose-500/60 shadow-rose-500/20";
      case "price_drop":
        return "border-amber-500/60 shadow-amber-500/20";
      case "badge":
        return "border-yellow-500/60 shadow-yellow-500/20";
      case "studio":
        return "border-neon-green/60 shadow-neon-green/20";
      default:
        return "border-cyan-500/60 shadow-cyan-500/20";
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        dispatchToast,
        removeToast,
        requestDesktopPermission,
        hasDesktopPermission,
      }}
    >
      {children}

      {/* Floating Tactical Cyberpunk Toast Stack */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none font-mono">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 bg-gray-950/95 border rounded-2xl backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${getToastBorder(
              toast.type
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                {getToastIcon(toast.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold text-white truncate">{toast.title}</h4>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">{toast.message}</p>

                {toast.url && (
                  <Link
                    to={toast.url}
                    onClick={() => removeToast(toast.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-neon-green hover:underline mt-2"
                  >
                    <span>{toast.actionLabel || "Inspect Now"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
