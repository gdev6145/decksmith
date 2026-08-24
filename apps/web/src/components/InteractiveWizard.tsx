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
  Award,
  Calculator,
  Compass as CompassIcon,
  Check,
  Flame,
  BatteryCharging,
  Sliders,
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

interface ArchetypeQuizOption {
  label: string;
  tag: string;
}

interface ArchetypeQuizQuestion {
  question: string;
  options: ArchetypeQuizOption[];
}

const QUIZ_QUESTIONS: ArchetypeQuizQuestion[] = [
  {
    question: "What is your primary cyberdeck mission?",
    options: [
      { label: "Tactical Field Recon & RF Spectrum Scanning", tag: "sdr" },
      { label: "Offline Disaster Recovery & Survival Airgap", tag: "survival" },
      { label: "Portable Coding & Software Engineering Workstation", tag: "workstation" },
      { label: "Live Chiptune Performance & Synthesizer Station", tag: "synth" },
    ],
  },
  {
    question: "What is your preferred enclosure form-factor?",
    options: [
      { label: "Heavy-Duty IP67 Rugged Hard Case (Pelican / Nanuk)", tag: "rugged" },
      { label: "Sleek Stretched Cyberpunk Wedge (3D Printed)", tag: "wedge" },
      { label: "Split Ergonomic Cyber-Tablet with Kickstand", tag: "split" },
    ],
  },
  {
    question: "What is your power autonomy priority?",
    options: [
      { label: "Maximum Runtime (LiFePO4 + Solar MPPT Harvesting)", tag: "solar" },
      { label: "Ultra-Lightweight & Compact (USB-PD 20W Power Bank)", tag: "pd" },
      { label: "24/7 Continuous Uninterruptible Power (Dual 18650 UPS)", tag: "ups" },
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
  const [activeTab, setActiveTab] = useState<"quests" | "quiz" | "calc" | "badges">("quests");
  const [activeTrackId, setActiveTrackId] = useState<string>("beginner-deck");
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ title: string; desc: string; sbc: string; screen: string; battery: string; budget: string } | null>(null);

  // Quick Calculator State
  const [calcMah, setCalcMah] = useState<number>(10000);
  const [calcVolts, setCalcVolts] = useState<number>(3.7);
  const [calcWatts, setCalcWatts] = useState<number>(7.5);
  const [calcFreqMhz, setCalcFreqMhz] = useState<number>(915);

  const activeTrack = WIZARD_TRACKS.find((t) => t.id === activeTrackId) || WIZARD_TRACKS[0];
  const step = activeTrack.steps[currentStepIdx] || activeTrack.steps[0];

  useEffect(() => {
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

  // Quiz Calculation
  const handleSelectQuizOption = (qIdx: number, oIdx: number) => {
    soundFx.playClick();
    const updated = [...quizAnswers];
    updated[qIdx] = oIdx;
    setQuizAnswers(updated);

    if (updated.length === QUIZ_QUESTIONS.length && !updated.includes(undefined as any)) {
      calculateQuizResult(updated);
    }
  };

  const calculateQuizResult = (answers: number[]) => {
    soundFx.playConfirm();
    if (answers[0] === 0) {
      // Recon
      setQuizResult({
        title: "The Signal Recon Spectre Mk IV",
        desc: "Tactical wideband RF spectrum hunter equipped with HackRF One SDR, 8.8\" stretched display, and GPS Stratum-1 PPS receiver.",
        sbc: "Raspberry Pi 5 8GB / Rock 5B",
        screen: "8.8\" 1920x480 Stretched Bar Touch LCD",
        battery: "21700 4S 5000mAh Pack (72 Wh)",
        budget: "$240 - $380",
      });
    } else if (answers[0] === 1) {
      // Survival
      setQuizResult({
        title: "The Solar Airgap Vanguard",
        desc: "Hardened disaster recovery station with zero-standby-power 10.3\" E-Ink display, LiFePO4 battery, and MPPT solar charging.",
        sbc: "Milk-V Mars RISC-V / RPi Zero 2 W",
        screen: "10.3\" Carta 1200 E-Ink Display",
        battery: "12V 6Ah LiFePO4 Rugged Pack",
        budget: "$180 - $290",
      });
    } else if (answers[0] === 3) {
      // Synth
      setQuizResult({
        title: "The Chiptune Cyber-Console",
        desc: "High-fidelity portable chiptune workstation with TI PCM5102A 32-bit DAC, 60% ortholinear mechanical matrix, and dual rotary encoders.",
        sbc: "Khadas VIM4 / Orange Pi 5 Plus",
        screen: "7.0\" 1024x600 IPS Touch Screen",
        battery: "USB-PD 20,000mAh Power Bank",
        budget: "$195 - $320",
      });
    } else {
      // Workstation
      setQuizResult({
        title: "The Heavyweight Field Workstation",
        desc: "Crushproof Pelican 1150 workstation powered by octa-core ARM / x86, dual NVMe PCIe storage, and mechanical Kailh low-profile keyboard.",
        sbc: "Radxa Rock 5B+ (RK3588, 16GB RAM)",
        screen: "11.9\" 320x1480 Long Optical Bar Touch Display",
        battery: "Samsung 50S 21700 Sled Pack",
        budget: "$280 - $450",
      });
    }
  };

  // Quick Calculator Formulas
  const batteryWh = (calcMah * calcVolts) / 1000;
  const batteryHours = calcWatts > 0 ? batteryWh / calcWatts : 0;
  const antennaWhipMm = calcFreqMhz > 0 ? (299792 / calcFreqMhz / 4) * 0.95 : 0;

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
                Decksmith Mission Guide & Wizard
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  v2.0 Advanced
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

        {/* Mode Navigation Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-950/60 p-2 gap-1.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("quests");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "quests"
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Studio Quests
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("quiz");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "quiz"
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <CompassIcon className="w-3.5 h-3.5" />
            Deck Archetype Quiz
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("calc");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "calc"
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Pocket Calculators
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("badges");
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "badges"
                ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Builder Badges
          </button>
        </div>

        {/* Tab 1: Studio Quests */}
        {activeTab === "quests" && (
          <>
            {/* Track Selector */}
            <div className="flex border-b border-gray-800 bg-gray-950/40 overflow-x-auto p-1.5 gap-1.5">
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
                    className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-mono text-left transition-all border ${
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

            {/* Quest Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-gray-800 text-neon-green border border-neon-green/20">
                  {step.badge}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  Step {currentStepIdx + 1} of {activeTrack.steps.length}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl bg-gray-900 border border-gray-800 ${step.color} shadow-lg shrink-0`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">{step.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 font-mono flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                  <span>{step.proTip}</span>
                </div>
              </div>

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

              <div className="flex items-center gap-1.5">
                {activeTrack.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      soundFx.playClick();
                      setCurrentStepIdx(i);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentStepIdx ? "bg-neon-green w-6" : i < currentStepIdx ? "bg-emerald-700" : "bg-gray-800"
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
          </>
        )}

        {/* Tab 2: Deck Archetype Quiz */}
        {activeTab === "quiz" && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {!quizResult ? (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white font-mono uppercase">Interactive Cyberdeck Diagnostic</h3>
                  <p className="text-xs text-gray-400 font-mono">Answer 3 questions to discover your ideal hardware architecture</p>
                </div>

                <div className="space-y-5">
                  {QUIZ_QUESTIONS.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3">
                      <h4 className="text-xs font-bold font-mono text-neon-green uppercase">
                        Q{qIdx + 1}. {q.question}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isChosen = quizAnswers[qIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                              className={`p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                                isChosen
                                  ? "border-neon-green bg-emerald-950/50 text-white font-bold"
                                  : "border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700"
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isChosen && <Check className="w-4 h-4 text-neon-green" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-950 rounded-2xl border border-neon-green/40 space-y-5 shadow-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-neon-green text-black uppercase">
                    Recommended Architecture
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">{quizResult.title}</h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">{quizResult.desc}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-gray-800">
                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase block">Recommended SBC</span>
                    <span className="text-cyan-300 font-bold">{quizResult.sbc}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase block">Display Panel</span>
                    <span className="text-yellow-400 font-bold">{quizResult.screen}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase block">Battery System</span>
                    <span className="text-purple-400 font-bold">{quizResult.battery}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase block">Estimated BOM</span>
                    <span className="text-neon-green font-bold">{quizResult.budget}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setQuizResult(null);
                      setQuizAnswers([]);
                    }}
                    className="flex-1 py-3 rounded-xl border border-gray-800 bg-gray-900 text-xs font-mono text-gray-400 hover:text-white"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playConfirm();
                      navigate("/builder");
                      onClose();
                    }}
                    className="flex-1 py-3 rounded-xl bg-neon-green text-black font-bold font-mono text-xs hover:bg-neon-green/90 flex items-center justify-center gap-1.5"
                  >
                    <span>Load in Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pocket Calculators */}
        {activeTab === "calc" && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Battery Autonomy Calculator */}
            <div className="p-5 bg-gray-950 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h4 className="text-xs font-bold font-mono text-yellow-400 uppercase flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4" />
                  Battery Runtime Quick Estimator
                </h4>
                <span className="text-sm font-black font-mono text-neon-green">
                  {batteryHours.toFixed(1)} Hours Runtime
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Capacity (mAh)</label>
                  <input
                    type="number"
                    value={calcMah}
                    onChange={(e) => setCalcMah(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Nominal (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcVolts}
                    onChange={(e) => setCalcVolts(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Deck Power (W)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calcWatts}
                    onChange={(e) => setCalcWatts(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Pack Energy: {batteryWh.toFixed(1)} Wh · Estimated for 80% Depth of Discharge.</p>
            </div>

            {/* Antenna λ/4 Calculator */}
            <div className="p-5 bg-gray-950 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Quarter-Wave (λ/4) Antenna Resonator
                </h4>
                <span className="text-sm font-black font-mono text-cyan-300">
                  {antennaWhipMm.toFixed(1)} mm ({ (antennaWhipMm / 25.4).toFixed(2) }")
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">Target Frequency:</span>
                  <span className="text-neon-green font-bold">{calcFreqMhz} MHz</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  {[433, 868, 915, 2400].map((f) => (
                    <button
                      key={f}
                      onClick={() => setCalcFreqMhz(f)}
                      className={`p-2 rounded-lg border text-center font-bold ${
                        calcFreqMhz === f ? "border-indigo-400 bg-indigo-950 text-white" : "border-gray-800 bg-gray-900 text-gray-400"
                      }`}
                    >
                      {f} MHz
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Builder Badges */}
        {activeTab === "badges" && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white font-mono uppercase">Cyberdeck Builder Achievements</h3>
              <p className="text-xs text-gray-400 font-mono">Unlock milestones as you architect, calculate, and fabricate hardware</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Novice Blueprint Architect", desc: "Designed a 10-slot modular cyberdeck", icon: Cpu, color: "text-neon-green", unlocked: true },
                { name: "Brownout Defender", desc: "Sized solid polymer decoupling caps in /power", icon: Zap, color: "text-yellow-400", unlocked: true },
                { name: "3D CAD Fabricator", desc: "Generated parametric OpenSCAD scripts", icon: Crosshair, color: "text-cyan-400", unlocked: true },
                { name: "Signal Spectrum Hunter", desc: "Monitored SDR waterfalls & tuned antenna", icon: Radio, color: "text-indigo-400", unlocked: true },
                { name: "Atomic Clock Chrony", desc: "Configured Stratum-1 PPS GPS timekeeping", icon: Compass, color: "text-purple-400", unlocked: true },
                { name: "Airgap Sovereign", desc: "Generated offline disaster recovery manual", icon: ShieldAlert, color: "text-rose-400", unlocked: true },
              ].map((badge, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-950 border border-gray-800 flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl bg-gray-900 border border-gray-800 ${badge.color}`}>
                    <badge.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white font-mono">{badge.name}</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{badge.desc}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-neon-green border border-neon-green/30">
                      ✓ UNLOCKED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
