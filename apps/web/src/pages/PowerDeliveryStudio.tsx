import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Battery,
  Sliders,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Compass,
  Crosshair,
  Shield,
  FileCode,
  Check,
  Copy,
  Activity,
  Cpu,
  Flame,
  Radio,
  Lock,
  Wrench,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface PowerSource {
  id: string;
  name: string;
  nominalVoltage: number;
  minVoltage: number;
  maxVoltage: number;
  maxCurrentA: number;
  type: "usb_pd" | "li_ion_3s" | "lifepo4_4s" | "lipo_1s";
}

const POWER_SOURCES: PowerSource[] = [
  { id: "usb_pd_20v", name: "USB-C PD 3.0 (20V 5A / 100W)", nominalVoltage: 20.0, minVoltage: 19.5, maxVoltage: 20.5, maxCurrentA: 5.0, type: "usb_pd" },
  { id: "usb_pd_12v", name: "USB-C PD 3.0 (12V 3A / 36W)", nominalVoltage: 12.0, minVoltage: 11.5, maxVoltage: 12.5, maxCurrentA: 3.0, type: "usb_pd" },
  { id: "li_ion_3s", name: "3S 18650 Pack (11.1V Nominal)", nominalVoltage: 11.1, minVoltage: 9.0, maxVoltage: 12.6, maxCurrentA: 15.0, type: "li_ion_3s" },
  { id: "lifepo4_4s", name: "4S LiFePO4 Rugged Pack (12.8V)", nominalVoltage: 12.8, minVoltage: 10.0, maxVoltage: 14.4, maxCurrentA: 20.0, type: "lifepo4_4s" },
  { id: "lipo_1s", name: "1S LiPo Flat Cell (3.7V)", nominalVoltage: 3.7, minVoltage: 3.0, maxVoltage: 4.2, maxCurrentA: 5.0, type: "lipo_1s" },
];

const AWG_TABLE: { [key: number]: { mOhmsPerMeter: number; maxCurrentA: number } } = {
  18: { mOhmsPerMeter: 20.95, maxCurrentA: 7.0 },
  20: { mOhmsPerMeter: 33.30, maxCurrentA: 5.0 },
  22: { mOhmsPerMeter: 52.96, maxCurrentA: 3.5 },
  24: { mOhmsPerMeter: 84.20, maxCurrentA: 2.0 },
  26: { mOhmsPerMeter: 133.9, maxCurrentA: 1.2 },
  28: { mOhmsPerMeter: 212.9, maxCurrentA: 0.8 },
};

export default function PowerDeliveryStudio() {
  const [sourceId, setSourceId] = useState<string>("usb_pd_20v");

  // Load Rail Currents (Amps)
  const [sbcCurrentA, setSbcCurrentA] = useState<number>(3.0); // 5.1V rail (RPi5/RK3588)
  const [displayCurrentA, setDisplayCurrentA] = useState<number>(1.2); // 12V bar screen rail
  const [sensorCurrentA, setSensorCurrentA] = useState<number>(0.3); // 3.3V analog/LoRa rail

  // Wire Harness Parameters
  const [wireAwg, setWireAwg] = useState<number>(20);
  const [wireLengthCm, setWireLengthCm] = useState<number>(25);

  // Decoupling & Protection Toggles
  const [hasDecouplingCap, setHasDecouplingCap] = useState<boolean>(true);
  const [hasTvsDiode, setHasTvsDiode] = useState<boolean>(true);
  const [hasPolyfuse, setHasPolyfuse] = useState<boolean>(true);

  // USB-PD Sink Decoy Configuration
  const [pdTriggerChip, setPdTriggerChip] = useState<"ch224k" | "ip2721" | "ip5328p">("ch224k");
  const [copiedNetlist, setCopiedNetlist] = useState<boolean>(false);

  const selectedSource = POWER_SOURCES.find((s) => s.id === sourceId) || POWER_SOURCES[0];

  // Comprehensive Power Calculations
  const powerMetrics = useMemo(() => {
    // Rail Powers
    const sbcPowerW = 5.1 * sbcCurrentA;
    const displayPowerW = 12.0 * displayCurrentA;
    const sensorPowerW = 3.3 * sensorCurrentA;
    const totalOutputPowerW = sbcPowerW + displayPowerW + sensorPowerW;

    // Converter Efficiency (Buck 92%, Boost 88%, LDO 70%)
    const sbcInputPowerW = sbcPowerW / 0.92;
    const displayInputPowerW = displayPowerW / (selectedSource.nominalVoltage < 12 ? 0.88 : 0.94);
    const sensorInputPowerW = sensorPowerW / 0.75;
    const totalInputPowerW = sbcInputPowerW + displayInputPowerW + sensorInputPowerW;
    const overallEfficiencyPct = (totalOutputPowerW / totalInputPowerW) * 100;
    const sourceCurrentDrawA = totalInputPowerW / selectedSource.nominalVoltage;

    // Wire Harness Voltage Drop
    const awgSpec = AWG_TABLE[wireAwg] || AWG_TABLE[20];
    const wireLengthM = (wireLengthCm * 2) / 100; // Loop (VCC + GND return)
    const harnessResistanceOhms = (awgSpec.mOhmsPerMeter / 1000) * wireLengthM;
    const sbcVoltageDropV = sbcCurrentA * harnessResistanceOhms;
    const deliveredSbcVoltageV = 5.1 - sbcVoltageDropV;
    const isUnderVoltage = deliveredSbcVoltageV < 4.85;

    // Step-Load Transient Droop (+2.0A transient burst)
    const stepTransientCurrentA = 2.0;
    const transientDroopV = stepTransientCurrentA * (harnessResistanceOhms + (hasDecouplingCap ? 0.015 : 0.085));
    const minBurstVoltageV = deliveredSbcVoltageV - transientDroopV;
    const isBurstBrownout = minBurstVoltageV < 4.75;

    // Recommended Low-ESR Decoupling Cap size (in uF)
    const recommendedCapUf = Math.max(470, Math.round((stepTransientCurrentA * 0.0001 / 0.15) * 1000000));

    // Survivability & Right-to-Repair Scorecard (0-100)
    let score = 50;
    if (!isUnderVoltage) score += 15;
    if (!isBurstBrownout) score += 15;
    if (hasDecouplingCap) score += 10;
    if (hasTvsDiode) score += 5;
    if (hasPolyfuse) score += 5;

    return {
      totalOutputPowerW: Number(totalOutputPowerW.toFixed(1)),
      totalInputPowerW: Number(totalInputPowerW.toFixed(1)),
      overallEfficiencyPct: Number(overallEfficiencyPct.toFixed(1)),
      sourceCurrentDrawA: Number(sourceCurrentDrawA.toFixed(2)),
      harnessResistanceMOhms: Number((harnessResistanceOhms * 1000).toFixed(1)),
      sbcVoltageDropV: Number(sbcVoltageDropV.toFixed(3)),
      deliveredSbcVoltageV: Number(deliveredSbcVoltageV.toFixed(3)),
      isUnderVoltage,
      transientDroopV: Number(transientDroopV.toFixed(3)),
      minBurstVoltageV: Number(minBurstVoltageV.toFixed(3)),
      isBurstBrownout,
      recommendedCapUf,
      survivabilityScore: Math.min(100, score),
      maxWireCurrentA: awgSpec.maxCurrentA,
      isWireOverloaded: sbcCurrentA > awgSpec.maxCurrentA,
    };
  }, [selectedSource, sbcCurrentA, displayCurrentA, sensorCurrentA, wireAwg, wireLengthCm, hasDecouplingCap, hasTvsDiode, hasPolyfuse]);

  const harnessTableAscii = useMemo(() => {
    return `# Decksmith Tactical Power & Field Survivability Netlist
# Source: ${selectedSource.name}
# Input Power: ${powerMetrics.totalInputPowerW}W @ ${selectedSource.nominalVoltage}V
# Efficiency: ${powerMetrics.overallEfficiencyPct}% · Survivability Grade: ${powerMetrics.survivabilityScore}/100

[POWER RAILS]
Rail 1: 5.1V @ ${sbcCurrentA}A (SBC / SoC) -> Wire: ${wireAwg} AWG (${wireLengthCm}cm) -> Delivered: ${powerMetrics.deliveredSbcVoltageV}V (Burst Min: ${powerMetrics.minBurstVoltageV}V)
Rail 2: 12.0V @ ${displayCurrentA}A (Bar Display / SDR) -> Buck/Boost -> ${(12.0 * displayCurrentA).toFixed(1)}W
Rail 3: 3.3V @ ${sensorCurrentA}A (LoRa / GPS / RTC) -> Ultra-Low Noise LDO -> ${(3.3 * sensorCurrentA).toFixed(1)}W

[TRANSIENT & BROWNOUT MITIGATION]
Bulk Decoupling: ${hasDecouplingCap ? `${powerMetrics.recommendedCapUf}µF Solid Polymer (Low-ESR <15mΩ)` : "NONE (⚠️ High brownout risk)"}
Transient Suppressor: ${hasTvsDiode ? "SMAJ5.0A Bidirectional TVS Diode Active" : "NONE"}
Overcurrent Polyfuse: ${hasPolyfuse ? "5.0A Resettable PTC Fuse Active" : "NONE"}

[USB-C PD SINK TRIGGER (${pdTriggerChip.toUpperCase()})]
CFG1: Pulled to VCC via 4.7kΩ (Requests 20V/12V PD Profile)
CFG2: Connected to GND
CC1/CC2: 5.1kΩ Pull-down resistors to GND (UFP Sink mode)
`;
  }, [selectedSource, powerMetrics, sbcCurrentA, displayCurrentA, sensorCurrentA, wireAwg, wireLengthCm, pdTriggerChip, hasDecouplingCap, hasTvsDiode, hasPolyfuse]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              Power Delivery & BMS Studio
            </span>
            <span className="text-xs font-mono text-neon-green">Brownout Prevention · AWG Voltage Drop · Solid Polymer Caps</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-yellow-400" />
            Tactical Power Delivery & Brownout Defense Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Simulate multi-voltage DC power trees, calculate AWG harness voltage drops, model step-load transient brownouts, and configure USB-C PD sink triggers.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/solar"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Battery className="w-3.5 h-3.5 text-amber-400" />
            Solar & MPPT Studio
          </Link>
          <Link
            to="/pinout"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            40-Pin GPIO Studio
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Survivability Grade</span>
          <div className="text-2xl font-black text-neon-green font-mono">{powerMetrics.survivabilityScore} / 100</div>
          <span className="text-xs text-gray-400 font-mono">
            {powerMetrics.survivabilityScore >= 90 ? "🟢 Military / Field Grade" : "🟡 Advisory Warnings Present"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">5.1V Delivered SoC Voltage</span>
          <div className={`text-2xl font-black font-mono ${powerMetrics.isUnderVoltage ? "text-rose-500" : "text-cyan-400"}`}>
            {powerMetrics.deliveredSbcVoltageV} V
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Drop: -{powerMetrics.sbcVoltageDropV}V (Loop: {powerMetrics.harnessResistanceMOhms}mΩ)
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Burst Transient Floor</span>
          <div className={`text-2xl font-black font-mono ${powerMetrics.isBurstBrownout ? "text-rose-500" : "text-yellow-400"}`}>
            {powerMetrics.minBurstVoltageV} V
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {powerMetrics.isBurstBrownout ? "⚠️ Brownout Risk (<4.75V)" : "Stable Transient Floor"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Recommended Decoupling Cap</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{powerMetrics.recommendedCapUf} µF</div>
          <span className="text-xs text-gray-400 font-mono">Solid Polymer (Low-ESR &lt;15mΩ)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Multi-Rail Power Tree & Wiring Controls */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              1. Multi-Rail DC Power Tree
            </h3>
            <span className="text-xs text-gray-400 font-mono">Input: {selectedSource.name.split(" ")[0]}</span>
          </div>

          {/* Power Source Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-gray-300">Select Main Power Source / Battery</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POWER_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSourceId(source.id);
                  }}
                  className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                    sourceId === source.id
                      ? "border-yellow-400 bg-yellow-950/40 text-white font-bold shadow-md shadow-yellow-400/20"
                      : "border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <div className="text-white font-bold">{source.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {source.nominalVoltage}V · Max {source.maxCurrentA}A ({source.nominalVoltage * source.maxCurrentA}W)
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Load Rail Sliders */}
          <div className="space-y-4 pt-2 border-t border-gray-800">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Load Rails Current Consumption</h4>

            {/* 5.1V SBC Rail */}
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-300 font-bold">5.1V High-Current Rail (RPi 5 / RK3588 SoC)</span>
                <span className="text-neon-green font-bold">{sbcCurrentA}A ({(5.1 * sbcCurrentA).toFixed(1)}W)</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={sbcCurrentA}
                onChange={(e) => setSbcCurrentA(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* 12V Display Rail */}
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold">12.0V Display & SDR Rail (Ultrawide Bar LCD)</span>
                <span className="text-neon-green font-bold">{displayCurrentA}A ({(12.0 * displayCurrentA).toFixed(1)}W)</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={3.0}
                step={0.1}
                value={displayCurrentA}
                onChange={(e) => setDisplayCurrentA(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* 3.3V Sensor Rail */}
            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-300 font-bold">3.3V Clean Analog Rail (LoRa SX1262 / GPS / RTC)</span>
                <span className="text-neon-green font-bold">{sensorCurrentA}A ({(3.3 * sensorCurrentA).toFixed(1)}W)</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.05}
                value={sensorCurrentA}
                onChange={(e) => setSensorCurrentA(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Wire Harness Drop Controls */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Wire Harness Gauge & Resistance</h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-gray-400 mb-1">Wire Gauge (AWG)</label>
                <select
                  value={wireAwg}
                  onChange={(e) => {
                    soundFx.playClick();
                    setWireAwg(Number(e.target.value));
                  }}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white font-bold"
                >
                  <option value={18}>18 AWG (Heavy Duty - Max 7A)</option>
                  <option value={20}>20 AWG (Standard - Max 5A)</option>
                  <option value={22}>22 AWG (Medium - Max 3.5A)</option>
                  <option value={24}>24 AWG (Light - Max 2A)</option>
                  <option value={26}>26 AWG (Thin - Max 1.2A)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Harness Length (cm)</label>
                <input
                  type="number"
                  min={5}
                  max={150}
                  value={wireLengthCm}
                  onChange={(e) => setWireLengthCm(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Field Protection Hardware Toggles */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Field Hardening & Circuit Protection</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setHasDecouplingCap((prev) => !prev);
                }}
                className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all ${
                  hasDecouplingCap
                    ? "border-neon-green bg-emerald-950/40 text-white font-bold"
                    : "border-gray-800 bg-gray-950 text-gray-400"
                }`}
              >
                Polymer Cap
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setHasTvsDiode((prev) => !prev);
                }}
                className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all ${
                  hasTvsDiode
                    ? "border-cyan-400 bg-cyan-950/40 text-white font-bold"
                    : "border-gray-800 bg-gray-950 text-gray-400"
                }`}
              >
                TVS ESD Diode
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setHasPolyfuse((prev) => !prev);
                }}
                className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all ${
                  hasPolyfuse
                    ? "border-yellow-400 bg-yellow-950/40 text-white font-bold"
                    : "border-gray-800 bg-gray-950 text-gray-400"
                }`}
              >
                PTC Polyfuse
              </button>
            </div>
          </div>
        </div>

        {/* Right: USB-C PD Sink Trigger Config & Harness Netlist */}
        <div className="lg:col-span-5 space-y-6">
          {/* USB-C PD Sink IC Trigger Config */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                USB-C PD Sink Trigger Decoy
              </h3>
              <select
                value={pdTriggerChip}
                onChange={(e) => setPdTriggerChip(e.target.value as any)}
                className="bg-gray-950 border border-gray-700 rounded-lg px-2 py-1 text-xs font-mono text-yellow-400 font-bold"
              >
                <option value="ch224k">CH224K (Auto-PD/QC)</option>
                <option value="ip2721">IP2721 (Hardware Resistor)</option>
                <option value="ip5328p">IP5328P (BMS + PD SoC)</option>
              </select>
            </div>

            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Trigger Profile:</span>
                <span className="text-neon-green font-bold">20V @ 5A (100W PD 3.0)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Decoy IC Pinout:</span>
                <span className="text-cyan-300 font-bold">ESSOP-10 (Ultra-Compact)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CC Resistors:</span>
                <span className="text-yellow-400 font-bold">5.1kΩ ±1% to GND</span>
              </div>
            </div>
          </div>

          {/* Tactical Harness Netlist Exporter */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Tactical Power Netlist
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(harnessTableAscii);
                  setCopiedNetlist(true);
                  setTimeout(() => setCopiedNetlist(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedNetlist ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedNetlist ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-yellow-300 overflow-x-auto leading-relaxed select-all max-h-64">
              {harnessTableAscii}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
