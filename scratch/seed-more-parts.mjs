import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const massivePartsWave = [
  // --- SBCs & Compute ---
  {
    name: "Raspberry Pi Compute Module 4 (CM4 8GB + 32GB eMMC + Wi-Fi)",
    slug: "raspberry-pi-cm4-8gb-32gb-wifi",
    category: "SBC",
    description: "Industry-standard quad-core computing module powered by BCM2711 with 8GB RAM, 32GB high-speed eMMC storage, and onboard dual-band Wi-Fi/Bluetooth.",
    specs: JSON.stringify({
      soc: "Broadcom BCM2711 Quad Cortex-A72 @ 1.5GHz",
      ram: "8GB LPDDR4-3200",
      storage: "32GB eMMC 5.1 Flash",
      ports: "Dual High-Density Hirose 100-Pin Connectors (PCIe 2.0 x1, Gigabit Ethernet, 2x HDMI 4K)",
      powerDrawW: 4.0,
      dimensionsMm: [55, 40, 4.7],
    }),
    images: JSON.stringify(["/parts/cm4-8gb.png"]),
    compatibility: JSON.stringify(["cm4-carrier", "pcie-x1", "raspberry-pi-os", "openwrt"]),
    price: 75.0,
    source: "Raspberry Pi Approved Reseller",
  },
  {
    name: "Khadas VIM4 Octa-Core High-End SBC",
    slug: "khadas-vim4-octa-core",
    category: "SBC",
    description: "Flagship multimedia SBC featuring Amlogic A311D2 (4x A73 + 4x A53), 8GB LPDDR4X, 32GB eMMC, Wi-Fi 6, 4K HDMI Input + Output, and dual cameras.",
    specs: JSON.stringify({
      soc: "Amlogic A311D2 (4x A73 @ 2.2GHz + 4x A53 @ 2.0GHz)",
      ram: "8GB LPDDR4X",
      storage: "32GB eMMC 5.1",
      ports: "Gigabit Ethernet, Wi-Fi 6, HDMI 2.1 4K, HDMI Input 4K, 40-Pin Header, USB-C PD",
      powerDrawW: 8.5,
      dimensionsMm: [82.0, 58.0, 13.0],
    }),
    images: JSON.stringify(["/parts/khadas-vim4.png"]),
    compatibility: JSON.stringify(["ubuntu", "oowow", "hdmi-in", "40-pin-gpio"]),
    price: 219.9,
    source: "Khadas",
  },
  {
    name: "StarFive VisionFive 2 RISC-V Quad-Core SBC",
    slug: "starfive-visionfive-2-riscv",
    category: "SBC",
    description: "The world's first mass-production high-performance RISC-V SBC with integrated 3D GPU (IMG BXE-4-32), 8GB RAM, dual Gigabit Ethernet, and M.2 PCIe NVMe.",
    specs: JSON.stringify({
      soc: "StarFive JH7110 Quad 64-bit RV64GC @ 1.5GHz",
      ram: "8GB LPDDR4",
      storage: "M.2 M-Key PCIe 2.0 NVMe, eMMC socket, MicroSD",
      ports: "2x GbE RJ45, 4x USB 3.0, HDMI 4K, 40-Pin GPIO",
      powerDrawW: 5.2,
      dimensionsMm: [100, 72, 18],
    }),
    images: JSON.stringify(["/parts/visionfive-2.png"]),
    compatibility: JSON.stringify(["debian-riscv", "arch-riscv", "40-pin-gpio", "nvme"]),
    price: 85.0,
    source: "AmeriDroid",
  },
  {
    name: "Luckfox Pico Mini RV1103 RISC-V Micro Linux Board",
    slug: "luckfox-pico-mini-rv1103",
    category: "SBC",
    description: "Ultra-compact $6 Linux micro-computer powered by Rockchip RV1103 Cortex-A7 + RISC-V core with integrated 0.5 TOPS NPU and 64MB DDR2.",
    specs: JSON.stringify({
      soc: "Rockchip RV1103 (Cortex-A7 1.2GHz + RISC-V)",
      ram: "64MB DDR2 integrated",
      storage: "128MB SPI NAND Flash + MicroSD",
      ports: "USB Type-C, MIPI CSI camera interface, GPIO pins",
      powerDrawW: 0.8,
      dimensionsMm: [28, 21, 3.5],
    }),
    images: JSON.stringify(["/parts/luckfox-pico.png"]),
    compatibility: JSON.stringify(["busybox", "buildroot", "ultra-low-power", "3.3v"]),
    price: 6.5,
    source: "Luckfox / Waveshare",
  },

  // --- Displays ---
  {
    name: "11.9\" 320x1480 Capacitive Touch Long Bar Display",
    slug: "11-9-inch-320x1480-touch-bar-display",
    category: "DISPLAY",
    description: "Extra-long capacitive 5-point touch bar display with toughened glass panel, IPS 178° viewing angle, HDMI video input, and USB touch interface.",
    specs: JSON.stringify({
      resolution: "320x1480 (Sub-ribbon aspect ratio)",
      sizeInches: 11.9,
      panelType: "IPS Full Color with Capacitive Touch",
      interface: "HDMI Video + USB Touch & Power",
      powerDrawW: 3.2,
      dimensionsMm: [289, 70, 15],
    }),
    images: JSON.stringify(["/parts/11-9-bar-touch.png"]),
    compatibility: JSON.stringify(["hdmi", "usb-touch", "5v-power", "custom-modeline"]),
    price: 74.0,
    source: "Waveshare",
  },
  {
    name: "4.0\" 720x720 Square IPS Display with Capacitive Touch",
    slug: "4-0-inch-720x720-square-ips-touch",
    category: "DISPLAY",
    description: "High-DPI 1:1 square display with 720x720 resolution (254 PPI), DPI RGB interface, and 5-point multi-touch for square cyberdeck HUD layouts.",
    specs: JSON.stringify({
      resolution: "720x720 (1:1 Square)",
      sizeInches: 4.0,
      panelType: "IPS Wide-Angle (254 PPI)",
      interface: "DPI / DSI / HDMI adapter board",
      powerDrawW: 1.6,
      dimensionsMm: [84, 84, 9.5],
    }),
    images: JSON.stringify(["/parts/4-0-square-display.png"]),
    compatibility: JSON.stringify(["dpi-interface", "touch-i2c", "square-ui"]),
    price: 46.5,
    source: "Pimoroni",
  },
  {
    name: "1.54\" 200x200 3-Color E-Paper Module (Black/White/Red)",
    slug: "1-54-inch-3color-epaper-module",
    category: "DISPLAY",
    description: "Low-power tri-color electronic paper display retaining text and graphics indefinitely without power; ideal for battery HUDs and badge tags.",
    specs: JSON.stringify({
      resolution: "200x200",
      colors: "Red, Black, White",
      interface: "3-Wire / 4-Wire SPI",
      powerDrawW: 0.03,
      dimensionsMm: [48, 33, 1.2],
    }),
    images: JSON.stringify(["/parts/1-54-epaper.png"]),
    compatibility: JSON.stringify(["spi", "3.3v", "zero-standby-power"]),
    price: 13.5,
    source: "Waveshare",
  },

  // --- Keyboards & Mechanical Input ---
  {
    name: "Sofle v2 Ergonomic Split Mechanical Keyboard PCB Kit",
    slug: "sofle-v2-split-keyboard-kit",
    category: "KEYBOARD",
    description: "58-key split ortholinear keyboard with dual rotary encoder support, OLED screen breakouts, per-key RGB backlight, and Kailh MX hotswap sockets.",
    specs: JSON.stringify({
      layout: "58-Key Split (6x4 + 5 Thumb Keys each half)",
      encoderSupport: "Dual EC11 Rotary Encoders",
      screens: "2x 0.91\" I2C OLED Displays",
      firmware: "QMK / VIA / VIAL Configurable",
      dimensionsMm: [155, 115, 12],
    }),
    images: JSON.stringify(["/parts/sofle-v2.png"]),
    compatibility: JSON.stringify(["qmk", "via", "rp2040", "pro-micro", "mx-switches"]),
    price: 55.0,
    source: "Keycapsss",
  },
  {
    name: "BlackBerry Q10 QWERTY Keyboard I2C PMOD Module",
    slug: "blackberry-q10-i2c-pmod-keyboard",
    category: "KEYBOARD",
    description: "Genuine tactical BlackBerry Q10 hardware keyboard mounted on an active I2C/UART backpack with white trackpad and programmable key matrix controller.",
    specs: JSON.stringify({
      keys: "35 Tactile Metal Dome Keys + Backlight",
      interface: "I2C (0x1F) / UART / USB via RP2040",
      operatingVoltage: "3.3V DC",
      powerDrawW: 0.08,
      dimensionsMm: [56, 35, 6.5],
    }),
    images: JSON.stringify(["/parts/bb-q10-keyboard.png"]),
    compatibility: JSON.stringify(["i2c", "uart", "qmk", "3.3v", "raspberry-pi"]),
    price: 28.0,
    source: "Solder Party",
  },
  {
    name: "Alps EC11 Rotary Encoder with Push Button (Set of 2)",
    slug: "alps-ec11-rotary-encoder-pair",
    category: "KEYBOARD",
    description: "Tactile high-precision 20-pulse quadrature rotary encoders with integrated push button switch for volume, zoom, and menu scrubbing.",
    specs: JSON.stringify({
      pulsesPerRev: 20,
      detentCount: 20,
      integratedSwitch: "Momentary Push Button",
      pinout: "A, B, GND + 2x Switch Pins",
    }),
    images: JSON.stringify(["/parts/ec11-encoder.png"]),
    compatibility: JSON.stringify(["qmk-encoder", "gpio", "3.3v-5v"]),
    price: 7.5,
    source: "Adafruit",
  },

  // --- Power & Battery Systems ---
  {
    name: "Waveshare Dual 18650 UPS HAT for Raspberry Pi",
    slug: "waveshare-dual-18650-ups-hat",
    category: "POWER",
    description: "Uninterruptible power supply shield providing regulated 5V 3A DC output from dual 18650 cells with I2C voltage/current battery telemetry.",
    specs: JSON.stringify({
      outputVoltage: "5.0V Regulated",
      maxOutputCurrentA: "3.0A Continuous (5.0A Peak)",
      telemetry: "I2C Fuel Gauge (INA219 on board)",
      batteryCapacity: "2x 18650 Cells",
      dimensionsMm: [85, 56, 21],
    }),
    images: JSON.stringify(["/parts/ups-hat-dual18650.png"]),
    compatibility: JSON.stringify(["raspberry-pi-gpio", "i2c-telemetry", "5v-ups"]),
    price: 24.5,
    source: "Waveshare",
  },
  {
    name: "Samsung 50S 21700 5000mAh 25A High-Drain Cells (4-Pack)",
    slug: "samsung-50s-21700-4pack",
    category: "BATTERY",
    description: "High-density 5000mAh 21700 cells capable of 25A continuous discharge, providing maximum runtime for high-load cyberdeck builds.",
    specs: JSON.stringify({
      nominalVoltage: "3.6V (4.2V Max)",
      capacity: "5000mAh (72.0Wh 4S Pack)",
      maxDischargeCurrentA: "25A Continuous",
      chemistry: "Li-Ion INR",
      weightG: 290,
    }),
    images: JSON.stringify(["/parts/samsung-50s.png"]),
    compatibility: JSON.stringify(["21700-sled", "high-capacity-bms"]),
    price: 38.0,
    source: "18650BatteryStore",
  },
  {
    name: "Heavy-Duty Military Toggle Switch with Red Missile Cover",
    slug: "military-toggle-switch-missile-cover",
    category: "OTHER",
    description: "SPST 20A 12V heavy-duty metal toggle switch with spring-loaded red aircraft safety cover to prevent accidental master power disconnection.",
    specs: JSON.stringify({
      rating: "20A @ 12V DC / 10A @ 125V AC",
      actuation: "Toggle SPST (ON/OFF)",
      safetyCover: "Spring-Loaded Red Polycarbonate Missile Flip",
      mountingHoleMm: 12.0,
    }),
    images: JSON.stringify(["/parts/missile-toggle.png"]),
    compatibility: JSON.stringify(["master-power", "panel-mount", "high-current"]),
    price: 5.5,
    source: "Amazon",
  },

  // --- Network, RF & SDR ---
  {
    name: "Great Scott Gadgets HackRF One SDR Transceiver",
    slug: "hackrf-one-sdr-transceiver",
    category: "NETWORK",
    description: "Wideband half-duplex Software Defined Radio transceiver operating from 1 MHz to 6 GHz with up to 20 million samples per second (20 MSPS).",
    specs: JSON.stringify({
      frequencyRange: "1 MHz - 6 GHz",
      sampleRate: "2 MSPS - 20 MSPS",
      operation: "Half-Duplex Transmit & Receive",
      adcDacBits: 8,
      connector: "SMA Female 50Ω",
      powerDrawW: 2.8,
    }),
    images: JSON.stringify(["/parts/hackrf-one.png"]),
    compatibility: JSON.stringify(["gnuradio", "gqrx", "sdr-sharp", "usb-2.0"]),
    price: 345.0,
    source: "Great Scott Gadgets",
  },
  {
    name: "Portapack H2 Mayhem Standalone RF Analysis Unit",
    slug: "portapack-h2-mayhem-sdr",
    category: "NETWORK",
    description: "Standalone add-on for HackRF One featuring a 3.2\" color touchscreen, 4-way navigation wheel, speaker, and Mayhem firmware for field signal hunting.",
    specs: JSON.stringify({
      screen: "3.2\" 240x320 Color Touchscreen LCD",
      controls: "4-Way Navigation D-Pad + Rotary Wheel",
      batterySupport: "Integrated 2000mAh LiPo battery",
      features: "ADS-B, APRS, Sub-GHz, GPS Simulator, Audio Demod",
    }),
    images: JSON.stringify(["/parts/portapack-h2.png"]),
    compatibility: JSON.stringify(["hackrf-one", "standalone-sdr", "mayhem-firmware"]),
    price: 135.0,
    source: "ShareBrained / AliExpress",
  },
  {
    name: "Alfa AWUS036ACH Long-Range Dual-Band Wi-Fi Adapter",
    slug: "alfa-awus036ach-wifi-adapter",
    category: "NETWORK",
    description: "High-power AC1200 USB 3.0 Wi-Fi adapter with dual RP-SMA high-gain antennas supporting monitor mode and packet injection in Kali Linux.",
    specs: JSON.stringify({
      chipset: "Realtek RTL8812AU",
      wirelessStandards: "802.11a/b/g/n/ac (2.4GHz + 5GHz)",
      maxTxPowerDbm: "+23 dBm",
      antennas: "2x 5dBi Detachable Dipole Antennas",
      powerDrawW: 3.5,
    }),
    images: JSON.stringify(["/parts/alfa-awus036ach.png"]),
    compatibility: JSON.stringify(["kali-linux", "monitor-mode", "packet-injection", "usb-3.0"]),
    price: 59.99,
    source: "Alfa Network",
  },

  // --- Sensors & Field Modules ---
  {
    name: "Sensirion SCD41 True Photoacoustic CO2 Sensor",
    slug: "sensirion-scd41-co2-sensor",
    category: "SENSOR",
    description: "Miniaturized photoacoustic NDIR carbon dioxide (CO2) sensor measuring 400 to 5000 ppm with integrated temperature and relative humidity sensing.",
    specs: JSON.stringify({
      co2Range: "400 - 5000 ppm (±40 ppm accuracy)",
      sensingPrinciple: "Photoacoustic NDIR Spectroscopy",
      interface: "I2C (0x62)",
      operatingVoltage: "3.3V - 5.0V",
      powerDrawW: 0.05,
    }),
    images: JSON.stringify(["/parts/scd41-co2.png"]),
    compatibility: JSON.stringify(["i2c", "qwiic", "3.3v", "environmental-monitoring"]),
    price: 38.5,
    source: "Sensirion",
  },
  {
    name: "VL53L1X Time-of-Flight (ToF) 4-Meter Distance Sensor",
    slug: "vl53l1x-tof-laser-distance-sensor",
    category: "SENSOR",
    description: "Long-range invisible 940nm Class 1 laser ranging sensor with millimeter precision up to 4 meters under bright ambient light.",
    specs: JSON.stringify({
      maxRangeMeters: 4.0,
      rangingFrequencyHz: 50,
      laserEmitter: "940nm Invisible VCSEL (Class 1 Eye-Safe)",
      interface: "I2C (0x29)",
      powerDrawW: 0.06,
    }),
    images: JSON.stringify(["/parts/vl53l1x.png"]),
    compatibility: JSON.stringify(["i2c", "3.3v", "robotics", "obstacle-avoidance"]),
    price: 14.5,
    source: "STMicroelectronics",
  },
  {
    name: "Adafruit INA219 High-Side DC Voltage & Current Sensor",
    slug: "adafruit-ina219-current-sensor",
    category: "SENSOR",
    description: "Precision high-side power monitor measuring bus voltages up to +26V and currents up to 3.2A with 12-bit ADC resolution via I2C.",
    specs: JSON.stringify({
      voltageRange: "0V to +26V DC",
      maxCurrentA: "3.2A (0.1Ω 1% precision shunt)",
      adcResolution: "12-Bit (0.8mA / 4mV per LSB)",
      interface: "I2C (0x40 - 0x4F selectable)",
      powerDrawW: 0.01,
    }),
    images: JSON.stringify(["/parts/ina219-sensor.png"]),
    compatibility: JSON.stringify(["i2c", "power-telemetry", "3.3v-5v"]),
    price: 9.95,
    source: "Adafruit",
  },

  // --- Cooling & Storage ---
  {
    name: "Argon ONE V3 M.2 NVMe Aluminum Case for Raspberry Pi 5",
    slug: "argon-one-v3-nvme-case-rpi5",
    category: "COOLING",
    description: "Precision CNC cast aluminum enclosure with active PWM fan, passive thermal heatsink fins, dual full-size HDMI ports, and built-in PCIe M.2 NVMe base.",
    specs: JSON.stringify({
      coolingType: "Active 30mm PWM Blower + Heavy Aluminum Body",
      nvmeSupport: "M.2 M-Key 2280 / 2242 / 2230 PCIe Gen 3",
      portsRerouting: "Dual Full-Size HDMI 4K, Power Button with Safe Shutdown",
      dimensionsMm: [106, 95, 38],
    }),
    images: JSON.stringify(["/parts/argon-one-v3.png"]),
    compatibility: JSON.stringify(["raspberry-pi-5", "pcie-nvme", "passive-active-cooling"]),
    price: 49.0,
    source: "Argon40",
  },
  {
    name: "Solidigm P44 Pro 2TB PCIe 4.0 NVMe M.2 SSD",
    slug: "solidigm-p44-pro-2tb-nvme",
    category: "STORAGE",
    description: "Ultra-fast PCIe 4.0 x4 SSD delivering up to 7000 MB/s sequential reads with outstanding power efficiency for portable cyberdeck workstations.",
    specs: JSON.stringify({
      capacity: "2000GB (2TB)",
      formFactor: "M.2 2280 Single-Sided",
      sequentialReadMBs: 7000,
      sequentialWriteMBs: 6500,
      enduranceTBW: 1200,
      powerDrawW: 5.5,
    }),
    images: JSON.stringify(["/parts/solidigm-p44-pro.png"]),
    compatibility: JSON.stringify(["m2-nvme", "pcie-gen3-gen4", "fast-storage"]),
    price: 154.0,
    source: "Solidigm / Amazon",
  },

  // --- Enclosures & Chassis Hardware ---
  {
    name: "Nanuk 904 Rugged Waterproof Hard Case with Bezel Ring",
    slug: "nanuk-904-rugged-hard-case",
    category: "CASE",
    description: "Military-grade NK-7 resin crushproof case with PowerClaw latching system, IP67 waterproof seal, and internal perimeter mounting lip for cyberdeck faceplates.",
    specs: JSON.stringify({
      interiorDimensionsMm: [213, 152, 94],
      exteriorDimensionsMm: [259, 201, 114],
      certifications: "IP67 / ATA 300 / ASTM D4169",
      material: "NK-7 High-Impact Polycarbonate Resin",
      weightG: 900,
    }),
    images: JSON.stringify(["/parts/nanuk-904.png"]),
    compatibility: JSON.stringify(["cyberdeck-case", "bezel-mounting", "ip67"]),
    price: 58.95,
    source: "Nanuk",
  },
  {
    name: "M2.5 & M3 Brass Heat-Set Threaded Inserts Assortment Kit (300 Pcs)",
    slug: "brass-heat-set-inserts-kit",
    category: "OTHER",
    description: "High-quality knurled brass threaded inserts for 3D printed cyberdeck enclosures (PLA, PETG, ABS), installed via soldering iron heat tip.",
    specs: JSON.stringify({
      sizes: "M2, M2.5, M3, M4, M5 Knurled Inserts",
      quantity: 300,
      material: "Solid High-Conductivity Brass",
      installation: "Thermal Heat-Staking via Soldering Iron",
    }),
    images: JSON.stringify(["/parts/brass-inserts.png"]),
    compatibility: JSON.stringify(["3d-printing", "fasteners", "right-to-repair"]),
    price: 14.5,
    source: "Amazon",
  },
];

async function main() {
  console.log(`Seeding additional ${massivePartsWave.length} specialized parts...`);

  let added = 0;
  for (const item of massivePartsWave) {
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
          reviewCount: Math.floor(15 + Math.random() * 50),
        },
      });

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
      added++;
    } else {
      console.log(`= Already exists: ${item.name}`);
    }
  }

  console.log(`Successfully added ${added} parts!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
