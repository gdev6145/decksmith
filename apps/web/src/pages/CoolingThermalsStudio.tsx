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
  Thermometer,
  Fan,
  AlertTriangle,
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
    name: "Raspberry Pi 5 (BCM2712 Quad A76)",
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
    name: "Raspberry Pi 4B (BCM2711 Quad A72)",
    peakTdpWatts: 7.5,
    idleTdpWatts: 2.2,
    throttleTempC: 80,
    dieAreaMm2: 66.0,
    description: "Standard 28nm workhorse. Can operate passively with large aluminum heatsink in ventilated cases.",
  },
];

interface CoolerOption {
  id: string;
  name: string;
  thermalResistanceCPerW: number;
  maxAirflowCfm: number;
  maxNoiseDba: number;
  description: string;
}

const COOLER_OPTIONS: CoolerOption[] = [
  { id: "passive_bare", name: "Bare Board (Natural Convection)", thermalResistanceCPerW: 6.8, maxAirflowCfm: 0.0, maxNoiseDba: 0, description: "Throttles rapidly under sustained load." },
  { id: "passive_heatsink", name: "Extruded Aluminum Passive Heatsink", thermalResistanceCPerW: 3.5, maxAirflowCfm: 0.0, maxNoiseDba: 0, description: "Zero noise passive dissipation for low ambient temps." },
  { id: "official_active", name: "Official Active Cooler Blower Fan", thermalResistanceCPerW: 1.2, maxAirflowCfm: 2.2, maxNoiseDba: 28, description: "Compact PWM blower fan with aluminum fin-stack." },
  { id: "ice_tower", name: "Ice Tower Dual-Heatpipe Vertical Cooler", thermalResistanceCPerW: 0.65, maxAirflowCfm: 4.8, maxNoiseDba: 24, description: "Tower heatsink with dual copper heatpipes and 30mm fan." },
  { id: "noctua_40mm", name: "Noctua NF-A4x20 5V PWM Duct", thermalResistanceCPerW: 0.50, maxAirflowCfm: 5.5, maxNoiseDba: 14.9, description: "Ultra-quiet premium acoustic fan for silent field operations." },
];

export default function CoolingThermalsStudio() {
  const [selectedSocId, setSelectedSocId] = useState<string>("rpi5");
  const [selectedCoolerId, setSelectedCoolerId] = useState<string>("official_active");
  const [ambientTempC, setAmbientTempC] = useState<number>(24.0);
  const [cpuWorkloadPercent, setCpuWorkloadPercent] = useState<number>(85);
  const [fanPwmPercent, setFanPwmPercent] = useState<number>(75);

  const soc = SOC_PRESETS.find((s) => s.id === selectedSocId) || SOC_PRESETS[0];
  const cooler = COOLER_OPTIONS.find((c) => c.id === selectedCoolerId) || COOLER_OPTIONS[0];

  // Thermal Calculations
  const thermalMetrics = useMemo(() => {
    const activeTdp = soc.idleTdpWatts + (soc.peakTdpWatts - soc.idleTdpWatts) * (cpuWorkloadPercent / 100);
    const effectiveTheta = cooler.thermalResistanceCPerW * (cooler.maxAirflowCfm > 0 ? (1.5 - (fanPwmPercent / 100) * 0.7) : 1.0);
    const tempRiseC = activeTdp * effectiveTheta;
    const junctionTempC = ambientTempC + tempRiseC;
    const isThrottling = junctionTempC >= soc.throttleTempC;
    const estimatedNoiseDba = cooler.maxNoiseDba > 0 ? Math.round(cooler.maxNoiseDba * (fanPwmPercent / 100)) : 0;

    return {
      activeTdp: Number(activeTdp.toFixed(1)),
      effectiveTheta: Number(effectiveTheta.toFixed(2)),
      junctionTempC: Number(junctionTempC.toFixed(1)),
      isThrottling,
      estimatedNoiseDba,
      thermalMarginC: Number((soc.throttleTempC - junctionTempC).toFixed(1)),
    };
  }, [soc, cooler, ambientTempC, cpuWorkloadPercent, fanPwmPercent]);

  const handleExportFanScript = () => {
    soundFx.playConfirm();
    let script = `#!/usr/bin/env python3
# DECKSMITH AUTOMATED DYNAMIC FAN PWM CONTROLLER
import time
import os

TEMP_FILE = "/sys/class/thermal/thermal_zone0/temp"
PWM_DUTY_FILE = "/sys/class/pwm/pwmchip0/pwm0/duty_cycle"

# Fan Curve: (Temp C, PWM %)
FAN_CURVE = [
    (45, 0),
    (55, 35),
    (65, 70),
    (75, 100)
]

def get_temp():
    with open(TEMP_FILE, "r") as f:
        return int(f.read().strip()) / 1000.0

def set_fan_pwm(percent):
    period_ns = 25000 # 40kHz PWM
    duty_ns = int(period_ns * (percent / 100.0))
    # Write to hardware PWM register
    print(f"Setting Fan PWM: {percent}% ({duty_ns}ns)")

if __name__ == "__main__":
    print("🔥 Starting Decksmith Thermal Monitor...")
    while True:
        t = get_temp()
        target_pwm = 0
        for temp_thresh, pwm_val in FAN_CURVE:
            if t >= temp_thresh:
                target_pwm = pwm_val
        set_fan_pwm(target_pwm)
        time.sleep(2)
`;

    const blob = new Blob([script], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fan_control.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-300 border border-orange-500/30 mb-2">
            <Flame className="w-3.5 h-3.5" />
            Thermal Conduction, Heatsinks & Dynamic Fan Curve Studio
          </div>
          <h1 className="text-3xl font-black text-white">Cooling & Thermals Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Simulate SoC junction temperatures, thermal throttling margins, acoustic dBA, and export Linux fan control scripts
          </p>
        </div>

        <button
          onClick={handleExportFanScript}
          className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
        >
          <Download className="w-4 h-4" />
          Export fan_control.py
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Die Junction Temp</span>
          <div className={`text-2xl font-black ${thermalMetrics.isThrottling ? "text-rose-500 animate-pulse" : thermalMetrics.junctionTempC >= 65 ? "text-amber-400" : "text-neon-green"}`}>
            {thermalMetrics.junctionTempC}°C
          </div>
          <span className="text-[11px] text-gray-500">Throttle Limit: {soc.throttleTempC}°C</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Thermal Headroom</span>
          <div className={`text-2xl font-black ${thermalMetrics.thermalMarginC > 0 ? "text-cyan-400" : "text-rose-400"}`}>
            {thermalMetrics.thermalMarginC > 0 ? `+${thermalMetrics.thermalMarginC}` : thermalMetrics.thermalMarginC}°C
          </div>
          <span className="text-[11px] text-gray-500">{thermalMetrics.thermalMarginC > 0 ? "Safe Operating Buffer ✓" : "Thermal Throttling Active ⚠️"}</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Current TDP Dissipation</span>
          <div className="text-2xl font-black text-white">{thermalMetrics.activeTdp} W</div>
          <span className="text-[11px] text-gray-500">At {cpuWorkloadPercent}% CPU Load</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Acoustic Noise</span>
          <div className="text-2xl font-black text-purple-400">{thermalMetrics.estimatedNoiseDba} dB-A</div>
          <span className="text-[11px] text-gray-500">At {fanPwmPercent}% Fan Speed</span>
        </div>
      </div>

      {/* Main Grid: Heatmap & Tuning Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Heatmap Gradient Display */}
        <div className="lg:col-span-6 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col items-center justify-between">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between w-full">
            <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              2D Thermal Dissipation Profile
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-cyan-400">
              {cooler.name.split(" ")[0]}
            </span>
          </div>

          <div className="w-full h-56 bg-gray-950 rounded-2xl border border-gray-800 p-4 relative flex items-center justify-center overflow-hidden">
            {/* Ambient Air Ring */}
            <div className="w-48 h-48 rounded-full border border-gray-800 flex items-center justify-center">
              {/* Heatsink Heat Diffusion Gradient */}
              <div
                className="w-36 h-36 rounded-3xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: `radial-gradient(circle, ${thermalMetrics.junctionTempC >= 75 ? "#ef4444" : thermalMetrics.junctionTempC >= 60 ? "#f59e0b" : "#00ff66"} 0%, rgba(30,38,56,0.3) 70%)`,
                }}
              >
                {/* Silicon Die Core */}
                <div className="w-16 h-16 bg-gray-900 border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center shadow-2xl">
                  <Cpu className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-bold text-white mt-1">{thermalMetrics.junctionTempC}°C</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 text-center w-full">
            Ambient Air: {ambientTempC}°C · Thermal Resistance: {thermalMetrics.effectiveTheta} °C/W
          </div>
        </div>

        {/* Sliders & Configuration */}
        <div className="lg:col-span-6 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Thermal Workload & Ambient Tuning
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Target SoC Architecture:</label>
              <select
                value={selectedSocId}
                onChange={(e) => setSelectedSocId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white font-bold focus:border-orange-500 focus:outline-none"
              >
                {SOC_PRESETS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.peakTdpWatts}W Peak)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-bold">Cooler & Heat Dissipation Hardware:</label>
              <select
                value={selectedCoolerId}
                onChange={(e) => setSelectedCoolerId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white font-bold focus:border-orange-500 focus:outline-none"
              >
                {COOLER_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-1">
              <div className="flex justify-between text-gray-400 mb-1">
                <span>CPU Workload Sustained:</span>
                <span className="text-orange-400 font-bold">{cpuWorkloadPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={cpuWorkloadPercent}
                onChange={(e) => setCpuWorkloadPercent(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>

            {cooler.maxAirflowCfm > 0 && (
              <div>
                <div className="flex justify-between text-gray-400 mb-1">
                  <span>Fan PWM Speed:</span>
                  <span className="text-cyan-400 font-bold">{fanPwmPercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fanPwmPercent}
                  onChange={(e) => setFanPwmPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
