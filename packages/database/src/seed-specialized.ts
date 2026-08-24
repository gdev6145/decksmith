import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEW_PARTS = [
  {
    name: "Waveshare SX1262 LoRa HAT (915MHz)",
    slug: "waveshare-sx1262-lora-hat",
    category: "NETWORK",
    description: "Long-range communication HAT for Raspberry Pi based on Semtech SX1262. Supports up to 5km line-of-sight range, 915MHz US/AU band, Meshtastic compatible.",
    specs: JSON.stringify({ frequency: "915 MHz", chip: "SX1262", rangeKm: 5, interface: "SPI", protocol: "LoRa / FSK", antenna: "SMA 2dBi included" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 21.99, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },
  {
    name: "RTL-SDR Blog V4 Software Defined Radio",
    slug: "rtl-sdr-blog-v4",
    category: "NETWORK",
    description: "Wideband software defined radio receiver with HF direct sampling, built-in bias tee, SMA connector, aluminum enclosure, 500kHz–1.7GHz tuning range.",
    specs: JSON.stringify({ range: "500 kHz – 1.766 GHz", adc: "8-bit", bandwidth: "3.2 MHz", tcxo: "1 PPM", connector: "SMA female", biasTee: "4.5V" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "RTL-SDR Blog", price: 39.95, currency: "USD", url: "https://www.rtl-sdr.com", inStock: true }],
  },
  {
    name: "BigBlue 28W USB Solar Charger Panel",
    slug: "bigblue-28w-solar-panel",
    category: "POWER",
    description: "Foldable 28W solar panel with 3 USB output ports, auto-restart SmartIC technology, waterproof PET polymer fabric, and high-efficiency SunPower cells (24%).",
    specs: JSON.stringify({ wattage: 28, outputs: "3× USB-A (5V/2.4A max)", foldedSize: "28×16×3 cm", weightG: 610, efficiency: "24%" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 59.99, currency: "USD", url: "https://www.amazon.com", inStock: true }],
  },
  {
    name: "Pelican 1150 Rugged Protector Case",
    slug: "pelican-1150-rugged-case",
    category: "CASE",
    description: "Watertight, crushproof, and dustproof IP67 protector case with pick-and-pluck foam. The gold standard for tactical and field cyberdeck builds.",
    specs: JSON.stringify({ ipRating: "IP67", exteriorDims: "240×198×109 mm", interiorDims: "211×147×95 mm", weightG: 900, material: "Polypropylene" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 49.95, currency: "USD", url: "https://www.amazon.com", inStock: true }],
  },
  {
    name: "Intel RealSense Depth Camera D435i",
    slug: "intel-realsense-d435i",
    category: "OTHER",
    description: "Stereo depth camera with integrated Bosch 6-DOF IMU. Wide field of view, global shutter, USB 3.1 interface. Perfect for computer vision and robotics on Jetson.",
    specs: JSON.stringify({ depthTech: "Active IR stereo", fov: "87° × 58°", depthResolution: "1280×720 @ 90fps", rgbResolution: "1920×1080 @ 30fps", imu: "BMI055 6-DOF" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Intel", price: 349.0, currency: "USD", url: "https://www.intelrealsense.com", inStock: true }],
  },
];

const NEW_BUILDS = [
  {
    title: "Off-Grid LoRa Comms Terminal (Meshtastic)",
    slug: "offgrid-lora-comms-terminal",
    description: "Solar-powered, rugged off-grid messaging terminal in a watertight Pelican 1150 case. Uses SX1262 LoRa HAT and an ultra-low-power E-Ink display to communicate over miles without cellular or internet.",
    type: "Cyberdeck",
    tags: ["lora", "meshtastic", "off-grid", "solar", "pelican", "e-ink", "rugged", "emergency"],
    budget: 280,
    parts: [
      { slug: "raspberry-pi-zero-2-w", qty: 1 },
      { slug: "waveshare-sx1262-lora-hat", qty: 1 },
      { slug: "2.9-inch-e-ink-display-hat", qty: 1 },
      { slug: "pelican-1150-rugged-case", qty: 1 },
      { slug: "bigblue-28w-solar-panel", qty: 1 },
      { slug: "10000mah-lipo-battery-pack", qty: 1 },
    ],
  },
  {
    title: "SIGINT SDR Spectrum Analyzer Deck",
    slug: "sigint-sdr-spectrum-analyzer-deck",
    description: "Portable RF surveillance and spectrum analysis cyberdeck powered by Raspberry Pi 5 and RTL-SDR Blog V4. Runs GQRX, SDR++, and Wireshark for RF reconnaissance across 500kHz–1.7GHz.",
    type: "Cyberdeck",
    tags: ["sdr", "sigint", "rf", "pentesting", "raspberry-pi-5", "radio", "gqrx"],
    budget: 320,
    parts: [
      { slug: "raspberry-pi-5", qty: 1 },
      { slug: "rtl-sdr-blog-v4", qty: 1 },
      { slug: "7-inch-ips-touchscreen", qty: 1 },
      { slug: "alfa-awus036ach-wifi-adapter", qty: 1 },
      { slug: "argon-one-active-cooling-case", qty: 1 },
      { slug: "20000mah-usb-c-power-bank-module", qty: 1 },
    ],
  },
  {
    title: "Edge AI Spatial Vision Node",
    slug: "edge-ai-spatial-vision-node",
    description: "High-performance edge AI computer vision station powered by NVIDIA Jetson and Intel RealSense D435i depth sensing camera. Real-time object detection, 3D point-cloud mapping, and SLAM.",
    type: "Cyberdeck",
    tags: ["ai", "jetson", "computer-vision", "realsense", "robotics", "slam", "cuda"],
    budget: 520,
    parts: [
      { slug: "nvidia-jetson-nano", qty: 1 },
      { slug: "intel-realsense-d435i", qty: 1 },
      { slug: "samsung-t7-500gb-portable-ssd", qty: 1 },
      { slug: "ice-tower-cpu-cooling-fan", qty: 1 },
      { slug: "10.1-inch-ips-capacitive-touch", qty: 1 },
    ],
  },
];

async function main() {
  console.log("⚡ Seeding specialized hardware parts...\n");

  const partIdMap: Record<string, string> = {};

  const existing = await prisma.part.findMany({ select: { id: true, slug: true } });
  for (const p of existing) partIdMap[p.slug] = p.id;

  for (const part of NEW_PARTS) {
    if (partIdMap[part.slug]) {
      console.log(`  ↩  ${part.name} (already exists)`);
      continue;
    }
    const { prices, ...partData } = part;
    const created = await prisma.part.create({ data: partData });
    partIdMap[created.slug] = created.id;
    for (const price of prices) {
      await prisma.price.create({ data: { partId: created.id, ...price } });
    }
    console.log(`  ✅ ${created.name}`);
  }

  const allParts = await prisma.part.findMany({ select: { id: true, slug: true } });
  for (const p of allParts) partIdMap[p.slug] = p.id;

  console.log("\n🚀 Seeding specialized builds...\n");

  const user = await prisma.user.findFirst({ where: { email: "guest@decksmith.local" } });
  if (!user) throw new Error("Guest user not found");

  for (const build of NEW_BUILDS) {
    const exists = await prisma.build.findUnique({ where: { slug: build.slug } });
    if (exists) {
      console.log(`  ↩  "${build.title}" (already exists)`);
      continue;
    }

    const { parts, ...buildMeta } = build;
    const created = await prisma.build.create({
      data: { ...buildMeta, tags: JSON.stringify(buildMeta.tags), images: "[]", authorId: user.id },
    });

    for (const bp of parts) {
      const pid = partIdMap[bp.slug];
      if (!pid) {
        console.warn(`    ⚠️  Unknown slug: ${bp.slug}`);
        continue;
      }
      await prisma.buildPart.create({ data: { buildId: created.id, partId: pid, quantity: bp.qty } });
    }

    console.log(`  ✅ "${created.title}" (${parts.length} parts)`);
  }

  console.log("\n🎉 Specialized builds and parts seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
