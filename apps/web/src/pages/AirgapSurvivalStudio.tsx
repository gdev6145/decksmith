import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Download,
  Battery,
  Zap,
  Sliders,
  Sparkles,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Activity,
  Compass,
  Crosshair,
  Lock,
  Flame,
  Radio,
  Share2,
  HardDrive,
  Printer,
  ShieldCheck,
  EyeOff,
  MicOff,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface ShieldMaterial {
  id: string;
  name: string;
  conductivityRatio: number; // relative to copper
  permeabilityRatio: number;
  attenuationDbPerMm: number; // at 1GHz
  description: string;
}

const SHIELD_MATERIALS: ShieldMaterial[] = [
  { id: "copper_mesh", name: "Pure Copper 100-Mesh (0.11mm wire)", conductivityRatio: 1.0, permeabilityRatio: 1.0, attenuationDbPerMm: 85, description: "Maximum RF and microwave attenuation with air ventilation." },
  { id: "aluminum_foil", name: "Dual-Layer Heavy Aluminum Foil (0.05mm)", conductivityRatio: 0.61, permeabilityRatio: 1.0, attenuationDbPerMm: 65, description: "Budget Faraday barrier for field deployment and emergency enclosure wrapping." },
  { id: "silver_ripstop", name: "Silver-Plated Conductive Ripstop Fabric", conductivityRatio: 0.85, permeabilityRatio: 1.0, attenuationDbPerMm: 78, description: "Flexible, tear-resistant textile for field sleeves and go-bag lining." },
  { id: "mumetal", name: "Mu-Metal (High Permeability Alloy)", conductivityRatio: 0.03, permeabilityRatio: 20000.0, attenuationDbPerMm: 95, description: "Extreme low-frequency magnetic field shielding (50Hz/60Hz EMI)." },
];

export default function AirgapSurvivalStudio() {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("copper_mesh");
  const [shieldThicknessMm, setShieldThicknessMm] = useState<number>(0.5);
  const [targetFrequencyMhz, setTargetFrequencyMhz] = useState<number>(2400); // 2.4 GHz Wi-Fi
  const [copiedManual, setCopiedManual] = useState<boolean>(false);

  // Hardware Kill-Switch State
  const [killMic, setKillMic] = useState<boolean>(true);
  const [killCam, setKillCam] = useState<boolean>(true);
  const [killRf, setKillRf] = useState<boolean>(true);
  const [killGps, setKillGps] = useState<boolean>(false);

  const material = SHIELD_MATERIALS.find((m) => m.id === selectedMaterialId) || SHIELD_MATERIALS[0];

  // Shielding Effectiveness & Skin Depth Calculations
  const shieldMetrics = useMemo(() => {
    const fHz = targetFrequencyMhz * 1e6;
    const sigma = material.conductivityRatio * 5.8e7; // S/m
    const mu = material.permeabilityRatio * 4 * Math.PI * 1e-7;

    // Skin depth: delta = 1 / sqrt(pi * f * mu * sigma) in meters
    const skinDepthM = 1 / Math.sqrt(Math.PI * fHz * mu * sigma);
    const skinDepthMm = skinDepthM * 1000;

    // Absorption Loss: A = 8.686 * (thickness / skinDepth) in dB
    const absorptionLossDb = 8.686 * (shieldThicknessMm / Math.max(0.0001, skinDepthMm));

    // Reflection Loss: R_dB = 168 - 10*log10( (mu_r / sigma_r) * f_Hz )
    const reflectionLossDb = Math.max(0, 168 - 10 * Math.log10((material.permeabilityRatio / material.conductivityRatio) * fHz));

    const totalShieldingDb = absorptionLossDb + reflectionLossDb;
    const isTempestSecure = totalShieldingDb >= 80;

    return {
      skinDepthMm: Number(skinDepthMm.toFixed(4)),
      absorptionLossDb: Number(absorptionLossDb.toFixed(1)),
      reflectionLossDb: Number(reflectionLossDb.toFixed(1)),
      totalShieldingDb: Number(totalShieldingDb.toFixed(1)),
      isTempestSecure,
    };
  }, [material, shieldThicknessMm, targetFrequencyMhz]);

  const handleExportManual = () => {
    soundFx.playConfirm();
    let text = `# DECKSMITH AIRGAP & SURVIVAL SECURITY MANUAL\n`;
    text += `Generated: ${new Date().toISOString()}\n\n`;
    text += `## Faraday Shielding Dossier\n`;
    text += `- Material: ${material.name}\n`;
    text += `- Shield Thickness: ${shieldThicknessMm} mm\n`;
    text += `- Target Frequency: ${targetFrequencyMhz} MHz\n`;
    text += `- Skin Depth: ${shieldMetrics.skinDepthMm} mm\n`;
    text += `- Absorption Loss: ${shieldMetrics.absorptionLossDb} dB\n`;
    text += `- Total Shielding Effectiveness: ${shieldMetrics.totalShieldingDb} dB (${shieldMetrics.isTempestSecure ? "TEMPEST Grade" : "Standard Isolation"})\n\n`;
    text += `## Hardware Kill-Switch Netlist Configuration\n`;
    text += `- Microphone Hardware Isolation: ${killMic ? "ACTIVATED (DPST Ground Cut)" : "INACTIVE"}\n`;
    text += `- Camera Sensor Power Interlock: ${killCam ? "ACTIVATED (3.3V High-Side P-FET Cut)" : "INACTIVE"}\n`;
    text += `- Wi-Fi / Bluetooth Radio Kill: ${killRf ? "ACTIVATED (RF PA VDD Cut)" : "INACTIVE"}\n`;
    text += `- GPS Antenna LNA Power: ${killGps ? "ACTIVATED" : "INACTIVE"}\n`;

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decksmith-airgap-security-manual.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Airgap, Faraday Enclosures & Hardware Kill Switches
          </div>
          <h1 className="text-3xl font-black text-white">Airgap & Hardware Security Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Simulate Faraday cage attenuation, skin depth penetration, and physical hardware kill-switch wiring
          </p>
        </div>

        <button
          onClick={handleExportManual}
          className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
        >
          <Download className="w-4 h-4" />
          Export Airgap Manual (.md)
        </button>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Shielding Effectiveness</span>
          <div className={`text-2xl font-black ${shieldMetrics.isTempestSecure ? "text-neon-green" : "text-amber-400"}`}>
            {shieldMetrics.totalShieldingDb} dB
          </div>
          <span className="text-[11px] text-gray-500">{shieldMetrics.isTempestSecure ? "TEMPEST Grade ✓" : "Standard Shield"}</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Skin Depth (δ)</span>
          <div className="text-2xl font-black text-cyan-400">{shieldMetrics.skinDepthMm} mm</div>
          <span className="text-[11px] text-gray-500">At {targetFrequencyMhz} MHz</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Absorption Loss (A)</span>
          <div className="text-2xl font-black text-purple-400">+{shieldMetrics.absorptionLossDb} dB</div>
          <span className="text-[11px] text-gray-500">{shieldThicknessMm}mm Barrier Thickness</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Physical Kill Switches</span>
          <div className="text-2xl font-black text-rose-400">
            {[killMic, killCam, killRf, killGps].filter(Boolean).length} / 4 Active
          </div>
          <span className="text-[11px] text-gray-500">Hardware Interlocks</span>
        </div>
      </div>

      {/* Main Grid: Faraday Simulator (7 Cols) + Hardware Kill Switch Matrix (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Faraday Attenuation Simulator */}
        <div className="lg:col-span-7 p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-5 shadow-xl">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neon-green" />
              Faraday Shielding Material & Frequency Tuning
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-cyan-300">
              RF Barrier Model
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-bold uppercase">Shield Material:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SHIELD_MATERIALS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedMaterialId(m.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedMaterialId === m.id
                        ? "bg-gray-950 border-neon-green shadow-md shadow-neon-green/10 text-white"
                        : "bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{m.name}</div>
                    <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Shield Thickness:</span>
                  <span className="text-neon-green font-bold">{shieldThicknessMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={shieldThicknessMm}
                  onChange={(e) => setShieldThicknessMm(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-neon-green"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Target RF Frequency:</span>
                  <span className="text-cyan-400 font-bold">{targetFrequencyMhz} MHz</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="6000"
                  step="50"
                  value={targetFrequencyMhz}
                  onChange={(e) => setTargetFrequencyMhz(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Kill-Switch Interlock Panel */}
        <div className="lg:col-span-5 p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
          <div className="border-b border-gray-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Hardware Kill-Switch Interlocks
            </h2>
            <span className="text-[10px] text-rose-400 font-bold">Physical Airgap</span>
          </div>

          <div className="space-y-2.5">
            {/* Mic Kill */}
            <div className="p-3 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MicOff className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="text-xs font-bold text-white">Microphone Bias Cut</div>
                  <div className="text-[10px] text-gray-500">DPST Physical Ground Short</div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playAlert();
                  setKillMic(!killMic);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  killMic ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-gray-800 text-gray-400"
                }`}
              >
                {killMic ? "ISOLATED" : "CONNECTED"}
              </button>
            </div>

            {/* Camera Kill */}
            <div className="p-3 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <EyeOff className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">CSI Camera Power Cut</div>
                  <div className="text-[10px] text-gray-500">High-Side P-FET 3.3V Rail</div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playAlert();
                  setKillCam(!killCam);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  killCam ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-gray-800 text-gray-400"
                }`}
              >
                {killCam ? "ISOLATED" : "CONNECTED"}
              </button>
            </div>

            {/* RF Kill */}
            <div className="p-3 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-white">Wi-Fi / BT PHY Shutdown</div>
                  <div className="text-[10px] text-gray-500">RF Power Amplifier VDD Cut</div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playAlert();
                  setKillRf(!killRf);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  killRf ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-gray-800 text-gray-400"
                }`}
              >
                {killRf ? "ISOLATED" : "CONNECTED"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
