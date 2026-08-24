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
} from "lucide-react";
import { API_URL } from "../lib/config";

const studioSuites = [
  {
    icon: Sparkles,
    badge: "Interactive Architect",
    title: "Blueprint Studio",
    description: "10-slot modular cyberdeck creator with live power drain, weight calculation, pinout validation, and parts shopping cart.",
    link: "/builder",
    color: "text-neon-green",
    borderColor: "border-neon-green/30 hover:border-neon-green",
    glow: "hover:shadow-neon-green/20",
  },
  {
    icon: Crosshair,
    badge: "3D & Laser Vectors",
    title: "CAD & CNC Studio",
    description: "Interactive 3D WebGL orbit viewer, exploded assembly view, DXF laser-cut vector exporter, and 3D printable STL enclosure generator.",
    link: "/cad",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30 hover:border-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: HardDrive,
    badge: "Zero-Touch Boot",
    title: "OS Flasher Companion",
    description: "Custom display modelines (hdmi_timings for ultrawide screens), cloud-init Wi-Fi/SSH pre-seeding, and kiosk mode auto-start configs.",
    link: "/flasher",
    color: "text-purple-400",
    borderColor: "border-purple-500/30 hover:border-purple-400",
    glow: "hover:shadow-purple-500/20",
  },
  {
    icon: Activity,
    badge: "Live Telemetry",
    title: "Field Companion & Diagnostics",
    description: "Real-time I2C bus scanner, battery drain curve, 9-DOF IMU attitude compass, BIST hardware self-tests, and python daemon.",
    link: "/companion",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/30 hover:border-yellow-400",
    glow: "hover:shadow-yellow-500/20",
  },
  {
    icon: Calculator,
    badge: "Storage Arrays",
    title: "RAID & NAS Calculator",
    description: "Multi-drive usable storage, fault tolerance, parity overhead, and rebuild risk analyzer for private cloud builds.",
    link: "/calculator",
    color: "text-blue-400",
    borderColor: "border-blue-500/30 hover:border-blue-400",
    glow: "hover:shadow-blue-500/20",
  },
  {
    icon: MessageSquare,
    badge: "AI Co-Pilot",
    title: "AI Hardware Architect",
    description: "Multi-turn hardware recommendations, pinout debugging, solar panel calculations, and component discovery.",
    link: "/chat",
    color: "text-rose-400",
    borderColor: "border-rose-500/30 hover:border-rose-400",
    glow: "hover:shadow-rose-500/20",
  },
];

const stats = [
  { label: "SBCs & SoCs", value: "50+", icon: Cpu },
  { label: "Displays & Bars", value: "30+", icon: Monitor },
  { label: "BMS & Batteries", value: "25+", icon: Battery },
  { label: "Fabrication Formats", value: "DXF · STL · SCAD", icon: FileCode },
];

const templates = [
  {
    title: "Shadow Netrunner MK-IV",
    tagline: "SBC · ULTRAWIDE BAR · BBQ20",
    image: "https://cdn-shop.adafruit.com/310x233/6447-00.jpg",
    description: "Portable intrusion and signal-hunting terminal with ultrawide bar display, tactile QWERTY keypad, and dual-band Wi-Fi.",
    type: "Cyberdeck",
    tags: ["cyberpunk", "ultrawide", "portable", "sdr"],
    slug: "shadow-netrunner-mk-iv",
  },
  {
    title: "Solar Off-Grid Field Comms Deck",
    tagline: "E-INK · LORA 915MHZ · SOLAR",
    image: "https://cdn-shop.adafruit.com/310x233/4295-05.jpg",
    description: "Sunlight-readable field communications deck with 2.9-inch E-Ink display, Meshtastic LoRa radio, and folding solar charging.",
    type: "Cyberdeck",
    tags: ["solar", "lora", "e-ink", "off-grid", "meshtastic"],
    slug: "solar-off-grid-field-comms-deck",
  },
  {
    title: "Silent 4-Bay Micro ZFS Server",
    tagline: "CM4 · 4TB NAS · NOCTUA",
    image: "https://cdn-shop.adafruit.com/310x233/3400-06.jpg",
    description: "Ultra-reliable mini-ITX private cloud and backup array with 4TB NAS storage drives and PWM cooling.",
    type: "NAS",
    tags: ["nas", "zfs", "truenas", "storage-pool", "raid"],
    slug: "silent-4-bay-micro-zfs-server",
  },
  {
    title: "SIGINT Field Spectrum Scanner",
    tagline: "ROCK 5B · HACKRF ONE · PELICAN",
    image: "https://cdn-shop.adafruit.com/310x233/1566-11.jpg",
    description: "Wideband RF interception and SIGINT platform powered by HackRF One (1MHz–6GHz) and high-gain Yagi antenna.",
    type: "Cyberdeck",
    tags: ["sdr", "sigint", "hackrf", "rf-scanner"],
    slug: "sigint-field-spectrum-scanner",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neon-green/10 text-neon-green border border-neon-green/30">
          <Sparkles className="w-3.5 h-3.5" />
          The Open-Source Cyberdeck Engineering Suite
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Design, Fabricate & Flash Your Custom{" "}
          <span className="bg-gradient-to-r from-neon-green via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Cyberdeck
          </span>
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
          From schematic layout and 3D exploded CAD bezels to first-boot OS flashing and live sensor telemetry — everything you need to build next-generation field computers.
        </p>

        <div className="flex flex-wrap gap-3.5 justify-center pt-2">
          <Link
            to="/builder"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-green text-gray-950 font-black rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-neon-green/20 text-sm"
          >
            Launch Blueprint Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/cad"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 border border-gray-700 text-gray-200 font-bold rounded-xl hover:bg-gray-800 hover:border-cyan-400 transition-all text-sm"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
            Open 3D CAD Studio
          </Link>
          <Link
            to="/flasher"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 border border-gray-700 text-gray-200 font-bold rounded-xl hover:bg-gray-800 hover:border-purple-400 transition-all text-sm"
          >
            <HardDrive className="w-4 h-4 text-purple-400" />
            OS Flasher
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center p-5 bg-gray-900/60 rounded-xl border border-gray-800">
              <Icon className="w-6 h-6 mx-auto mb-2 text-neon-green" />
              <div className="text-2xl font-black text-white font-mono">{stat.value}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* 6 Studio Suites */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-neon-green" />
            Full-Stack Cyberdeck Engineering Suite
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Purpose-built fabrication, schematic, and software tooling designed for hardware hackers and field technicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studioSuites.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                to={s.link}
                className={`group p-6 bg-gray-900/70 rounded-2xl border transition-all shadow-lg flex flex-col justify-between ${s.borderColor} ${s.glow}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${s.color}`} />
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-neon-green transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neon-green transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Verified Blueprints */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Verified Community Blueprints
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Battle-tested designs ready to 1-click fork, customize, or export to CAD.
            </p>
          </div>
          <Link
            to="/builds"
            className="text-xs font-bold text-neon-green hover:underline flex items-center gap-1"
          >
            View All Builds →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((tpl) => (
            <Link
              key={tpl.title}
              to={`/builds/${tpl.slug}`}
              className="group bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden hover:border-neon-green/50 transition-all hover:shadow-xl hover:shadow-neon-green/10 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video bg-gray-800 overflow-hidden relative">
                  <img
                    src={tpl.image}
                    alt={tpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-gray-950/80 backdrop-blur text-neon-green font-bold border border-neon-green/30">
                    {tpl.type}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <p className="text-[10px] font-mono font-bold text-neon-green tracking-wide">{tpl.tagline}</p>
                  <h3 className="font-bold text-white text-sm group-hover:text-neon-green transition-colors line-clamp-1">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{tpl.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex flex-wrap gap-1 mt-2">
                  {tpl.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
