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
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface MobileBottomNavProps {
  onOpenCommandPalette: () => void;
}

export default function MobileBottomNav({ onOpenCommandPalette }: MobileBottomNavProps) {
  const location = useLocation();
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
    { path: "/calculator", label: "RAID & NAS Calc", badge: "ZFS", icon: Calculator, color: "text-blue-400" },
    { path: "/parts", label: "Parts Catalog", badge: "50+ SBCs", icon: Cpu, color: "text-teal-400" },
    { path: "/chat", label: "AI Hardware Chat", badge: "LLM", icon: MessageSquare, color: "text-pink-400" },
  ];

  return (
    <>
      {/* Slide-Up Mobile Apps & Studios Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="flex-1"
            onClick={() => {
              triggerTap();
              setShowDrawer(false);
            }}
          />
          <div className="bg-gray-950 border-t border-gray-800 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse" />
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                  Decksmith Mobile Hub
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const state = soundFx.toggleSound();
                    setIsSoundOn(state);
                    triggerTap();
                  }}
                  className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300"
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

      {/* Floating Bottom Navigation Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <div className="max-w-md mx-auto bg-gray-950/90 backdrop-blur-xl border border-gray-800/90 rounded-2xl p-1.5 flex items-center justify-around shadow-2xl pointer-events-auto">
          {navButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = location.pathname === btn.path;
            return (
              <Link
                key={btn.path}
                to={btn.path}
                onClick={triggerTap}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-neon-green font-bold bg-emerald-950/50 scale-105"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] tracking-tight">{btn.label}</span>
              </Link>
            );
          })}

          {/* Quick Hub Drawer Button */}
          <button
            onClick={() => {
              triggerTap();
              setShowDrawer((prev) => !prev);
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              showDrawer ? "text-cyan-400 bg-cyan-950/50 scale-105" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Grid className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </div>
    </>
  );
}
