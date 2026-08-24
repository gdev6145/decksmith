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
    txPowerDbm: 22, // 160mW (SX1262)
    rxSensitivityDbm: -137, // SF12 / 125kHz
    description: "Long-range decentralized mesh networking. High sensitivity with ultra-low packet loss over mountainous terrain.",
  },
  {
    id: "lora-868",
    name: "Meshtastic LoRa 868 MHz (EU ISM)",
    frequencyMhz: 868,
    txPowerDbm: 14, // 25mW (EU limit)
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
    name: "Wi-Fi 2.4 GHz (High-Power Alfa AWUS036ACH)",
    frequencyMhz: 2412,
    txPowerDbm: 30, // 1000mW
    rxSensitivityDbm: -92,
    description: "Directional 2.4GHz long-range bridge for high-speed IP field networking.",
  },
  {
    id: "wifi-5800",
    name: "Wi-Fi 5.8 GHz (High Throughput Backhaul)",
    frequencyMhz: 5800,
    txPowerDbm: 23, // 200mW
    rxSensitivityDbm: -85,
    description: "High bandwidth video & data streaming with minimal spectrum congestion.",
  },
];

interface CoaxCable {
  id: string;
  name: string;
  lossPer100mAt900Mhz: number; // dB per 100m
}

const COAX_CABLES: CoaxCable[] = [
  { id: "lmr400", name: "LMR-400 Ultra Low Loss (0.13 dB/m)", lossPer100mAt900Mhz: 12.8 },
  { id: "rg58", name: "RG-58 Standard Coax (0.45 dB/m)", lossPer100mAt900Mhz: 44.0 },
  { id: "rg316", name: "RG-316 Teflon Flexible (0.75 dB/m)", lossPer100mAt900Mhz: 75.0 },
  { id: "rg174", name: "RG-174 Thin Pigtail (0.98 dB/m)", lossPer100mAt900Mhz: 98.0 },
];

export default function RfLinkBudgetStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("lora-915");
  const [txPowerDbm, setTxPowerDbm] = useState<number>(22);
  const [txAntennaGainDbi, setTxAntennaGainDbi] = useState<number>(3.0); // 3dBi omni
  const [rxAntennaGainDbi, setRxAntennaGainDbi] = useState<number>(5.8); // 5.8dBi fiberglass
  const [coaxCableId, setCoaxCableId] = useState<string>("lmr400");
  const [coaxLengthMeters, setCoaxLengthMeters] = useState<number>(3.0);

  // Link Geometry
  const [distanceKm, setDistanceKm] = useState<number>(12.5);
  const [txHeightMeters, setTxHeightMeters] = useState<number>(1.8); // Handheld / desk
  const [rxHeightMeters, setRxHeightMeters] = useState<number>(10.0); // Mast / roof
  const [terrainLossDb, setTerrainLossDb] = useState<number>(4.0); // Foliage / clutter loss

  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const selectedPreset = RF_PRESETS.find((p) => p.id === selectedPresetId) || RF_PRESETS[0];
  const selectedCoax = COAX_CABLES.find((c) => c.id === coaxCableId) || COAX_CABLES[0];

  const handleSelectPreset = (preset: RfProtocolPreset) => {
    soundFx.playClick();
    setSelectedPresetId(preset.id);
    setTxPowerDbm(preset.txPowerDbm);
  };

  const metrics = useMemo(() => {
    // 1. Coax Cable Loss
    const cableLossDb = (selectedCoax.lossPer100mAt900Mhz / 100) * coaxLengthMeters * (selectedPreset.frequencyMhz / 900);

    // 2. EIRP (Effective Isotropic Radiated Power)
    const eirpDbm = txPowerDbm - cableLossDb + txAntennaGainDbi;

    // 3. Free Space Path Loss (FSPL) = 20*log10(d_km) + 20*log10(f_MHz) + 32.44
    const fsplDb = 20 * Math.log10(Math.max(0.01, distanceKm)) + 20 * Math.log10(selectedPreset.frequencyMhz) + 32.44;

    // 4. Total Received Power (RSSI)
    const totalLossDb = fsplDb + terrainLossDb + cableLossDb;
    const rssiDbm = txPowerDbm + txAntennaGainDbi + rxAntennaGainDbi - totalLossDb;

    // 5. Link Fade Margin (Headroom above sensitivity threshold)
    const fadeMarginDb = rssiDbm - selectedPreset.rxSensitivityDbm;
    const isLinkUp = fadeMarginDb >= 0;

    // 6. Geometric Radio Horizon Line-of-Sight (LoS)
    const radioHorizonKm = 3.57 * (Math.sqrt(txHeightMeters) + Math.sqrt(rxHeightMeters));

    // 7. First Fresnel Zone Radius at Midpoint (r = 8.656 * sqrt(d_km / f_GHz))
    const freqGhz = selectedPreset.frequencyMhz / 1000;
    const fresnelRadiusMeters = 8.656 * Math.sqrt(distanceKm / freqGhz);
    const fresnelClearanceMeters = fresnelRadiusMeters * 0.6; // 60% clearance standard

    return {
      cableLossDb: Number(cableLossDb.toFixed(2)),
      eirpDbm: Number(eirpDbm.toFixed(1)),
      fsplDb: Number(fsplDb.toFixed(1)),
      rssiDbm: Number(rssiDbm.toFixed(1)),
      fadeMarginDb: Number(fadeMarginDb.toFixed(1)),
      isLinkUp,
      radioHorizonKm: Number(radioHorizonKm.toFixed(1)),
      fresnelRadiusMeters: Number(fresnelRadiusMeters.toFixed(1)),
      fresnelClearanceMeters: Number(fresnelClearanceMeters.toFixed(1)),
    };
  }, [
    txPowerDbm,
    txAntennaGainDbi,
    rxAntennaGainDbi,
    selectedCoax,
    coaxLengthMeters,
    distanceKm,
    selectedPreset,
    terrainLossDb,
    txHeightMeters,
    rxHeightMeters,
  ]);

  const markdownReport = useMemo(() => {
    return `# ================================================================
# DECKSMITH WIRELESS LINK BUDGET & RF HORIZON AUDIT
# Protocol: ${selectedPreset.name} (${selectedPreset.frequencyMhz} MHz)
# Target Distance: ${distanceKm} km
# Link Status: ${metrics.isLinkUp ? "✅ LINK ESTABLISHED (STRONG SIGNAL)" : "🔴 LINK CLOSED / OUT OF RANGE"}
# ================================================================

### 1. TRANSMITTER & RADIATED POWER
- TX Power: ${txPowerDbm} dBm (${(Math.pow(10, txPowerDbm / 10) / 1000).toFixed(3)} Watts)
- TX Antenna: +${txAntennaGainDbi} dBi
- Coaxial Feedline (${selectedCoax.name}, ${coaxLengthMeters}m): -${metrics.cableLossDb} dB
- Effective Isotropic Radiated Power (EIRP): +${metrics.eirpDbm} dBm

### 2. PATH PROPAGATION & PATH LOSS
- Free Space Path Loss (FSPL): -${metrics.fsplDb} dB
- Clutter / Foliage Margin: -${terrainLossDb} dB
- RX Antenna Gain: +${rxAntennaGainDbi} dBi
- Predicted Received Signal (RSSI): ${metrics.rssiDbm} dBm
- Receiver Sensitivity Threshold: ${selectedPreset.rxSensitivityDbm} dBm
- Link Fade Margin: ${metrics.fadeMarginDb > 0 ? "+" : ""}${metrics.fadeMarginDb} dB

### 3. FRESNEL ZONE & LINE-OF-SIGHT GEOMETRY
- Optical/Radio Horizon Distance: ${metrics.radioHorizonKm} km (TX: ${txHeightMeters}m, RX: ${rxHeightMeters}m)
- 1st Fresnel Zone Radius at Midpoint: ${metrics.fresnelRadiusMeters} meters
- Required 60% Obstacle Clearance: ${metrics.fresnelClearanceMeters} meters above ground
`;
  }, [selectedPreset, distanceKm, metrics, txPowerDbm, txAntennaGainDbi, selectedCoax, coaxLengthMeters, terrainLossDb, rxAntennaGainDbi, txHeightMeters, rxHeightMeters]);

  const downloadReport = () => {
    soundFx.playConfirm();
    const blob = new Blob([markdownReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rf-link-budget-${selectedPreset.id}.md`;
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Tactical RF & Link Budget Engine
            </span>
            <span className="text-xs font-mono text-neon-green">LoRa · 2.4/5.8GHz Wi-Fi · Fresnel Radius</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Radio className="w-7 h-7 text-purple-400" />
            Wireless Range, Antenna & Link Budget Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Calculate Free Space Path Loss (FSPL), Fresnel zone obstacle clearance, coaxial cable attenuation, and line-of-sight radio horizons.
          </p>
        </div>

        {/* Quick Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/companion"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Field HUD (LoRa Scope)
          </Link>
          <Link
            to="/builder"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-neon-green" />
            Blueprint Studio
          </Link>
          <button
            onClick={downloadReport}
            className="px-3.5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export RF Report
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border space-y-2 ${metrics.isLinkUp ? "bg-emerald-950/40 border-emerald-500/50" : "bg-rose-950/40 border-rose-500/50"}`}>
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Link Fade Margin</span>
          <div className="text-2xl font-black text-white font-mono">
            {metrics.fadeMarginDb > 0 ? "+" : ""}{metrics.fadeMarginDb} dB
          </div>
          <span className={`text-xs font-bold font-mono ${metrics.fadeMarginDb > 15 ? "text-emerald-400" : metrics.fadeMarginDb > 0 ? "text-yellow-400" : "text-rose-400"}`}>
            {metrics.fadeMarginDb > 15 ? "● Ultra-Reliable Link" : metrics.fadeMarginDb > 0 ? "● Marginal / Fading Prone" : "● Link Out of Range"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Predicted Signal (RSSI)</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{metrics.rssiDbm} dBm</div>
          <span className="text-xs text-gray-400 font-mono">Sensitivity: {selectedPreset.rxSensitivityDbm} dBm</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Radio Horizon (LoS)</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{metrics.radioHorizonKm} km</div>
          <span className="text-xs text-gray-400 font-mono">Elevation: TX {txHeightMeters}m · RX {rxHeightMeters}m</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">60% Fresnel Clearance</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{metrics.fresnelClearanceMeters} m</div>
          <span className="text-xs text-gray-400 font-mono">At midpoint ({metrics.fresnelRadiusMeters}m full radius)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Protocol Preset Selector */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              1. Wireless Protocol & Frequency Band
            </h3>
            <div className="space-y-2">
              {RF_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedPresetId === preset.id
                      ? "border-purple-400 bg-purple-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{preset.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-purple-300">
                      {preset.frequencyMhz} MHz
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-normal">{preset.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Target Distance & Link Geometry */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              2. Target Distance & Elevation Geometry
            </h3>

            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                <span>Target Link Distance</span>
                <span className="text-cyan-400 font-bold">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={50.0}
                step={0.5}
                value={distanceKm}
                onChange={(e) => {
                  soundFx.playClick();
                  setDistanceKm(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>Near (0.5 km)</span>
                <span>Medium (25 km)</span>
                <span>Extreme (50 km)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">TX Antenna Height (m)</label>
                <input
                  type="number"
                  step={0.5}
                  value={txHeightMeters}
                  onChange={(e) => setTxHeightMeters(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">RX Antenna Height (m)</label>
                <input
                  type="number"
                  step={0.5}
                  value={rxHeightMeters}
                  onChange={(e) => setRxHeightMeters(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* 3. Antenna & Feedline Hardware */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neon-green" />
              3. Antennas & Coaxial Feedline Cable
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">TX Antenna Gain (dBi)</label>
                <input
                  type="number"
                  step={0.5}
                  value={txAntennaGainDbi}
                  onChange={(e) => setTxAntennaGainDbi(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-neon-green font-bold"
                />
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">RX Antenna Gain (dBi)</label>
                <input
                  type="number"
                  step={0.5}
                  value={rxAntennaGainDbi}
                  onChange={(e) => setRxAntennaGainDbi(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-neon-green font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">Coaxial Cable Type</label>
                <select
                  value={coaxCableId}
                  onChange={(e) => setCoaxCableId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-yellow-300 font-bold"
                >
                  {COAX_CABLES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-gray-400 mb-1">Coax Length (m)</label>
                <input
                  type="number"
                  step={0.5}
                  value={coaxLengthMeters}
                  onChange={(e) => setCoaxLengthMeters(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Markdown Audit Report Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Field RF Link Budget Audit
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
