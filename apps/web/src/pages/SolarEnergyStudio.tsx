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
  Clock,
  Thermometer,
  AlertTriangle,
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
  const [peakSunHours, setPeakSunHours] = useState<number>(4.5);
  const [controllerType, setControllerType] = useState<"mppt" | "pwm">("mppt");
  const [environmentalLoss, setEnvironmentalLoss] = useState<number>(0.85);

  // Battery Storage Inputs
  const [batteryChemistryId, setBatteryChemistryId] = useState<string>("lifepo4");
  const [batteryCapacityMah, setBatteryCapacityMah] = useState<number>(15000);
  const [batteryPacksParallel, setBatteryPacksParallel] = useState<number>(1);
  const [ambientTempC, setAmbientTempC] = useState<number>(20);
  const [simulatedHour, setSimulatedHour] = useState<number>(12); // 0 - 24h

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
    const hoursToFullRecharge = usablePackCapacityWh / Math.max(0.1, solarPanelWatts * controllerEff * environmentalLoss);

    // Temperature derating factor
    let tempDeratingFactor = 1.0;
    if (ambientTempC < 0 && batteryChemistryId === "lifepo4") {
      tempDeratingFactor = 0.5; // Cold-weather charge current limit
    } else if (ambientTempC < -10) {
      tempDeratingFactor = 0.2;
    }

    return {
      totalDailyWhConsumed: Number(totalDailyWhConsumed.toFixed(1)),
      dailySolarWhHarvested: Number(dailySolarWhHarvested.toFixed(1)),
      netDailyWh: Number(netDailyWh.toFixed(1)),
      isNetPositive,
      totalPackCapacityWh: Number(totalPackCapacityWh.toFixed(1)),
      usablePackCapacityWh: Number(usablePackCapacityWh.toFixed(1)),
      daysOfAutonomy: Number(daysOfAutonomy.toFixed(2)),
      hoursToFullRecharge: Number(hoursToFullRecharge.toFixed(1)),
      tempDeratingFactor,
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
    ambientTempC,
    batteryChemistryId,
  ]);

  // 24-Hour Diurnal Curve Simulation
  const diurnalData = useMemo(() => {
    const hours = Array.from({ length: 25 }, (_, i) => i);
    const controllerEff = controllerType === "mppt" ? 0.95 : 0.75;
    let runningWh = metrics.usablePackCapacityWh * 0.7; // Start day at 70% battery

    return hours.map((h) => {
      // Solar Bell Curve between 6 AM (6) and 6 PM (18)
      let sunMultiplier = 0;
      if (h >= 6 && h <= 18) {
        const peakDist = Math.abs(h - 12);
        sunMultiplier = Math.max(0, Math.cos((peakDist / 6) * (Math.PI / 2)));
      }

      const currentGenW = solarPanelWatts * sunMultiplier * controllerEff * environmentalLoss * metrics.tempDeratingFactor;
      const isDayActive = h >= 8 && h <= 16;
      const currentLoadW = isDayActive ? deckActivePowerW : deckIdlePowerW;
      const netHourlyW = currentGenW - currentLoadW;

      runningWh = Math.min(metrics.usablePackCapacityWh, Math.max(0, runningWh + netHourlyW));
      const batterySocPct = Math.round((runningWh / Math.max(1, metrics.usablePackCapacityWh)) * 100);

      return {
        hour: h,
        solarW: Number(currentGenW.toFixed(1)),
        loadW: Number(currentLoadW.toFixed(1)),
        batterySocPct,
      };
    });
  }, [metrics, solarPanelWatts, controllerType, environmentalLoss, deckActivePowerW, deckIdlePowerW]);

  const currentHourPoint = diurnalData[simulatedHour] || diurnalData[12];

  const handleExportReport = () => {
    soundFx.playConfirm();
    let text = `# DECKSMITH SOLAR & OFF-GRID AUTONOMY REPORT\n`;
    text += `Generated: ${new Date().toISOString()}\n\n`;
    text += `## System Configuration\n`;
    text += `- Solar Panel: ${solarPanelWatts}W (${controllerType.toUpperCase()} Controller)\n`;
    text += `- Battery Storage: ${batteryCapacityMah}mAh (${chemistry.name})\n`;
    text += `- Usable Capacity: ${metrics.usablePackCapacityWh} Wh\n`;
    text += `- Daily Power Load: ${metrics.totalDailyWhConsumed} Wh/day\n`;
    text += `- Daily Solar Harvest: ${metrics.dailySolarWhHarvested} Wh/day\n`;
    text += `- Net Daily Energy Balance: ${metrics.netDailyWh > 0 ? "+" : ""}${metrics.netDailyWh} Wh/day\n`;
    text += `- Autonomy Reserve: ${metrics.daysOfAutonomy} Days without Sun\n\n`;

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decksmith-solar-autonomy-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
            <Sun className="w-3.5 h-3.5" />
            Solar Harvester & Off-Grid Autonomy Studio
          </div>
          <h1 className="text-3xl font-black text-white">Solar & Off-Grid Energy Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Simulate 24-hour diurnal solar irradiance, MPPT buck efficiency, LiFePO4 cold derating, and battery autonomy reserve
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
        >
          <Download className="w-4 h-4" />
          Export Energy Dossier (.md)
        </button>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Daily Solar Harvest</span>
          <div className="text-2xl font-black text-amber-400">{metrics.dailySolarWhHarvested} Wh/day</div>
          <span className="text-[11px] text-gray-500">{peakSunHours} Peak Sun Hours</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Cyberdeck Daily Load</span>
          <div className="text-2xl font-black text-white">{metrics.totalDailyWhConsumed} Wh/day</div>
          <span className="text-[11px] text-gray-500">{dailyActiveHours}h Active @ {deckActivePowerW}W</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Net Energy Balance</span>
          <div className={`text-2xl font-black ${metrics.isNetPositive ? "text-neon-green" : "text-rose-400"}`}>
            {metrics.netDailyWh > 0 ? "+" : ""}{metrics.netDailyWh} Wh
          </div>
          <span className="text-[11px] text-gray-500">{metrics.isNetPositive ? "Indefinite Run-time ✓" : "Net Deficit"}</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Autonomy Reserve</span>
          <div className="text-2xl font-black text-cyan-400">{metrics.daysOfAutonomy} Days</div>
          <span className="text-[11px] text-gray-500">Zero-Sun Reserve ({metrics.usablePackCapacityWh} Wh)</span>
        </div>
      </div>

      {/* 24-Hour Diurnal Solar Simulator Canvas */}
      <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              24-Hour Diurnal Irradiance & Battery SOC Curve
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Simulating hour {simulatedHour}:00 — Solar Generation: {currentHourPoint.solarW}W · Cyberdeck Load: {currentHourPoint.loadW}W · Battery: {currentHourPoint.batterySocPct}%
            </p>
          </div>

          {/* Time Slider */}
          <div className="flex items-center gap-3 bg-gray-950 px-4 py-2 rounded-2xl border border-gray-800">
            <span className="text-xs font-bold text-amber-400">{simulatedHour.toString().padStart(2, "0")}:00</span>
            <input
              type="range"
              min="0"
              max="24"
              value={simulatedHour}
              onChange={(e) => setSimulatedHour(Number(e.target.value))}
              className="w-32 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div className="h-44 w-full bg-gray-950 rounded-2xl border border-gray-800 p-3 relative flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 240 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="25" x2="240" y2="25" stroke="#1e2638" strokeDasharray="3,3" />
            <line x1="0" y1="50" x2="240" y2="50" stroke="#1e2638" strokeDasharray="3,3" />
            <line x1="0" y1="75" x2="240" y2="75" stroke="#1e2638" strokeDasharray="3,3" />

            {/* Solar Generation Polyline (Amber) */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              points={diurnalData.map((d) => `${d.hour * 10},${100 - (d.solarW / Math.max(1, solarPanelWatts)) * 90}`).join(" ")}
            />

            {/* Battery SOC Polyline (Neon Green) */}
            <polyline
              fill="none"
              stroke="#00ff66"
              strokeWidth="2.5"
              points={diurnalData.map((d) => `${d.hour * 10},${100 - (d.batterySocPct / 100) * 90}`).join(" ")}
            />

            {/* Time Cursor Marker */}
            <line
              x1={simulatedHour * 10}
              y1="0"
              x2={simulatedHour * 10}
              y2="100"
              stroke="#00f3ff"
              strokeWidth="2"
              strokeDasharray="2,2"
            />
          </svg>

          {/* Chart Legend */}
          <div className="absolute top-3 right-4 flex items-center gap-4 text-[10px] font-bold bg-gray-900/90 px-3 py-1 rounded-xl border border-gray-800">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Solar Watts
            </span>
            <span className="flex items-center gap-1.5 text-neon-green">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green" /> Battery SOC %
            </span>
          </div>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solar Harvester Config */}
        <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Sun className="w-4 h-4 text-amber-400" />
            Solar Harvester Specs
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Panel Rating:</span>
                <span className="text-amber-400 font-bold">{solarPanelWatts}W</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={solarPanelWatts}
                onChange={(e) => setSolarPanelWatts(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-bold">Charge Controller:</label>
              <select
                value={controllerType}
                onChange={(e) => setControllerType(e.target.value as any)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white font-bold focus:border-amber-400 focus:outline-none"
              >
                <option value="mppt">MPPT Synchronous (95% Efficiency)</option>
                <option value="pwm">PWM Standard (75% Efficiency)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Battery Storage */}
        <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Battery className="w-4 h-4 text-neon-green" />
            Battery Bank Chemistry
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Chemistry:</label>
              <select
                value={batteryChemistryId}
                onChange={(e) => setBatteryChemistryId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white font-bold focus:border-neon-green focus:outline-none"
              >
                {BATTERY_CHEMISTRIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Capacity:</span>
                <span className="text-neon-green font-bold">{batteryCapacityMah} mAh</span>
              </div>
              <input
                type="range"
                min="3000"
                max="50000"
                step="1000"
                value={batteryCapacityMah}
                onChange={(e) => setBatteryCapacityMah(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-neon-green"
              />
            </div>
          </div>
        </div>

        {/* Environmental Derating */}
        <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            Environmental Derating
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Ambient Temp:</span>
                <span className={`font-bold ${ambientTempC < 0 ? "text-cyan-400" : "text-white"}`}>{ambientTempC}°C</span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                value={ambientTempC}
                onChange={(e) => setAmbientTempC(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {ambientTempC < 0 && (
              <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-[11px] text-cyan-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Cold lockout active: Charge current derated to 50% to prevent lithium plating.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
