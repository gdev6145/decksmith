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
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import CommandPalette from "./CommandPalette";
import MobileBottomNav from "./MobileBottomNav";
import InteractiveWizard from "./InteractiveWizard";
import AuthModal from "./AuthModal";
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
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, setShowAuthModal } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/notifications`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // ignore
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ""}/api/notifications/mark-read`, { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-950 text-gray-100"}`}>
      {/* Header */}
      <header className={`border-b ${theme === "light" ? "border-gray-200 bg-gray-100/50" : "border-gray-800 bg-gray-900/50"} backdrop-blur-sm sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                Decksmith
              </span>
            </Link>

            {/* Navigation */}
            <button
              onClick={() => setShowMobileNav((prev) => !prev)}
              className={`md:hidden p-2 rounded-lg ${theme === "light" ? "text-gray-600 hover:bg-gray-200" : "text-gray-300 hover:bg-gray-800"}`}
              aria-label={showMobileNav ? "Close navigation" : "Open navigation"}
              aria-expanded={showMobileNav}
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

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
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  setShowWizard(true);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  theme === "light"
                    ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300"
                    : "text-neon-green bg-emerald-950/40 hover:bg-emerald-950/70 border border-neon-green/40 shadow-sm shadow-neon-green/10"
                }`}
                title="Open Interactive Mission Guide & Onboarding Wizard (? / F1)"
              >
                <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                <span className="hidden sm:inline">Guide</span>
              </button>
              <button
                onClick={() => setShowCommandPalette(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  theme === "light"
                    ? "text-gray-600 bg-gray-200/70 hover:bg-gray-200"
                    : "text-gray-300 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-neon-green"
                }`}
                title="Open Command Palette (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-neon-green" />
                <span className="hidden lg:inline text-[11px] text-gray-400">Ctrl+K</span>
              </button>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-1.5 p-2 rounded-lg transition-all ${
                  theme === "light" ? "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50" : "text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50"
                }`}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  const state = soundFx.toggleSound();
                  setIsSoundOn(state);
                }}
                className={`flex items-center gap-1.5 p-2 rounded-lg transition-all ${
                  isSoundOn
                    ? "text-neon-green hover:bg-gray-800/50"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                }`}
                title={isSoundOn ? "Mute Cyberpunk Audio FX" : "Enable Cyberpunk Audio FX"}
              >
                {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    theme === "light" ? "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50" : "text-gray-500 hover:text-neon-green hover:bg-gray-800/50"
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl z-50 ${
                    theme === "light" ? "bg-white border-gray-200" : "bg-gray-900 border-gray-700"
                  }`}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                      <h3 className="text-sm font-semibold text-gray-100">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-neon-green hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((n) => (
                        <Link
                          key={n.id}
                          to={n.url || "#"}
                          onClick={() => setShowNotifications(false)}
                          className={`block px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                            !n.read ? "bg-gray-800/30" : ""
                          }`}
                        >
                          <p className="text-sm text-gray-200">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </Link>
                      )) : (
                        <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to="/wishlist"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  location.pathname === "/wishlist"
                    ? theme === "light" ? "bg-gray-200 text-red-400" : "bg-gray-800 text-red-400"
                    : theme === "light" ? "text-gray-500 hover:text-red-400 hover:bg-gray-200/50" : "text-gray-500 hover:text-red-400 hover:bg-gray-800/50"
                }`}
                title="Wishlist"
              >
                <Heart className="w-4 h-4" />
              </Link>
              {/* User Authentication & Operative Profile Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowUserMenu((prev) => !prev);
                    }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gray-800/90 border border-gray-700 hover:border-neon-green transition-all"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-5 h-5 rounded-lg bg-gray-900 border border-gray-700"
                    />
                    <span className="text-xs font-bold font-mono text-neon-green hidden lg:inline">{user.name}</span>
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

              <Link
                to="/settings"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ml-1 ${
                  location.pathname === "/settings"
                    ? theme === "light" ? "bg-gray-200 text-neon-green" : "bg-gray-800 text-neon-green"
                    : theme === "light" ? "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </nav>
          </div>
          {showMobileNav && (
            <nav className={`md:hidden grid grid-cols-2 gap-1 pb-3 ${theme === "light" ? "border-t border-gray-200" : "border-t border-gray-800"} pt-3`}>
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
                        ? theme === "light" ? "bg-gray-200 text-neon-green" : "bg-gray-800 text-neon-green"
                        : theme === "light" ? "text-gray-600 hover:bg-gray-200" : "text-gray-400 hover:bg-gray-800"
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
      <footer className={`border-t ${theme === "light" ? "border-gray-200 bg-gray-100/30" : "border-gray-800 bg-gray-900/30"} py-6 mb-16 md:mb-0`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Decksmith - AI-Powered Cyberdeck Builder</p>
          <p className="mt-1">Build your dream portable computer</p>
        </div>
      </footer>

      {/* Floating Interactive Guide Launcher (Desktop) */}
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

      {/* Floating Mobile Bottom Navigation Dock (Mobile Only) */}
      <MobileBottomNav onOpenCommandPalette={() => setShowCommandPalette(true)} />

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      {/* Interactive Onboarding Mission Guide Wizard */}
      <InteractiveWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />

      {/* Cyberdeck Operative Authentication Modal */}
      <AuthModal />
    </div>
  );
}
