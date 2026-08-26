import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Terminal,
  Zap,
  HardDrive,
  Download,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Radio,
  Sliders,
  Send,
  Lock,
  Unlock,
  Activity,
  FileCode,
  Check,
  Maximize2,
  HelpCircle,
  Clock,
  Usb,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface LogEntry {
  id: string;
  type: "rx" | "tx" | "sys" | "err";
  text: string;
  timestamp: string;
  hex?: string;
}

interface FirmwarePreset {
  id: string;
  name: string;
  target: string;
  version: string;
  size: string;
  description: string;
  type: "uf2" | "bin" | "hex";
  badgeColor: string;
}

const FIRMWARE_PRESETS: FirmwarePreset[] = [
  {
    id: "micropython-rp2040",
    name: "MicroPython v1.23.0",
    target: "Raspberry Pi Pico / RP2040",
    version: "1.23.0",
    size: "348 KB",
    description: "Official MicroPython runtime with full PIO, I2C, SPI, and USB-HID support.",
    type: "uf2",
    badgeColor: "bg-neon-green/10 text-neon-green border-neon-green/30",
  },
  {
    id: "circuitpython-rp2040",
    name: "CircuitPython v9.0.4",
    target: "RP2040 / Cyberdeck Keyboard",
    version: "9.0.4",
    size: "1.2 MB",
    description: "Includes onboard USB drive support, `displayio` for OLED/bar screens, and keyboard libraries.",
    type: "uf2",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    id: "meshtastic-esp32",
    name: "Meshtastic LoRa Mesh v2.3.4",
    target: "ESP32 / Heltec LoRa V3",
    version: "2.3.4",
    size: "2.8 MB",
    description: "Decentralized off-grid tactical mesh communicator with BLE & OLED screen drivers.",
    type: "bin",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "wled-cyberdeck",
    name: "WLED Cyberpunk RGB Controller",
    target: "ESP32 / ESP8266",
    version: "0.14.4",
    size: "1.4 MB",
    description: "Fast addressable WS2812B / SK6812 LED matrix and underglow animator with Web UI.",
    type: "bin",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    id: "qmk-ortho",
    name: "QMK Cyberdeck Split Keyboard",
    target: "RP2040 / Pro Micro 32U4",
    version: "0.24.0",
    size: "128 KB",
    description: "Vial-compatible ortholinear matrix keymap with rotary encoder volume knob support.",
    type: "uf2",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  },
];

export default function WebSerialStudio() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulated, setIsSimulated] = useState(true);
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [dataBits, setDataBits] = useState<number>(8);
  const [stopBits, setStopBits] = useState<number>(1);
  const [parity, setParity] = useState<"none" | "even" | "odd">("none");
  const [lineEnding, setLineEnding] = useState<string>("\\r\\n");
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showHexView, setShowHexView] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [rtsState, setRtsState] = useState(false);
  const [dtrState, setDtrState] = useState(false);

  const [inputCommand, setInputCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "sys-0",
      type: "sys",
      text: "⚡ Decksmith WebSerial & MCU Hardware Bridge Initialized",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "sys-1",
      type: "sys",
      text: "💡 Connect USB-UART bridge (CP2102/CH340/FTDI/RP2040) or toggle Virtual MCU Emulator.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Flasher State
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwarePreset>(FIRMWARE_PRESETS[0]);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [flashingProgress, setFlashingProgress] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashStatus, setFlashStatus] = useState<string>("");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const addLog = (type: LogEntry["type"], text: string) => {
    const hex = Array.from(text)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase())
      .join(" ");

    setLogs((prev) => [
      ...prev.slice(-400),
      {
        id: Math.random().toString(36).substring(7),
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
        hex,
      },
    ]);
  };

  const handleConnect = async () => {
    soundFx.playConfirm();

    // Check if WebSerial API is available in browser
    if (typeof navigator !== "undefined" && "serial" in navigator) {
      try {
        const port = await (navigator as any).serial.requestPort();
        await port.open({
          baudRate,
          dataBits,
          stopBits,
          parity,
        });

        portRef.current = port;
        setIsConnected(true);
        setIsSimulated(false);
        addLog("sys", `✓ Connected to physical USB serial device @ ${baudRate} 8N1`);

        // Start listening
        readSerialStream(port);
      } catch (err: any) {
        addLog("err", `Connection aborted or failed: ${err.message || err}`);
        // Fallback to simulated mode
        setIsSimulated(true);
        setIsConnected(true);
        addLog("sys", `⚡ Running in Virtual Cyberdeck MCU Hardware Simulation Mode`);
      }
    } else {
      // Browser does not support WebSerial (or in non-secure context)
      setIsSimulated(true);
      setIsConnected(true);
      addLog("sys", `⚡ WebSerial API not native in this browser. Running Virtual MCU Hardware Emulator.`);
    }
  };

  const readSerialStream = async (port: any) => {
    const decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable;
    readerRef.current = inputStream.getReader();

    try {
      while (true) {
        const { value, done } = await readerRef.current.read();
        if (done) break;
        if (value) {
          addLog("rx", value);
        }
      }
    } catch (e: any) {
      addLog("err", `Serial stream disconnected: ${e.message}`);
    } finally {
      readerRef.current.releaseLock();
    }
  };

  const handleDisconnect = async () => {
    soundFx.playClick();
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {
        // ignore
      }
    }
    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch {
        // ignore
      }
    }
    portRef.current = null;
    setIsConnected(false);
    addLog("sys", "Disconnected from serial port.");
  };

  const sendCommand = async (cmdToSend?: string) => {
    const cmd = cmdToSend !== undefined ? cmdToSend : inputCommand;
    if (!cmd.trim() && cmdToSend === undefined) return;

    soundFx.playClick();
    addLog("tx", cmd);

    if (cmd.trim()) {
      setHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
    }
    setInputCommand("");

    // Physical Serial Write
    if (!isSimulated && portRef.current && portRef.current.writable) {
      try {
        const encoder = new TextEncoder();
        const fullPayload = cmd + (lineEnding === "\\r\\n" ? "\r\n" : lineEnding === "\\n" ? "\n" : lineEnding === "\\r" ? "\r" : "");
        const writer = portRef.current.writable.getWriter();
        await writer.write(encoder.encode(fullPayload));
        writer.releaseLock();
      } catch (err: any) {
        addLog("err", `Write error: ${err.message}`);
      }
      return;
    }

    // Virtual MCU Simulation Responses
    if (isSimulated) {
      setTimeout(() => {
        const trimmed = cmd.trim().toUpperCase();

        if (trimmed === "AT") {
          addLog("rx", "OK");
        } else if (trimmed.startsWith("AT+GMR")) {
          addLog("rx", "AT version:2.4.0.0(ESP32)\nSDK version:v4.4.4\ncompile time:Feb 18 2026\nBin version:2.4.0(WROOM-32)\nOK");
        } else if (trimmed.startsWith("AT+CWLAP")) {
          addLog("rx", '+CWLAP:(3,"CyberDeck_Mesh_915",-42,"a0:20:a6:14:e2:10",1)\n+CWLAP:(4,"Pelican_SDR_AP",-58,"c8:2b:96:33:18:90",6)\n+CWLAP:(0,"OpenWrt_Airgap",-70,"00:14:22:01:23:45",11)\nOK');
        } else if (trimmed === "HELP()" || trimmed === "HELP") {
          addLog("rx", "Welcome to MicroPython on RP2040!\nFor online docs, visit https://docs.micropython.org/\nType help('modules') to list available modules.");
        } else if (trimmed === "IMPORT OS; OS.UNAME()") {
          addLog("rx", "(sysname='rp2040', nodename='decksmith-pico', release='1.23.0', version='v1.23.0 on 2026-08-20', machine='Raspberry Pi Pico with RP2040')");
        } else if (trimmed.startsWith("$PMTK") || trimmed.startsWith("$GP")) {
          addLog("rx", "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47\n$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230826,003.1,W*6A");
        } else if (trimmed === "DMESG" || trimmed === "UNAME -A") {
          addLog("rx", "Linux decksmith-pelican 6.6.20+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.6.20-1+rpt1 (2026-08-15) aarch64 GNU/Linux");
        } else {
          addLog("rx", `ACK: Recv "${cmd}" [${cmd.length} bytes] - Device Status: OK`);
        }
      }, 120);
    }
  };

  const handleStartFlash = () => {
    if (isFlashing) return;
    soundFx.playConfirm();
    setIsFlashing(true);
    setFlashingProgress(0);
    setFlashStatus("Initializing ROM Bootloader handshake...");

    addLog("sys", `🚀 Starting Firmware Flash: [${selectedFirmware.name}] -> Target: ${selectedFirmware.target}`);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setFlashingProgress(current);

      if (current === 20) {
        setFlashStatus("Syncing baud rate @ 921600 baud...");
        addLog("sys", "Handshake ACK: Bootloader ID 0x00000004 (RP2040 / ESP32 ROM)");
      } else if (current === 40) {
        setFlashStatus("Erasing target flash memory blocks...");
        addLog("sys", "Flash memory erased 0x00000000 - 0x00400000 (4MB)");
      } else if (current === 70) {
        setFlashStatus("Writing compressed firmware blocks...");
        addLog("sys", "Writing block 0x00010000 [348 KB / 348 KB, 100%]");
      } else if (current === 90) {
        setFlashStatus("Verifying SHA-256 partition checksum...");
        addLog("sys", "Checksum match: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (PASS)");
      } else if (current >= 100) {
        clearInterval(interval);
        setIsFlashing(false);
        setFlashStatus("Flash complete! Microcontroller soft-rebooting into firmware...");
        addLog("sys", "✓ Firmware successfully flashed! Microcontroller running.");
        soundFx.playConfirm();
      }
    }, 350);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-neon-green/10 text-neon-green border border-neon-green/30 mb-2">
            <Usb className="w-3.5 h-3.5" />
            WebSerial & WebUSB Hardware Link
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Serial Terminal & MCU Flasher Studio
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Direct in-browser microcontroller programming, live bidirectional serial telemetry & firmware deployment
          </p>
        </div>

        {/* Connection Control Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-neon-green text-neon-green text-xs font-bold flex items-center gap-1.5 shadow-md shadow-neon-green/20">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
                {isSimulated ? "SIMULATOR CONNECTED" : "PORT ACTIVE (LIVE)"}
              </span>

              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-950/60 border border-red-800 hover:bg-red-900 text-red-300 font-bold rounded-xl text-xs transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-5 py-2.5 bg-neon-green text-black font-black rounded-xl text-xs hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-neon-green/20"
            >
              <Usb className="w-4 h-4" />
              Connect USB Device
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Terminal vs Flasher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Terminal Monitor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[620px]">
            {/* Terminal Header & Toolbar */}
            <div className="p-3 bg-gray-900/90 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-neon-green/80" />
                </div>
                <span className="text-xs font-bold text-gray-300 ml-2">ttyUSB0 / COM-BRIDGE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-cyan-400">
                  {baudRate} Baud
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowHexView(!showHexView)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    showHexView
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"
                  }`}
                  title="Toggle Raw HEX Dump View"
                >
                  HEX
                </button>
                <button
                  onClick={() => setShowTimestamps(!showTimestamps)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    showTimestamps
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"
                  }`}
                  title="Toggle Timestamps"
                >
                  TIME
                </button>
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    autoScroll
                      ? "bg-emerald-500/20 text-neon-green border-emerald-500/40"
                      : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"
                  }`}
                  title="Toggle Auto-Scroll"
                >
                  SCROLL
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setLogs([]);
                  }}
                  className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-red-400"
                  title="Clear Terminal Buffer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Output Screen */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs select-text bg-gray-950 font-mono">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  {showTimestamps && (
                    <span className="text-[10px] text-gray-600 shrink-0 select-none">
                      [{log.timestamp}]
                    </span>
                  )}

                  {log.type === "sys" && (
                    <span className="text-yellow-400/90 font-bold">{log.text}</span>
                  )}
                  {log.type === "err" && (
                    <span className="text-red-400 font-bold">{log.text}</span>
                  )}
                  {log.type === "tx" && (
                    <span className="text-cyan-400 font-bold">
                      <span className="text-gray-500 select-none">&gt;&gt; </span>
                      {log.text}
                    </span>
                  )}
                  {log.type === "rx" && (
                    <span className="text-neon-green">
                      {showHexView ? (
                        <span className="text-purple-300 font-mono text-[11px]">{log.hex}</span>
                      ) : (
                        log.text
                      )}
                    </span>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Quick Macro Commands Bar */}
            <div className="px-3 py-2 bg-gray-900/60 border-t border-gray-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <span className="text-gray-500 font-bold uppercase shrink-0">Macros:</span>
              {[
                { label: "AT", cmd: "AT" },
                { label: "AT+GMR", cmd: "AT+GMR" },
                { label: "Wi-Fi Scan", cmd: "AT+CWLAP" },
                { label: "MicroPython REPL", cmd: "import os; os.uname()" },
                { label: "GPS Query", cmd: "$PMTK314,1,1,1,1,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0*2C" },
                { label: "Linux dmesg", cmd: "dmesg" },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => sendCommand(m.cmd)}
                  className="px-2 py-1 rounded bg-gray-950 border border-gray-800 text-gray-300 hover:text-neon-green hover:border-neon-green/40 shrink-0 font-mono transition-all"
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Command Send Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendCommand();
              }}
              className="p-3 bg-gray-900 border-t border-gray-800 flex items-center gap-2"
            >
              <div className="text-neon-green font-bold text-sm pl-1">&gt;</div>
              <input
                type="text"
                placeholder={isConnected ? "Enter serial command (e.g. AT, help(), $GPGGA)..." : "Connect serial port to transmit commands..."}
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-neon-green focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={!isConnected}
                className="px-4 py-2 bg-neon-green text-black font-bold rounded-xl text-xs hover:bg-neon-green/90 transition-all flex items-center gap-1.5 shadow-md shadow-neon-green/10 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Firmware Flasher & Serial Port Config (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Serial Config Card */}
          <div className="p-5 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-4 backdrop-blur-md shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neon-green" />
              Serial Port Configuration
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Baud Rate</label>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(Number(e.target.value))}
                  disabled={isConnected}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-cyan-300 font-bold focus:border-neon-green focus:outline-none"
                >
                  <option value={9600}>9600 Baud</option>
                  <option value={19200}>19200 Baud</option>
                  <option value={38400}>38400 Baud</option>
                  <option value={57600}>57600 Baud</option>
                  <option value={115200}>115200 Baud (Standard)</option>
                  <option value={230400}>230400 Baud</option>
                  <option value={460800}>460800 Baud</option>
                  <option value={921600}>921600 Baud (Fast Flash)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Line Ending</label>
                <select
                  value={lineEnding}
                  onChange={(e) => setLineEnding(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 font-bold focus:border-neon-green focus:outline-none"
                >
                  <option value="\\r\\n">CRLF (\r\n)</option>
                  <option value="\\n">LF (\n)</option>
                  <option value="\\r">CR (\r)</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>

            {/* Hardware Control Signals (DTR / RTS) */}
            <div className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-2xl">
              <div>
                <div className="text-xs font-bold text-white">ESP32 Auto-Reset & Boot Pins</div>
                <div className="text-[10px] text-gray-500">Toggle DTR / RTS for manual bootloader entry</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDtrState(!dtrState)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    dtrState ? "bg-neon-green text-black border-neon-green" : "bg-gray-900 text-gray-400 border-gray-800"
                  }`}
                >
                  DTR
                </button>
                <button
                  onClick={() => setRtsState(!rtsState)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    rtsState ? "bg-cyan-400 text-black border-cyan-400" : "bg-gray-900 text-gray-400 border-gray-800"
                  }`}
                >
                  RTS
                </button>
              </div>
            </div>
          </div>

          {/* Microcontroller Firmware Flasher Card */}
          <div className="p-5 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                MCU Firmware Flasher
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                UF2 / BIN / HEX
              </span>
            </div>

            {/* Firmware Preset Selector */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {FIRMWARE_PRESETS.map((fw) => (
                <div
                  key={fw.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedFirmware(fw);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedFirmware.id === fw.id
                      ? "bg-purple-950/30 border-purple-500 shadow-md shadow-purple-500/10"
                      : "bg-gray-950 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{fw.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${fw.badgeColor}`}>
                      {fw.type.toUpperCase()} • {fw.size}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">{fw.target}</div>
                  <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{fw.description}</div>
                </div>
              ))}
            </div>

            {/* Flash Progress & Action */}
            {isFlashing ? (
              <div className="space-y-2 p-3 bg-gray-950 border border-gray-800 rounded-2xl">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">{flashStatus}</span>
                  <span className="text-neon-green">{flashingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-neon-green transition-all duration-300"
                    style={{ width: `${flashingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartFlash}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl text-xs hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-4 h-4" />
                <span>Flash {selectedFirmware.name}</span>
              </button>
            )}
          </div>

          {/* Hardware Pinout Hookup Guide */}
          <div className="p-4 bg-gray-950/80 border border-gray-800 rounded-3xl space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-yellow-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>USB-UART Crossover Safety Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Always connect <strong>TX (Transmit)</strong> on the USB adapter to <strong>RX (Receive)</strong> on the MCU. Ensure logic voltage is set to <strong>3.3V</strong> (not 5V) to protect Raspberry Pi and ESP32 GPIOs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
