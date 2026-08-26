import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Crosshair,
  HardDrive,
  Activity,
  Calculator,
  MessageSquare,
  Cpu,
  Wrench,
  ArrowRight,
  Zap,
  Radio,
  Compass,
  FileCode,
  Shield,
  Layers,
  Check,
  Keyboard,
  Sun,
  Flame,
  QrCode,
  Printer,
  Router as RouterIcon,
  ShieldAlert,
  Music,
  Usb,
  Tag,
  Settings as SettingsIcon,
  HelpCircle,
  Bell,
  SlidersHorizontal,
} from "lucide-react";

import { soundFx } from "../lib/soundFx";

interface PaletteItem {
  id: string;
  category: "Tools" | "Presets" | "Actions" | "Navigation";
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  badge?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems: PaletteItem[] = [
    // Tools
    {
      id: "tool-builder",
      category: "Tools",
      title: "Blueprint Studio",
      subtitle: "10-slot modular cyberdeck creator with live telemetry simulation",
      icon: Sparkles,
      action: () => { navigate("/builder"); onClose(); },
      badge: "Studio",
    },
    {
      id: "tool-price-watch",
      category: "Tools",
      title: "Watched Hardware & Price Alerts",
      subtitle: "Live component market price drop tracking & supplier alerts",
      icon: Tag,
      action: () => { navigate("/price-watch"); onClose(); },
      badge: "Tracker",
    },
    {
      id: "tool-pcb",
      category: "Tools",
      title: "Gerber & KiCad PCB Layer Viewer Studio",
      subtitle: "Multi-layer copper trace inspection, SMT footprint verification, DRC rules, and Gerber export",
      icon: Cpu,
      action: () => { navigate("/pcb"); onClose(); },
      badge: "PCB",
    },
    {
      id: "tool-cad",
      category: "Tools",
      title: "CAD & CNC Fabrication Studio",
      subtitle: "3D WebGL orbit, exploded assembly, and DXF/STL/G-Code export",
      icon: Crosshair,
      action: () => { navigate("/cad"); onClose(); },
      badge: "3D CAD",
    },
    {
      id: "tool-assembly",
      category: "Tools",
      title: "3D Exploded Assembly Guide Studio",
      subtitle: "Layer-by-layer 3D explosion slider, screw torque limits, and printable build manual",
      icon: Layers,
      action: () => { navigate("/assembly"); onClose(); },
      badge: "Assembly",
    },
    {
      id: "tool-serial",
      category: "Tools",
      title: "WebSerial & MCU Hardware Flasher Studio",
      subtitle: "Direct USB-to-UART serial terminal and MicroPython/WLED/QMK flasher",
      icon: Usb,
      action: () => { navigate("/serial"); onClose(); },
      badge: "WebSerial",
    },
    {
      id: "tool-flasher",
      category: "Tools",
      title: "OS Flasher Companion",
      subtitle: "Custom display modelines, cloud-init Wi-Fi/SSH, and first-boot setup",
      icon: HardDrive,
      action: () => { navigate("/flasher"); onClose(); },
      badge: "OS",
    },
    {
      id: "tool-companion",
      category: "Tools",
      title: "Field Companion & Diagnostics",
      subtitle: "Live I2C bus scanner, battery drain curve, 9-DOF IMU, and LoRa scope",
      icon: Activity,
      action: () => { navigate("/companion"); onClose(); },
      badge: "Telemetry",
    },
    {
      id: "tool-keyboard",
      category: "Tools",
      title: "Mechanical Keyboard Matrix Studio",
      subtitle: "Ortholinear & split matrix designer, QMK/KMK firmware, and 3D switch plates",
      icon: Keyboard,
      action: () => { navigate("/keyboard"); onClose(); },
      badge: "Matrix",
    },
    {
      id: "tool-calculator",
      category: "Tools",
      title: "RAID & NAS Storage Calculator",
      subtitle: "Multi-drive usable storage, fault tolerance, and parity simulator",
      icon: Calculator,
      action: () => { navigate("/calculator"); onClose(); },
      badge: "ZFS",
    },
    {
      id: "tool-solar",
      category: "Tools",
      title: "Solar & Off-Grid Energy Studio",
      subtitle: "Solar panel sizing, MPPT efficiency, and zero-sun autonomy reserve modeling",
      icon: Sun,
      action: () => { navigate("/solar"); onClose(); },
      badge: "Off-Grid",
    },
    {
      id: "tool-rf",
      category: "Tools",
      title: "Wireless Range & Link Budget Studio",
      subtitle: "Free Space Path Loss (FSPL), Fresnel zone obstacle clearance, and radio horizons",
      icon: Radio,
      action: () => { navigate("/rf"); onClose(); },
      badge: "RF",
    },
    {
      id: "tool-cooling",
      category: "Tools",
      title: "Thermal Dissipation & Active Cooling Studio",
      subtitle: "Heatsink convection (Theta), enclosure air exchange, and fan acoustic noise modeling",
      icon: Flame,
      action: () => { navigate("/cooling"); onClose(); },
      badge: "Thermals",
    },
    {
      id: "tool-pinout",
      category: "Tools",
      title: "40-Pin GPIO & Bus Pinout Studio",
      subtitle: "Interactive 40-pin header explorer, bus filtering, and Device Tree overlays",
      icon: Cpu,
      action: () => { navigate("/pinout"); onClose(); },
      badge: "GPIO",
    },
    {
      id: "tool-scanner",
      category: "Tools",
      title: "Field QR Badge & Cyberdeck Scanner",
      subtitle: "Scan physical cyberdeck QR badges to load BOM manifests and 3D CAD models",
      icon: QrCode,
      action: () => { navigate("/scan"); onClose(); },
      badge: "Scanner",
    },
    {
      id: "tool-stl",
      category: "Tools",
      title: "3D Printable STL & Mesh Slicer Studio",
      subtitle: "Inspect STL models, simulate infill, and calculate filament mass and print cost",
      icon: Printer,
      action: () => { navigate("/stl"); onClose(); },
      badge: "STL Slicer",
    },
    {
      id: "tool-power",
      category: "Tools",
      title: "Power Delivery & Battery Studio",
      subtitle: "Transient brownout simulation, AWG voltage drop, and USB-PD sink profiles",
      icon: Zap,
      action: () => { navigate("/power"); onClose(); },
      badge: "Power",
    },
    {
      id: "tool-harness",
      category: "Tools",
      title: "Wiring Harness & Cable Loom Studio",
      subtitle: "Schematic wiring netlists, wire gauge sizing, and printable harness pinout charts",
      icon: Layers,
      action: () => { navigate("/harness"); onClose(); },
      badge: "Wiring",
    },
    {
      id: "tool-sdr",
      category: "Tools",
      title: "SDR & Radio Frequency Studio",
      subtitle: "Spectrum waterfall visualizer, antenna resonance calculator, and filter design",
      icon: Radio,
      action: () => { navigate("/sdr"); onClose(); },
      badge: "SDR",
    },
    {
      id: "tool-gps",
      category: "Tools",
      title: "GPS & Satellite Tracking Studio",
      subtitle: "NMEA sentence decoder, skyplot constellation view, and Maidenhead grid locator",
      icon: Compass,
      action: () => { navigate("/gps"); onClose(); },
      badge: "GNSS",
    },
    {
      id: "tool-router",
      category: "Tools",
      title: "Router & Firewall Studio",
      subtitle: "nftables firewall generator, WireGuard VPN mesh, and captive portal manager",
      icon: RouterIcon,
      action: () => { navigate("/router"); onClose(); },
      badge: "NetSec",
    },
    {
      id: "tool-airgap",
      category: "Tools",
      title: "Airgap & Survival Studio",
      subtitle: "Faraday attenuation calculator, optical audio airgap, and hardware kill switch guide",
      icon: ShieldAlert,
      action: () => { navigate("/airgap"); onClose(); },
      badge: "Airgap",
    },
    {
      id: "tool-logic",
      category: "Tools",
      title: "Logic Analyzer & Protocol Decoder",
      subtitle: "Multi-channel digital waveform viewer for I2C, SPI, UART, and 1-Wire",
      icon: Activity,
      action: () => { navigate("/logic"); onClose(); },
      badge: "Logic",
    },
    {
      id: "tool-audio",
      category: "Tools",
      title: "Chiptune Audio Synth & Tracker Studio",
      subtitle: "4-channel chiptune synthesizer, step sequencer, and I2S DAC configuration",
      icon: Music,
      action: () => { navigate("/audio"); onClose(); },
      badge: "Chiptune",
    },

    // Navigation
    {
      id: "nav-parts",
      category: "Navigation",
      title: "Parts Catalog",
      subtitle: "Browse 112+ verified cyberdeck hardware components",
      icon: Cpu,
      action: () => { navigate("/parts"); onClose(); },
      badge: "Catalog",
    },
    {
      id: "nav-builds",
      category: "Navigation",
      title: "Community Builds Directory",
      subtitle: "Explore, star, and fork operative cyberdeck creations",
      icon: Wrench,
      action: () => { navigate("/builds"); onClose(); },
      badge: "Gallery",
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Operative Station Settings",
      subtitle: "Configure callsigns, sound effects, units, and notifications",
      icon: SettingsIcon,
      action: () => { navigate("/settings"); onClose(); },
      badge: "Config",
    },

    // Presets
    {
      id: "preset-netrunner",
      category: "Presets",
      title: "Load Preset: Shadow Netrunner MK-IV",
      subtitle: "Pi 5 8GB + 11.9\" Bar LCD + BBQ20 Keyboard + Pelican 1150",
      icon: Compass,
      action: () => { navigate("/builder"); onClose(); },
      badge: "Preset",
    },
    {
      id: "preset-meshtastic",
      category: "Presets",
      title: "Load Preset: Nomad LoRa Field Unit",
      subtitle: "Pi Zero 2 W + SX1262 LoRa + 5\" LCD + 10000mAh Solar BMS",
      icon: Radio,
      action: () => { navigate("/builder"); onClose(); },
      badge: "Preset",
    },
    {
      id: "preset-nas",
      category: "Presets",
      title: "Load Preset: Silent 4-Bay ZFS NAS",
      subtitle: "Rock 5B + 4x M.2 NVMe + 10GbE + Custom Aluminum Enclosure",
      icon: HardDrive,
      action: () => { navigate("/builder"); onClose(); },
      badge: "Preset",
    },

    // Actions
    {
      id: "action-toggle-sound",
      category: "Actions",
      title: "Toggle Cyberpunk Audio Sound FX",
      subtitle: "Mute or enable tactical mechanical UI clicks and chimes",
      icon: Sparkles,
      action: () => {
        soundFx.toggleSound();
        onClose();
      },
      badge: "Action",
    },
  ];

  const categories = ["All", "Tools", "Navigation", "Presets", "Actions"];

  const filteredItems = allItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  useEffect(() => {
    if (isOpen) {
      soundFx.playPaletteOpen();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          onClose(); // toggle behavior managed by parent
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        soundFx.playClick();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        soundFx.playClick();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          soundFx.playConfirm();
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 font-mono">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Palette Modal */}
      <div className="relative w-full max-w-2xl bg-gray-950 border border-neon-green/40 rounded-3xl shadow-2xl shadow-neon-green/10 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900/60">
          <Search className="w-5 h-5 text-neon-green shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, studio name, preset, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 text-[10px] bg-gray-800 text-gray-400 rounded-md border border-gray-700">ESC</kbd>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 px-4 py-2 bg-gray-950/80 border-b border-gray-800/80 text-[11px] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-neon-green text-black shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No commands or hardware studios found matching "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFx.playConfirm();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gray-900 border border-neon-green/50 text-white shadow-md shadow-neon-green/5"
                      : "text-gray-300 hover:bg-gray-900/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl border ${
                        isSelected
                          ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                          : "bg-gray-900 border-gray-800 text-gray-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-800 border border-gray-700 text-cyan-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 line-clamp-1">{item.subtitle}</div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-neon-green translate-x-1" : "text-gray-600"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-2.5 px-4 bg-gray-900/80 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-neon-green font-bold">DECKSMITH v2.5 PRO</span>
        </div>
      </div>
    </div>
  );
}
