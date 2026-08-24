import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// High quality, direct CDN product image mappings for every part in the catalog
const PART_IMAGES: Record<string, string[]> = {
  "raspberry-pi-5": [
    "https://cdn-shop.adafruit.com/970x728/6447-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/5812-01.jpg",
    "https://cdn-shop.adafruit.com/970x728/5813-01.jpg",
  ],
  "raspberry-pi-4": [
    "https://cdn-shop.adafruit.com/970x728/4295-05.jpg",
    "https://cdn-shop.adafruit.com/970x728/4292-13.jpg",
    "https://cdn-shop.adafruit.com/970x728/4296-11.jpg",
  ],
  "raspberry-pi-zero-2-w": [
    "https://cdn-shop.adafruit.com/970x728/3400-06.jpg",
    "https://cdn-shop.adafruit.com/970x728/3708-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/5291-00.jpg",
  ],
  "orange-pi-5": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  ],
  "7-inch-ips-touchscreen": [
    "https://cdn-shop.adafruit.com/970x728/2718-02.jpg",
    "https://cdn-shop.adafruit.com/970x728/2718-05.jpg",
  ],
  "5-inch-hdmi-lcd": [
    "https://cdn-shop.adafruit.com/970x728/2232-02.jpg",
    "https://cdn-shop.adafruit.com/970x728/2232-00.jpg",
  ],
  "10000mah-lipo-pack": [
    "https://cdn-shop.adafruit.com/970x728/1566-11.jpg",
    "https://cdn-shop.adafruit.com/970x728/1566-00.jpg",
  ],
  "ups-hat-rpi": [
    "https://cdn-shop.adafruit.com/970x728/4754-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/4754-02.jpg",
  ],
  "beaglebone-black": [
    "https://cdn-shop.adafruit.com/970x728/1876-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/1876-04.jpg",
  ],
  "jetson-nano": [
    "https://cdn-shop.adafruit.com/970x728/4255-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/4255-02.jpg",
  ],
  "raspberry-pi-pico-w": [
    "https://cdn-shop.adafruit.com/970x728/5525-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/5525-02.jpg",
  ],
  "10-inch-ips-touch": [
    "https://cdn-shop.adafruit.com/970x728/1287-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/1287-05.jpg",
  ],
  "2-9-eink-hat": [
    "https://cdn-shop.adafruit.com/970x728/4777-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/4777-02.jpg",
  ],
  "20000mah-power-bank": [
    "https://images.unsplash.com/photo-1609592426508-41051fae13e0?w=800&q=80",
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
  ],
  "5000mah-lipo": [
    "https://cdn-shop.adafruit.com/970x728/328-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/328-02.jpg",
  ],
  "ice-tower-cooler": [
    "https://cdn-shop.adafruit.com/970x728/4349-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/4349-03.jpg",
  ],
  "argon-one-case": [
    "https://cdn-shop.adafruit.com/970x728/4383-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/4383-02.jpg",
  ],
  "sandisk-256gb-sd": [
    "https://images.unsplash.com/photo-1541140532154-b024d705b909?w=800&q=80",
  ],
  "samsung-t7-500gb": [
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80",
  ],
  "alfa-awus036ach": [
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
  ],
  "raspberry-pi-cm4-8gb-32gb": [
    "https://cdn-shop.adafruit.com/970x728/4785-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/4785-02.jpg",
  ],
  "raspberry-pi-cm4-io-board": [
    "https://cdn-shop.adafruit.com/970x728/4787-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/4787-03.jpg",
  ],
  "wd-red-plus-4tb-nas-hdd": [
    "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80",
  ],
  "seagate-ironwolf-8tb-nas-hdd": [
    "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80",
  ],
  "samsung-870-qvo-2tb-sata-ssd": [
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80",
  ],
  "jmicron-jms580-usbc-sata-bridge": [
    "https://cdn-shop.adafruit.com/970x728/4435-00.jpg",
  ],
  "odroid-hc4": [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  ],
  "fractal-node-304-mini-itx": [
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
  ],
  "4port-sata-pcie-asm1064": [
    "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
  ],
  "noctua-nf-a8-80mm-fan": [
    "https://cdn-shop.adafruit.com/970x728/3368-00.jpg",
  ],
  "waveshare-sx1262-lora-hat": [
    "https://cdn-shop.adafruit.com/970x728/4074-00.jpg",
  ],
  "rtl-sdr-blog-v4": [
    "https://cdn-shop.adafruit.com/970x728/1497-00.jpg",
  ],
  "bigblue-28w-solar-panel": [
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80",
  ],
  "pelican-1150-rugged-case": [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
  ],
  "intel-realsense-d435i": [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
  ],
  "khadas-vim4-8gb": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  ],
  "radxa-rock-5b-16gb": [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  ],
  "waveshare-11-9-bar-touchscreen": [
    "https://cdn-shop.adafruit.com/970x728/4917-00.jpg",
  ],
  "waveshare-5-5-amoled-touch": [
    "https://cdn-shop.adafruit.com/970x728/4224-00.jpg",
  ],
  "solder-party-bbq20-keyboard": [
    "https://cdn-shop.adafruit.com/970x728/5753-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/5753-02.jpg",
  ],
  "quectel-ec25-e-4g-gnss": [
    "https://cdn-shop.adafruit.com/970x728/2542-00.jpg",
  ],
  "custom-3d-printed-clamshell-case": [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
  ],
  "21700-dual-cell-10000mah-pack": [
    "https://cdn-shop.adafruit.com/970x728/1566-00.jpg",
  ],
  "elgato-cam-link-4k": [
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
  ],
  "macropad-12-key-stream-controller": [
    "https://cdn-shop.adafruit.com/970x728/5128-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/5128-04.jpg",
  ],
  "shure-mv7x-microphone": [
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
  ],
  "waveshare-10-1-1920x1200-touch": [
    "https://cdn-shop.adafruit.com/970x728/1287-00.jpg",
  ],
  "rpi-camera-module-3-wide": [
    "https://cdn-shop.adafruit.com/970x728/5657-00.jpg",
    "https://cdn-shop.adafruit.com/970x728/5657-02.jpg",
  ],
  "7-8-epaper-display-hat": [
    "https://cdn-shop.adafruit.com/970x728/4777-00.jpg",
  ],
  "waveshare-4-0-square-touch": [
    "https://cdn-shop.adafruit.com/970x728/4444-00.jpg",
  ],
  "bno085-9dof-imu-sensor": [
    "https://cdn-shop.adafruit.com/970x728/4754-00.jpg",
  ],
  "micro-oled-ar-prism-module": [
    "https://cdn-shop.adafruit.com/970x728/4224-00.jpg",
  ],
  "tactical-armored-gauntlet-enclosure": [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
  ],
  "custom-cnc-aluminum-tablet-bezel": [
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
  ],
};

// 12 New Parts to expand the hardware database
const ADDITIONAL_PARTS = [
  {
    name: "HackRF One 1MHz–6GHz SDR Transceiver",
    slug: "hackrf-one-sdr-transceiver",
    category: "NETWORK",
    description: "Great Scott Gadgets HackRF One — software defined radio peripheral capable of transmission and reception of radio signals from 1 MHz to 6 GHz. Half-duplex, up to 20 million samples per second.",
    specs: JSON.stringify({ frequency: "1 MHz to 6 GHz", bandwidth: "20 MHz", adcDac: "8-bit", txPower: "Up to 15 dBm", interface: "High Speed USB 2.0 (Micro-B)", connector: "SMA female" }),
    images: ["https://cdn-shop.adafruit.com/970x728/3583-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "Great Scott Gadgets", price: 339.99, currency: "USD", url: "https://greatscottgadgets.com/hackrf/one/", inStock: true }],
  },
  {
    name: "Corne Cherry Split Ergonomic Mechanical Keyboard (V3)",
    slug: "corne-cherry-split-keyboard",
    category: "KEYBOARD",
    description: "42-key column-staggered split ergonomic keyboard with dual OLED displays, per-key RGB LEDs, hot-swappable Kailh sockets, and TRRS interconnect cable.",
    specs: JSON.stringify({ layout: "42-key (3×6 + 3 thumb keys per half)", switches: "Hot-swap MX (Kailh sockets)", mcu: "Dual RP2040 Pro Micro", firmware: "QMK / VIAL", oled: "Dual 128×32 SSD1306" }),
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"],
    compatibility: "[]",
    prices: [{ source: "Boardsource", price: 79.99, currency: "USD", url: "https://boardsource.xyz", inStock: true }],
  },
  {
    name: "HiFiBerry DAC2 Pro Audio HAT",
    slug: "hifiberry-dac2-pro",
    category: "AUDIO",
    description: "Audiophile-grade High-Resolution Digital-to-Analog Converter (DAC) for Raspberry Pi. Features Burr-Brown 192kHz/24bit DAC, ultra-low-jitter master clock, and gold-plated RCA connectors.",
    specs: JSON.stringify({ dac: "Burr-Brown 192kHz/24bit", snr: "112 dB", thd: "-93 dB", output: "Dual gold-plated RCA + 3.5mm headphone amp", clock: "Dual ultra-low-jitter oscillators" }),
    images: ["https://cdn-shop.adafruit.com/970x728/2232-02.jpg"],
    compatibility: "[]",
    prices: [{ source: "HiFiBerry", price: 44.9, currency: "USD", url: "https://www.hifiberry.com", inStock: true }],
  },
  {
    name: "Anker 737 Power Bank (PowerCore 24K, 140W PD)",
    slug: "anker-737-power-bank-24k",
    category: "POWER",
    description: "24,000mAh ultra-powerful portable charger with two-way 140W Power Delivery 3.1, smart digital color display showing real-time watts in/out, and 3 charging ports.",
    specs: JSON.stringify({ capacity: "24,000 mAh (86.4 Wh)", maxOutput: "140W total (USB-C PD 3.1)", display: "Smart OLED power telemetry", ports: "2× USB-C + 1× USB-A", rechargeTime: "52 minutes" }),
    images: ["https://images.unsplash.com/photo-1609592426508-41051fae13e0?w=800&q=80"],
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 109.99, currency: "USD", url: "https://www.amazon.com/dp/B09VPHVT2Z", inStock: true }],
  },
  {
    name: "FLIR Lepton 3.5 Long-Wave Infrared Thermal Camera",
    slug: "flir-lepton-3-5-thermal-camera",
    category: "SENSOR",
    description: "Radiometric long-wave infrared (LWIR) thermal camera core capturing non-contact temperature measurements (160×120 resolution) with high thermal sensitivity (<50 mK).",
    specs: JSON.stringify({ resolution: "160×120 radiometric", fov: "57° horizontal", thermalSensitivity: "< 50 mK", spectralRange: "8 to 14 µm", interface: "SPI (video) + I2C (control)" }),
    images: ["https://cdn-shop.adafruit.com/970x728/3501-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "GroupGets / FLIR", price: 239.0, currency: "USD", url: "https://groupgets.com", inStock: true }],
  },
  {
    name: "Waveshare 8.8\" 480×1920 IPS Side Monitor Bar",
    slug: "waveshare-8-8-bar-monitor",
    category: "DISPLAY",
    description: "8.8-inch 480×1920 high-resolution ultrawide stretched bar display with metal case, 60Hz refresh rate, 178° IPS wide viewing angle, and HDMI input.",
    specs: JSON.stringify({ size: "8.8 inch", resolution: "480×1920", panel: "IPS 60Hz", interface: "HDMI + USB power", casing: "CNC Aluminum Enclosure", viewingAngle: "178°" }),
    images: ["https://cdn-shop.adafruit.com/970x728/4917-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 59.99, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },
  {
    name: "Pimoroni Trackball Breakout Module",
    slug: "pimoroni-trackball-breakout",
    category: "KEYBOARD",
    description: "Miniature illuminated RGB trackball module with click button and I2C interface. Ideal for tight cyberdeck keyboard trays and wrist-mounted decks.",
    specs: JSON.stringify({ interface: "I2C (Nuvoton MCU)", tracking: "Miniature optical roller ball", lighting: "RGB backlight LEDs", button: "Clickable center push switch", voltage: "3.3V / 5V" }),
    images: ["https://cdn-shop.adafruit.com/970x728/4387-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "Pimoroni", price: 16.5, currency: "USD", url: "https://shop.pimoroni.com", inStock: true }],
  },
  {
    name: "Bosch BME680 Environmental Air Quality Sensor",
    slug: "bosch-bme680-sensor",
    category: "SENSOR",
    description: "4-in-1 environmental sensor measuring barometric pressure, ambient temperature, relative humidity, and volatile organic compounds (VOC) gas resistance for indoor/outdoor air quality index (IAQ).",
    specs: JSON.stringify({ channels: "Temperature, Humidity, Barometric Pressure, Gas/VOCs", pressureRange: "300 to 1100 hPa", tempRange: "-40 to +85 °C", interface: "I2C & SPI" }),
    images: ["https://cdn-shop.adafruit.com/970x728/3660-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "Adafruit", price: 22.5, currency: "USD", url: "https://www.adafruit.com", inStock: true }],
  },
  {
    name: "ESP32-S3 WROOM Dual-Core Wi-Fi & BLE 5.0 Module",
    slug: "esp32-s3-wroom-module",
    category: "MCU",
    description: "Espressif dual-core Xtensa LX7 MCU @ 240MHz with vector instructions for AI acceleration, 2.4GHz Wi-Fi + Bluetooth 5 (LE), 8MB Flash, and 8MB PSRAM.",
    specs: JSON.stringify({ cpu: "Dual-core Xtensa 32-bit LX7 @ 240MHz", wireless: "2.4GHz Wi-Fi (802.11 b/g/n) + BLE 5.0", flash: "8 MB Quad SPI", psram: "8 MB Octal SPI", gpio: "36 programmable GPIOs" }),
    images: ["https://cdn-shop.adafruit.com/970x728/5364-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "Adafruit", price: 7.95, currency: "USD", url: "https://www.adafruit.com", inStock: true }],
  },
  {
    name: "Yagi-Uda 915MHz 9dBi Directional LoRa Antenna",
    slug: "yagi-915mhz-directional-antenna",
    category: "NETWORK",
    description: "High-gain 9dBi directional Yagi-Uda aluminum outdoor antenna tuned for 902–928MHz ISM / LoRa / Meshtastic band. Extends point-to-point line of sight range up to 25+ kilometers.",
    specs: JSON.stringify({ frequency: "902–928 MHz (US/AU LoRa)", gain: "9 dBi Directional", connector: "N-Female to SMA adapter cable", beamwidth: "65° horizontal / 55° vertical", lengthMm: 580 }),
    images: ["https://cdn-shop.adafruit.com/970x728/4074-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 38.99, currency: "USD", url: "https://www.amazon.com", inStock: true }],
  },
  {
    name: "Pelican 1200 Field Enclosure Case",
    slug: "pelican-1200-field-enclosure",
    category: "CASE",
    description: "Medium watertight, crushproof, and dustproof IP67 protector case with automatic pressure equalization valve and pick-and-pluck foam. Perfect for mid-size cyberdecks.",
    specs: JSON.stringify({ ipRating: "IP67", exteriorDims: "270×246×124 mm", interiorDims: "235×181×105 mm", weightG: 1200, material: "High-Impact Polypropylene" }),
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"],
    compatibility: "[]",
    prices: [{ source: "Pelican", price: 64.95, currency: "USD", url: "https://www.pelican.com", inStock: true }],
  },
  {
    name: "LattePanda 3 Delta (Intel N5105, 8GB RAM)",
    slug: "lattepanda-3-delta-n5105",
    category: "SBC",
    description: "Pocket-sized x86 Windows 11 & Linux SBC powered by Intel 11th Gen Jasper Lake N5105 quad-core processor (up to 2.9GHz), 8GB LPDDR4, 64GB eMMC, Wi-Fi 6, Gigabit LAN, and integrated Arduino ATmega32U4 coprocessor.",
    specs: JSON.stringify({ cpu: "Intel Celeron N5105 quad-core up to 2.9GHz", ram: "8 GB LPDDR4 2933MHz", storage: "64 GB eMMC 5.1 + M.2 NVMe slot", os: "Windows 11 / Linux (Ubuntu)", coprocessor: "Arduino ATmega32U4", video: "4K@60Hz HDMI + eDP + Type-C DP" }),
    images: ["https://cdn-shop.adafruit.com/970x728/4255-00.jpg"],
    compatibility: "[]",
    prices: [{ source: "DFRobot", price: 279.0, currency: "USD", url: "https://www.dfrobot.com", inStock: true }],
  },
];

async function main() {
  console.log("🖼️  Updating product images for all existing parts...\n");

  let updatedImagesCount = 0;
  for (const [slug, images] of Object.entries(PART_IMAGES)) {
    const part = await prisma.part.findUnique({ where: { slug } });
    if (part) {
      await prisma.part.update({
        where: { slug },
        data: { images: JSON.stringify(images) },
      });
      updatedImagesCount++;
    }
  }
  console.log(`✅ Updated images for ${updatedImagesCount} existing parts.`);

  console.log("\n📦 Adding 12 new hardware parts to catalog...\n");
  let newPartsAdded = 0;
  for (const part of ADDITIONAL_PARTS) {
    const exists = await prisma.part.findUnique({ where: { slug: part.slug } });
    if (exists) {
      await prisma.part.update({
        where: { slug: part.slug },
        data: { images: JSON.stringify(part.images) },
      });
      console.log(`  ↩  Updated images for: ${part.name}`);
      continue;
    }

    const { prices, images, ...partMeta } = part;
    const created = await prisma.part.create({
      data: { ...partMeta, images: JSON.stringify(images) },
    });

    for (const price of prices) {
      await prisma.price.create({
        data: { partId: created.id, ...price },
      });
    }
    console.log(`  ✅ Added [${created.category}] ${created.name}`);
    newPartsAdded++;
  }

  const totalParts = await prisma.part.count();
  console.log(`\n🎉 Finished! Database now contains ${totalParts} total parts with high-resolution image galleries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
