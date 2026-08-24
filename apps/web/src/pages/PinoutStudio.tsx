import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Search,
  Sparkles,
  Zap,
  Sliders,
  Layers,
  Copy,
  Check,
  Download,
  Crosshair,
  Compass,
  Radio,
  Activity,
  HardDrive,
  Keyboard,
  Sun,
  Flame,
  Info,
  Shield,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface PinDef {
  pin: number;
  name: string;
  bcm?: number;
  type: "power_3v3" | "power_5v" | "gnd" | "i2c" | "spi" | "uart" | "pwm" | "gpio" | "i2s";
  desc: string;
  altFuncs?: string[];
}

const RPI_40_PINS: PinDef[] = [
  { pin: 1, name: "3.3V Power", type: "power_3v3", desc: "3.3V DC Power Rail (Max 50mA total draw across sensors)" },
  { pin: 2, name: "5.0V Power", type: "power_5v", desc: "5.0V DC Power Rail (Directly connected to USB-C input)" },
  { pin: 3, name: "GPIO 2 (SDA1)", bcm: 2, type: "i2c", desc: "I2C1 Data line with fixed 1.8kΩ pull-up resistor", altFuncs: ["I2C1_SDA", "SMI_D0"] },
  { pin: 4, name: "5.0V Power", type: "power_5v", desc: "5.0V DC Power Rail (High-current for active cooling and HATs)" },
  { pin: 5, name: "GPIO 3 (SCL1)", bcm: 3, type: "i2c", desc: "I2C1 Clock line with fixed 1.8kΩ pull-up resistor", altFuncs: ["I2C1_SCL", "SMI_D1"] },
  { pin: 6, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 7, name: "GPIO 4 (GPCLK0)", bcm: 4, type: "gpio", desc: "General purpose clock output / 1-Wire default", altFuncs: ["GPCLK0", "SMI_D2", "1-Wire"] },
  { pin: 8, name: "GPIO 14 (TXD0)", bcm: 14, type: "uart", desc: "UART0 Transmit line (Primary serial console / GPS)", altFuncs: ["UART0_TXD", "UART1_TXD"] },
  { pin: 9, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 10, name: "GPIO 15 (RXD0)", bcm: 15, type: "uart", desc: "UART0 Receive line (Primary serial console / GPS)", altFuncs: ["UART0_RXD", "UART1_RXD"] },
  { pin: 11, name: "GPIO 17", bcm: 17, type: "gpio", desc: "General Purpose I/O pin (Recommended LoRa SX1262 RST)", altFuncs: ["UART0_RTS", "SPI1_CE1"] },
  { pin: 12, name: "GPIO 18 (PWM0)", bcm: 18, type: "pwm", desc: "Hardware PWM Channel 0 (Ideal for 25kHz fan speed control)", altFuncs: ["PWM0_0", "I2S_BCLK"] },
  { pin: 13, name: "GPIO 27", bcm: 27, type: "gpio", desc: "General Purpose I/O pin (Recommended LoRa SX1262 BUSY)", altFuncs: ["SMI_D7", "SPI1_CE2"] },
  { pin: 14, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 15, name: "GPIO 22", bcm: 22, type: "gpio", desc: "General Purpose I/O pin (Recommended LoRa SX1262 DIO1)", altFuncs: ["SMI_D6", "SPI1_MISO"] },
  { pin: 16, name: "GPIO 23", bcm: 23, type: "gpio", desc: "General Purpose I/O pin", altFuncs: ["SMI_D5", "SPI1_MOSI"] },
  { pin: 17, name: "3.3V Power", type: "power_3v3", desc: "3.3V DC Power Rail" },
  { pin: 18, name: "GPIO 24", bcm: 24, type: "gpio", desc: "General Purpose I/O pin", altFuncs: ["SMI_D4", "SPI1_SCLK"] },
  { pin: 19, name: "GPIO 10 (MOSI0)", bcm: 10, type: "spi", desc: "SPI0 Master Out Slave In (Data out to display/radio)", altFuncs: ["SPI0_MOSI", "SPI1_MOSI"] },
  { pin: 20, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 21, name: "GPIO 9 (MISO0)", bcm: 9, type: "spi", desc: "SPI0 Master In Slave Out (Data from SD card/radio)", altFuncs: ["SPI0_MISO", "SPI1_MISO"] },
  { pin: 22, name: "GPIO 25", bcm: 25, type: "gpio", desc: "General Purpose I/O pin (Display D/C Data/Command)", altFuncs: ["SMI_D13", "SPI1_CE0"] },
  { pin: 23, name: "GPIO 11 (SCLK0)", bcm: 11, type: "spi", desc: "SPI0 Serial Clock (Up to 32MHz high-speed bus)", altFuncs: ["SPI0_SCLK", "SPI1_SCLK"] },
  { pin: 24, name: "GPIO 8 (CE0)", bcm: 8, type: "spi", desc: "SPI0 Chip Enable 0 (Primary display chip select)", altFuncs: ["SPI0_CE0_N"] },
  { pin: 25, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 26, name: "GPIO 7 (CE1)", bcm: 7, type: "spi", desc: "SPI0 Chip Enable 1 (Secondary LoRa radio chip select)", altFuncs: ["SPI0_CE1_N"] },
  { pin: 27, name: "ID_SD (I2C0 SDA)", type: "i2c", desc: "HAT ID EEPROM I2C Data line (Reserved for auto-detect HATs)" },
  { pin: 28, name: "ID_SC (I2C0 SCL)", type: "i2c", desc: "HAT ID EEPROM I2C Clock line (Reserved for auto-detect HATs)" },
  { pin: 29, name: "GPIO 5", bcm: 5, type: "gpio", desc: "General Purpose I/O pin (I2C3 SDA alternate)", altFuncs: ["I2C3_SDA", "GPCLK1"] },
  { pin: 30, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 31, name: "GPIO 6", bcm: 6, type: "gpio", desc: "General Purpose I/O pin (I2C3 SCL alternate)", altFuncs: ["I2C3_SCL", "GPCLK2"] },
  { pin: 32, name: "GPIO 12 (PWM0)", bcm: 12, type: "pwm", desc: "Hardware PWM Channel 0 alternate", altFuncs: ["PWM0_0", "SMI_D12"] },
  { pin: 33, name: "GPIO 13 (PWM1)", bcm: 13, type: "pwm", desc: "Hardware PWM Channel 1 (Buzzer/Audio/Backlight dimmer)", altFuncs: ["PWM0_1", "SMI_D13"] },
  { pin: 34, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 35, name: "GPIO 19 (I2S_FS)", bcm: 19, type: "i2s", desc: "I2S Audio Frame Sync / PWM1 alternate", altFuncs: ["I2S_FS", "PWM0_1", "SPI1_MISO"] },
  { pin: 36, name: "GPIO 16", bcm: 16, type: "gpio", desc: "General Purpose I/O pin", altFuncs: ["SPI1_CE2", "UART0_CTS"] },
  { pin: 37, name: "GPIO 26", bcm: 26, type: "gpio", desc: "General Purpose I/O pin", altFuncs: ["SMI_D14", "SPI1_CE1"] },
  { pin: 38, name: "GPIO 20 (I2S_DIN)", bcm: 20, type: "i2s", desc: "I2S Audio Data Input (Microphone HATs)", altFuncs: ["I2S_DIN", "SPI1_MOSI"] },
  { pin: 39, name: "Ground", type: "gnd", desc: "0V Ground reference" },
  { pin: 40, name: "GPIO 21 (I2S_DOUT)", bcm: 21, type: "i2s", desc: "I2S Audio Data Output (DAC / Speaker HATs)", altFuncs: ["I2S_DOUT", "SPI1_SCLK"] },
];

export default function PinoutStudio() {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPin, setSelectedPin] = useState<PinDef>(RPI_40_PINS[2]); // Default GPIO 2 SDA
  const [copiedOverlay, setCopiedOverlay] = useState<boolean>(false);

  const getPinColor = (type: PinDef["type"]) => {
    switch (type) {
      case "power_5v": return "bg-rose-500 text-white border-rose-400";
      case "power_3v3": return "bg-amber-500 text-gray-950 border-amber-300";
      case "gnd": return "bg-gray-800 text-gray-400 border-gray-700";
      case "i2c": return "bg-cyan-500 text-gray-950 border-cyan-300";
      case "spi": return "bg-purple-500 text-white border-purple-400";
      case "uart": return "bg-yellow-400 text-gray-950 border-yellow-300";
      case "pwm": return "bg-neon-green text-gray-950 border-emerald-400";
      case "i2s": return "bg-pink-500 text-white border-pink-400";
      default: return "bg-gray-900 text-gray-200 border-gray-700";
    }
  };

  const filteredPins = useMemo(() => {
    return RPI_40_PINS.filter((pin) => {
      const matchesType = selectedTypeFilter === "ALL" || pin.type === selectedTypeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(pin.pin).includes(searchQuery) ||
        (pin.bcm !== undefined && String(pin.bcm).includes(searchQuery)) ||
        (pin.altFuncs && pin.altFuncs.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesType && matchesSearch;
    });
  }, [selectedTypeFilter, searchQuery]);

  const overlaySnippet = useMemo(() => {
    return `# /boot/firmware/config.txt
# Decksmith Hardware Overlays
dtparam=i2c_arm=on
dtparam=spi=on
dtparam=uart0=on
dtoverlay=pwm-2chan,pin=18,func=2,pin2=13,func2=4
dtoverlay=i2c-rtc,ds3231
`;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Hardware Pinout Inspector
            </span>
            <span className="text-xs font-mono text-neon-green">Raspberry Pi 5 · RK3588 · Zero 2 W</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Cpu className="w-7 h-7 text-cyan-400" />
            40-Pin GPIO & Hardware Bus Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Touch-interactive 40-pin header explorer with instant bus filtering, alternate function (ALT0-ALT5) lookup, and Device Tree overlays.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/builder"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-neon-green" />
            Blueprint Studio
          </Link>
          <Link
            to="/companion"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            I2C Bus Scanner
          </Link>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pin name, BCM #, or function (e.g. SCL, 18, MOSI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
          {[
            { id: "ALL", label: "All Pins" },
            { id: "i2c", label: "I2C" },
            { id: "spi", label: "SPI" },
            { id: "uart", label: "UART" },
            { id: "pwm", label: "PWM" },
            { id: "i2s", label: "I2S Audio" },
            { id: "power_5v", label: "5.0V" },
            { id: "power_3v3", label: "3.3V" },
            { id: "gnd", label: "GND" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedTypeFilter(f.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                selectedTypeFilter === f.id
                  ? "bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/20 scale-105"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Double-Row Pinout Layout & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Physical 40-Pin Header Interactive Diagram */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              Standard 40-Pin Dual Header
            </h3>
            <span className="text-xs text-gray-400 font-mono">Pins 1 (Top Left) to 40 (Bottom Right)</span>
          </div>

          {/* 40-Pin Double Column Matrix */}
          <div className="space-y-1.5">
            {Array.from({ length: 20 }, (_, idx) => {
              const leftPin = RPI_40_PINS[idx * 2]; // Odd pins: 1, 3, 5...
              const rightPin = RPI_40_PINS[idx * 2 + 1]; // Even pins: 2, 4, 6...

              const isLeftSelected = selectedPin.pin === leftPin.pin;
              const isRightSelected = selectedPin.pin === rightPin.pin;

              const isLeftMatch = filteredPins.some((p) => p.pin === leftPin.pin);
              const isRightMatch = filteredPins.some((p) => p.pin === rightPin.pin);

              return (
                <div key={idx} className="grid grid-cols-2 gap-3 items-center text-xs font-mono">
                  {/* Left (Odd Pin) */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedPin(leftPin);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      isLeftSelected
                        ? "border-cyan-400 bg-cyan-950/60 text-white shadow-lg shadow-cyan-400/20 scale-[1.02]"
                        : isLeftMatch
                        ? "border-gray-800 bg-gray-950 hover:border-gray-700 text-gray-300"
                        : "border-gray-900 bg-gray-950/40 text-gray-600 opacity-40"
                    }`}
                  >
                    <span className="truncate text-left font-bold">{leftPin.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${getPinColor(leftPin.type)}`}>
                        {leftPin.pin}
                      </span>
                    </div>
                  </button>

                  {/* Right (Even Pin) */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedPin(rightPin);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      isRightSelected
                        ? "border-cyan-400 bg-cyan-950/60 text-white shadow-lg shadow-cyan-400/20 scale-[1.02]"
                        : isRightMatch
                        ? "border-gray-800 bg-gray-950 hover:border-gray-700 text-gray-300"
                        : "border-gray-900 bg-gray-950/40 text-gray-600 opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${getPinColor(rightPin.type)}`}>
                        {rightPin.pin}
                      </span>
                    </div>
                    <span className="truncate text-right font-bold">{rightPin.name}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Pin Inspector & Overlay Exporter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pin Details Card */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <span className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-black font-mono shadow-md ${getPinColor(selectedPin.type)}`}>
                  {selectedPin.pin}
                </span>
                <div>
                  <h3 className="text-base font-black text-white">{selectedPin.name}</h3>
                  <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                    Type: {selectedPin.type.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-gray-400 block mb-1">Description & Electrical Behavior:</span>
                <p className="text-gray-200 leading-relaxed font-sans">{selectedPin.desc}</p>
              </div>

              {selectedPin.bcm !== undefined && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-gray-950 rounded-lg border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">BCM GPIO #</span>
                    <span className="text-neon-green font-bold text-sm">GPIO {selectedPin.bcm}</span>
                  </div>
                  <div className="p-2.5 bg-gray-950 rounded-lg border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Physical Header</span>
                    <span className="text-cyan-400 font-bold text-sm">Pin #{selectedPin.pin}</span>
                  </div>
                </div>
              )}

              {selectedPin.altFuncs && (
                <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
                  <span className="text-gray-400 block">Alternate Silicon Functions (ALT0 - ALT5):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPin.altFuncs.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-yellow-300 text-[11px] font-bold">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Config.txt Overlays */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                /boot/firmware/config.txt Overlays
              </h3>
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  navigator.clipboard.writeText(overlaySnippet);
                  setCopiedOverlay(true);
                  setTimeout(() => setCopiedOverlay(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
              >
                {copiedOverlay ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                {copiedOverlay ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed select-all">
              {overlaySnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
