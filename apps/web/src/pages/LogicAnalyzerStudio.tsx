import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Cpu,
  Layers,
  Zap,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  FileCode,
  Shield,
  Compass,
  Crosshair,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface ProtocolPreset {
  id: "i2c" | "spi" | "uart" | "onewire";
  name: string;
  category: string;
  channels: string[];
  clockSpeedKhz: number;
  packetSample: string;
  description: string;
}

const PROTOCOLS: ProtocolPreset[] = [
  {
    id: "i2c",
    name: "I2C Sensor Bus (400 kHz Fast-Mode)",
    category: "Synchronous 2-Wire",
    channels: ["CH0: SCL (Clock)", "CH1: SDA (Data)", "CH2: INT#", "CH3: 3.3V VCC"],
    clockSpeedKhz: 400,
    packetSample: "START -> ADDR 0x68 [W] -> ACK -> REG 0x75 -> ACK -> RESTART -> ADDR 0x68 [R] -> ACK -> DATA 0x48 (WHO_AM_I) -> NACK -> STOP",
    description: "Inter-Integrated Circuit communication used by BME688, DS3231 RTC, and OLED displays.",
  },
  {
    id: "spi",
    name: "SPI Flash & Display Bus (Mode 0 / 10 MHz)",
    category: "Synchronous 4-Wire",
    channels: ["CH0: SCLK (Clock)", "CH1: MOSI (Master Out)", "CH2: MISO (Master In)", "CH3: CS# (Chip Select)"],
    clockSpeedKhz: 10000,
    packetSample: "CS# LOW -> CMD 0x03 (READ) -> ADDR 0x001000 -> DATA_IN 0xDEADBEEF -> CS# HIGH",
    description: "Serial Peripheral Interface high-speed synchronous protocol for LoRa SX1262 and e-paper screens.",
  },
  {
    id: "uart",
    name: "UART Serial Terminal (115200 8N1)",
    category: "Asynchronous Serial",
    channels: ["CH0: TX (Transmit)", "CH1: RX (Receive)", "CH2: RTS#", "CH3: CTS#"],
    clockSpeedKhz: 115.2,
    packetSample: "START -> 0x44 ('D') -> 0x45 ('E') -> 0x43 ('C') -> 0x4B ('K') -> STOP",
    description: "Universal Asynchronous Receiver-Transmitter used by GPS NMEA, microcontrollers, and Linux kernel consoles.",
  },
  {
    id: "onewire",
    name: "1-Wire Dallas Bus (DS18B20 Temp)",
    category: "Single-Wire Protocol",
    channels: ["CH0: DQ (Data / Pullup)", "CH1: GND", "CH2: NC", "CH3: NC"],
    clockSpeedKhz: 16.3,
    packetSample: "RESET PULSE (480µs) -> PRESENCE PULSE (60µs) -> SKIP ROM (0xCC) -> READ SCRATCHPAD (0xBE) -> 0x50 0x01 (+21.0°C)",
    description: "Maxim 1-Wire protocol with open-drain bidirectional line and parasite power support.",
  },
];

interface AnalyzerHardware {
  id: string;
  name: string;
  channels: number;
  sampleRateMsps: number;
  inputVoltageRange: string;
  priceUsd: number;
}

const ANALYZER_DEVICES: AnalyzerHardware[] = [
  { id: "fx2lp-8ch", name: "USB 8-Channel 24MHz Logic Analyzer (FX2LP)", channels: 8, sampleRateMsps: 24, inputVoltageRange: "0V - 5.5V (3.3V/5V TTL)", priceUsd: 7.95 },
  { id: "rp2040-logic", name: "Raspberry Pi Pico RP2040 Logic Analyzer (PIO)", channels: 8, sampleRateMsps: 100, inputVoltageRange: "0V - 3.3V Native", priceUsd: 4.0 },
  { id: "kingst-la2016", name: "Kingst LA2016 16-Channel Analyzer", channels: 16, sampleRateMsps: 200, inputVoltageRange: "-50V to +50V Threshold", priceUsd: 125.0 },
  { id: "saleae-logic8", name: "Saleae Logic 8 USB 3.0 Pro", channels: 8, sampleRateMsps: 500, inputVoltageRange: "-10V to +10V Analog + Digital", priceUsd: 499.0 },
];

export default function LogicAnalyzerStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedProtocolId, setSelectedProtocolId] = useState<"i2c" | "spi" | "uart" | "onewire">("i2c");
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>("fx2lp-8ch");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeDivUs, setTimeDivUs] = useState<number>(50); // 10us - 500us
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false);

  const selectedProtocol = PROTOCOLS.find((p) => p.id === selectedProtocolId) || PROTOCOLS[0];
  const selectedHardware = ANALYZER_DEVICES.find((d) => d.id === selectedHardwareId) || ANALYZER_DEVICES[0];

  // Animated Logic Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let timeOffset = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1;

      // Vertical Time Division Grid
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal Channel Separators (4 channels)
      const chHeight = h / 4;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * chHeight);
        ctx.lineTo(w, i * chHeight);
        ctx.stroke();
      }

      // Channel Trace Colors
      const channelColors = ["#00ff66", "#06b6d4", "#eab308", "#ec4899"];

      // Draw 4 Digital Channels
      for (let ch = 0; ch < 4; ch++) {
        const topY = ch * chHeight + 10;
        const lowY = ch * chHeight + chHeight - 12;
        const highY = topY + 6;

        ctx.strokeStyle = channelColors[ch];
        ctx.lineWidth = 2;
        ctx.beginPath();

        let prevLevel = 0;
        for (let x = 0; x < w; x += 4) {
          // Synthetic digital pattern based on protocol and channel
          let bit = 0;
          const t = (x + timeOffset) * 0.05;

          if (selectedProtocol.id === "i2c") {
            if (ch === 0) bit = Math.sin(t * 2) > 0 ? 1 : 0; // SCL Clock
            else if (ch === 1) bit = Math.sin(t * 0.7) > 0.2 ? 1 : 0; // SDA Data
            else if (ch === 2) bit = 1; // INT
            else bit = 1; // VCC
          } else if (selectedProtocol.id === "spi") {
            if (ch === 0) bit = Math.sin(t * 3) > 0 ? 1 : 0; // SCLK
            else if (ch === 1) bit = Math.sin(t * 1.1) > 0 ? 1 : 0; // MOSI
            else if (ch === 2) bit = Math.sin(t * 1.5) > -0.2 ? 1 : 0; // MISO
            else bit = Math.sin(t * 0.2) > 0.8 ? 1 : 0; // CS# (Active Low)
          } else if (selectedProtocol.id === "uart") {
            if (ch === 0) bit = Math.sin(t * 0.9 + Math.cos(t)) > 0 ? 1 : 0; // TX
            else if (ch === 1) bit = Math.sin(t * 1.2) > -0.1 ? 1 : 0; // RX
            else bit = 0;
          } else {
            // 1-Wire
            if (ch === 0) bit = Math.sin(t * 0.4) > -0.5 ? 1 : 0; // DQ Open-Drain
            else bit = 0;
          }

          const currentY = bit === 1 ? highY : lowY;

          if (x === 0) {
            ctx.moveTo(x, currentY);
          } else {
            if (bit !== prevLevel) {
              // Vertical transition edge
              ctx.lineTo(x, prevLevel === 1 ? highY : lowY);
              ctx.lineTo(x, currentY);
            } else {
              ctx.lineTo(x, currentY);
            }
          }
          prevLevel = bit;
        }
        ctx.stroke();

        // Channel Label
        ctx.fillStyle = channelColors[ch];
        ctx.font = "bold 10px monospace";
        ctx.fillText(selectedProtocol.channels[ch] || `CH${ch}`, 8, topY + 12);
      }

      if (isPlaying) {
        timeOffset += 3;
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedProtocol, isPlaying, timeDivUs]);

  // PulseView / sigrok CSV Session Exporter
  const sigrokCsvExport = useMemo(() => {
    return `# Decksmith Logic Analyzer Capture
# Protocol: ${selectedProtocol.name}
# Samplerate: ${selectedHardware.sampleRateMsps} MHz
# Channels: 4
Time (us),CH0,CH1,CH2,CH3
0.0,1,1,1,1
0.5,0,1,1,1
1.0,0,0,1,1
1.5,1,0,1,1
2.0,1,1,1,1
2.5,0,1,1,0
3.0,0,0,1,0
3.5,1,0,1,0
`;
  }, [selectedProtocol, selectedHardware]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-neon-green border border-neon-green/30">
              Digital Hardware Logic Analyzer
            </span>
            <span className="text-xs font-mono text-cyan-400">I2C · SPI · UART · 1-Wire · PulseView Exporter</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-neon-green" />
            Hardware Bus Sniffer & Logic Analyzer Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Capture and decode digital I2C, SPI, and UART waveforms in real time, inspect timing packet annotations, and export PulseView/sigrok logic traces.
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
            to="/harness"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Wiring Loom Studio
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Protocol Clock Speed</span>
          <div className="text-2xl font-black text-neon-green font-mono">
            {selectedProtocol.clockSpeedKhz >= 1000
              ? `${(selectedProtocol.clockSpeedKhz / 1000).toFixed(1)} MHz`
              : `${selectedProtocol.clockSpeedKhz} kHz`}
          </div>
          <span className="text-xs text-gray-400 font-mono">{selectedProtocol.category}</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Analyzer Sampling Rate</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{selectedHardware.sampleRateMsps} MSPS</div>
          <span className="text-xs text-gray-400 font-mono">{selectedHardware.channels} Logic Channels</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Timebase Division</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{timeDivUs} µs / Div</div>
          <span className="text-xs text-gray-400 font-mono">Zoom Level: {((1 / timeDivUs) * 1000).toFixed(0)}x</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Hardware Threshold</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{selectedHardware.inputVoltageRange.split(" ")[0]}</div>
          <span className="text-xs text-gray-400 font-mono">${selectedHardware.priceUsd} USB Module</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Waveform Canvas & Live Traces */}
        <div className="lg:col-span-8 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse" />
              Digital Logic Timing Waveform
            </h3>

            {/* Play/Pause & Reset Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsPlaying((prev) => !prev);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-mono text-white flex items-center gap-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-yellow-400" /> : <Play className="w-3.5 h-3.5 text-neon-green" />}
                {isPlaying ? "Freeze" : "Capture"}
              </button>
            </div>
          </div>

          {/* Canvas Waveform */}
          <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950 p-2">
            <canvas ref={canvasRef} width={640} height={240} className="w-full h-60 block" />
          </div>

          {/* Packet Stream Decoder */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Protocol Packet Inspector</h4>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto select-all">
              {selectedProtocol.packetSample}
            </div>
          </div>

          {/* Timebase Scrubbing Slider */}
          <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-300">Timebase Horizontal Zoom (µs/Div)</span>
              <span className="text-neon-green font-bold">{timeDivUs} µs</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={timeDivUs}
              onChange={(e) => setTimeDivUs(Number(e.target.value))}
              className="w-full accent-neon-green cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Protocol Selector & PulseView Exporter */}
        <div className="lg:col-span-4 space-y-6">
          {/* Target Protocol */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Cpu className="w-4 h-4 text-cyan-400" />
              1. Communication Protocol
            </h3>
            <div className="space-y-2">
              {PROTOCOLS.map((proto) => (
                <button
                  key={proto.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedProtocolId(proto.id);
                  }}
                  className={`w-full p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                    selectedProtocolId === proto.id
                      ? "border-neon-green bg-emerald-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <div className="text-white font-bold">{proto.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{proto.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Analyzer Hardware */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Zap className="w-4 h-4 text-yellow-400" />
              2. Logic Analyzer Hardware
            </h3>
            <select
              value={selectedHardwareId}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedHardwareId(e.target.value);
              }}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 font-mono text-yellow-400 font-bold text-xs"
            >
              {ANALYZER_DEVICES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (${d.priceUsd})
                </option>
              ))}
            </select>
          </div>

          {/* PulseView sigrok Exporter */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                PulseView / sigrok (.csv)
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(sigrokCsvExport);
                  setCopiedCsv(true);
                  setTimeout(() => setCopiedCsv(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedCsv ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedCsv ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all max-h-40">
              {sigrokCsvExport}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
