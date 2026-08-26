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

export default function LogicAnalyzerStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedProtocolId, setSelectedProtocolId] = useState<"i2c" | "spi" | "uart" | "onewire">("i2c");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeDivUs, setTimeDivUs] = useState<number>(50);
  const [glitchInjection, setGlitchInjection] = useState<boolean>(false);
  const [cursorAUs, setCursorAUs] = useState<number>(120);
  const [cursorBUs, setCursorBUs] = useState<number>(340);

  const selectedProtocol = PROTOCOLS.find((p) => p.id === selectedProtocolId) || PROTOCOLS[0];

  const deltaTUs = Math.abs(cursorBUs - cursorAUs);
  const measuredFreqKhz = deltaTUs > 0 ? Number((1000 / deltaTUs).toFixed(2)) : 0;

  // Render Multi-Channel Waveforms
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 700;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "#07090e";
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = "#181e29";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const channelColors = ["#00ff66", "#00f3ff", "#f59e0b", "#a855f7"];
    const channelHeight = 70;

    // Draw 4 Digital Waveforms
    selectedProtocol.channels.slice(0, 4).forEach((chName, idx) => {
      const topY = 20 + idx * channelHeight;
      const lowY = topY + 40;
      const highY = topY + 10;
      const color = channelColors[idx % channelColors.length];

      // Channel Label
      ctx.fillStyle = color;
      ctx.font = "bold 10px monospace";
      ctx.fillText(chName, 12, topY + 6);

      // Channel Baseline
      ctx.strokeStyle = "#1e2638";
      ctx.beginPath();
      ctx.moveTo(0, lowY);
      ctx.lineTo(width, lowY);
      ctx.stroke();

      // Digital Pulse Waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, lowY);

      let currentHigh = false;
      for (let x = 0; x < width; x += 30) {
        if (glitchInjection && idx === 1 && x > 200 && x < 280) {
          // Glitch Noise
          ctx.lineTo(x, lowY - 15);
        } else {
          currentHigh = (Math.floor(x / 40) + idx) % 2 === 0;
          ctx.lineTo(x, currentHigh ? highY : lowY);
          ctx.lineTo(x + 25, currentHigh ? highY : lowY);
        }
      }
      ctx.stroke();
    });

    // Draw Timing Cursors A & B
    const caX = (cursorAUs / 500) * width;
    const cbX = (cursorBUs / 500) * width;

    // Cursor A (Yellow)
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(caX, 0);
    ctx.lineTo(caX, height);
    ctx.stroke();
    ctx.fillStyle = "#facc15";
    ctx.fillText(`A: ${cursorAUs}µs`, caX + 4, 15);

    // Cursor B (Cyan)
    ctx.strokeStyle = "#00f3ff";
    ctx.beginPath();
    ctx.moveTo(cbX, 0);
    ctx.lineTo(cbX, height);
    ctx.stroke();
    ctx.fillStyle = "#00f3ff";
    ctx.fillText(`B: ${cursorBUs}µs`, cbX + 4, 15);
    ctx.setLineDash([]);
  }, [selectedProtocol, isPlaying, timeDivUs, glitchInjection, cursorAUs, cursorBUs]);

  const handleExportCsv = () => {
    soundFx.playConfirm();
    let csv = `timestamp_us,ch0_scl,ch1_sda,ch2_int,ch3_vcc\n`;
    for (let t = 0; t <= 500; t += 5) {
      csv += `${t},${(t % 40 < 20) ? 1 : 0},${(t % 80 < 40) ? 1 : 0},1,1\n`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-${selectedProtocol.id}-capture.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <Activity className="w-3.5 h-3.5" />
            Digital Signal Analyzer & Protocol Timing Engine
          </div>
          <h1 className="text-3xl font-black text-white">Logic Analyzer & Protocol Decoder</h1>
          <p className="text-xs text-gray-400 mt-1">
            Decode I2C/SPI/UART/1-Wire timing waveforms, measure clock skew & delta-t, and simulate bus glitches
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-neon-green/20"
        >
          <Download className="w-4 h-4" />
          Export PulseView CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Delta Time (Δt)</span>
          <div className="text-2xl font-black text-neon-green">{deltaTUs} µs</div>
          <span className="text-[11px] text-gray-500">Between Cursor A & B</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Measured Frequency</span>
          <div className="text-2xl font-black text-cyan-400">{measuredFreqKhz} kHz</div>
          <span className="text-[11px] text-gray-500">Target: {selectedProtocol.clockSpeedKhz} kHz</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Bus Protocol</span>
          <div className="text-2xl font-black text-white">{selectedProtocol.name.split(" ")[0]}</div>
          <span className="text-[11px] text-gray-500">{selectedProtocol.category}</span>
        </div>

        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Glitch Injection</span>
          <div className={`text-2xl font-black ${glitchInjection ? "text-rose-400" : "text-gray-400"}`}>
            {glitchInjection ? "ACTIVE ⚠️" : "OFF"}
          </div>
          <span className="text-[11px] text-gray-500">{glitchInjection ? "Simulating Noise" : "Clean Signal"}</span>
        </div>
      </div>

      {/* Waveform Canvas & Controls */}
      <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div className="flex gap-2">
            {PROTOCOLS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedProtocolId(p.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedProtocolId === p.id
                    ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/20"
                    : "bg-gray-950 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                {p.name.split(" ")[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundFx.playAlert();
              setGlitchInjection(!glitchInjection);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              glitchInjection ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-gray-950 text-gray-400 border border-gray-800"
            }`}
          >
            {glitchInjection ? "Disable Glitch" : "Inject Signal Glitch"}
          </button>
        </div>

        {/* HTML5 Canvas */}
        <div className="bg-gray-950 rounded-2xl border border-gray-800 p-2 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-[360px]" />
        </div>

        {/* Cursor Tuning Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Cursor A Position:</span>
              <span className="text-yellow-400 font-bold">{cursorAUs} µs</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={cursorAUs}
              onChange={(e) => setCursorAUs(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Cursor B Position:</span>
              <span className="text-cyan-400 font-bold">{cursorBUs} µs</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={cursorBUs}
              onChange={(e) => setCursorBUs(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
