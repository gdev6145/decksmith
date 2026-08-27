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
  Check,
  Trash2,
} from "lucide-react";
import { soundFx } from "./lib/soundFx";

export type NotificationType = "studio" | "price_drop" | "hazard" | "badge" | "info";

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  url?: string;
  actionLabel?: string;
  read: boolean;
  timestamp: string;
}

export interface ToastItem extends NotificationRecord {
  durationMs?: number;
}

interface NotificationContextType {
  toasts: ToastItem[];
  notifications: NotificationRecord[];
  unreadCount: number;
  dispatchToast: (toast: Omit<NotificationRecord, "id" | "timestamp" | "read"> & { durationMs?: number }) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestDesktopPermission: () => Promise<boolean>;
  hasDesktopPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif-init-1",
    type: "studio",
    title: "⚡ 3D Exploded Assembly Simulator Online",
    message: "Simulate multi-layer mechanical chassis stacking and torque limits at /assembly.",
    url: "/assembly",
    actionLabel: "Launch Simulator",
    read: false,
    timestamp: "Just now",
  },
  {
    id: "notif-init-2",
    type: "price_drop",
    title: "🏷️ Hardware Price Alerts Engine Ready",
    message: "Automated scraper tracks price drops on Raspberry Pi 5 & Waveshare displays.",
    url: "/price-watch",
    actionLabel: "View Alerts",
    read: false,
    timestamp: "10m ago",
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem("decksmith_notifications_v2");
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_NOTIFICATIONS;
    } catch {
      return DEFAULT_INITIAL_NOTIFICATIONS;
    }
  });

  const [hasDesktopPermission, setHasDesktopPermission] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem("decksmith_notifications_v2", JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasDesktopPermission(Notification.permission === "granted");
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    soundFx.playClick();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    soundFx.playConfirm();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    soundFx.playClick();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    soundFx.playClick();
    setNotifications([]);
    setToasts([]);
  }, []);

  const dispatchToast = useCallback(
    (toast: Omit<NotificationRecord, "id" | "timestamp" | "read"> & { durationMs?: number }) => {
      const id = "notif-" + Math.random().toString(36).substring(2, 9);
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newRecord: NotificationRecord = {
        id,
        type: toast.type,
        title: toast.title,
        message: toast.message,
        url: toast.url,
        actionLabel: toast.actionLabel,
        read: false,
        timestamp,
      };

      const newToast: ToastItem = {
        ...newRecord,
        durationMs: toast.durationMs,
      };

      // Play tactical audio chime
      if (toast.type === "hazard") {
        soundFx.playAlert();
      } else {
        soundFx.playConfirm();
      }

      // Add to persistent list
      setNotifications((prev) => [newRecord, ...prev.slice(0, 49)]);

      // Add to visible toasts
      setToasts((prev) => [...prev.slice(-3), newToast]);

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

      // Auto dismiss toast after duration
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
            type: "badge",
            title: "🔔 Desktop Alerts Activated",
            message: "You will receive native desktop notifications for component price drops and critical build telemetry.",
          });
        }
        return granted;
      } catch {
        return false;
      }
    }
    return false;
  };

  const getToastBorder = (type: NotificationType) => {
    switch (type) {
      case "hazard":
        return "border-rose-500/50 bg-rose-950/90 text-rose-300 shadow-rose-500/20";
      case "price_drop":
        return "border-amber-500/50 bg-amber-950/90 text-amber-300 shadow-amber-500/20";
      case "badge":
        return "border-yellow-500/50 bg-yellow-950/90 text-yellow-300 shadow-yellow-500/20";
      case "studio":
        return "border-neon-green/50 bg-gray-950/95 text-gray-200 shadow-neon-green/20";
      default:
        return "border-cyan-500/50 bg-cyan-950/90 text-cyan-300 shadow-cyan-500/20";
    }
  };

  const getToastIcon = (type: NotificationType) => {
    switch (type) {
      case "hazard":
        return <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />;
      case "price_drop":
        return <Tag className="w-5 h-5 text-amber-400 shrink-0" />;
      case "badge":
        return <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />;
      case "studio":
        return <Sparkles className="w-5 h-5 text-neon-green shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        notifications,
        unreadCount,
        dispatchToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        requestDesktopPermission,
        hasDesktopPermission,
      }}
    >
      {children}

      {/* Floating Tactical Toast Stack (Top Right) */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-mono">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all pointer-events-auto transform translate-y-0 opacity-100 flex flex-col gap-2 ${getToastBorder(
              toast.type
            )}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {getToastIcon(toast.type)}
                <h4 className="text-xs font-black text-white leading-tight">{toast.title}</h4>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  removeToast(toast.id);
                  markAsRead(toast.id);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">{toast.message}</p>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-gray-400">{toast.timestamp}</span>

              {toast.url && (
                <Link
                  to={toast.url}
                  onClick={() => {
                    soundFx.playConfirm();
                    removeToast(toast.id);
                    markAsRead(toast.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 transition-all"
                >
                  <span>{toast.actionLabel || "Inspect"}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
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
