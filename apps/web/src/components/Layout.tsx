import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Wrench,
  Cpu,
  Home,
  Settings,
  Heart,
  Sun,
  Moon,
  Bell,
  Calculator,
  Sparkles,
  Crosshair,
  HardDrive,
  Activity,
  Search,
  Volume2,
  VolumeX,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Usb,
  ShieldCheck,
  Layers,
  Music,
  Tag,
  Radio,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";
import { API_URL } from "../lib/config";
import CommandPalette from "./CommandPalette";
import MobileBottomNav from "./MobileBottomNav";
import InteractiveWizard from "./InteractiveWizard";
import AuthModal from "./AuthModal";
import WhatsNewModal from "./WhatsNewModal";
import { soundFx } from "../lib/soundFx";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/builder", label: "Studio", icon: Sparkles },
  { path: "/cad", label: "CAD / CNC", icon: Crosshair },
  { path: "/flasher", label: "OS Flasher", icon: HardDrive },
  { path: "/companion", label: "Field HUD", icon: Activity },
  { path: "/builds", label: "Builds", icon: Wrench },
  { path: "/parts", label: "Parts", icon: Cpu },
  { path: "/calculator", label: "RAID Calc", icon: Calculator },
  { path: "/chat", label: "AI Architect", icon: MessageSquare },
];

export default function Layout() {
  const location = useLocation();
  const { theme } = useTheme();
  const { user, token, isAuthenticated, logout, setShowAuthModal } = useAuth();
  const { dispatchToast, requestDesktopPermission, hasDesktopPermission } = useNotification();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "studio" | "hardware" | "security">("all");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(soundFx.isEnabled());
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; title: string; message: string; read: boolean; url: string | null; createdAt: string }>>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette (Ctrl+K / Cmd+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
      // Toggle Interactive Guide Wizard (F1 or ? / Shift+/)
      if (
        (e.key === "F1" || e.key === "?") &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setShowWizard((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchNotifications = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/notifications`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [token]);

  const markAllRead = async () => {
    soundFx.playConfirm();
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_URL}/api/notifications/mark-read`, { method: "POST", headers });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "new_studio":
        return { label: "NEW STUDIO", bg: "bg-emerald-950/80 text-neon-green border-neon-green/40", icon: Layers, category: "studio" };
      case "new_part":
        return { label: "HARDWARE", bg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40", icon: Cpu, category: "hardware" };
      case "security_update":
        return { label: "SECURITY", bg: "bg-yellow-950/80 text-yellow-300 border-yellow-500/40", icon: ShieldCheck, category: "security" };
      default:
        return { label: "UPDATE", bg: "bg-purple-950/80 text-purple-300 border-purple-500/40", icon: Sparkles, category: "all" };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "studio") return n.type === "new_studio";
    if (activeFilter === "hardware") return n.type === "new_part";
    if (activeFilter === "security") return n.type === "security_update";
    return true;
  });

  const handleTestToast = () => {
    dispatchToast({
      type: "price_drop",
      title: "🔥 Price Drop Alert: Waveshare 11.9\" Bar LCD",
      message: "Price decreased by 18% ($84.99 -> $69.99) on Adafruit / AliExpress.",
      url: "/parts",
      actionLabel: "View in Parts Catalog",
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-950 text-gray-100"}`}>
      {/* Header */}
      <header className={`border-b ${theme === "light" ? "border-gray-200 bg-gray-100/50" : "border-gray-800 bg-gray-900/50"} backdrop-blur-sm sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent font-mono">
                Decksmith
              </span>
            </Link>

            {/* Desktop Navbar Center */}
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? theme === "light"
                          ? "bg-gray-200 text-neon-green"
                          : "bg-gray-800/90 text-neon-green border border-neon-green/30 shadow-sm shadow-neon-green/20"
                        : theme === "light"
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons (Right Header) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Guide Button */}
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  setShowWizard(true);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  theme === "light"
                    ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300"
                    : "text-neon-green bg-emerald-950/40 hover:bg-emerald-950/70 border border-neon-green/40 shadow-sm shadow-neon-green/10"
                }`}
                title="Open Interactive Mission Guide & Onboarding Wizard (? / F1)"
              >
                <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                <span className="text-[11px] sm:text-xs">Guide</span>
              </button>

              {/* User Callsign Button */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowUserMenu((prev) => !prev);
                    }}
                    className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gray-800/90 border border-gray-700 hover:border-neon-green transition-all"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-6 h-6 rounded-lg bg-gray-900 border border-gray-700"
                    />
                    <span className="text-xs font-bold font-mono text-neon-green hidden md:inline truncate max-w-[100px]">
                      {user.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div
                      className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl z-50 p-2 space-y-1 ${
                        theme === "light" ? "bg-white border-gray-200" : "bg-gray-900 border-gray-800"
                      }`}
                    >
                      <div className="p-2 border-b border-gray-800">
                        <div className="text-xs font-bold text-white font-mono truncate">{user.name}</div>
                        <div className="text-[10px] text-cyan-400 font-mono truncate">{user.email}</div>
                      </div>

                      <Link
                        to={`/profile/${user.id}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 p-2 rounded-xl text-xs font-mono text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        My Profile & Builds
                      </Link>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowAuthModal(true);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-mono text-gray-300 hover:bg-gray-800 hover:text-white text-left"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        Switch Callsign
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-mono text-red-400 hover:bg-red-950/40 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundFx.playConfirm();
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-green text-black font-bold font-mono text-xs hover:bg-neon-green/90 shadow-md shadow-neon-green/20 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Desktop Command Palette */}
              <button
                onClick={() => setShowCommandPalette(true)}
                className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  theme === "light"
                    ? "text-gray-600 bg-gray-200/70 hover:bg-gray-200"
                    : "text-gray-300 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-neon-green"
                }`}
                title="Open Command Palette (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-neon-green" />
                <span className="text-[11px] text-gray-400">Ctrl+K</span>
              </button>

              {/* Audio FX Toggle */}
              <button
                onClick={() => {
                  const state = soundFx.toggleSound();
                  setIsSoundOn(state);
                }}
                className={`flex items-center p-2 rounded-lg transition-all ${
                  isSoundOn ? "text-neon-green hover:bg-gray-800/50" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                }`}
                title={isSoundOn ? "Mute Audio FX" : "Enable Audio FX"}
              >
                {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Notifications & Tactical Alerts Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setShowNotifications(!showNotifications);
                  }}
                  className={`relative flex items-center gap-2 p-2 rounded-xl transition-all ${
                    showNotifications
                      ? "bg-gray-800 text-neon-green border border-neon-green/40"
                      : "text-gray-400 hover:text-neon-green hover:bg-gray-800/50"
                  }`}
                  title="What's Newly Added & Operative Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono animate-pulse shadow-md shadow-red-500/40">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Tactical Alert & Notification Dispatch Drawer */}
                {showNotifications && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-88 sm:w-[420px] rounded-3xl border shadow-2xl z-50 overflow-hidden font-mono ${
                      theme === "light" ? "bg-white border-gray-200" : "bg-gray-900 border-gray-800"
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-neon-green" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Tactical Alerts & Updates
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[10px] text-neon-green hover:underline font-bold mr-1"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            setShowWhatsNew(true);
                          }}
                          className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-cyan-300 font-bold border border-gray-700 hover:border-cyan-400"
                        >
                          Changelog
                        </button>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-2 bg-gray-950/90 border-b border-gray-800/80 overflow-x-auto text-[10px]">
                      {(
                        [
                          { id: "all", label: "All" },
                          { id: "studio", label: "Studios" },
                          { id: "hardware", label: "Hardware" },
                          { id: "security", label: "Security" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            soundFx.playClick();
                            setActiveFilter(tab.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                            activeFilter === tab.id
                              ? "bg-neon-green text-black shadow-sm"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}

                      {/* Desktop Push Permission Toggle */}
                      <button
                        onClick={requestDesktopPermission}
                        className={`ml-auto px-2 py-1 rounded-lg text-[9px] font-bold border flex items-center gap-1 shrink-0 ${
                          hasDesktopPermission
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                            : "bg-gray-800 text-gray-300 border-gray-700 hover:border-neon-green"
                        }`}
                        title="Toggle Native Desktop Push Notifications"
                      >
                        <Radio className="w-2.5 h-2.5 text-neon-green" />
                        <span>{hasDesktopPermission ? "Push ON" : "Enable Push"}</span>
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-800/80">
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((n) => {
                          const badge = getNotificationBadge(n.type);
                          const BadgeIcon = badge.icon;
                          return (
                            <Link
                              key={n.id}
                              to={n.url || "#"}
                              onClick={() => setShowNotifications(false)}
                              className={`block p-3.5 hover:bg-gray-800/50 transition-all ${
                                !n.read ? "bg-gray-950/90 border-l-2 border-l-neon-green" : "bg-gray-900/40"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${badge.bg}`}>
                                  <BadgeIcon className="w-3 h-3" />
                                  {badge.label}
                                </span>
                                <span className="text-[9px] text-gray-500">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-white hover:text-neon-green transition-colors">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>

                              {n.url && (
                                <div className="mt-2 text-[10px] text-neon-green font-bold flex items-center gap-1">
                                  <span>Launch Studio / Component</span>
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                              )}
                            </Link>
                          );
                        })
                      ) : (
                        <div className="py-12 text-center text-gray-500 text-xs">
                          No notifications in this filter
                        </div>
                      )}
                    </div>

                    {/* Footer Quick Action Bar */}
                    <div className="p-2.5 bg-gray-950 border-t border-gray-800 flex items-center justify-between text-xs">
                      <button
                        onClick={handleTestToast}
                        className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-[10px] text-gray-300 hover:text-white hover:border-gray-700 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>Simulate Price Drop</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          setShowWhatsNew(true);
                        }}
                        className="text-[11px] font-bold text-neon-green hover:underline flex items-center gap-1"
                      >
                        <span>v2.4 Release Notes</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setShowMobileNav((prev) => !prev)}
                className={`md:hidden p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-200" : "text-gray-300 hover:bg-gray-800"}`}
                aria-label={showMobileNav ? "Close navigation" : "Open navigation"}
              >
                {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Slide-Down Mobile Header Menu */}
          {showMobileNav && (
            <nav className={`md:hidden grid grid-cols-2 gap-1 pb-3 ${theme === "light" ? "border-t border-gray-200" : "border-t border-gray-800"} pt-3 font-mono`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileNav(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                      isActive
                        ? theme === "light"
                          ? "bg-gray-200 text-neon-green"
                          : "bg-gray-800 text-neon-green"
                        : theme === "light"
                        ? "text-gray-600 hover:bg-gray-200"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link to="/wishlist" onClick={() => setShowMobileNav(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-gray-800">
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
              <Link to="/settings" onClick={() => setShowMobileNav(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:bg-gray-800">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`border-t ${theme === "light" ? "border-gray-200 bg-gray-100/30" : "border-gray-800 bg-gray-900/30"} py-6 mb-16 md:mb-0 font-mono`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm space-y-1">
          <p>Decksmith - AI-Powered Cyberdeck Builder & Hardware Engineering Suite</p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-600 pt-1">
            <button onClick={() => setShowWhatsNew(true)} className="text-neon-green hover:underline">
              What's Newly Added (v2.4)
            </button>
            <span>•</span>
            <button onClick={() => setShowWizard(true)} className="hover:text-gray-400">
              Interactive Mission Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Interactive Guide Launcher */}
      <button
        onClick={() => {
          soundFx.playConfirm();
          setShowWizard((prev) => !prev);
        }}
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-3.5 py-2 rounded-full bg-gray-900/90 border border-neon-green/40 hover:border-neon-green text-neon-green text-xs font-mono font-bold shadow-xl shadow-neon-green/10 backdrop-blur-md transition-all hover:scale-105"
        title="Toggle Interactive Mission Guide (? / F1)"
      >
        <Sparkles className="w-4 h-4 text-neon-green animate-pulse" />
        <span>Mission Guide (?)</span>
      </button>

      {/* Floating Mobile Bottom Navigation Dock */}
      <MobileBottomNav onOpenCommandPalette={() => setShowCommandPalette(true)} />

      {/* Global Command Palette */}
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      {/* Interactive Onboarding Mission Guide Wizard */}
      <InteractiveWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />

      {/* Cyberdeck Operative Authentication Modal */}
      <AuthModal />

      {/* What's Newly Added Changelog Modal */}
      <WhatsNewModal isOpen={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
    </div>
  );
}
