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
  Table,
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
  { id: "usb_pd_48v", name: "USB-C PD 3.1 EPR (48V 5A / 240W Max)", nominalVoltage: 48.0, minVoltage: 46.0, maxVoltage: 49.5, maxCurrentA: 5.0, type: "usb_pd" },
  { id: "usb_pd_28v", name: "USB-C PD 3.1 EPR (28V 5A / 140W)", nominalVoltage: 28.0, minVoltage: 27.0, maxVoltage: 29.0, maxCurrentA: 5.0, type: "usb_pd" },
  { id: "usb_pd_20v", name: "USB-C PD 3.0 (20V 5A / 100W Standard)", nominalVoltage: 20.0, minVoltage: 19.5, maxVoltage: 20.5, maxCurrentA: 5.0, type: "usb_pd" },
  { id: "lifepo4_4s", name: "4S LiFePO4 Rugged Pack (12.8V 20A)", nominalVoltage: 12.8, minVoltage: 10.0, maxVoltage: 14.4, maxCurrentA: 20.0, type: "lifepo4_4s" },
  { id: "li_ion_3s", name: "3S 18650 Pack (11.1V Nominal)", nominalVoltage: 11.1, minVoltage: 9.0, maxVoltage: 12.6, maxCurrentA: 15.0, type: "li_ion_3s" },
];

const SBS_REGISTERS = [
  { reg: "0x08", name: "Temperature()", desc: "Internal BMS cell temperature in 0.1°K", value: "2982 (25.1°C)" },
  { reg: "0x09", name: "Voltage()", desc: "Total battery pack terminal voltage in mV", value: "13240 mV" },
  { reg: "0x0A", name: "Current()", desc: "Instantaneous charge/discharge current in mA", value: "-2450 mA" },
  { reg: "0x0D", name: "RelativeStateOfCharge()", desc: "Calculated battery state of charge percentage", value: "88 %" },
  { reg: "0x10", name: "FullChargeCapacity()", desc: "Compensated battery capacity at full charge", value: "10000 mAh" },
  { reg: "0x17", name: "CycleCount()", desc: "Accumulated discharge cycles", value: "42 Cycles" },
];

export default function PowerDeliveryStudio() {
  const [sourceId, setSourceId] = useState<string>("usb_pd_20v");
  const [sbcCurrentA, setSbcCurrentA] = useState<number>(3.0);
  const [displayCurrentA, setDisplayCurrentA] = useState<number>(1.2);
  const [sensorCurrentA, setSensorCurrentA] = useState<number>(0.3);

  const selectedSource = POWER_SOURCES.find((s) => s.id === sourceId) || POWER_SOURCES[0];

  const powerMetrics = useMemo(() => {
    const sbcPowerW = 5.1 * sbcCurrentA;
    const displayPowerW = 12.0 * displayCurrentA;
    const sensorPowerW = 3.3 * sensorCurrentA;
    const totalOutputPowerW = sbcPowerW + displayPowerW + sensorPowerW;

    const totalInputPowerW = totalOutputPowerW / 0.91; // 91% Buck efficiency
    const sourceCurrentA = totalInputPowerW / selectedSource.nominalVoltage;

    return {
      totalOutputPowerW: Number(totalOutputPowerW.toFixed(1)),
      totalInputPowerW: Number(totalInputPowerW.toFixed(1)),
      sourceCurrentA: Number(sourceCurrentA.toFixed(2)),
      overallEfficiencyPct: 91,
    };
  }, [sbcCurrentA, displayCurrentA, sensorCurrentA, selectedSource]);

  const handleExportReport = () => {
    soundFx.playConfirm();
    let text = `# DECKSMITH POWER DELIVERY & BMS DOSSIER\n`;
    text += `Source: ${selectedSource.name}\n`;
    text += `- Nominal Voltage: ${selectedSource.nominalVoltage}V\n`;
    text += `- Total Output Power: ${powerMetrics.totalOutputPowerW} W\n`;
    text += `- Input Draw from Source: ${powerMetrics.sourceCurrentA} A @ ${selectedSource.nominalVoltage}V (${powerMetrics.totalInputPowerW} W)\n`;
    text += `- Converter Efficiency: ${powerMetrics.overallEfficiencyPct}%\n`;

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-power-delivery.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
            <Zap className="w-3.5 h-3.5" />
            USB-PD 3.1 Extended Power Range & Smart BMS Studio
          </div>
          <h1 className="text-3xl font-black text-white">Power Delivery & BMS Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Simulate USB-PD 3.1 EPR (28V-48V / 240W), buck converter power budgets, and Smart Battery SBS gas gauge registers
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
        >
          <Download className="w-4 h-4" />
          Export Power Dossier (.md)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Total Load Power</span>
          <div className="text-2xl font-black text-white">{powerMetrics.totalOutputPowerW} W</div>
          <span className="text-[11px] text-gray-500">Delivered to SBC & Rails</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Source Draw</span>
          <div className="text-2xl font-black text-neon-green">{powerMetrics.sourceCurrentA} A</div>
          <span className="text-[11px] text-gray-500">At {selectedSource.nominalVoltage}V ({powerMetrics.totalInputPowerW} W)</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Converter Efficiency</span>
          <div className="text-2xl font-black text-cyan-400">{powerMetrics.overallEfficiencyPct}%</div>
          <span className="text-[11px] text-gray-500">Synchronous Buck Topology</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">USB-PD Standard</span>
          <div className="text-2xl font-black text-amber-400">{selectedSource.type === "usb_pd" ? "PD 3.1 EPR" : "DC Battery"}</div>
          <span className="text-[11px] text-gray-500">Hardware Negotiation</span>
        </div>
      </div>

      {/* Main Grid: Source Config (5 Cols) + SBS Registers Table (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Selector & Rail Sliders */}
        <div className="lg:col-span-5 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Power Infeed Configuration
          </h2>

          <div className="space-y-2">
            {POWER_SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  soundFx.playClick();
                  setSourceId(s.id);
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all ${
                  sourceId === s.id
                    ? "bg-gray-950 border-amber-400 text-white shadow-md shadow-amber-400/10"
                    : "bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex justify-between text-xs font-bold">
                  <span>{s.name}</span>
                  <span className="text-amber-400">{s.nominalVoltage}V</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-800 space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>SBC Current (5.1V Rail):</span>
                <span className="text-neon-green font-bold">{sbcCurrentA} A</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={sbcCurrentA}
                onChange={(e) => setSbcCurrentA(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-neon-green"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Display Current (12V Rail):</span>
                <span className="text-cyan-400 font-bold">{displayCurrentA} A</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={displayCurrentA}
                onChange={(e) => setDisplayCurrentA(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* SBS I2C Registers */}
        <div className="lg:col-span-7 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <Table className="w-4 h-4 text-cyan-400" />
            I2C Smart Battery System (SBS 1.1) Gas Gauge Registers
          </h2>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {SBS_REGISTERS.map((r) => (
              <div key={r.reg} className="p-3 bg-gray-950 rounded-2xl border border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-cyan-400 font-mono border border-cyan-500/30">
                      {r.reg}
                    </span>
                    <span className="font-bold text-white">{r.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{r.desc}</div>
                </div>

                <span className="font-mono text-neon-green font-bold text-xs">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
