import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const newParts = [
  // --- SBCs ---
  {
    name: "Milk-V Mars RISC-V SBC",
    slug: "milk-v-mars-riscv-sbc",
    category: "SBC",
    description: "Credit card sized RISC-V computer powered by StarFive JH7110 Quad-Core 64-bit SoC @ 1.5GHz with 8GB LPDDR4 and Gigabit Ethernet.",
    specs: JSON.stringify({
      soc: "StarFive JH7110 Quad-Core RISC-V 64-bit",
      ram: "8GB LPDDR4",
      storage: "MicroSD / eMMC socket",
      ports: "1x GbE, 3x USB 3.0, 1x USB 2.0, HDMI 4K, 40-Pin GPIO",
      powerDrawW: 4.5,
      dimensionsMm: [85, 56, 18],
    }),
    images: JSON.stringify(["/parts/milk-v-mars.png"]),
    compatibility: JSON.stringify(["linux-riscv", "40-pin-gpio", "usb-c-5v"]),
    price: 64.0,
    source: "AliExpress",
  },
  {
    name: "Radxa ROCK 5B+ Octa-Core SBC",
    slug: "radxa-rock-5b-plus",
    category: "SBC",
    description: "Heavyweight 8K single board computer powered by Rockchip RK3588 with 16GB LPDDR5, dual 2.5GbE LAN, PCIe 3.0 x4 M.2 NVMe, and 6 TOPS NPU.",
    specs: JSON.stringify({
      soc: "Rockchip RK3588 (4x A76 + 4x A55)",
      ram: "16GB LPDDR5",
      storage: "M.2 M-Key PCIe 3.0 x4, eMMC 5.1, MicroSD",
      ports: "2x 2.5GbE, 2x HDMI 8K out, 1x HDMI 4K in, 4x USB, 40-Pin GPIO",
      powerDrawW: 12.0,
      dimensionsMm: [100, 72, 20],
    }),
    images: JSON.stringify(["/parts/rock-5b-plus.png"]),
    compatibility: JSON.stringify(["armbian", "ubuntu", "pcie-m2", "40-pin-gpio"]),
    price: 189.0,
    source: "Allnet China",
  },
  {
    name: "LattePanda Mu x86 Compute Module",
    slug: "lattepanda-mu-x86",
    category: "SBC",
    description: "Micro-sized Intel N100 Quad-Core x86 compute module with 8GB LPDDR5, 64GB eMMC, and 9x PCIe 3.0 lanes for custom carrier breakout.",
    specs: JSON.stringify({
      soc: "Intel N100 Quad-Core Alder Lake-N @ 3.4GHz",
      ram: "8GB LPDDR5 4800MHz",
      storage: "64GB eMMC 5.1, PCIe NVMe support",
      ports: "Carrier breakout: Dual 2.5GbE, USB 3.2, 4x 4K displays",
      powerDrawW: 10.5,
      dimensionsMm: [69.6, 60.0, 8.5],
    }),
    images: JSON.stringify(["/parts/lattepanda-mu.png"]),
    compatibility: JSON.stringify(["x86-64", "windows-11", "linux", "pcie-carrier"]),
    price: 149.0,
    source: "DFRobot",
  },
  {
    name: "Seeed Studio reComputer J4012 (Jetson Orin NX 16GB)",
    slug: "seeed-recomputer-j4012-orin-nx",
    category: "SBC",
    description: "Industrial AI supercomputing carrier with NVIDIA Jetson Orin NX 16GB delivering 100 TOPS of edge INT8 AI performance.",
    specs: JSON.stringify({
      soc: "NVIDIA Jetson Orin NX 16GB (8-core ARM v8.2)",
      ram: "16GB 128-bit LPDDR5",
      storage: "128GB M.2 NVMe SSD included",
      ports: "Gigabit Ethernet, 4x USB 3.2, HDMI 2.1, CAN Bus, 40-Pin GPIO",
      powerDrawW: 22.0,
      dimensionsMm: [130, 120, 58],
    }),
    images: JSON.stringify(["/parts/recomputer-j4012.png"]),
    compatibility: JSON.stringify(["jetpack", "cuda", "tensorrt", "ros2"]),
    price: 899.0,
    source: "Seeed Studio",
  },

  // --- Displays ---
  {
    name: "8.8\" 1920x480 Ultrawide Stretched Bar LCD",
    slug: "8-8-inch-1920x480-stretched-bar-lcd",
    category: "DISPLAY",
    description: "High-density cyberdeck bar display with IPS wide viewing angles, 60Hz HDMI input, and Micro-USB 5V backlight power.",
    specs: JSON.stringify({
      resolution: "1920x480",
      sizeInches: 8.8,
      panelType: "IPS Full Color (60Hz)",
      interface: "Standard HDMI / Mini-HDMI",
      powerDrawW: 2.8,
      dimensionsMm: [231, 64, 13],
    }),
    images: JSON.stringify(["/parts/8-8-bar-lcd.png"]),
    compatibility: JSON.stringify(["hdmi", "5v-micro-usb", "custom-modeline"]),
    price: 52.0,
    source: "AliExpress",
  },
  {
    name: "10.3\" Waveshare Carta 1200 E-Ink RAW Panel",
    slug: "10-3-inch-waveshare-eink-raw",
    category: "DISPLAY",
    description: "Sunlight-readable ultra-low power E-Paper display with 1872x1404 resolution, 16 grayscale levels, and IT8951 USB/SPI controller.",
    specs: JSON.stringify({
      resolution: "1872x1404 (226 DPI)",
      sizeInches: 10.3,
      panelType: "E-Ink Carta 1200",
      interface: "IT8951 Controller via USB / SPI",
      powerDrawW: 0.8,
      dimensionsMm: [227.7, 165.8, 0.85],
    }),
    images: JSON.stringify(["/parts/10-3-eink.png"]),
    compatibility: JSON.stringify(["usb", "spi", "it8951", "sunlight-readable"]),
    price: 165.0,
    source: "Waveshare",
  },
  {
    name: "5.5\" 1080x1920 Full HD AMOLED Touch Panel",
    slug: "5-5-inch-1080p-amoled-touch",
    category: "DISPLAY",
    description: "Vibrant true-black OLED display with capacitive 5-point touch, HDMI driver board, and deep 100,000:1 contrast ratio.",
    specs: JSON.stringify({
      resolution: "1080x1920",
      sizeInches: 5.5,
      panelType: "AMOLED Full Color",
      interface: "HDMI + I2C Touch (USB)",
      powerDrawW: 2.2,
      dimensionsMm: [140, 78, 12],
    }),
    images: JSON.stringify(["/parts/5-5-amoled.png"]),
    compatibility: JSON.stringify(["hdmi", "usb-touch", "5v-power"]),
    price: 68.0,
    source: "Waveshare",
  },
  {
    name: "1.3\" I2C/SPI Transparent OLED Display",
    slug: "1-3-inch-transparent-oled",
    category: "DISPLAY",
    description: "See-through HUD OLED display with 128x64 resolution, SSD1309 controller, and high light transmittance for AR gunner sights.",
    specs: JSON.stringify({
      resolution: "128x64",
      sizeInches: 1.3,
      panelType: "Transparent Light-Blue OLED",
      interface: "I2C / 4-Wire SPI (SSD1309)",
      powerDrawW: 0.15,
      dimensionsMm: [42, 27, 4.5],
    }),
    images: JSON.stringify(["/parts/transparent-oled.png"]),
    compatibility: JSON.stringify(["i2c", "spi", "3.3v", "arduino", "raspberry-pi"]),
    price: 24.0,
    source: "Adafruit",
  },

  // --- Keyboards & Input ---
  {
    name: "Corne v4 (CRKBD) Choc Low-Profile Split Kit",
    slug: "corne-v4-choc-split-keyboard-kit",
    category: "KEYBOARD",
    description: "Ultra-thin 42-key column-staggered ergonomic split keyboard PCB with Kailh Choc v1 hotswap sockets, per-key RGB, and TRRS/Type-C interconnect.",
    specs: JSON.stringify({
      layout: "42-Key Split 3x6 Ortholinear",
      switchType: "Kailh Choc v1 Low-Profile Hotswap",
      firmware: "QMK / VIA / ZMK Wireless",
      mcuSupport: "RP2040-Zero / Pro Micro / nice!nano",
      dimensionsMm: [140, 95, 8],
    }),
    images: JSON.stringify(["/parts/corne-v4.png"]),
    compatibility: JSON.stringify(["qmk", "zmk", "rp2040", "choc-switches"]),
    price: 48.0,
    source: "Boardsource",
  },
  {
    name: "Trackpoint Thumbstick Mouse Module with Rubber Cap",
    slug: "trackpoint-thumbstick-mouse-module",
    category: "KEYBOARD",
    description: "Isometric strain-gauge pointing stick mouse module with classic red dome cap and PS/2 / UART output for embedding into custom key plates.",
    specs: JSON.stringify({
      sensor: "Strain Gauge Isometric Force",
      interface: "PS/2 / UART / USB via RP2040",
      operatingVoltage: "3.3V / 5.0V",
      powerDrawW: 0.05,
      dimensionsMm: [18, 18, 14],
    }),
    images: JSON.stringify(["/parts/trackpoint-module.png"]),
    compatibility: JSON.stringify(["qmk-pointing-device", "ps2", "uart", "3.3v"]),
    price: 18.5,
    source: "AliExpress",
  },

  // --- Power & Batteries ---
  {
    name: "IP5389 100W Bidirectional USB-PD 3.0 BMS Module",
    slug: "ip5389-100w-bidirectional-pd-bms",
    category: "POWER",
    description: "Heavy-duty 4S/5S synchronized buck-boost battery management system supporting 100W USB-PD 3.0 in/out with digital percentage display.",
    specs: JSON.stringify({
      maxPower: "100W (20V 5A)",
      supportedPacks: "3S / 4S / 5S Li-Ion & LiFePO4",
      efficiency: "Up to 96%",
      ports: "2x USB-C (100W PD), 2x USB-A (QC 22.5W)",
      dimensionsMm: [72, 38, 14],
    }),
    images: JSON.stringify(["/parts/ip5389-bms.png"]),
    compatibility: JSON.stringify(["usb-pd-100w", "4s-li-ion", "4s-lifepo4"]),
    price: 22.0,
    source: "AliExpress",
  },
  {
    name: "Molicel P45B 21700 High-Drain 4500mAh 45A Cells (4-Pack)",
    slug: "molicel-p45b-21700-4pack",
    category: "BATTERY",
    description: "Industry-leading high-drain 21700 lithium-ion cylindrical cells delivering 4500mAh capacity and 45A continuous discharge with minimal voltage sag.",
    specs: JSON.stringify({
      nominalVoltage: "3.6V (4.2V Max)",
      capacity: "4500mAh per cell (64.8Wh 4S Pack)",
      maxDischargeCurrentA: "45A Continuous",
      chemistry: "Li-Ion NMC",
      weightG: 280,
    }),
    images: JSON.stringify(["/parts/molicel-p45b.png"]),
    compatibility: JSON.stringify(["21700-sled", "high-current-bms"]),
    price: 36.0,
    source: "18650BatteryStore",
  },
  {
    name: "Ampere Time 12V 6Ah Rugged LiFePO4 Battery Pack",
    slug: "ampere-time-12v-6ah-lifepo4",
    category: "BATTERY",
    description: "Hardcase 4S LiFePO4 battery pack with 4000+ deep cycles, integrated BMS, and robust F2 spade terminals for off-grid cyberdeck deployment.",
    specs: JSON.stringify({
      nominalVoltage: "12.8V",
      capacity: "6Ah (76.8Wh)",
      cycleLife: "4000+ Cycles to 80%",
      maxDischargeCurrentA: "10A Continuous",
      dimensionsMm: [151, 65, 94],
      weightG: 820,
    }),
    images: JSON.stringify(["/parts/lifepo4-6ah.png"]),
    compatibility: JSON.stringify(["12v-dc", "mppt-solar", "xt60"]),
    price: 49.0,
    source: "Amazon",
  },
  {
    name: "Nichicon 1000µF 10V Solid Polymer Low-ESR Decoupling Caps (5-Pack)",
    slug: "nichicon-1000uf-polymer-caps",
    category: "POWER",
    description: "Ultra-low ESR (<10mΩ) solid conductive polymer aluminum capacitors engineered to absorb transient step-load spikes on Raspberry Pi 5 5.1V rails.",
    specs: JSON.stringify({
      capacitance: "1000µF",
      voltageRating: "10V DC",
      esr: "< 9 mΩ @ 100kHz",
      rippleCurrent: "5.4A RMS",
      leadSpacingMm: 5.0,
    }),
    images: JSON.stringify(["/parts/nichicon-polymer.png"]),
    compatibility: JSON.stringify(["5v-rail-decoupling", "brownout-protection"]),
    price: 8.5,
    source: "Mouser",
  },

  // --- Network & RF ---
  {
    name: "RTL-SDR Blog V4 Software Defined Radio Receiver",
    slug: "rtl-sdr-blog-v4-dongle",
    category: "NETWORK",
    description: "Upgraded wideband SDR receiver covering 500kHz to 1.766GHz with built-in HF upconverter, 1PPM TCXO, bias-tee, and aluminum shielded enclosure.",
    specs: JSON.stringify({
      frequencyRange: "500kHz - 1766MHz",
      bandwidth: "Up to 3.2MHz (2.4MHz stable)",
      adcBits: 8,
      tcxoAccuracy: "1 PPM",
      connector: "SMA Female 50Ω",
      powerDrawW: 1.4,
    }),
    images: JSON.stringify(["/parts/rtl-sdr-v4.png"]),
    compatibility: JSON.stringify(["gqrx", "sdr-plus-plus", "dump1090", "usb-2.0"]),
    price: 34.95,
    source: "RTL-SDR Blog",
  },
  {
    name: "Heltec LoRa32 V3 SX1262 915MHz Meshtastic Node",
    slug: "heltec-lora32-v3-sx1262",
    category: "NETWORK",
    description: "ESP32-S3 powered off-grid mesh communicator board with Semtech SX1262 LoRa transceiver, 0.96\" OLED screen, and IPEX antenna connector.",
    specs: JSON.stringify({
      soc: "ESP32-S3 Dual-Core Xtensa LX7 @ 240MHz",
      loraTransceiver: "Semtech SX1262 (915MHz US / 868MHz EU)",
      txPowerDbm: "+22 dBm (160mW)",
      display: "0.96\" Monochrome OLED (128x64)",
      powerDrawW: 0.35,
    }),
    images: JSON.stringify(["/parts/heltec-lora32.png"]),
    compatibility: JSON.stringify(["meshtastic", "arduino", "micropython", "ipex-sma"]),
    price: 26.5,
    source: "Heltec Automation",
  },
  {
    name: "Quectel RM520N-GL 5G NR Sub-6GHz M.2 Cellular Modem",
    slug: "quectel-rm520n-gl-5g-modem",
    category: "NETWORK",
    description: "Worldwide 5G Sub-6GHz & LTE-A Cat 20 cellular module in M.2 Key-B form factor delivering up to 3.4 Gbps downlink speeds and GNSS.",
    specs: JSON.stringify({
      bands: "5G NR SA/NSA Sub-6GHz Worldwide + LTE Cat 20",
      maxDownlinkGbps: 3.4,
      interface: "M.2 Key-B (USB 3.1 / PCIe)",
      antennaPorts: "4x IPEX MHF4 RF Connectors",
      powerDrawW: 4.2,
    }),
    images: JSON.stringify(["/parts/quectel-rm520n.png"]),
    compatibility: JSON.stringify(["m2-key-b", "sim-card", "modemmanager", "qmi"]),
    price: 198.0,
    source: "Quectel",
  },
  {
    name: "u-blox ZED-F9P Multi-Band RTK GNSS Receiver Board",
    slug: "ublox-zed-f9p-rtk-gnss-board",
    category: "NETWORK",
    description: "Centimeter-level high-precision dual-band (L1/L2) GPS, Galileo, GLONASS, and BeiDou receiver with integrated RTK rover and base station modes.",
    specs: JSON.stringify({
      accuracy: "0.01m (1cm) + 1ppm CEP with RTK",
      constellations: "GPS, GLONASS, Galileo, BeiDou concurrent",
      updateRateHz: 20,
      interface: "UART / I2C / SPI / USB + 1PPS output",
      powerDrawW: 0.65,
    }),
    images: JSON.stringify(["/parts/zed-f9p.png"]),
    compatibility: JSON.stringify(["gpsd", "rtklib", "qgis", "1pps-ntp"]),
    price: 210.0,
    source: "SparkFun",
  },

  // --- Sensors & Comms ---
  {
    name: "MLX90640 32x24 Far-Infrared Thermal Camera Module",
    slug: "mlx90640-ir-thermal-camera",
    category: "SENSOR",
    description: "Field thermal imaging sensor with 768 individual infrared pixels, -40°C to 300°C target temperature measurement, and 64Hz I2C stream rate.",
    specs: JSON.stringify({
      irResolution: "32x24 pixels (768 IR points)",
      fieldOfView: "55° Standard or 110° Wide Angle",
      tempRangeC: "-40°C to +300°C (±1°C accuracy)",
      interface: "I2C (Fast Mode+ 1MHz)",
      powerDrawW: 0.12,
    }),
    images: JSON.stringify(["/parts/mlx90640.png"]),
    compatibility: JSON.stringify(["i2c", "3.3v", "python-opencv", "field-hud"]),
    price: 49.95,
    source: "Pimoroni",
  },
  {
    name: "BME688 4-in-1 AI Environmental & VOC Gas Sensor",
    slug: "bme688-environmental-gas-sensor",
    category: "SENSOR",
    description: "Precision environmental sensor with artificial intelligence gas scanner for detecting volatile organic compounds (VOC), CO, humidity, and barometric pressure.",
    specs: JSON.stringify({
      measurements: "Temperature, Humidity, Barometric Pressure, VOC Gas",
      gasScanner: "AI BSEC machine learning odor/air classifier",
      interface: "I2C (0x77/0x76) / SPI",
      powerDrawW: 0.02,
    }),
    images: JSON.stringify(["/parts/bme688.png"]),
    compatibility: JSON.stringify(["i2c", "qwiic", "stemma-qt", "3.3v"]),
    price: 21.0,
    source: "Bosch Sensortec",
  },
  {
    name: "SBM-20 Geiger-Müller Nuclear Radiation Tube Kit",
    slug: "sbm-20-geiger-radiation-kit",
    category: "SENSOR",
    description: "Military-grade Soviet SBM-20 Geiger-Müller tube with 400V high-voltage boost board and interrupt pulse output for counting Gamma and Beta radiation CPM.",
    specs: JSON.stringify({
      radiationDetected: "Beta (β) and Gamma (γ)",
      highVoltageSupply: "400V DC on-board boost",
      interface: "Digital Pulse / Interrupt Pin (GPIO)",
      powerDrawW: 0.18,
    }),
    images: JSON.stringify(["/parts/sbm-20-geiger.png"]),
    compatibility: JSON.stringify(["gpio-interrupt", "5v-power", "radmon"]),
    price: 42.0,
    source: "RH Electronics",
  },

  // --- Audio ---
  {
    name: "PCM5102A 32-Bit 384kHz HiFi I2S DAC Audio Board",
    slug: "pcm5102a-32bit-hifi-i2s-dac",
    category: "AUDIO",
    description: "Audiophile-grade 32-bit/384kHz digital-to-analog converter board with integrated charge pump generating negative rail for zero DC capacitor distortion.",
    specs: JSON.stringify({
      dacResolution: "32-Bit / 384kHz PCM",
      snr: "112 dB Dynamic Range",
      interface: "I2S (BCLK, LRCK, DIN, SCK optional)",
      output: "3.5mm Gold-Plated Stereo Jack",
      powerDrawW: 0.15,
    }),
    images: JSON.stringify(["/parts/pcm5102a.png"]),
    compatibility: JSON.stringify(["i2s-audio", "alsa", "pipewire", "5v-3.3v"]),
    price: 9.5,
    source: "Texas Instruments",
  },

  // --- Enclosures & Hardware ---
  {
    name: "Pelican 1150 Protector Watertight Case",
    slug: "pelican-1150-protector-case",
    category: "CASE",
    description: "The gold standard ruggedized cyberdeck shell: unbreakable, watertight IP67, dustproof, with automatic pressure equalization purge valve.",
    specs: JSON.stringify({
      interiorDimensionsMm: [208, 144, 92],
      exteriorDimensionsMm: [232, 192, 111],
      certifications: "IP67 / MIL-STD-810G / STANAG 4280",
      material: "Polypropylene Structural Copolymer",
      weightG: 860,
    }),
    images: JSON.stringify(["/parts/pelican-1150.png"]),
    compatibility: JSON.stringify(["cyberdeck-chassis", "ip67", "chassis-plate"]),
    price: 54.95,
    source: "Pelican",
  },
  {
    name: "Aviation GX16 4-Pin Threaded Metal Waterproof Panel Connector Pair",
    slug: "aviation-gx16-4pin-metal-connector",
    category: "OTHER",
    description: "Heavy-duty chassis-mount zinc alloy circular connector pair with locking screw thread rated for 7A @ 125V for secure external power and serial lines.",
    specs: JSON.stringify({
      pins: 4,
      ratedCurrentA: 7.0,
      ratedVoltageV: 125,
      mountingHoleDiameterMm: 16.0,
      material: "Zinc Alloy with Silver-Plated Copper Contacts",
    }),
    images: JSON.stringify(["/parts/gx16-4pin.png"]),
    compatibility: JSON.stringify(["panel-mount", "power-input", "serial-comms"]),
    price: 6.8,
    source: "Amazon",
  },
];

async function main() {
  console.log(`Starting to seed ${newParts.length} rich hardware parts...`);

  let count = 0;
  for (const item of newParts) {
    const existing = await prisma.part.findUnique({ where: { slug: item.slug } });
    if (!existing) {
      const part = await prisma.part.create({
        data: {
          name: item.name,
          slug: item.slug,
          category: item.category,
          description: item.description,
          specs: item.specs,
          images: item.images,
          compatibility: item.compatibility,
          rating: 4.8 + Number((Math.random() * 0.2).toFixed(1)),
          reviewCount: Math.floor(12 + Math.random() * 45),
        },
      });

      // Add Price
      await prisma.price.create({
        data: {
          partId: part.id,
          source: item.source,
          price: item.price,
          currency: "USD",
          url: `https://duckduckgo.com/?q=${encodeURIComponent(item.name)}`,
          inStock: true,
        },
      });

      console.log(`+ Created part: [${item.category}] ${item.name} ($${item.price})`);
      count++;
    } else {
      console.log(`= Already exists: ${item.name}`);
    }
  }

  console.log(`Successfully added ${count} new parts!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
