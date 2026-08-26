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
  FileCode,
  Terminal,
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
  const [selectedPin, setSelectedPin] = useState<PinDef>(RPI_40_PINS[2]);
  const [activeCodeTab, setActiveCodeTab] = useState<"dts" | "kicad" | "python">("dts");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const getPinColor = (type: PinDef["type"]) => {
    switch (type) {
      case "power_5v": return "bg-rose-500 text-white border-rose-400";
      case "power_3v3": return "bg-amber-500 text-black border-amber-300";
      case "gnd": return "bg-gray-800 text-gray-400 border-gray-700";
      case "i2c": return "bg-cyan-500 text-black border-cyan-300";
      case "spi": return "bg-purple-500 text-white border-purple-400";
      case "uart": return "bg-yellow-400 text-black border-yellow-300";
      case "pwm": return "bg-neon-green text-black border-emerald-400";
      case "i2s": return "bg-pink-500 text-white border-pink-400";
      default: return "bg-gray-900 text-gray-200 border-gray-700";
    }
  };

  const filteredPins = useMemo(() => {
    return RPI_40_PINS.filter((pin) => {
      const matchesType = selectedTypeFilter === "ALL" || pin.type === selectedTypeFilter;
      const matchesQuery =
        pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pin.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pin.bcm !== undefined && `gpio ${pin.bcm}`.includes(searchQuery.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [selectedTypeFilter, searchQuery]);

  const deviceTreeOverlay = useMemo(() => {
    return `/dts-v1/;
/plugin/;

/ {
    compatible = "brcm,bcm2835", "brcm,bcm2711", "brcm,bcm2712";

    fragment@0 {
        target = <&gpio>;
        __overlay__ {
            decksmith_pins: decksmith_pins {
                brcm,pins = <2 3 14 15 18 19 20 21>;
                brcm,function = <4 4 2 2 2 2 2 2>; /* I2C, UART, I2S */
                brcm,pull = <2 2 0 2 0 0 0 0>;     /* Pull-up on SDA/SCL */
            };
        };
    };
};
`;
  }, []);

  const kicadSymbol = useMemo(() => {
    let sym = `(kicad_symbol_lib (version 20211014) (generator Decksmith_Studio)\n`;
    sym += `  (symbol "Raspberry_Pi_40Pin_Header" (in_bom yes) (on_board yes)\n`;
    sym += `    (property "Reference" "J" (id 0) (at 0 25.4 0))\n`;
    sym += `    (property "Value" "RPi_40Pin_GPIO" (id 1) (at 0 -25.4 0))\n`;
    sym += `    (property "Footprint" "Connector_PinHeader_2.54mm:PinHeader_2x20_P2.54mm_Vertical" (id 2) (at 0 0 0))\n`;
    sym += `    (symbol "RPi_40Pin_GPIO_1_1"\n`;

    RPI_40_PINS.forEach((p) => {
      const isOdd = p.pin % 2 !== 0;
      const y = 20 - Math.floor((p.pin - 1) / 2) * 2.54;
      const x = isOdd ? -5.08 : 5.08;
      sym += `      (pin passive line (at ${x} ${y} ${isOdd ? "0" : "180"}) (length 2.54) (name "${p.name}") (number "${p.pin}"))\n`;
    });

    sym += `    )\n  )\n)\n`;
    return sym;
  }, []);

  const pythonTestScript = useMemo(() => {
    return `#!/usr/bin/env python3
# DECKSMITH AUTOMATED GPIO & BUS HARDWARE TEST HARNESS
import sys
import time

try:
    import gpiod
    import smbus2
    import spidev
    print("✅ All hardware communication libraries loaded successfully.")
except ImportError as e:
    print(f"⚠️ Missing library: {e}. Install via: pip install gpiod smbus2 spidev")

def test_i2c_bus(bus_num=1):
    print(f"📡 Scanning I2C Bus {bus_num}...")
    try:
        bus = smbus2.SMBus(bus_num)
        found = []
        for addr in range(0x03, 0x78):
            try:
                bus.read_byte(addr)
                found.append(hex(addr))
            except OSError:
                pass
        bus.close()
        print(f"✅ Found {len(found)} I2C Devices: {', '.join(found) if found else 'None'}")
    except Exception as err:
        print(f"❌ I2C Error: {err}")

def test_spi_bus(bus=0, device=0):
    print(f"⚡ Testing SPI Loopback on Bus {bus}:{device}...")
    try:
        spi = spidev.SpiDev()
        spi.open(bus, device)
        spi.max_speed_hz = 10000000 # 10MHz
        res = spi.xfer2([0xAA, 0x55, 0xFF])
        spi.close()
        print(f"✅ SPI Response: {[hex(b) for b in res]}")
    except Exception as err:
        print(f"❌ SPI Error: {err}")

if __name__ == "__main__":
    print("🚀 Running Decksmith Hardware Self-Test...")
    test_i2c_bus(1)
    test_spi_bus(0, 0)
`;
  }, []);

  const activeContent = activeCodeTab === "dts" ? deviceTreeOverlay : activeCodeTab === "kicad" ? kicadSymbol : pythonTestScript;

  const downloadFile = (filename: string, content: string, type: string) => {
    soundFx.playConfirm();
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            40-Pin GPIO Header & Bus Explorer
          </div>
          <h1 className="text-3xl font-black text-white">40-Pin GPIO Pinout Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Explore I2C/SPI/UART/I2S multiplexing, export Device Tree overlays, KiCad symbols, and Python test scripts
          </p>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by pin number, BCM GPIO, alternate function (e.g. I2S, SPI0_MOSI, PWM)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto text-[11px] font-bold">
            {["ALL", "i2c", "spi", "uart", "pwm", "i2s", "power_5v", "power_3v3", "gnd"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTypeFilter(type);
                }}
                className={`px-3 py-1.5 rounded-xl uppercase transition-all whitespace-nowrap ${
                  selectedTypeFilter === type
                    ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/20"
                    : "bg-gray-950 text-gray-400 hover:text-white border border-gray-800"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: 40-Pin Interactive Header (7 Cols) + Pin Inspector & Code Exporter (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 40-Pin Physical Header Visualizer */}
        <div className="lg:col-span-7 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neon-green" />
              Standard 2x20 2.54mm Pin Header Layout
            </h2>
            <span className="text-[10px] text-gray-500">Raspberry Pi 5 / 4 / CM4 IO</span>
          </div>

          {/* Dual Column Pin Grid */}
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {Array.from({ length: 20 }).map((_, i) => {
              const oddPin = RPI_40_PINS[i * 2];
              const evenPin = RPI_40_PINS[i * 2 + 1];

              return (
                <div key={i} className="grid grid-cols-2 gap-2 text-xs">
                  {/* Left (Odd) Pin */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedPin(oddPin);
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      selectedPin.pin === oddPin.pin
                        ? "border-neon-green bg-gray-800 ring-1 ring-neon-green shadow-md"
                        : "bg-gray-950/80 border-gray-800 hover:border-gray-700 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-3 h-3 rounded-full border shrink-0 ${getPinColor(oddPin.type)}`} />
                      <span className="font-bold truncate">{oddPin.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono ml-1">{oddPin.pin}</span>
                  </button>

                  {/* Right (Even) Pin */}
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedPin(evenPin);
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      selectedPin.pin === evenPin.pin
                        ? "border-neon-green bg-gray-800 ring-1 ring-neon-green shadow-md"
                        : "bg-gray-950/80 border-gray-800 hover:border-gray-700 text-gray-300"
                    }`}
                  >
                    <span className="text-[10px] text-gray-500 font-mono mr-1">{evenPin.pin}</span>
                    <div className="flex items-center gap-2 truncate justify-end">
                      <span className="font-bold truncate">{evenPin.name}</span>
                      <span className={`w-3 h-3 rounded-full border shrink-0 ${getPinColor(evenPin.type)}`} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pin Inspector & Exporters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Pin Details */}
          <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full border ${getPinColor(selectedPin.type)}`} />
                Pin {selectedPin.pin}: {selectedPin.name}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 text-cyan-300">
                {selectedPin.type.replace("_", " ")}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">{selectedPin.desc}</p>

            {selectedPin.altFuncs && (
              <div className="pt-2 border-t border-gray-800">
                <span className="text-[10px] text-gray-400 font-bold block mb-1">Alternate Bus Functions:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedPin.altFuncs.map((alt) => (
                    <span key={alt} className="px-2 py-0.5 bg-gray-950 text-cyan-300 rounded text-[10px] border border-gray-800">
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exporter Tabs */}
          <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveCodeTab("dts")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === "dts" ? "bg-neon-green text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  dtoverlay.dts
                </button>
                <button
                  onClick={() => setActiveCodeTab("kicad")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === "kicad" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  KiCad .kicad_sym
                </button>
                <button
                  onClick={() => setActiveCodeTab("python")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === "python" ? "bg-cyan-400 text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Python Test
                </button>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    soundFx.playConfirm();
                    navigator.clipboard.writeText(activeContent);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-800 text-xs text-gray-200 font-bold hover:bg-gray-700 flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() =>
                    downloadFile(
                      activeCodeTab === "dts" ? "decksmith-pins.dts" : activeCodeTab === "kicad" ? "RPi_40Pin_GPIO.kicad_sym" : "test_hardware.py",
                      activeContent,
                      "text/plain"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-neon-green text-black text-xs font-bold hover:bg-neon-green/90 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-xs text-gray-200 overflow-x-auto leading-relaxed max-h-56 select-all">
              {activeContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
