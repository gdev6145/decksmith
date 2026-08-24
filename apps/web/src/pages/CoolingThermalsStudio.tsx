import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Wind,
  Cpu,
  Shield,
  Download,
  Copy,
  Check,
  Compass,
  Sliders,
  Sparkles,
  Layers,
  Crosshair,
  Activity,
  Sun,
  Radio,
  Volume2,
  HardDrive,
  Keyboard,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface SocThermalPreset {
  id: string;
  name: string;
  peakTdpWatts: number;
  idleTdpWatts: number;
  throttleTempC: number;
  dieAreaMm2: number;
  description: string;
}

const SOC_PRESETS: SocThermalPreset[] = [
  {
    id: "rpi5",
    name: "Raspberry Pi 5 (BCM2712 Quad Cortex-A76)",
    peakTdpWatts: 12.0,
    idleTdpWatts: 2.7,
    throttleTempC: 80,
    dieAreaMm2: 68.0,
    description: "High performance 16nm SoC. Active cooling strongly recommended inside enclosed chassis.",
  },
  {
    id: "rk3588",
    name: "Rockchip RK3588 (Orange Pi 5 / Rock 5B)",
    peakTdpWatts: 18.0,
    idleTdpWatts: 3.5,
    throttleTempC: 85,
    dieAreaMm2: 110.0,
    description: "8-Core hybrid (4x A76 + 4x A55) + 6 TOPS NPU. High peak heat density during AI inference.",
  },
  {
    id: "rpi4",
    name: "Raspberry Pi 4B (BCM2711 Quad Cortex-A72)",
    peakTdpWatts: 7.5,
    idleTdpWatts: 2.2,
    throttleTempC: 80,
    dieAreaMm2: 66.0,
    description: "Standard 28nm workhorse. Can operate passively with large aluminum heatsink in ventilated cases.",
  },
  {
    id: "rpizero2",
    name: "Raspberry Pi Zero 2 W (RP3A0-AU)",
    peakTdpWatts: 2.5,
    idleTdpWatts: 0.7,
    throttleTempC: 80,
    dieAreaMm2: 30.0,
    description: "Low-power SiP. Perfect for completely sealed passive and solar cyberdecks.",
  },
];

interface CoolerOption {
  id: string;
  name: string;
  thermalResistanceCPerW: number; // Theta heatsink-to-air
  maxAirflowCfm: number;
  maxNoiseDba: number;
  description: string;
}

const COOLER_OPTIONS: CoolerOption[] = [
  { id: "passive_bare", name: "Bare Board (No Heatsink)", thermalResistanceCPerW: 6.8, maxAirflowCfm: 0.0, maxNoiseDba: 0, description: "Natural convection only. Throttles rapidly under sustained load." },
  { id: "passive_heatsink", name: "Extruded Aluminum Passive Heatsink", thermalResistanceCPerW: 3.5, maxAirflowCfm: 0.0, maxNoiseDba: 0, description: "Zero noise passive dissipation. Suitable for low ambient temps." },
  { id: "official_active", name: "Raspberry Pi Official Active Cooler", thermalResistanceCPerW: 1.2, maxAirflowCfm: 2.2, maxNoiseDba: 28, description: "Compact PWM blower fan with aluminum fin-stack." },
  { id: "ice_tower", name: "Ice Tower Dual-Heatpipe Vertical Cooler", thermalResistanceCPerW: 0.65, maxAirflowCfm: 4.8, maxNoiseDba: 24, description: "Tower heatsink with dual copper heatpipes and 30mm fan." },
  { id: "noctua_40mm", name: "Noctua NF-A4x20 5V PWM Active Duct", thermalResistanceCPerW: 0.50, maxAirflowCfm: 5.5, maxNoiseDba: 14.9, description: "Ultra-quiet premium acoustic fan for silent field operations." },
];

export default function CoolingThermalsStudio() {
  const [selectedSocId, setSelectedSocId] = useState<string>("rpi5");
  const [selectedCoolerId, setSelectedCoolerId] = useState<string>("official_active");
  const [ambientTempC, setAmbientTempC] = useState<number>(24.0); // Field ambient temp
  const [cpuWorkloadPercent, setCpuWorkloadPercent] = useState<number>(85); // 0 - 100%
  const [fanPwmPercent, setFanPwmPercent] = useState<number>(75); // 10 - 100%

  // Enclosure Dynamics
  const [enclosureVolumeCm3, setEnclosureVolumeCm3] = useState<number>(1400); // ~1.4 liters
  const [enclosureType, setEnclosureType] = useState<"ventilated" | "sealed" | "pelican">("ventilated");

  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const selectedSoc = SOC_PRESETS.find((s) => s.id === selectedSocId) || SOC_PRESETS[0];
  const selectedCooler = COOLER_OPTIONS.find((c) => c.id === selectedCoolerId) || COOLER_OPTIONS[0];

  const metrics = useMemo(() => {
    // 1. Current Active TDP
    const currentTdpWatts = selectedSoc.idleTdpWatts + ((selectedSoc.peakTdpWatts - selectedSoc.idleTdpWatts) * (cpuWorkloadPercent / 100));

    // 2. Dynamic Cooler Thermal Resistance (Scaled by Fan PWM)
    let effectiveThermalResistance = selectedCooler.thermalResistanceCPerW;
    if (selectedCooler.maxAirflowCfm > 0) {
      const pwmFactor = Math.max(0.2, fanPwmPercent / 100);
      effectiveThermalResistance = selectedCooler.thermalResistanceCPerW / Math.pow(pwmFactor, 0.4);
    }

    // 3. Enclosure Confinement Penalty
    let enclosurePenaltyCPerW = 0.0;
    if (enclosureType === "sealed") {
      enclosurePenaltyCPerW = 1.8;
    } else if (enclosureType === "pelican") {
      enclosurePenaltyCPerW = 2.4; // Polypropylene insulating wall
    } else {
      enclosurePenaltyCPerW = 0.3; // Ventilated mesh
    }

    // 4. Steady-State Junction Core Temperature
    const totalTheta = effectiveThermalResistance + enclosurePenaltyCPerW;
    const deltaTempC = currentTdpWatts * totalTheta;
    const steadyStateTempC = ambientTempC + deltaTempC;

    // 5. Thermal Headroom & Throttle Status
    const thermalHeadroomC = selectedSoc.throttleTempC - steadyStateTempC;
    const isThrottling = thermalHeadroomC <= 0;

    // 6. Air Exchange Turnover (Air Changes per Minute)
    const enclosureLiters = enclosureVolumeCm3 / 1000;
    const currentCfm = selectedCooler.maxAirflowCfm * (fanPwmPercent / 100);
    const airflowLitersPerMin = currentCfm * 28.3168;
    const airTurnoverPerMin = enclosureType === "sealed" || enclosureType === "pelican" ? 0 : airflowLitersPerMin / Math.max(0.1, enclosureLiters);

    // 7. Acoustic Sound Pressure Level (dBA)
    let currentNoiseDba = 0;
    if (selectedCooler.maxNoiseDba > 0) {
      currentNoiseDba = Math.max(12, selectedCooler.maxNoiseDba * Math.pow(fanPwmPercent / 100, 1.5));
    }

    return {
      currentTdpWatts: Number(currentTdpWatts.toFixed(1)),
      steadyStateTempC: Number(steadyStateTempC.toFixed(1)),
      thermalHeadroomC: Number(thermalHeadroomC.toFixed(1)),
      isThrottling,
      totalTheta: Number(totalTheta.toFixed(2)),
      airTurnoverPerMin: Number(airTurnoverPerMin.toFixed(0)),
      currentNoiseDba: Number(currentNoiseDba.toFixed(1)),
    };
  }, [selectedSoc, selectedCooler, ambientTempC, cpuWorkloadPercent, fanPwmPercent, enclosureVolumeCm3, enclosureType]);

  const markdownReport = useMemo(() => {
    return `# ================================================================
# DECKSMITH THERMAL DISSIPATION & ACTIVE COOLING AUDIT
# SoC Platform: ${selectedSoc.name}
# Cooler: ${selectedCooler.name}
# Status: ${metrics.isThrottling ? "🔴 THERMAL THROTTLING DETECTED" : "✅ NOMINAL OPERATING TEMPERATURES"}
# ================================================================

### 1. HEAT GENERATION & THERMAL JUNCTION
- Active Power Dissipation: ${metrics.currentTdpWatts} Watts (at ${cpuWorkloadPercent}% CPU Load)
- Ambient Field Temperature: ${ambientTempC}°C
- Predicted Steady-State Core Temp: ${metrics.steadyStateTempC}°C
- Silicon Throttle Limit: ${selectedSoc.throttleTempC}°C
- Thermal Headroom Margin: ${metrics.thermalHeadroomC > 0 ? "+" : ""}${metrics.thermalHeadroomC}°C

### 2. COOLING SOLUTION & RESISTANCE
- Cooler Type: ${selectedCooler.name}
- System Thermal Resistance (Theta total): ${metrics.totalTheta} °C / Watt
- Fan PWM Duty Cycle: ${fanPwmPercent}%
- Acoustic Sound Pressure Level: ${metrics.currentNoiseDba} dBA @ 1m

### 3. ENCLOSURE AIR DYNAMICS
- Enclosure Style: ${enclosureType.toUpperCase()} (${enclosureVolumeCm3} cm³ internal volume)
- Air Turnover Rate: ${metrics.airTurnoverPerMin} full volume exchanges / minute
`;
  }, [selectedSoc, selectedCooler, metrics, cpuWorkloadPercent, ambientTempC, fanPwmPercent, enclosureType, enclosureVolumeCm3]);

  const downloadReport = () => {
    soundFx.playConfirm();
    const blob = new Blob([markdownReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `thermal-dissipation-${selectedSoc.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Thermal Engineering & CFD Engine
            </span>
            <span className="text-xs font-mono text-neon-green">Heatsink Theta · Air Turnover · Acoustic dBA</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Flame className="w-7 h-7 text-rose-400" />
            Thermal Dissipation & Active Cooling Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Model steady-state junction temperatures, heatsink convection resistance (Theta total), and enclosure air exchange for custom cyberdecks.
          </p>
        </div>

        {/* Quick Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/builder"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-neon-green" />
            Blueprint Studio
          </Link>
          <Link
            to="/cad"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            CAD Studio
          </Link>
          <button
            onClick={downloadReport}
            className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-rose-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Thermal Audit
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border space-y-2 ${metrics.isThrottling ? "bg-rose-950/40 border-rose-500/50" : "bg-emerald-950/40 border-emerald-500/50"}`}>
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Predicted Core Temp</span>
          <div className="text-2xl font-black text-white font-mono">{metrics.steadyStateTempC}°C</div>
          <span className={`text-xs font-bold font-mono ${metrics.isThrottling ? "text-rose-400" : "text-emerald-400"}`}>
            {metrics.isThrottling ? "● Thermal Throttling (Cut Freq)" : `● Safe (${metrics.thermalHeadroomC}°C Headroom)`}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Heat Dissipation (TDP)</span>
          <div className="text-2xl font-black text-rose-400 font-mono">{metrics.currentTdpWatts} Watts</div>
          <span className="text-xs text-gray-400 font-mono">@ {cpuWorkloadPercent}% CPU Load (Die: {selectedSoc.dieAreaMm2}mm²)</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Air Turnover Rate</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{metrics.airTurnoverPerMin} /min</div>
          <span className="text-xs text-gray-400 font-mono">Total Volume Changes in {enclosureVolumeCm3}cm³ Case</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Acoustic Noise Level</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{metrics.currentNoiseDba} dBA</div>
          <span className="text-xs text-gray-400 font-mono">@ 1 meter ({fanPwmPercent}% Fan PWM)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. SoC Selection */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              1. Target SoC / Processor Platform
            </h3>
            <div className="space-y-2">
              {SOC_PRESETS.map((soc) => (
                <div
                  key={soc.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSocId(soc.id);
                  }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedSocId === soc.id
                      ? "border-rose-400 bg-rose-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{soc.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-rose-300">
                      {soc.peakTdpWatts}W TDP
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-normal">{soc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Heatsink & Active Fan Cooler */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              2. Heatsink & Active Fan Solution
            </h3>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">Cooling Hardware</label>
              <select
                value={selectedCoolerId}
                onChange={(e) => {
                  soundFx.playClick();
                  setSelectedCoolerId(e.target.value);
                }}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-cyan-300 font-bold font-mono"
              >
                {COOLER_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.thermalResistanceCPerW}°C/W)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                <span>Active Fan PWM Duty Cycle</span>
                <span className="text-cyan-400 font-bold">{fanPwmPercent}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={fanPwmPercent}
                onChange={(e) => {
                  soundFx.playClick();
                  setFanPwmPercent(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Environment & Enclosure Type */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neon-green" />
              3. Environmental & Enclosure Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">Enclosure Style</label>
                <select
                  value={enclosureType}
                  onChange={(e) => setEnclosureType(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white"
                >
                  <option value="ventilated">Ventilated Mesh Ducting</option>
                  <option value="sealed">Sealed Aluminum Shell</option>
                  <option value="pelican">Pelican Weatherproof Case</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">Internal Volume (cm³)</label>
                <input
                  type="number"
                  step={100}
                  value={enclosureVolumeCm3}
                  onChange={(e) => setEnclosureVolumeCm3(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                <span>Ambient Air Temperature</span>
                <span className="text-neon-green font-bold">{ambientTempC}°C</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={ambientTempC}
                onChange={(e) => {
                  soundFx.playClick();
                  setAmbientTempC(Number(e.target.value));
                }}
                className="w-full accent-neon-green cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Markdown Report */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Thermal & CFD Engineering Audit
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(markdownReport);
                  setCopiedReport(true);
                  setTimeout(() => setCopiedReport(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedReport ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedReport ? "Copied" : "Copy Markdown"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-h-[500px] select-all">
              {markdownReport}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
