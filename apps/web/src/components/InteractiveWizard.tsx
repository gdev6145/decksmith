import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Zap,
  ShieldAlert,
  Crosshair,
  HardDrive,
  Radio,
  Compass,
  Router as RouterIcon,
  Activity,
  Layers,
  Music,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface WizardStep {
  title: string;
  badge: string;
  path: string;
  icon: React.ElementType;
  color: string;
  description: string;
  proTip: string;
  actionText: string;
}

interface WizardTrack {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  steps: WizardStep[];
}

const WIZARD_TRACKS: WizardTrack[] = [
  {
    id: "beginner-deck",
    name: "1. The Rookie Deckbuilder's Quest",
    subtitle: "From selecting an SBC to 3D printing and flashing your OS",
    icon: Sparkles,
    steps: [
      {
        title: "Step 1: Architect in 10-Slot Blueprint Studio",
        badge: "Hardware Selection",
        path: "/builder",
        icon: Cpu,
        color: "text-neon-green",
        description: "Choose your core SBC (Raspberry Pi 5, Rock 5B, Milk-V Mars RISC-V), display panel, keyboard, and chassis from 110+ verified components. Decksmith calculates real-time power draw, weight, and battery runtime.",
        proTip: "Tip: Watch the live 3D preview update as you pick different display and keyboard form factors!",
        actionText: "Open Blueprint Studio",
      },
      {
        title: "Step 2: Calculate Power & Transient Brownouts",
        badge: "Power Delivery",
        path: "/power",
        icon: Zap,
        color: "text-yellow-400",
        description: "Verify your DC buck converters, calculate AWG wire voltage drop, and simulate step-load transient brownout voltage droops. Size low-ESR solid polymer decoupling caps to prevent CPU resets.",
        proTip: "Tip: Keep transient droop under 0.25V to prevent SD card corruption during sudden Wi-Fi/NPU bursts.",
        actionText: "Check Power Delivery",
      },
      {
        title: "Step 3: Generate Parametric 3D CAD & Slicer Files",
        badge: "3D Fabrication",
        path: "/cad",
        icon: Crosshair,
        color: "text-cyan-400",
        description: "Generate millimeter-accurate parametric OpenSCAD scripts, laser-cut DXF/SVG panel bezels, and 3D printable STL models fitted precisely to your chosen display and keyboard layout.",
        proTip: "Tip: You can preview and slice your STL directly in the 3D Print Studio (/stl)!",
        actionText: "Generate 3D CAD",
      },
      {
        title: "Step 4: Flash Linux & Stretched Bar Display Timings",
        badge: "OS Provisioning",
        path: "/flasher",
        icon: HardDrive,
        color: "text-purple-400",
        description: "Calculate custom HDMI modelines for ultra-wide stretched bar LCDs (e.g. 1920x480, 1280x400) and export turnkey /boot/firmware/config.txt and systemd auto-login configurations.",
        proTip: "Tip: Copy the generated config.txt directly to your micro-SD card boot partition.",
        actionText: "Open OS Flasher",
      },
      {
        title: "Step 5: Export Airgap Survival Manuals & KiCad Netlists",
        badge: "Disaster Readiness",
        path: "/survival",
        icon: ShieldAlert,
        color: "text-rose-400",
        description: "Generate a standalone offline single-file HTML disaster manual with all your wiring diagrams, calculate sub-zero battery Peukert derating, and export a KiCad 8.0 PCB schematic netlist.",
        proTip: "Tip: Save the offline HTML manual to a USB drive in your emergency go-bag!",
        actionText: "Open Airgap Survival",
      },
    ],
  },
  {
    id: "rf-comms",
    name: "2. RF Spectrum, GPS & Mesh Networking",
    subtitle: "SDR waterfall monitoring, satellite tracking, and OpenWrt routers",
    icon: Radio,
    steps: [
      {
        title: "Step 1: Monitor RF Waterfall & Antenna Tuning",
        badge: "SDR Spectrum",
        path: "/sdr",
        icon: Radio,
        color: "text-indigo-400",
        description: "Inspect live animated RF spectrogram waterfalls, calculate resonant quarter-wave (λ/4) antenna lengths, and export GQRX & SDR# frequency bookmark lists.",
        proTip: "Tip: Use the antenna tuner to trim your 915 MHz LoRa or 433 MHz ISM whips with zero SWR reflection.",
        actionText: "Open SDR Studio",
      },
      {
        title: "Step 2: Polar Radar Satellite Tracking & Stratum-1 NTP",
        badge: "GNSS Radar",
        path: "/gps",
        icon: Compass,
        color: "text-neon-green",
        description: "Track GPS, Galileo, GLONASS, and BeiDou satellite constellations on an interactive 360° polar skyplot radar, decode live NMEA-0183 sentences, and export Stratum-1 PPS chrony NTP atomic clock sync configs.",
        proTip: "Tip: Connect a hardware GPS PPS pin to GPIO 18 for microsecond-accurate offline timekeeping.",
        actionText: "Open GPS Tracker",
      },
      {
        title: "Step 3: Custom Router & Firewall Gateway Studio",
        badge: "Edge Routing",
        path: "/router",
        icon: RouterIcon,
        color: "text-cyan-400",
        description: "Architect high-performance OpenWrt/pfSense routers (BPI-R4 10G, NanoPi R6S), benchmark WireGuard throughput vs Cake SQM overhead, and export UCI network firewall configurations.",
        proTip: "Tip: Enable isolated guest/IoT VLANs to sandbox insecure devices in field deployments.",
        actionText: "Open Router Studio",
      },
    ],
  },
  {
    id: "hardware-hacking",
    name: "3. Hardware Bus Hacking & Logic Analysis",
    subtitle: "Pinout multiplexing, 4-channel logic waveforms, and audio DSP",
    icon: Activity,
    steps: [
      {
        title: "Step 1: 40-Pin GPIO Header & Device Tree Overlays",
        badge: "GPIO Pinout",
        path: "/pinout",
        icon: Cpu,
        color: "text-cyan-400",
        description: "Explore the interactive double-row 40-pin header with full ALT0–ALT5 peripheral functions, power/ground safety checks, and auto-generated Device Tree overlay snippets.",
        proTip: "Tip: Filter by I2C or SPI to highlight only the relevant bus pins on the board header.",
        actionText: "Open GPIO Studio",
      },
      {
        title: "Step 2: 4-Channel Logic Analyzer & Bus Sniffer",
        badge: "Digital Logic",
        path: "/logic",
        icon: Activity,
        color: "text-neon-green",
        description: "Capture and analyze digital I2C, SPI, and UART waveforms in real time, inspect timing packet annotations, and export PulseView/sigrok logic traces.",
        proTip: "Tip: Use the timebase zoom slider to inspect individual bit clock transitions at 10µs resolution.",
        actionText: "Open Logic Analyzer",
      },
      {
        title: "Step 3: Tactical Wiring Harness & Loom Designer",
        badge: "Wire Harness",
        path: "/harness",
        icon: Layers,
        color: "text-indigo-400",
        description: "Design pin-to-pin wiring interconnects, auto-generate crimp connector BOMs (JST-XH, Dupont, Molex), and export graphical WireViz YAML schematics.",
        proTip: "Tip: Follow the color-coded standards (Red=5V, Orange=3.3V, Black=GND) to avoid polarity blowouts.",
        actionText: "Open Harness Studio",
      },
      {
        title: "Step 4: Cyberdeck Audio DSP & Chiptune Synth",
        badge: "Audio Tracker",
        path: "/synth",
        icon: Music,
        color: "text-rose-400",
        description: "Compose live 16-step cyberpunk tracker sequences, adjust resonant lowpass filter cutoffs, and configure hardware I2S DACs with Linux ALSA /etc/asound.conf configs.",
        proTip: "Tip: Try the 'Cyberpunk Phrygian' scale mode for instant dystopian chiptune vibes.",
        actionText: "Open Audio Synth",
      },
    ],
  },
];

export default function InteractiveWizard({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [activeTrackId, setActiveTrackId] = useState<string>("beginner-deck");
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const activeTrack = WIZARD_TRACKS.find((t) => t.id === activeTrackId) || WIZARD_TRACKS[0];
  const step = activeTrack.steps[currentStepIdx] || activeTrack.steps[0];

  useEffect(() => {
    // Reset step index when changing tracks
    setCurrentStepIdx(0);
  }, [activeTrackId]);

  if (!isOpen) return null;

  const handleNext = () => {
    soundFx.playClick();
    if (currentStepIdx < activeTrack.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      soundFx.playConfirm();
      onClose();
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleJumpToStudio = () => {
    soundFx.playConfirm();
    navigate(step.path);
    onClose();
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase font-mono tracking-wider flex items-center gap-2">
                Decksmith Mission Guide
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Interactive Wizard
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">Master cyberdeck hardware, CAD, power, and field tools</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-950/60 overflow-x-auto p-1.5 gap-1.5">
          {WIZARD_TRACKS.map((track) => {
            const TrackIcon = track.icon;
            const isSelected = track.id === activeTrackId;
            return (
              <button
                key={track.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTrackId(track.id);
                }}
                className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-mono text-left transition-all border ${
                  isSelected
                    ? "border-neon-green bg-emerald-950/40 text-white font-bold"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <TrackIcon className={`w-3.5 h-3.5 ${isSelected ? "text-neon-green" : "text-gray-500"}`} />
                  <span className="truncate">{track.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step Counter & Badge */}
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-gray-800 text-neon-green border border-neon-green/20">
              {step.badge}
            </span>
            <span className="text-xs font-mono text-gray-400">
              Step {currentStepIdx + 1} of {activeTrack.steps.length}
            </span>
          </div>

          {/* Step Main Card */}
          <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-3.5 rounded-2xl bg-gray-900 border border-gray-800 ${step.color} shadow-lg shrink-0`}>
                <StepIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">{step.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 font-mono flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
              <span>{step.proTip}</span>
            </div>
          </div>

          {/* Direct Action Button */}
          <button
            onClick={handleJumpToStudio}
            className="w-full py-3.5 rounded-xl bg-neon-green text-black font-bold font-mono text-sm hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-neon-green/20"
          >
            <span>{step.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {activeTrack.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  soundFx.playClick();
                  setCurrentStepIdx(i);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentStepIdx
                    ? "bg-neon-green w-6"
                    : i < currentStepIdx
                    ? "bg-emerald-700"
                    : "bg-gray-800"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-mono text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>{currentStepIdx === activeTrack.steps.length - 1 ? "Finish Quest" : "Next"}</span>
            <ChevronRight className="w-4 h-4 text-neon-green" />
          </button>
        </div>
      </div>
    </div>
  );
}
