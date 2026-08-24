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
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface BatteryChemistry {
  id: string;
  name: string;
  nominalVoltage: number;
  peukertExponent: number; // 1.05 - 1.35
  tempCoefficientPctPerC: number;
  cyclesTo80Pct: number;
  lowTempLimitC: number;
}

const BATTERY_CHEMISTRIES: BatteryChemistry[] = [
  { id: "lifepo4", name: "LiFePO4 (Lithium Iron Phosphate)", nominalVoltage: 3.2, peukertExponent: 1.06, tempCoefficientPctPerC: 0.5, cyclesTo80Pct: 3500, lowTempLimitC: -20 },
  { id: "li_nmc", name: "Li-Ion NMC (18650 / 21700)", nominalVoltage: 3.7, peukertExponent: 1.15, tempCoefficientPctPerC: 0.8, cyclesTo80Pct: 800, lowTempLimitC: -10 },
  { id: "lipo", name: "LiPo Flat Pouch Cell", nominalVoltage: 3.7, peukertExponent: 1.20, tempCoefficientPctPerC: 1.1, cyclesTo80Pct: 500, lowTempLimitC: 0 },
  { id: "lto", name: "LTO (Lithium Titanate - Arctic Grade)", nominalVoltage: 2.4, peukertExponent: 1.02, tempCoefficientPctPerC: 0.2, cyclesTo80Pct: 20000, lowTempLimitC: -40 },
];

export default function AirgapSurvivalStudio() {
  const [selectedChemistryId, setSelectedChemistryId] = useState<string>("lifepo4");
  const [cellCapacityAh, setCellCapacityAh] = useState<number>(10.0); // 10Ah pack
  const [ambientTempC, setAmbientTempC] = useState<number>(20); // -20°C to +45°C
  const [dischargeCurrentA, setDischargeCurrentA] = useState<number>(3.5); // System load in Amps
  const [cellCountS, setCellCountS] = useState<number>(4); // 4S pack
  const [copiedManual, setCopiedManual] = useState<boolean>(false);
  const [copiedKicad, setCopiedKicad] = useState<boolean>(false);

  const selectedChemistry = BATTERY_CHEMISTRIES.find((c) => c.id === selectedChemistryId) || BATTERY_CHEMISTRIES[0];

  // Peukert's Law & Thermal Derating Calculations
  const batteryMetrics = useMemo(() => {
    const C = cellCapacityAh; // Rated Ah (typically 20hr rate)
    const k = selectedChemistry.peukertExponent;
    const I = Math.max(0.1, dischargeCurrentA);
    const H = 20; // rated hours

    // Peukert effective runtime in hours: t = H / (I * H / C)^k
    const effectiveHours = H / Math.pow((I * H) / C, k);

    // Temperature derating factor
    // Reference 25°C. For every degree below 25°C, lose tempCoefficientPctPerC %
    const deltaT = 25 - ambientTempC;
    const tempDeratePct = deltaT > 0 ? Math.min(60, deltaT * selectedChemistry.tempCoefficientPctPerC) : 0;
    const tempFactor = (100 - tempDeratePct) / 100;

    const finalRuntimeHours = effectiveHours * tempFactor;
    const finalRuntimeMinutes = Math.round(finalRuntimeHours * 60);

    const packNominalVoltage = selectedChemistry.nominalVoltage * cellCountS;
    const packEnergyWh = packNominalVoltage * cellCapacityAh * tempFactor;

    const isSubZero = ambientTempC < 0;
    const isBelowOperatingLimit = ambientTempC < selectedChemistry.lowTempLimitC;

    return {
      packNominalVoltage: Number(packNominalVoltage.toFixed(1)),
      packEnergyWh: Number(packEnergyWh.toFixed(1)),
      finalRuntimeHours: Number(finalRuntimeHours.toFixed(1)),
      finalRuntimeMinutes,
      tempDeratePct: Number(tempDeratePct.toFixed(1)),
      effectiveAh: Number((cellCapacityAh * tempFactor).toFixed(2)),
      isSubZero,
      isBelowOperatingLimit,
    };
  }, [selectedChemistry, cellCapacityAh, ambientTempC, dischargeCurrentA, cellCountS]);

  // Airgap Standalone Disaster Recovery Manual (HTML/Markdown)
  const standaloneManualHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Decksmith Cyberdeck Airgap Disaster Recovery Manual</title>
  <style>
    body { font-family: monospace; background: #0a0e17; color: #e2e8f0; padding: 2rem; line-height: 1.6; }
    h1, h2, h3 { color: #00ff66; border-bottom: 1px solid #1e293b; padding-bottom: 0.3rem; }
    .box { background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
    .highlight { color: #38bdf8; font-weight: bold; }
    .warning { color: #f43f5e; font-weight: bold; }
    pre { background: #030712; padding: 1rem; border-radius: 6px; overflow-x: auto; color: #a5f3fc; }
  </style>
</head>
<body>
  <h1>🛠️ DECKSMITH AIRGAP FIELD DISASTER RECOVERY MANUAL</h1>
  <p><strong>Offline Reference Document</strong> · Generated for zero-cloud field operations & emergency recovery.</p>

  <div class="box">
    <h2>1. 🔋 POWER TREE & BATTERY SPECIFICATIONS</h2>
    <p>Battery Chemistry: <span class="highlight">${selectedChemistry.name}</span></p>
    <p>Configuration: <span class="highlight">${cellCountS}S Pack (${batteryMetrics.packNominalVoltage}V Nominal)</span></p>
    <p>Rated Capacity: <span class="highlight">${cellCapacityAh} Ah (${batteryMetrics.packEnergyWh} Wh)</span></p>
    <p>Ambient Temperature: <span class="highlight">${ambientTempC}°C (Thermal Derating: -${batteryMetrics.tempDeratePct}%)</span></p>
    <p>Estimated Runtime @ ${dischargeCurrentA}A: <span class="highlight">${batteryMetrics.finalRuntimeHours} Hours (${batteryMetrics.finalRuntimeMinutes} Minutes)</span></p>
  </div>

  <div class="box">
    <h2>2. 🔌 40-PIN GPIO EMERGENCY PINOUT REFERENCE</h2>
    <pre>
Pin 01: 3.3V DC Power       | Pin 02: 5.0V DC Main Power
Pin 03: I2C1 SDA (GPIO 2)   | Pin 04: 5.0V DC Main Power
Pin 05: I2C1 SCL (GPIO 3)   | Pin 06: Ground (GND)
Pin 07: GPIO 4 (1-Wire)     | Pin 08: UART TX (GPIO 14)
Pin 09: Ground (GND)        | Pin 10: UART RX (GPIO 15)
Pin 19: SPI MOSI (GPIO 10)  | Pin 20: Ground (GND)
Pin 21: SPI MISO (GPIO 9)   | Pin 22: GPIO 25 (LoRa RST)
Pin 23: SPI SCLK (GPIO 11)  | Pin 24: SPI CE0 (GPIO 8)
    </pre>
  </div>

  <div class="box">
    <h2>3. 📻 EMERGENCY TACTICAL FREQUENCIES</h2>
    <ul>
      <li><span class="highlight">Meshtastic US / LongFast</span>: 915.000 MHz (BW: 250 kHz, SF11)</li>
      <li><span class="highlight">APRS 2m Packet / ISS</span>: 144.390 MHz (1200 Baud AFSK)</li>
      <li><span class="highlight">NOAA-19 APT Weather Satellite</span>: 137.100 MHz (FM Analogue Fax)</li>
      <li><span class="highlight">ADS-B Aircraft Flight Radar</span>: 1090.000 MHz (PPM Mode-S)</li>
    </ul>
  </div>

  <div class="box">
    <h2>4. ⚡ BROWNOUT DEFENSE & PROTECTION RULES</h2>
    <ul>
      <li>Keep 5.1V rail above <strong>4.85V</strong> at all times to prevent SD card corruption.</li>
      <li>Always solder a <strong>470µF – 1000µF Low-ESR Solid Polymer Capacitor</strong> directly across the SBC 5V/GND input.</li>
      <li>Never charge Li-Ion/LiPo below <strong>0°C</strong> (Risk of permanent lithium plating and cell shorting).</li>
    </ul>
  </div>
</body>
</html>`;
  }, [selectedChemistry, cellCountS, batteryMetrics, cellCapacityAh, ambientTempC, dischargeCurrentA]);

  // KiCad 8.0 Netlist Export
  const kicadNetlist = useMemo(() => {
    return `(export (version "E")
  (design
    (source "decksmith_cyberdeck.kicad_sch")
    (date "${new Date().toISOString()}")
    (tool "Decksmith KiCad 8.0 Generator")
  )
  (components
    (comp (ref "U1") (value "SBC_SOC_MAIN") (footprint "Module:RaspberryPi_5_40Pin"))
    (comp (ref "U2") (value "USB_PD_TRIGGER_${batteryMetrics.packNominalVoltage}V") (footprint "Package_SO:SOIC-8"))
    (comp (ref "C1") (value "470uF_10V_POLYMER") (footprint "Capacitor_SMD:CP_Elec_8x10"))
    (comp (ref "D1") (value "SMAJ5.0A_TVS") (footprint "Diode_SMD:D_SMA"))
    (comp (ref "F1") (value "5A_RESETTABLE_PTC") (footprint "Fuse:Fuse_1812"))
  )
  (nets
    (net (code "1") (name "+5V_SBC")
      (node (ref "U1") (pin "2"))
      (node (ref "U1") (pin "4"))
      (node (ref "C1") (pin "1"))
      (node (ref "F1") (pin "2"))
    )
    (net (code "2") (name "GND")
      (node (ref "U1") (pin "6"))
      (node (ref "U1") (pin "9"))
      (node (ref "C1") (pin "2"))
      (node (ref "D1") (pin "2"))
    )
  )
)
`;
  }, [batteryMetrics]);

  const handleDownloadManual = () => {
    soundFx.playConfirm();
    const blob = new Blob([standaloneManualHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decksmith-field-survival-manual.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Airgap Survivability & KiCad PCB Studio
            </span>
            <span className="text-xs font-mono text-neon-green">Peukert's Law · Sub-Zero Derating · KiCad Netlist</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            Airgap Field Survival & KiCad PCB Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Calculate sub-zero battery capacity deratings via Peukert's Law, export single-file standalone offline disaster recovery HTML manuals, and generate KiCad 8.0 schematics.
          </p>
        </div>

        {/* Download Standalone Field Manual Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadManual}
            className="px-4 py-2 rounded-xl bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg shadow-neon-green/10"
          >
            <Download className="w-4 h-4" />
            Download Offline Manual (HTML)
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Field Battery Runtime</span>
          <div className="text-2xl font-black text-neon-green font-mono">
            {batteryMetrics.finalRuntimeHours} Hours
          </div>
          <span className="text-xs text-gray-400 font-mono">
            ({batteryMetrics.finalRuntimeMinutes} Mins @ {dischargeCurrentA}A Load)
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Sub-Zero Thermal Loss</span>
          <div className={`text-2xl font-black font-mono ${batteryMetrics.isSubZero ? "text-rose-400" : "text-cyan-400"}`}>
            -{batteryMetrics.tempDeratePct}%
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Ambient: {ambientTempC}°C (Effective: {batteryMetrics.effectiveAh} Ah)
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Pack Nominal Voltage</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{batteryMetrics.packNominalVoltage} V</div>
          <span className="text-xs text-gray-400 font-mono">{cellCountS}S Pack ({batteryMetrics.packEnergyWh} Wh Energy)</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Cycle Lifespan</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{selectedChemistry.cyclesTo80Pct} Cycles</div>
          <span className="text-xs text-gray-400 font-mono">Peukert Exp k: {selectedChemistry.peukertExponent}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Peukert's Law & Thermal Environmental Controls */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              1. Battery Chemistry & Peukert Derating
            </h3>
            <span className="text-xs text-gray-400 font-mono">Peukert Law: I^k · t = C</span>
          </div>

          {/* Chemistry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BATTERY_CHEMISTRIES.map((chem) => (
              <button
                key={chem.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedChemistryId(chem.id);
                }}
                className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                  selectedChemistryId === chem.id
                    ? "border-rose-400 bg-rose-950/40 text-white font-bold shadow-md shadow-rose-400/20"
                    : "border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700"
                }`}
              >
                <div className="text-white font-bold text-sm">{chem.name}</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {chem.nominalVoltage}V · k={chem.peukertExponent} · {chem.cyclesTo80Pct} cycles
                </div>
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2 border-t border-gray-800">
            {/* Ambient Temperature */}
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-300 font-bold">Ambient Operating Temperature</span>
                <span className={`font-bold ${ambientTempC < 0 ? "text-rose-400" : "text-neon-green"}`}>
                  {ambientTempC}°C {ambientTempC < 0 ? "(Sub-Zero Arctic)" : "(Standard)"}
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={45}
                step={1}
                value={ambientTempC}
                onChange={(e) => setAmbientTempC(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            {/* Pack Capacity */}
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-yellow-300 font-bold">Rated Cell Capacity (Ah)</span>
                <span className="text-neon-green font-bold">{cellCapacityAh} Ah ({cellCountS}S Pack)</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={30.0}
                step={0.5}
                value={cellCapacityAh}
                onChange={(e) => setCellCapacityAh(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* System Discharge Load */}
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold">System Continuous Current Draw</span>
                <span className="text-neon-green font-bold">{dischargeCurrentA} Amps</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={15.0}
                step={0.1}
                value={dischargeCurrentA}
                onChange={(e) => setDischargeCurrentA(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: KiCad 8.0 Netlist & Disaster Recovery Manual Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* KiCad 8.0 Netlist Exporter */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                KiCad 8.0 Schematic Netlist (.net)
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(kicadNetlist);
                  setCopiedKicad(true);
                  setTimeout(() => setCopiedKicad(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedKicad ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedKicad ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all max-h-56">
              {kicadNetlist}
            </pre>
          </div>

          {/* Standalone Field Manual Action */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <FileCode className="w-4 h-4 text-neon-green" />
              Airgap Self-Contained Manual
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Generates a single self-contained HTML file with embedded pinouts, emergency radio channels, brownout rules, and battery ratings. Copy to an SD card for 100% offline recovery.
            </p>
            <button
              onClick={handleDownloadManual}
              className="w-full py-2.5 rounded-xl bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/40 text-neon-green text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              Save Manual to SD Card (.html)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
