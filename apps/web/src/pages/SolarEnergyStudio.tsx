import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sun,
  Battery,
  Zap,
  Flame,
  Shield,
  Download,
  Copy,
  Check,
  Compass,
  Sliders,
  Sparkles,
  Layers,
  Crosshair,
  TrendingUp,
  Activity,
  HardDrive,
  Keyboard,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface BatteryChemistry {
  id: string;
  name: string;
  nominalVoltage: number;
  maxDoD: number; // Depth of discharge (0.0 - 1.0)
  cycleLife: number;
  tempTolerance: string;
}

const BATTERY_CHEMISTRIES: BatteryChemistry[] = [
  { id: "lifepo4", name: "LiFePO4 (Lithium Iron Phosphate)", nominalVoltage: 3.2, maxDoD: 0.90, cycleLife: 3500, tempTolerance: "-20°C to 60°C (Safest)" },
  { id: "lipo", name: "LiPo / Li-Ion (Standard 18650 / 21700)", nominalVoltage: 3.7, maxDoD: 0.80, cycleLife: 800, tempTolerance: "0°C to 45°C (High Energy Density)" },
  { id: "lto", name: "LTO (Lithium Titanate)", nominalVoltage: 2.4, maxDoD: 0.98, cycleLife: 20000, tempTolerance: "-30°C to 75°C (Military Grade)" },
];

export default function SolarEnergyStudio() {
  // Deck Consumption Inputs
  const [deckActivePowerW, setDeckActivePowerW] = useState<number>(6.5);
  const [dailyActiveHours, setDailyActiveHours] = useState<number>(8);
  const [deckIdlePowerW, setDeckIdlePowerW] = useState<number>(1.2);

  // Solar Harvesting Inputs
  const [solarPanelWatts, setSolarPanelWatts] = useState<number>(28);
  const [peakSunHours, setPeakSunHours] = useState<number>(4.5); // 2.0 (winter) - 6.5 (summer)
  const [controllerType, setControllerType] = useState<"mppt" | "pwm">("mppt");
  const [environmentalLoss, setEnvironmentalLoss] = useState<number>(0.85); // dust/angle loss

  // Battery Storage Inputs
  const [batteryChemistryId, setBatteryChemistryId] = useState<string>("lifepo4");
  const [batteryCapacityMah, setBatteryCapacityMah] = useState<number>(15000);
  const [batteryPacksParallel, setBatteryPacksParallel] = useState<number>(1);

  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const chemistry = BATTERY_CHEMISTRIES.find((c) => c.id === batteryChemistryId) || BATTERY_CHEMISTRIES[0];

  // Calculations
  const metrics = useMemo(() => {
    const idleHours = 24 - dailyActiveHours;
    const activeDailyWh = deckActivePowerW * dailyActiveHours;
    const idleDailyWh = deckIdlePowerW * idleHours;
    const totalDailyWhConsumed = activeDailyWh + idleDailyWh;

    const controllerEff = controllerType === "mppt" ? 0.95 : 0.75;
    const dailySolarWhHarvested = solarPanelWatts * peakSunHours * controllerEff * environmentalLoss;

    const netDailyWh = dailySolarWhHarvested - totalDailyWhConsumed;
    const isNetPositive = netDailyWh >= 0;

    const totalPackCapacityWh = (batteryCapacityMah * batteryPacksParallel * chemistry.nominalVoltage) / 1000;
    const usablePackCapacityWh = totalPackCapacityWh * chemistry.maxDoD;

    const daysOfAutonomy = usablePackCapacityWh / Math.max(1, totalDailyWhConsumed);

    // Solar Re-charge time on a clear day
    const hoursToFullRecharge = usablePackCapacityWh / Math.max(0.1, solarPanelWatts * controllerEff * environmentalLoss);

    return {
      totalDailyWhConsumed: Number(totalDailyWhConsumed.toFixed(1)),
      dailySolarWhHarvested: Number(dailySolarWhHarvested.toFixed(1)),
      netDailyWh: Number(netDailyWh.toFixed(1)),
      isNetPositive,
      totalPackCapacityWh: Number(totalPackCapacityWh.toFixed(1)),
      usablePackCapacityWh: Number(usablePackCapacityWh.toFixed(1)),
      daysOfAutonomy: Number(daysOfAutonomy.toFixed(2)),
      hoursToFullRecharge: Number(hoursToFullRecharge.toFixed(1)),
    };
  }, [
    deckActivePowerW,
    dailyActiveHours,
    deckIdlePowerW,
    solarPanelWatts,
    peakSunHours,
    controllerType,
    environmentalLoss,
    batteryCapacityMah,
    batteryPacksParallel,
    chemistry,
  ]);

  const markdownReport = useMemo(() => {
    return `# ================================================================
# DECKSMITH SOLAR & OFF-GRID ENERGY AUDIT REPORT
# Generated: ${new Date().toISOString()}
# Status: ${metrics.isNetPositive ? "✅ 100% SELF-SUSTAINING (NET POSITIVE)" : "⚠️ ENERGY DEFICIT (REQUIRES GRID CHARGE)"}
# ================================================================

### 1. DAILY ENERGY BALANCE
- Daily Energy Consumption: ${metrics.totalDailyWhConsumed} Wh / day
  • Active Usage: ${dailyActiveHours} hours @ ${deckActivePowerW} W
  • Idle / Standby: ${24 - dailyActiveHours} hours @ ${deckIdlePowerW} W
- Solar Generation Harvest: ${metrics.dailySolarWhHarvested} Wh / day
  • Solar Array: ${solarPanelWatts}W (${controllerType.toUpperCase()} Controller, ${peakSunHours} Peak Sun Hours)
- Net Daily Differential: ${metrics.netDailyWh > 0 ? "+" : ""}${metrics.netDailyWh} Wh / day

### 2. BATTERY & AUTONOMY RESERVE
- Battery Chemistry: ${chemistry.name}
- Total Storage: ${metrics.totalPackCapacityWh} Wh (${batteryCapacityMah * batteryPacksParallel} mAh @ ${chemistry.nominalVoltage}V)
- Usable Storage (${(chemistry.maxDoD * 100).toFixed(0)}% DoD): ${metrics.usablePackCapacityWh} Wh
- Days of Zero-Sun Autonomy: ${metrics.daysOfAutonomy} days continuous runtime
- Solar Full Re-charge Duration: ${metrics.hoursToFullRecharge} peak sun hours
`;
  }, [metrics, dailyActiveHours, deckActivePowerW, deckIdlePowerW, solarPanelWatts, controllerType, peakSunHours, chemistry, batteryCapacityMah, batteryPacksParallel]);

  const downloadReport = () => {
    soundFx.playConfirm();
    const blob = new Blob([markdownReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cyberdeck-solar-energy-audit.md";
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              Off-Grid Field Energy Engine
            </span>
            <span className="text-xs font-mono text-neon-green">MPPT · LiFePO4 · Autonomy Modeling</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Sun className="w-7 h-7 text-yellow-400" />
            Solar & Off-Grid Energy Harvesting Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Model solar panel wattage, MPPT charge efficiency, battery depth of discharge (DoD), and zero-sun autonomy reserve for off-grid nomad cyberdecks.
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
            to="/companion"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Field HUD
          </Link>
          <button
            onClick={downloadReport}
            className="px-3.5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-yellow-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Energy Audit
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border space-y-2 ${metrics.isNetPositive ? "bg-emerald-950/40 border-emerald-500/50" : "bg-rose-950/40 border-rose-500/50"}`}>
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Net Daily Energy Balance</span>
          <div className="text-2xl font-black text-white font-mono">
            {metrics.netDailyWh > 0 ? "+" : ""}{metrics.netDailyWh} Wh/day
          </div>
          <span className={`text-xs font-bold font-mono ${metrics.isNetPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {metrics.isNetPositive ? "● Infinite Self-Sustaining" : "● Daily Deficit Warning"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Solar Generation Harvest</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{metrics.dailySolarWhHarvested} Wh/day</div>
          <span className="text-xs text-gray-400 font-mono">From {solarPanelWatts}W Array @ {peakSunHours} PSH</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Total Daily Consumption</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{metrics.totalDailyWhConsumed} Wh/day</div>
          <span className="text-xs text-gray-400 font-mono">{dailyActiveHours}h Active · {24 - dailyActiveHours}h Standby</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Zero-Sun Autonomy Reserve</span>
          <div className="text-2xl font-black text-neon-green font-mono">{metrics.daysOfAutonomy} Days</div>
          <span className="text-xs text-gray-400 font-mono">Usable: {metrics.usablePackCapacityWh} Wh ({chemistry.name.split(" ")[0]})</span>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Deck Power Demand */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-green" />
              1. Cyberdeck Power Profile
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                  <span>Active Workload Power Draw</span>
                  <span className="text-neon-green font-bold">{deckActivePowerW} Watts</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={25}
                  step={0.5}
                  value={deckActivePowerW}
                  onChange={(e) => {
                    soundFx.playClick();
                    setDeckActivePowerW(Number(e.target.value));
                  }}
                  className="w-full accent-neon-green cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                  <span>Active Operating Hours per Day</span>
                  <span className="text-cyan-400 font-bold">{dailyActiveHours} Hours/day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={dailyActiveHours}
                  onChange={(e) => {
                    soundFx.playClick();
                    setDailyActiveHours(Number(e.target.value));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 2. Solar Array & Sun Hours */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              2. Solar Array & Geographic Insolation
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">Solar Panel Rating</label>
                <select
                  value={solarPanelWatts}
                  onChange={(e) => {
                    soundFx.playClick();
                    setSolarPanelWatts(Number(e.target.value));
                  }}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-yellow-300 font-bold"
                >
                  <option value={10}>10W (Ultra-Portable Backpack)</option>
                  <option value={21}>21W (Folding 3-Panel Kit)</option>
                  <option value={28}>28W (High-Efficiency USB-C)</option>
                  <option value={50}>50W (Rigid Briefcase)</option>
                  <option value={100}>100W (Basecamp Array)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-gray-400 mb-1">Charge Controller</label>
                <select
                  value={controllerType}
                  onChange={(e) => {
                    soundFx.playClick();
                    setControllerType(e.target.value as any);
                  }}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-cyan-300 font-bold"
                >
                  <option value="mppt">MPPT (95% Efficiency)</option>
                  <option value="pwm">PWM (75% Efficiency)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                <span>Peak Sun Hours (PSH / Day)</span>
                <span className="text-yellow-400 font-bold">{peakSunHours} PSH</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={7.0}
                step={0.5}
                value={peakSunHours}
                onChange={(e) => {
                  soundFx.playClick();
                  setPeakSunHours(Number(e.target.value));
                }}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>Winter / Overcast (2.0)</span>
                <span>Moderate (4.5)</span>
                <span>Desert Summer (7.0)</span>
              </div>
            </div>
          </div>

          {/* 3. Battery Storage */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Battery className="w-4 h-4 text-purple-400" />
              3. Battery Bank Chemistry & Capacity
            </h3>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">Battery Chemistry</label>
              <select
                value={batteryChemistryId}
                onChange={(e) => {
                  soundFx.playClick();
                  setBatteryChemistryId(e.target.value);
                }}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-purple-300 font-bold font-mono"
              >
                {BATTERY_CHEMISTRIES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">Cell Pack Capacity (mAh)</label>
                <input
                  type="number"
                  step={1000}
                  value={batteryCapacityMah}
                  onChange={(e) => setBatteryCapacityMah(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">Parallel Pack Count</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={batteryPacksParallel}
                  onChange={(e) => setBatteryPacksParallel(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Energy Simulation & Markdown Report */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Field Energy Audit Report
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
