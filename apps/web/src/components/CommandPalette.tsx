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
      id: "tool-cad",
      category: "Tools",
      title: "CAD & CNC Fabrication Studio",
      subtitle: "3D WebGL orbit, exploded assembly, and DXF/STL/G-Code export",
      icon: Crosshair,
      action: () => { navigate("/cad"); onClose(); },
      badge: "3D CAD",
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
      badge: "3D Print",
    },
    {
      id: "tool-power",
      category: "Tools",
      title: "Tactical Power Delivery & USB-PD / BMS Studio",
      subtitle: "Multi-rail DC power tree, AWG wire drop calculator, and USB-C PD sink triggers",
      icon: Zap,
      action: () => { navigate("/power"); onClose(); },
      badge: "Power",
    },
    {
      id: "tool-harness",
      category: "Tools",
      title: "Wiring Harness & Cable Assembly Loom Studio",
      subtitle: "Pin-to-pin interconnect matrix, wire color coding, and WireViz YAML export",
      icon: Layers,
      action: () => { navigate("/harness"); onClose(); },
      badge: "Loom",
    },
    {
      id: "tool-sdr",
      category: "Tools",
      title: "Tactical SDR Spectrum & Mesh Radio Studio",
      subtitle: "Spectrogram waterfall, resonant antenna tuner, and Meshtastic presets",
      icon: Radio,
      action: () => { navigate("/sdr"); onClose(); },
      badge: "SDR",
    },
    {
      id: "tool-gps",
      category: "Tools",
      title: "Tactical GPS NMEA & Satellite Constellation HUD",
      subtitle: "Polar skyplot constellation radar, NMEA-0183 decoder, and Stratum-1 NTP",
      icon: Compass,
      action: () => { navigate("/gps"); onClose(); },
      badge: "GNSS",
    },
    {
      id: "tool-router",
      category: "Tools",
      title: "Custom Router & Firewall Gateway Studio",
      subtitle: "OpenWrt / pfSense hardware architect, WireGuard throughput, and UCI configs",
      icon: RouterIcon,
      action: () => { navigate("/router"); onClose(); },
      badge: "Router",
    },
    {
      id: "tool-survival",
      category: "Tools",
      title: "Airgap Field Survival & KiCad PCB Studio",
      subtitle: "Peukert's sub-zero battery derating, offline disaster manuals, and KiCad 8.0 netlists",
      icon: ShieldAlert,
      action: () => { navigate("/survival"); onClose(); },
      badge: "Airgap",
    },
    {
      id: "tool-chat",
      category: "Tools",
      title: "AI Hardware Architect Chat",
      subtitle: "Chat with AI to design custom cyberdecks, pinouts, and power supplies",
      icon: MessageSquare,
      action: () => { navigate("/chat"); onClose(); },
      badge: "AI",
    },

    // Presets
    {
      id: "preset-netrunner",
      category: "Presets",
      title: "Shadow Netrunner MK-IV",
      subtitle: "Pi 5 + Waveshare 11.9\" Ultrawide + BBQ20 Keyboard",
      icon: Zap,
      action: () => { navigate("/builds/shadow-netrunner-mk-iv"); onClose(); },
      badge: "Verified",
    },
    {
      id: "preset-solar",
      category: "Presets",
      title: "Solar Off-Grid Field Comms Deck",
      subtitle: "Pi Zero 2 W + 2.9\" E-Ink + Meshtastic LoRa 915MHz",
      icon: Radio,
      action: () => { navigate("/builds/solar-off-grid-field-comms-deck"); onClose(); },
      badge: "Off-Grid",
    },
    {
      id: "preset-nas",
      category: "Presets",
      title: "Silent 4-Bay Micro ZFS Server",
      subtitle: "CM4 + 4x 4TB Red Plus + Noctua PWM Cooling",
      icon: HardDrive,
      action: () => { navigate("/builds/silent-4-bay-micro-zfs-server"); onClose(); },
      badge: "NAS",
    },
    {
      id: "preset-sigint",
      category: "Presets",
      title: "SIGINT Field Spectrum Scanner",
      subtitle: "Rock 5B + HackRF One 1MHz-6GHz + Pelican 1200",
      icon: Compass,
      action: () => { navigate("/builds/sigint-field-spectrum-scanner"); onClose(); },
      badge: "SIGINT",
    },

    // Navigation
    {
      id: "nav-builds",
      category: "Navigation",
      title: "Explore Community Builds",
      subtitle: "Browse custom cyberdecks, androdecks, and field terminals",
      icon: Wrench,
      action: () => { navigate("/builds"); onClose(); },
    },
    {
      id: "nav-parts",
      category: "Navigation",
      title: "Parts Catalog & Prices",
      subtitle: "Search 50+ SBCs, displays, batteries, and mechanical keyboards",
      icon: Cpu,
      action: () => { navigate("/parts"); onClose(); },
    },
  ];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      soundFx.playPaletteOpen();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          onClose(); // toggle
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
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-150">
      <div
        className="bg-gray-950 border-2 border-neon-green/40 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-sans relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800 bg-gray-900/60">
          <Search className="w-5 h-5 text-neon-green" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool, preset, or part... (↑↓ to navigate, Enter to open)"
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 font-mono">
              No matching commands or tools found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-neon-green/10 border border-neon-green/40 text-white"
                      : "hover:bg-gray-900/80 border border-transparent text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-neon-green text-gray-950" : "bg-gray-900 text-neon-green"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-800 text-cyan-400 border border-gray-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{item.category}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-neon-green" : "text-gray-600"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-950 border-t border-gray-900 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>Decksmith Command Palette</span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
