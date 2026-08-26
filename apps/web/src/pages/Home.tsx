import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Wrench,
  Cpu,
  ArrowRight,
  Zap,
  Battery,
  Monitor,
  Crosshair,
  Sparkles,
  HardDrive,
  Activity,
  Layers,
  Shield,
  Radio,
  FileCode,
  Terminal,
  Calculator,
  Search,
  Sun,
  Flame,
  QrCode,
  Printer,
  Compass,
  Router as RouterIcon,
  ShieldAlert,
  Music,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sliders,
  Usb,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface StudioItem {
  icon: any;
  badge: string;
  title: string;
  description: string;
  link: string;
  category: "core" | "fabrication" | "power" | "wireless" | "firmware" | "audio";
  color: string;
  borderColor: string;
  glow: string;
}

const allStudios: StudioItem[] = [
  {
    icon: Sparkles,
    badge: "Interactive Architect",
    title: "10-Slot Blueprint Studio",
    description: "Design modular cyberdecks with live power drain, weight budget, pinout validation, and parts shopping cart.",
    link: "/builder",
    category: "core",
    color: "text-neon-green",
    borderColor: "border-neon-green/40 hover:border-neon-green",
    glow: "hover:shadow-neon-green/20",
  },
  {
    icon: Crosshair,
    badge: "3D & Laser Vectors",
    title: "CAD & CNC Studio",
    description: "Interactive 3D WebGL orbit viewer, exploded assembly view, DXF laser-cut vector exporter, and 3D printable STL enclosure generator.",
    link: "/cad",
    category: "fabrication",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40 hover:border-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: HardDrive,
    badge: "Zero-Touch Boot",
    title: "OS Flasher & Modelines",
    description: "Custom display modelines (hdmi_timings for bar LCDs), cloud-init Wi-Fi/SSH pre-seeding, and kiosk auto-start scripts.",
    link: "/flasher",
    category: "firmware",
    color: "text-purple-400",
    borderColor: "border-purple-500/40 hover:border-purple-400",
    glow: "hover:shadow-purple-500/20",
  },
  {
    icon: Activity,
    badge: "Live Telemetry",
    title: "Field Companion & Diagnostics",
    description: "Real-time I2C bus scanner, battery drain curve, 9-DOF IMU attitude compass, BIST hardware self-tests, and python daemon.",
    link: "/companion",
    category: "firmware",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    glow: "hover:shadow-emerald-500/20",
  },
  {
    icon: Activity,
    badge: "Waveform Decoder",
    title: "Logic Analyzer & Bus Sniffer",
    description: "4-channel digital waveform timing analyzer with protocol decoders for I2C (400kHz), SPI (10MHz), UART (115200), and 1-Wire.",
    link: "/logic",
    category: "firmware",
    color: "text-neon-green",
    borderColor: "border-neon-green/40 hover:border-neon-green",
    glow: "hover:shadow-neon-green/20",
  },
  {
    icon: Usb,
    badge: "WebSerial Link",
    title: "Serial Terminal & MCU Flasher",
    description: "Direct in-browser USB serial connection, live ASCII/Hex debug monitor, and firmware flasher for RP2040, ESP32, and Arduino.",
    link: "/serial",
    category: "firmware",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40 hover:border-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: Music,
    badge: "Chiptune Tracker",
    title: "Audio DSP & Chiptune Synth",
    description: "16-step tracker chiptune synthesizer with resonant lowpass filter, Cyberpunk scales, I2S DAC profiles, and ALSA config export.",
    link: "/synth",
    category: "audio",
    color: "text-rose-400",
    borderColor: "border-rose-500/40 hover:border-rose-400",
    glow: "hover:shadow-rose-500/20",
  },
  {
    icon: Sun,
    badge: "MPPT Harvester",
    title: "Solar & Off-Grid Studio",
    description: "Solar irradiance simulator, MPPT charge controller sizing, battery autonomy curve, and fold-out array calculator.",
    link: "/solar",
    category: "power",
    color: "text-amber-400",
    borderColor: "border-amber-500/40 hover:border-amber-400",
    glow: "hover:shadow-amber-500/20",
  },
  {
    icon: Radio,
    badge: "Fresnel Analysis",
    title: "RF Link Budget Studio",
    description: "Calculate path loss, Fresnel clearance, LoRa/Wi-Fi EIRP, whip antenna length, and long-range telemetry margins.",
    link: "/rf",
    category: "wireless",
    color: "text-indigo-400",
    borderColor: "border-indigo-500/40 hover:border-indigo-400",
    glow: "hover:shadow-indigo-500/20",
  },
  {
    icon: Flame,
    badge: "Thermal CFD",
    title: "Cooling & Thermals Studio",
    description: "Multi-layer thermal resistance model, heatsink dissipation curves, CFM airflow requirements, and throttling predictor.",
    link: "/cooling",
    category: "fabrication",
    color: "text-rose-400",
    borderColor: "border-rose-500/40 hover:border-rose-400",
    glow: "hover:shadow-rose-500/20",
  },
  {
    icon: Cpu,
    badge: "Interactive Pinout",
    title: "40-Pin GPIO Pinout Studio",
    description: "Interactive pin multiplexer for Raspberry Pi, CM4, Orange Pi 5, Rock 5B, Radxa Zero, and RISC-V SBCs with pin conflict detection.",
    link: "/pinout",
    category: "firmware",
    color: "text-cyan-300",
    borderColor: "border-cyan-500/40 hover:border-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: Zap,
    badge: "BMS & AWG Sizing",
    title: "Power Delivery Studio",
    description: "USB-PD PPS trigger negotiation, 3S/4S BMS pack balancing, buck converter efficiency, and AWG wire gauge ampacity sizing.",
    link: "/power",
    category: "power",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40 hover:border-yellow-400",
    glow: "hover:shadow-yellow-500/20",
  },
  {
    icon: Layers,
    badge: "Wire Loom Builder",
    title: "Wiring Harness Studio",
    description: "Design custom interconnect looms with JST-PH, Molex, Dupont, and Hirose pinouts, netting wire lengths and crimp guides.",
    link: "/harness",
    category: "fabrication",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40 hover:border-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: Radio,
    badge: "Waterfall & FFT",
    title: "SDR & Radio Studio",
    description: "Spectrum waterfall viewer, modulation demodulator, antenna resonance tuner, and SIGINT frequency channel presets.",
    link: "/sdr",
    category: "wireless",
    color: "text-indigo-400",
    borderColor: "border-indigo-500/40 hover:border-indigo-400",
    glow: "hover:shadow-indigo-500/20",
  },
  {
    icon: Compass,
    badge: "GNSS Sky Plot",
    title: "GPS & Satellite Studio",
    description: "Constellation sky plot (GPS, GLONASS, Galileo, BeiDou), HDOP precision analyzer, NMEA sentence parser, and waypoint recorder.",
    link: "/gps",
    category: "wireless",
    color: "text-neon-green",
    borderColor: "border-neon-green/40 hover:border-neon-green",
    glow: "hover:shadow-neon-green/20",
  },
  {
    icon: RouterIcon,
    badge: "OpenWrt Gateway",
    title: "Custom Router Studio",
    description: "Configure dual-NIC SBC gateways, WireGuard mesh VPN endpoints, VLAN segmentation, and captive portals.",
    link: "/router",
    category: "wireless",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40 hover:border-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: ShieldAlert,
    badge: "Offline Survival",
    title: "Airgap Survival Studio",
    description: "Emergency offline archives (KiCad schematics, Wikipedia ZIM, OpenStreetMap data, offline LLMs, radio manuals).",
    link: "/survival",
    category: "core",
    color: "text-rose-400",
    borderColor: "border-rose-500/40 hover:border-rose-400",
    glow: "hover:shadow-rose-500/20",
  },
  {
    icon: Calculator,
    badge: "Storage Arrays",
    title: "RAID & NAS Calculator",
    description: "Multi-drive usable storage, fault tolerance, parity overhead, and rebuild risk analyzer for private cloud builds.",
    link: "/calculator",
    category: "core",
    color: "text-blue-400",
    borderColor: "border-blue-500/40 hover:border-blue-400",
    glow: "hover:shadow-blue-500/20",
  },
  {
    icon: MessageSquare,
    badge: "AI Co-Pilot",
    title: "AI Hardware Architect",
    description: "Multi-turn hardware recommendations, pinout debugging, solar panel calculations, and component discovery.",
    link: "/chat",
    category: "core",
    color: "text-pink-400",
    borderColor: "border-pink-500/40 hover:border-pink-400",
    glow: "hover:shadow-pink-500/20",
  },
];

const stats = [
  { label: "Verified Hardware Parts", value: "112+", icon: Cpu },
  { label: "Engineering Studios", value: "20+", icon: Layers },
  { label: "Real-Time Simulators", value: "Physics & CFD", icon: Activity },
  { label: "Fabrication Formats", value: "DXF · STL · SCAD", icon: FileCode },
];

const templates = [
  {
    title: "Shadow Netrunner MK-IV",
    tagline: "CM4 · 11.9\" BAR LCD · SOFLE V2",
    image: "https://cdn-shop.adafruit.com/310x233/6447-00.jpg",
    description: "Portable intrusion and signal-hunting terminal with ultrawide bar display, tactile split QWERTY keypad, and dual-band Wi-Fi.",
    type: "Cyberdeck",
    tags: ["cyberpunk", "ultrawide", "portable", "sdr"],
    slug: "shadow-netrunner-mk-iv",
  },
  {
    title: "Solar Off-Grid Field Comms Deck",
    tagline: "E-INK · LORA 915MHZ · MPPT SOLAR",
    image: "https://cdn-shop.adafruit.com/310x233/4295-05.jpg",
    description: "Sunlight-readable field communications deck with 3-color E-Ink display, Meshtastic LoRa radio, and folding solar charging.",
    type: "Cyberdeck",
    tags: ["solar", "lora", "e-ink", "off-grid", "meshtastic"],
    slug: "solar-off-grid-field-comms-deck",
  },
  {
    title: "Silent 4-Bay Micro ZFS Server",
    tagline: "CM4 · 4TB NAS · NOCTUA PWM",
    image: "https://cdn-shop.adafruit.com/310x233/3400-06.jpg",
    description: "Ultra-reliable mini-ITX private cloud and backup array with 4TB NAS storage drives and PWM cooling.",
    type: "NAS",
    tags: ["nas", "zfs", "truenas", "storage-pool", "raid"],
    slug: "silent-4-bay-micro-zfs-server",
  },
  {
    title: "SIGINT Field Spectrum Scanner",
    tagline: "ROCK 5B · HACKRF ONE · PELICAN 1150",
    image: "https://cdn-shop.adafruit.com/310x233/1566-11.jpg",
    description: "Wideband RF interception and SIGINT platform powered by HackRF One (1MHz–6GHz) and high-gain whip antenna.",
    type: "Cyberdeck",
    tags: ["sdr", "sigint", "hackrf", "rf-scanner"],
    slug: "sigint-field-spectrum-scanner",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStudios = allStudios.filter((s) => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-neon-green/10 text-neon-green border border-neon-green/30 shadow-lg shadow-neon-green/10 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          The Open-Source Cyberdeck Engineering & Fabrication Suite
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight font-mono">
          Design, Fabricate & Flash Your Custom{" "}
          <span className="bg-gradient-to-r from-neon-green via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Cyberdeck
          </span>
        </h1>
        <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          From schematic layout and 3D exploded CAD bezels to logic bus sniffing, chiptune synthesis, and live field telemetry — everything you need to build next-generation field computers.
        </p>

        {/* Hero Quick Launch Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link
            to="/builder"
            onClick={() => soundFx.playConfirm()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neon-green text-gray-950 font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-neon-green/20 text-sm font-mono"
          >
            <Sparkles className="w-4 h-4" />
            Launch Blueprint Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/cad"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-900 border border-gray-700 text-gray-200 font-bold rounded-2xl hover:bg-gray-800 hover:border-cyan-400 transition-all text-sm font-mono"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
            3D CAD & CNC
          </Link>
          <Link
            to="/logic"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-900 border border-gray-700 text-gray-200 font-bold rounded-2xl hover:bg-gray-800 hover:border-neon-green transition-all text-sm font-mono"
          >
            <Activity className="w-4 h-4 text-neon-green" />
            Logic Analyzer
          </Link>
          <Link
            to="/synth"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-900 border border-gray-700 text-gray-200 font-bold rounded-2xl hover:bg-gray-800 hover:border-rose-400 transition-all text-sm font-mono"
          >
            <Music className="w-4 h-4 text-rose-400" />
            Audio Synth
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center p-5 bg-gray-900/80 rounded-2xl border border-gray-800 backdrop-blur-sm">
              <Icon className="w-6 h-6 mx-auto mb-2 text-neon-green" />
              <div className="text-2xl font-black text-white font-mono">{stat.value}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* 20+ Specialized Studios Directory with Category Filters */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 font-mono">
              <Layers className="w-6 h-6 text-neon-green" />
              20+ Cyberdeck Engineering Studios
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono">
              Purpose-built fabrication, schematic, and software tooling designed for hardware hackers and field operatives.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search 20+ studios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white font-mono placeholder-gray-500 focus:border-neon-green focus:outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
          {[
            { id: "all", label: "All Studios (20+)" },
            { id: "core", label: "Core & Planning" },
            { id: "fabrication", label: "Fabrication & CAD" },
            { id: "firmware", label: "Firmware & Logic" },
            { id: "power", label: "Power & Solar" },
            { id: "wireless", label: "RF & Wireless" },
            { id: "audio", label: "Audio & Media" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveCategory(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeCategory === tab.id
                  ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Studio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudios.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                to={s.link}
                onClick={() => soundFx.playClick()}
                className={`group p-6 bg-gray-900/80 rounded-2xl border transition-all shadow-xl flex flex-col justify-between backdrop-blur-sm ${s.borderColor} ${s.glow}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-center group-hover:border-neon-green transition-colors">
                      <Icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-gray-950 border border-gray-800 text-gray-300">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-2 group-hover:text-neon-green transition-colors font-mono">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono">
                    {s.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono font-bold text-gray-400 group-hover:text-white transition-colors">
                  <span>Open Studio</span>
                  <ChevronRight className="w-4 h-4 text-neon-green group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Verified Cyberdeck Build Blueprints */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 font-mono">
              <Wrench className="w-6 h-6 text-neon-green" />
              Featured Verified Cyberdeck Blueprints
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono">
              Complete hardware reference designs with verified parts, power benchmarks, and CAD templates.
            </p>
          </div>
          <Link
            to="/builds"
            onClick={() => soundFx.playClick()}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neon-green hover:underline"
          >
            <span>View All Builds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((tpl) => (
            <Link
              key={tpl.slug}
              to={`/builds/${tpl.slug}`}
              onClick={() => soundFx.playClick()}
              className="group bg-gray-900/80 rounded-2xl border border-gray-800 hover:border-neon-green transition-all overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div className="relative h-44 bg-gray-950 overflow-hidden">
                <img
                  src={tpl.image}
                  alt={tpl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                  {tpl.type}
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-neon-green">{tpl.tagline}</div>
                  <h3 className="text-sm font-bold text-white group-hover:text-neon-green transition-colors mt-0.5 font-mono">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{tpl.description}</p>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-neon-green font-bold">
                  <span>Inspect Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
