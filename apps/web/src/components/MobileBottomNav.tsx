import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Sparkles,
  Crosshair,
  Wrench,
  Grid,
  HardDrive,
  Activity,
  Keyboard,
  Sun,
  Radio,
  Flame,
  Calculator,
  MessageSquare,
  Cpu,
  X,
  Volume2,
  VolumeX,
  QrCode,
  Printer,
  Zap,
  Layers,
  Compass,
  Router as RouterIcon,
  ShieldAlert,
  Music,
  User,
  LogIn,
  Usb,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { soundFx } from "../lib/soundFx";

interface MobileBottomNavProps {
  onOpenCommandPalette: () => void;
}

export default function MobileBottomNav({ onOpenCommandPalette }: MobileBottomNavProps) {
  const location = useLocation();
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(soundFx.isEnabled());

  const triggerTap = () => {
    soundFx.playClick();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
  };

  const navButtons = [
    { path: "/", label: "Home", icon: Home },
    { path: "/builder", label: "Studio", icon: Sparkles },
    { path: "/cad", label: "3D CAD", icon: Crosshair },
    { path: "/builds", label: "Builds", icon: Wrench },
  ];

  const allStudios = [
    { path: "/builder", label: "Blueprint Studio", badge: "10-Slot", icon: Sparkles, color: "text-neon-green" },
    { path: "/cad", label: "3D CAD & CNC", badge: "WebGL", icon: Crosshair, color: "text-cyan-400" },
    { path: "/flasher", label: "OS Flasher", badge: "Modelines", icon: HardDrive, color: "text-purple-400" },
    { path: "/companion", label: "Field HUD", badge: "I2C / IMU", icon: Activity, color: "text-emerald-400" },
    { path: "/keyboard", label: "Keyboard Studio", badge: "QMK / SCAD", icon: Keyboard, color: "text-yellow-400" },
    { path: "/solar", label: "Solar & Off-Grid", badge: "MPPT", icon: Sun, color: "text-amber-400" },
    { path: "/rf", label: "RF Link Budget", badge: "Fresnel", icon: Radio, color: "text-indigo-400" },
    { path: "/cooling", label: "Thermal CFD", badge: "Theta", icon: Flame, color: "text-rose-400" },
    { path: "/pinout", label: "40-Pin GPIO", badge: "Pinout", icon: Cpu, color: "text-cyan-300" },
    { path: "/scan", label: "Field Scanner", badge: "QR Code", icon: QrCode, color: "text-emerald-400" },
    { path: "/stl", label: "3D Print STL", badge: "Slicer", icon: Printer, color: "text-yellow-400" },
    { path: "/power", label: "Power & USB-PD", badge: "BMS / AWG", icon: Zap, color: "text-yellow-400" },
    { path: "/harness", label: "Wiring Harness", badge: "Loom", icon: Layers, color: "text-cyan-400" },
    { path: "/sdr", label: "SDR & Radio", badge: "Spectrum", icon: Radio, color: "text-indigo-400" },
    { path: "/gps", label: "GPS & Satellites", badge: "GNSS", icon: Compass, color: "text-neon-green" },
    { path: "/router", label: "Custom Routers", badge: "OpenWrt", icon: RouterIcon, color: "text-cyan-400" },
    { path: "/survival", label: "Airgap Survival", badge: "KiCad", icon: ShieldAlert, color: "text-rose-400" },
    { path: "/logic", label: "Logic Analyzer", badge: "Bus Sniffer", icon: Activity, color: "text-neon-green" },
    { path: "/synth", label: "Audio & Chiptune", badge: "Tracker", icon: Music, color: "text-rose-400" },
    { path: "/serial", label: "WebSerial Flasher", badge: "USB-UART", icon: Usb, color: "text-cyan-400" },
    { path: "/calculator", label: "RAID & NAS Calc", badge: "ZFS", icon: Calculator, color: "text-blue-400" },
    { path: "/parts", label: "Parts Catalog", badge: "112+ Parts", icon: Cpu, color: "text-teal-400" },
    { path: "/chat", label: "AI Hardware Chat", badge: "LLM", icon: MessageSquare, color: "text-pink-400" },
  ];

  return (
    <>
      {/* Slide-Up Mobile Apps & Studios Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-200">
          <div className="bg-gray-950 border-t border-gray-800 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Decksmith Command Station
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono">20+ Cyberdeck Studios & Tools</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const state = soundFx.toggleSound();
                    setIsSoundOn(state);
                    triggerTap();
                  }}
                  className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300"
                  title="Toggle Sound"
                >
                  {isSoundOn ? <Volume2 className="w-4 h-4 text-neon-green" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                </button>
                <button
                  onClick={() => {
                    triggerTap();
                    setShowDrawer(false);
                  }}
                  className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Operative Identity / Sign In Card (Mobile) */}
            {isAuthenticated && user ? (
              <div className="p-3 bg-gray-900/90 border border-gray-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl bg-gray-950 border border-gray-800"
                  />
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{user.name}</div>
                    <div className="text-[10px] text-neon-green font-mono">● OPERATIVE ACTIVE</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    triggerTap();
                    setShowDrawer(false);
                    setShowAuthModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-800 text-[10px] font-mono text-cyan-300 font-bold border border-gray-700"
                >
                  Switch
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  triggerTap();
                  setShowDrawer(false);
                  setShowAuthModal(true);
                }}
                className="w-full p-3 rounded-2xl bg-emerald-950/40 border border-neon-green/40 flex items-center justify-between text-left shadow-md shadow-neon-green/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-neon-green text-black flex items-center justify-center font-bold">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase font-mono">Sign In / Register Callsign</div>
                    <div className="text-[10px] text-gray-300">Access saved blueprints, CAD & parts</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-neon-green text-black font-bold text-[10px] font-mono">
                  Sign In
                </span>
              </button>
            )}

            {/* Interactive Mission Guide Launcher Banner */}
            <button
              onClick={() => {
                triggerTap();
                setShowDrawer(false);
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "F1" }));
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/40 text-left flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase font-mono">Interactive Mission Guide</div>
                  <div className="text-[10px] text-gray-300">Step-by-step onboarding quest for builders</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-400 text-black font-bold text-[10px] font-mono">
                Start
              </span>
            </button>

            {/* Grid of Studios */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {allStudios.map((studio) => {
                const Icon = studio.icon;
                const isActive = location.pathname === studio.path;
                return (
                  <Link
                    key={studio.path}
                    to={studio.path}
                    onClick={() => {
                      triggerTap();
                      setShowDrawer(false);
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      isActive
                        ? "bg-emerald-950/40 border-neon-green text-white shadow-md shadow-neon-green/20"
                        : "bg-gray-900/90 border-gray-800 text-gray-300 hover:border-gray-700"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${studio.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate text-white">{studio.label}</div>
                      <div className="text-[9px] font-mono text-gray-400">{studio.badge}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav Dock (Mobile Screens Only) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 border-t border-gray-800/80 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
      >
        {navButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = location.pathname === btn.path;
          return (
            <Link
              key={btn.path}
              to={btn.path}
              onClick={triggerTap}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive ? "text-neon-green font-bold scale-105" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-mono tracking-tight">{btn.label}</span>
            </Link>
          );
        })}

        {/* More Studios / Launcher Button */}
        <button
          onClick={() => {
            triggerTap();
            setShowDrawer(true);
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            showDrawer ? "text-neon-green font-bold scale-105" : "text-gray-400 hover:text-gray-200"
          }`}
          aria-label="Open Studios Drawer"
        >
          <Grid className="w-5 h-5 mb-0.5 text-cyan-400" />
          <span className="text-[10px] font-mono tracking-tight text-cyan-300">More</span>
        </button>
      </nav>
    </>
  );
}
