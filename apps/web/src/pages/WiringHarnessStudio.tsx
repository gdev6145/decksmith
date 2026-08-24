import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Zap,
  Cpu,
  Scissors,
  Check,
  Copy,
  Download,
  Sliders,
  Sparkles,
  Compass,
  Crosshair,
  FileCode,
  Shield,
  Activity,
  CheckCircle2,
  Box,
  Wrench,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface WireDef {
  pin: number;
  sourcePin: string;
  destPin: string;
  signal: string;
  color: string;
  colorHex: string;
  gaugeAwg: number;
}

interface LoomPreset {
  id: string;
  name: string;
  category: string;
  sourceConnector: string;
  destConnector: string;
  lengthCm: number;
  description: string;
  crimpType: string;
  heatshrinkMm: number;
  wires: WireDef[];
}

const LOOM_PRESETS: LoomPreset[] = [
  {
    id: "i2c-sensor-loom",
    name: "I2C Sensor Bus Loom (Qwiic / STEMMA QT)",
    category: "Sensors",
    sourceConnector: "4-Pin JST-SH (1.0mm Pitch)",
    destConnector: "4-Pin DuPont Header (2.54mm Pitch)",
    lengthCm: 15,
    description: "Connects BME280 environmental sensors and DS3231 RTC to SBC 40-pin GPIO.",
    crimpType: "JST-SH (1.0mm) & DuPont (2.54mm)",
    heatshrinkMm: 2.0,
    wires: [
      { pin: 1, sourcePin: "Pin 1 (GND)", destPin: "Pin 6 (GND)", signal: "Ground", color: "Black", colorHex: "#1f2937", gaugeAwg: 28 },
      { pin: 2, sourcePin: "Pin 2 (3V3)", destPin: "Pin 1 (3.3V)", signal: "3.3V Power", color: "Red", colorHex: "#ef4444", gaugeAwg: 28 },
      { pin: 3, sourcePin: "Pin 3 (SDA)", destPin: "Pin 3 (SDA1)", signal: "I2C1 Data", color: "Blue", colorHex: "#3b82f6", gaugeAwg: 28 },
      { pin: 4, sourcePin: "Pin 4 (SCL)", destPin: "Pin 5 (SCL1)", signal: "I2C1 Clock", color: "Yellow", colorHex: "#eab308", gaugeAwg: 28 },
    ],
  },
  {
    id: "keyboard-loom",
    name: "Mechanical Keyboard USB Loom",
    category: "Input",
    sourceConnector: "4-Pin JST-ZH (1.5mm Pitch)",
    destConnector: "USB 2.0 Header / Type-A Internal",
    lengthCm: 12,
    description: "Internal USB 2.0 interconnect linking RP2040 keyboard controller to SBC.",
    crimpType: "JST-ZH (1.5mm) Crimp Contacts",
    heatshrinkMm: 3.0,
    wires: [
      { pin: 1, sourcePin: "Pin 1 (VBUS)", destPin: "5V USB VBUS", signal: "5.0V Power", color: "Red", colorHex: "#ef4444", gaugeAwg: 26 },
      { pin: 2, sourcePin: "Pin 2 (D-)", destPin: "USB D- (Data Negative)", signal: "USB Data -", color: "White", colorHex: "#f3f4f6", gaugeAwg: 28 },
      { pin: 3, sourcePin: "Pin 3 (D+)", destPin: "USB D+ (Data Positive)", signal: "USB Data +", color: "Green", colorHex: "#22c55e", gaugeAwg: 28 },
      { pin: 4, sourcePin: "Pin 4 (GND)", destPin: "USB Ground Return", signal: "Ground", color: "Black", colorHex: "#1f2937", gaugeAwg: 26 },
    ],
  },
  {
    id: "lora-spi-loom",
    name: "Tactical LoRa SX1262 SPI Loom",
    category: "RF Radio",
    sourceConnector: "7-Pin JST-XH (2.54mm Pitch)",
    destConnector: "SBC 40-Pin GPIO Header",
    lengthCm: 20,
    description: "High-speed SPI interconnect linking SX1262 915MHz LoRa tranceiver to SPI0.",
    crimpType: "JST-XH (2.54mm) Crimps",
    heatshrinkMm: 4.0,
    wires: [
      { pin: 1, sourcePin: "Pin 1 (3V3)", destPin: "Pin 17 (3.3V)", signal: "3.3V Power", color: "Red", colorHex: "#ef4444", gaugeAwg: 24 },
      { pin: 2, sourcePin: "Pin 2 (GND)", destPin: "Pin 20 (GND)", signal: "Ground", color: "Black", colorHex: "#1f2937", gaugeAwg: 24 },
      { pin: 3, sourcePin: "Pin 3 (MOSI)", destPin: "Pin 19 (MOSI0)", signal: "SPI0 MOSI", color: "Blue", colorHex: "#3b82f6", gaugeAwg: 26 },
      { pin: 4, sourcePin: "Pin 4 (MISO)", destPin: "Pin 21 (MISO0)", signal: "SPI0 MISO", color: "Cyan", colorHex: "#06b6d4", gaugeAwg: 26 },
      { pin: 5, sourcePin: "Pin 5 (SCLK)", destPin: "Pin 23 (SCLK0)", signal: "SPI0 Clock", color: "Yellow", colorHex: "#eab308", gaugeAwg: 26 },
      { pin: 6, sourcePin: "Pin 6 (NSS)", destPin: "Pin 24 (CE0)", signal: "Chip Select", color: "Purple", colorHex: "#a855f7", gaugeAwg: 26 },
      { pin: 7, sourcePin: "Pin 7 (RST)", destPin: "Pin 11 (GPIO17)", signal: "Radio Reset", color: "Orange", colorHex: "#f97316", gaugeAwg: 26 },
    ],
  },
  {
    id: "main-power-loom",
    name: "Main Battery to Buck Switch Loom",
    category: "Power",
    sourceConnector: "XT30 High-Current Plug",
    destConnector: "Heavy-Duty Toggle Switch & Buck",
    lengthCm: 18,
    description: "High-current power distribution harness handling up to 15A continuous current.",
    crimpType: "XT30 Solder & 4.8mm Spade Terminals",
    heatshrinkMm: 6.0,
    wires: [
      { pin: 1, sourcePin: "XT30 (+)", destPin: "Switch IN (+)", signal: "12V-20V Battery VCC", color: "Red", colorHex: "#ef4444", gaugeAwg: 18 },
      { pin: 2, sourcePin: "XT30 (-)", destPin: "Buck GND Return (-)", signal: "System Main Ground", color: "Black", colorHex: "#1f2937", gaugeAwg: 18 },
    ],
  },
  {
    id: "fan-pwm-loom",
    name: "Active Cooling Fan PWM Loom",
    category: "Cooling",
    sourceConnector: "3-Pin JST-PH (2.0mm Pitch)",
    destConnector: "SBC 5V/GND/GPIO18 PWM",
    lengthCm: 10,
    description: "3-wire tachometer/PWM cable for Noctua 5V 40mm brushless cooling fans.",
    crimpType: "JST-PH (2.0mm) Crimps",
    heatshrinkMm: 2.5,
    wires: [
      { pin: 1, sourcePin: "Pin 1 (+5V)", destPin: "Pin 4 (5.0V)", signal: "5V Fan Power", color: "Red", colorHex: "#ef4444", gaugeAwg: 26 },
      { pin: 2, sourcePin: "Pin 2 (GND)", destPin: "Pin 14 (GND)", signal: "Fan Ground", color: "Black", colorHex: "#1f2937", gaugeAwg: 26 },
      { pin: 3, sourcePin: "Pin 3 (PWM)", destPin: "Pin 12 (PWM0)", signal: "25kHz PWM Control", color: "Yellow", colorHex: "#eab308", gaugeAwg: 28 },
    ],
  },
];

export default function WiringHarnessStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("i2c-sensor-loom");
  const [harnessLengthCm, setHarnessLengthCm] = useState<number>(15);
  const [copiedWireviz, setCopiedWireviz] = useState<boolean>(false);

  const selectedPreset = LOOM_PRESETS.find((p) => p.id === selectedPresetId) || LOOM_PRESETS[0];

  // Bill of Materials Calculations
  const bomMetrics = useMemo(() => {
    const wireCount = selectedPreset.wires.length;
    const totalWireLengthCm = wireCount * harnessLengthCm;
    const totalWireLengthM = (totalWireLengthCm / 100).toFixed(2);
    const crimpContactsCount = wireCount * 2; // Two ends
    const heatshrinkCutLengthCm = 3.0; // 3cm sleeve per end

    return {
      wireCount,
      totalWireLengthCm,
      totalWireLengthM,
      crimpContactsCount,
      heatshrinkCutLengthCm,
    };
  }, [selectedPreset, harnessLengthCm]);

  // Standard WireViz YAML Export
  const wirevizYaml = useMemo(() => {
    return `# WireViz Harness Definition
# Loom: ${selectedPreset.name}
# Length: ${harnessLengthCm} cm
connectors:
  X1:
    type: ${selectedPreset.sourceConnector}
    pincount: ${selectedPreset.wires.length}
  X2:
    type: ${selectedPreset.destConnector}
    pincount: ${selectedPreset.wires.length}

cables:
  W1:
    length: ${harnessLengthCm / 100}
    wirecount: ${selectedPreset.wires.length}
    colors: [${selectedPreset.wires.map((w) => w.color.toLowerCase()).join(", ")}]
    gauge: ${selectedPreset.wires[0].gaugeAwg} AWG

connections:
${selectedPreset.wires
  .map((w) => `  - [X1:${w.pin}, W1:${w.pin}, X2:${w.pin}] # ${w.signal}`)
  .join("\n")}
`;
  }, [selectedPreset, harnessLengthCm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Wiring Harness & Loom Studio
            </span>
            <span className="text-xs font-mono text-neon-green">Pin-to-Pin Interconnects · WireViz YAML · Crimp BOM</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Layers className="w-7 h-7 text-cyan-400" />
            Tactical Wiring Harness & Cable Assembly Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Design pin-to-pin cyberdeck cable looms, assign color-coded signal routing, calculate crimp pin counts, and export standard WireViz YAML diagrams.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/pinout"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            40-Pin GPIO Studio
          </Link>
          <Link
            to="/power"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Power Delivery Studio
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Total Wire Consumption</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{bomMetrics.totalWireLengthM} Meters</div>
          <span className="text-xs text-gray-400 font-mono">{bomMetrics.wireCount} Conductors @ {harnessLengthCm}cm each</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Crimp Contacts Required</span>
          <div className="text-2xl font-black text-neon-green font-mono">{bomMetrics.crimpContactsCount} Pins</div>
          <span className="text-xs text-gray-400 font-mono">Tool: {selectedPreset.crimpType.split(" ")[0]}</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Heatshrink Tubing</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">Ø {selectedPreset.heatshrinkMm}mm</div>
          <span className="text-xs text-gray-400 font-mono">2× 30mm strain relief sleeves</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Loom Classification</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{selectedPreset.category}</div>
          <span className="text-xs text-gray-400 font-mono">Wire: {selectedPreset.wires[0].gaugeAwg} AWG Silicone</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Visual Pin-to-Pin Loom Diagram */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              Pin-to-Pin Interconnect Matrix
            </h3>
            <span className="text-xs text-gray-400 font-mono">Length: {harnessLengthCm}cm</span>
          </div>

          {/* Connector Headers Header */}
          <div className="flex justify-between text-xs font-mono text-gray-400 px-2">
            <span className="font-bold text-cyan-300">SOURCE: {selectedPreset.sourceConnector}</span>
            <span className="font-bold text-neon-green">DEST: {selectedPreset.destConnector}</span>
          </div>

          {/* Pin-to-Pin Wire Lines */}
          <div className="space-y-2.5">
            {selectedPreset.wires.map((wire) => (
              <div
                key={wire.pin}
                className="p-3 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-between gap-4 text-xs font-mono transition-all hover:border-gray-700"
              >
                {/* Source Pin */}
                <div className="flex items-center gap-2 w-1/3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center font-bold text-white text-[11px]">
                    {wire.pin}
                  </span>
                  <span className="truncate text-gray-200">{wire.sourcePin}</span>
                </div>

                {/* Wire Beam with Color & Signal */}
                <div className="flex-1 flex flex-col items-center justify-center px-2">
                  <div className="w-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: wire.colorHex }} />
                    <div className="flex-1 h-1 rounded-full shadow-sm" style={{ backgroundColor: wire.colorHex }} />
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: wire.colorHex }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                    {wire.signal} ({wire.gaugeAwg} AWG)
                  </span>
                </div>

                {/* Destination Pin */}
                <div className="flex items-center justify-end gap-2 w-1/3 min-w-0 text-right">
                  <span className="truncate text-gray-200">{wire.destPin}</span>
                  <span className="w-6 h-6 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center font-bold text-neon-green text-[11px]">
                    {wire.pin}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Length Slider */}
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5 pt-3">
            <div className="flex justify-between text-xs font-mono text-gray-300">
              <span>Harness Loom Length</span>
              <span className="text-cyan-400 font-bold">{harnessLengthCm} cm</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={harnessLengthCm}
              onChange={(e) => setHarnessLengthCm(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Presets & WireViz YAML Exporter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Selector */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Box className="w-4 h-4 text-cyan-400" />
              1. Cable Assembly Presets ({LOOM_PRESETS.length})
            </h3>
            <div className="space-y-2">
              {LOOM_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedPresetId(preset.id);
                    setHarnessLengthCm(preset.lengthCm);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPresetId === preset.id
                      ? "border-cyan-400 bg-cyan-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{preset.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-cyan-300">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-normal">{preset.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* WireViz YAML Exporter */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                WireViz YAML Loom Definition
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(wirevizYaml);
                  setCopiedWireviz(true);
                  setTimeout(() => setCopiedWireviz(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedWireviz ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedWireviz ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all max-h-56">
              {wirevizYaml}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
