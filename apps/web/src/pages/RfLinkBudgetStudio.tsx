import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Radio,
  Wifi,
  Compass,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  Zap,
  Activity,
  Layers,
  Crosshair,
  Shield,
  Sun,
  HardDrive,
  Keyboard,
  Mountain,
  AlertTriangle,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface RfProtocolPreset {
  id: string;
  name: string;
  frequencyMhz: number;
  txPowerDbm: number;
  rxSensitivityDbm: number;
  description: string;
}

const RF_PRESETS: RfProtocolPreset[] = [
  {
    id: "lora-915",
    name: "Meshtastic LoRa 915 MHz (US/AU ISM)",
    frequencyMhz: 915,
    txPowerDbm: 22,
    rxSensitivityDbm: -137,
    description: "Long-range decentralized mesh networking. High sensitivity with ultra-low packet loss over mountainous terrain.",
  },
  {
    id: "lora-868",
    name: "Meshtastic LoRa 868 MHz (EU ISM)",
    frequencyMhz: 868,
    txPowerDbm: 14,
    rxSensitivityDbm: -137,
    description: "Standard European ISM band for off-grid mesh communications and telemetry beacons.",
  },
  {
    id: "lora-433",
    name: "LoRa 433 MHz (Sub-GHz High Penetration)",
    frequencyMhz: 433,
    txPowerDbm: 20,
    rxSensitivityDbm: -138,
    description: "Exceptional foliage and urban penetration. Popular for remote telemetry and drone links.",
  },
  {
    id: "wifi-2400",
    name: "Wi-Fi 2.4 GHz (High-Power Long Range)",
    frequencyMhz: 2412,
    txPowerDbm: 30,
    rxSensitivityDbm: -92,
    description: "Directional 2.4GHz long-range bridge for high-speed IP field networking.",
  },
];

interface CoaxCable {
  id: string;
  name: string;
  lossPer100mAt900Mhz: number;
}

const COAX_CABLES: CoaxCable[] = [
  { id: "lmr400", name: "LMR-400 Ultra Low Loss (0.13 dB/m)", lossPer100mAt900Mhz: 12.8 },
  { id: "rg58", name: "RG-58 Standard Coax (0.45 dB/m)", lossPer100mAt900Mhz: 44.0 },
  { id: "rg316", name: "RG-316 Teflon Flexible (0.75 dB/m)", lossPer100mAt900Mhz: 75.0 },
];

export default function RfLinkBudgetStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("lora-915");
  const [txPowerDbm, setTxPowerDbm] = useState<number>(22);
  const [txAntennaGainDbi, setTxAntennaGainDbi] = useState<number>(3.0);
  const [rxAntennaGainDbi, setRxAntennaGainDbi] = useState<number>(5.8);
  const [coaxCableId, setCoaxCableId] = useState<string>("lmr400");
  const [coaxLengthMeters, setCoaxLengthMeters] = useState<number>(3.0);

  // Link Geometry
  const [distanceKm, setDistanceKm] = useState<number>(12.5);
  const [txHeightMeters, setTxHeightMeters] = useState<number>(2.0);
  const [rxHeightMeters, setRxHeightMeters] = useState<number>(12.0);

  // Terrain Obstacle
  const [obstacleDistPct, setObstacleDistPct] = useState<number>(50); // 10% to 90%
  const [obstacleHeightM, setObstacleHeightM] = useState<number>(4.0); // Meters above ground

  const preset = RF_PRESETS.find((p) => p.id === selectedPresetId) || RF_PRESETS[0];
  const coax = COAX_CABLES.find((c) => c.id === coaxCableId) || COAX_CABLES[0];

  // RF Math Calculations
  const linkMetrics = useMemo(() => {
    const freq = preset.frequencyMhz;
    const wavelengthM = 300 / freq;

    // Free Space Path Loss (FSPL): 20log10(d_km) + 20log10(f_MHz) + 32.44
    const fsplDb = 20 * Math.log10(Math.max(0.01, distanceKm)) + 20 * Math.log10(freq) + 32.44;

    // 1st Fresnel Zone Radius at midpoint: r = 8.657 * sqrt(d_km / f_GHz)
    const freqGhz = freq / 1000;
    const d1Km = distanceKm * (obstacleDistPct / 100);
    const d2Km = distanceKm * (1 - obstacleDistPct / 100);
    const fresnelRadiusMidM = 17.32 * Math.sqrt((d1Km * d2Km) / (distanceKm * freqGhz));

    // Line of Sight Height at obstacle position
    const losHeightAtObstacle = txHeightMeters + (rxHeightMeters - txHeightMeters) * (obstacleDistPct / 100);
    const clearanceM = losHeightAtObstacle - obstacleHeightM;
    const clearanceRatio = clearanceM / Math.max(0.1, fresnelRadiusMidM);

    // Knife-Edge Diffraction Loss (dB)
    let diffractionLossDb = 0;
    const v = -clearanceRatio * Math.sqrt(2);
    if (v > -0.7) {
      diffractionLossDb = 6.9 + 20 * Math.log10(Math.sqrt(Math.pow(v - 0.1, 2) + 1) + v - 0.1);
    }
    diffractionLossDb = Math.max(0, Number(diffractionLossDb.toFixed(1)));

    // Cable loss
    const cableLossDb = (coax.lossPer100mAt900Mhz / 100) * coaxLengthMeters;

    // Effective Isotropic Radiated Power (EIRP)
    const eirpDbm = txPowerDbm + txAntennaGainDbi - cableLossDb;

    // Received Signal Strength Indicator (RSSI)
    const rxPowerDbm = eirpDbm - fsplDb - diffractionLossDb + rxAntennaGainDbi;

    // Fade Margin
    const linkMarginDb = rxPowerDbm - preset.rxSensitivityDbm;
    const isLinkViable = linkMarginDb >= 10.0;

    // Radio Horizon: d_km = 3.57 * (sqrt(h1) + sqrt(h2))
    const radioHorizonKm = 3.57 * (Math.sqrt(txHeightMeters) + Math.sqrt(rxHeightMeters));

    return {
      wavelengthM: Number(wavelengthM.toFixed(3)),
      fsplDb: Number(fsplDb.toFixed(1)),
      fresnelRadiusMidM: Number(fresnelRadiusMidM.toFixed(1)),
      clearanceM: Number(clearanceM.toFixed(1)),
      diffractionLossDb,
      eirpDbm: Number(eirpDbm.toFixed(1)),
      rxPowerDbm: Number(rxPowerDbm.toFixed(1)),
      linkMarginDb: Number(linkMarginDb.toFixed(1)),
      isLinkViable,
      radioHorizonKm: Number(radioHorizonKm.toFixed(1)),
    };
  }, [
    preset,
    coax,
    distanceKm,
    txPowerDbm,
    txAntennaGainDbi,
    rxAntennaGainDbi,
    coaxLengthMeters,
    txHeightMeters,
    rxHeightMeters,
    obstacleDistPct,
    obstacleHeightM,
  ]);

  const handleExportDossier = () => {
    soundFx.playConfirm();
    let text = `# DECKSMITH RF LINK BUDGET & FRESNEL DOSSIER\n`;
    text += `Protocol: ${preset.name}\n`;
    text += `Distance: ${distanceKm} km\n`;
    text += `- EIRP: ${linkMetrics.eirpDbm} dBm\n`;
    text += `- Free Space Loss: ${linkMetrics.fsplDb} dB\n`;
    text += `- Knife-Edge Diffraction Loss: ${linkMetrics.diffractionLossDb} dB\n`;
    text += `- Received RSSI: ${linkMetrics.rxPowerDbm} dBm\n`;
    text += `- Receiver Sensitivity: ${preset.rxSensitivityDbm} dBm\n`;
    text += `- Link Fade Margin: ${linkMetrics.linkMarginDb} dB (${linkMetrics.isLinkViable ? "VIABLE" : "MARGINAL"})\n`;
    text += `- 1st Fresnel Radius: ${linkMetrics.fresnelRadiusMidM} meters\n`;

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-rf-link-budget.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-2">
            <Radio className="w-3.5 h-3.5" />
            Wireless Range, FSPL & Fresnel Zone Studio
          </div>
          <h1 className="text-3xl font-black text-white">Wireless RF Link Budget Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Simulate Free Space Path Loss, 1st Fresnel zone clearance, terrain knife-edge diffraction, and fade margin
          </p>
        </div>

        <button
          onClick={handleExportDossier}
          className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
        >
          <Download className="w-4 h-4" />
          Export RF Dossier (.md)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Estimated RSSI</span>
          <div className={`text-2xl font-black ${linkMetrics.isLinkViable ? "text-neon-green" : "text-amber-400"}`}>
            {linkMetrics.rxPowerDbm} dBm
          </div>
          <span className="text-[11px] text-gray-500">Sensitivity: {preset.rxSensitivityDbm} dBm</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Link Fade Margin</span>
          <div className={`text-2xl font-black ${linkMetrics.linkMarginDb >= 15 ? "text-neon-green" : linkMetrics.linkMarginDb >= 6 ? "text-amber-400" : "text-rose-400"}`}>
            +{linkMetrics.linkMarginDb} dB
          </div>
          <span className="text-[11px] text-gray-500">{linkMetrics.linkMarginDb >= 10 ? "Rock Solid Link ✓" : "Weak Link"}</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Fresnel Zone Radius</span>
          <div className="text-2xl font-black text-cyan-400">{linkMetrics.fresnelRadiusMidM} m</div>
          <span className="text-[11px] text-gray-500">Clearance: {linkMetrics.clearanceM} m</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Diffraction Loss</span>
          <div className={`text-2xl font-black ${linkMetrics.diffractionLossDb > 0 ? "text-rose-400" : "text-gray-300"}`}>
            {linkMetrics.diffractionLossDb} dB
          </div>
          <span className="text-[11px] text-gray-500">Radio Horizon: {linkMetrics.radioHorizonKm} km</span>
        </div>
      </div>

      {/* Interactive 2D Topographic Terrain & Fresnel Zone Canvas */}
      <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Mountain className="w-4 h-4 text-indigo-400" />
              2D Topographic Profile & Fresnel Zone Ellipsoid
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              TX Antenna ({txHeightMeters}m) to RX Tower ({rxHeightMeters}m) over {distanceKm} km
            </p>
          </div>
        </div>

        {/* SVG Profile Canvas */}
        <div className="h-56 w-full bg-gray-950 rounded-2xl border border-gray-800 p-4 relative overflow-hidden flex items-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 160">
            {/* Ground Elevation Profile */}
            <path
              d="M 0 150 Q 200 142 400 150 L 400 160 L 0 160 Z"
              fill="#181e29"
            />

            {/* Draggable Terrain Obstacle (Mountain / Building) */}
            <polygon
              points={`${obstacleDistPct * 4 - 20},150 ${obstacleDistPct * 4},${150 - obstacleHeightM * 5} ${obstacleDistPct * 4 + 20},150`}
              fill="#334155"
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* TX Mast (Left) */}
            <line x1="20" y1="150" x2="20" y2={150 - txHeightMeters * 5} stroke="#00ff66" strokeWidth="3" />
            <circle cx="20" cy={150 - txHeightMeters * 5} r="4" fill="#00ff66" />
            <text x="10" y={135 - txHeightMeters * 5} fill="#00ff66" fontSize="9" fontWeight="bold">TX Node</text>

            {/* RX Mast (Right) */}
            <line x1="380" y1="150" x2="380" y2={150 - rxHeightMeters * 5} stroke="#00f3ff" strokeWidth="3" />
            <circle cx="380" cy={150 - rxHeightMeters * 5} r="4" fill="#00f3ff" />
            <text x="350" y={135 - rxHeightMeters * 5} fill="#00f3ff" fontSize="9" fontWeight="bold">RX Base</text>

            {/* Line of Sight (LOS) */}
            <line
              x1="20"
              y1={150 - txHeightMeters * 5}
              x2="380"
              y2={150 - rxHeightMeters * 5}
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />

            {/* 1st Fresnel Zone Ellipsoid */}
            <ellipse
              cx="200"
              cy={(150 - txHeightMeters * 5 + (150 - rxHeightMeters * 5)) / 2}
              rx="180"
              ry={linkMetrics.fresnelRadiusMidM * 2.2}
              fill="rgba(99, 102, 241, 0.12)"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          </svg>
        </div>

        {/* Obstacle Tuning Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Obstacle Position:</span>
              <span className="text-white font-bold">{obstacleDistPct}% of distance</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={obstacleDistPct}
              onChange={(e) => setObstacleDistPct(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Obstacle Height:</span>
              <span className="text-white font-bold">{obstacleHeightM} meters</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={obstacleHeightM}
              onChange={(e) => setObstacleHeightM(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
