import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ANDRO_PARTS = [
  {
    name: "Khadas VIM4 SBC (8GB RAM, 32GB eMMC)",
    slug: "khadas-vim4-8gb",
    category: "SBC",
    description: "High-performance SBC powered by Amlogic A311D2 (quad-core A73 + quad-core A53), Mali-G52 GPU, 8GB LPDDR4X, 32GB eMMC, Wi-Fi 6, Gigabit Ethernet, native HDMI input/output, official Android 11/12 support with Google Play.",
    specs: JSON.stringify({ cpu: "Amlogic A311D2 2.2GHz 8-Core", gpu: "Mali-G52 MP8", ram: "8 GB LPDDR4X", storage: "32 GB eMMC 5.1", os: "Android 11/12, Ubuntu", wifi: "Wi-Fi 6 (AP6275S)", hdmiIn: "4K@30fps HDMI RX", hdmiOut: "4K@60fps" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Khadas", price: 219.9, currency: "USD", url: "https://www.khadas.com/vim4", inStock: true }],
  },
  {
    name: "Radxa Rock 5B (RK3588, 16GB RAM)",
    slug: "radxa-rock-5b-16gb",
    category: "SBC",
    description: "Flagship Rockchip RK3588 octa-core SBC with 6 TOPS NPU, 16GB LPDDR4x, dual 8K HDMI out, 4K HDMI in, M.2 PCIe 3.0 x4 SSD slot, Android 12 Tablet / Desktop OS support.",
    specs: JSON.stringify({ cpu: "Rockchip RK3588 (4× A76 @ 2.4GHz + 4× A55 @ 1.8GHz)", npu: "6 TOPS NPU", ram: "16 GB LPDDR4x", pcie: "M.2 M-key PCIe 3.0 x4", display: "2× 8K HDMI, 1× eDP", camera: "4-lane MIPI CSI" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "AmeriDroid", price: 189.0, currency: "USD", url: "https://ameridroid.com", inStock: true }],
  },
  {
    name: "Waveshare 11.9\" 320×1480 Ultrawide Bar Touchscreen",
    slug: "waveshare-11-9-bar-touchscreen",
    category: "DISPLAY",
    description: "11.9-inch IPS ultrawide bar touchscreen display (320×1480 resolution) with toughened glass capacitive 5-point touch. Cyberpunk aesthetic, perfect for terminal and split-screen Android multitasking.",
    specs: JSON.stringify({ size: "11.9 inch", resolution: "320×1480", panel: "IPS", touch: "5-point Capacitive", interface: "HDMI + USB Touch", viewingAngle: "170°", glass: "6H Toughened" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 69.99, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },
  {
    name: "Waveshare 5.5\" AMOLED 1080×1920 Touch Display",
    slug: "waveshare-5-5-amoled-touch",
    category: "DISPLAY",
    description: "5.5-inch 1080×1920 Full HD AMOLED capacitive touch display. Deep blacks, vibrant colors, wide 170° viewing angle, optical bonding, toughened glass.",
    specs: JSON.stringify({ size: "5.5 inch", resolution: "1080×1920 FHD", panel: "AMOLED", touch: "Capacitive", interface: "HDMI + USB", contrast: "100000:1" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 89.99, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },
  {
    name: "Solder Party BBQ20 QWERTY Keyboard with Trackpad",
    slug: "solder-party-bbq20-keyboard",
    category: "KEYBOARD",
    description: "Full QWERTY tactile keyboard module with optical trackpad based on the BlackBerry Q20 (Classic). Connects via USB-C or I2C. Built-in backlight, PMOD connector, RP2040 powered.",
    specs: JSON.stringify({ layout: "35-key QWERTY + Optical Trackpad", interface: "USB Type-C / I2C", mcu: "Raspberry Pi RP2040", backlight: "White LED", dimensions: "65×52 mm" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Solder Party", price: 29.95, currency: "USD", url: "https://www.solder.party", inStock: true }],
  },
  {
    name: "Quectel EC25-E Mini PCIe 4G LTE & GNSS Module",
    slug: "quectel-ec25-e-4g-gnss",
    category: "NETWORK",
    description: "LTE Cat 4 module with integrated multi-constellation GNSS (GPS, GLONASS, Galileo). Delivers up to 150Mbps downlink and 50Mbps uplink, Mini PCIe form factor with SIM slot HAT.",
    specs: JSON.stringify({ lteCat: "Cat 4 (150 Mbps DL / 50 Mbps UL)", gnss: "GPS, GLONASS, BeiDou, Galileo", formFactor: "Mini PCIe", bands: "B1/B3/B7/B8/B20/B28A" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 45.0, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },
  {
    name: "Custom 3D-Printed Cyberdeck Clamshell Case",
    slug: "custom-3d-printed-clamshell-case",
    category: "CASE",
    description: "Reinforced PETG/Carbon Fiber 3D-printed clamshell enclosure with steel friction hinges, integrated M3 brass heat-set inserts, internal cable routing channels, and cooling vents.",
    specs: JSON.stringify({ material: "PETG / Carbon-Fiber PLA", hinges: "Dual adjustable steel friction hinges", internalVolume: "240×130×38 mm", mounting: "M2.5/M3 brass threaded inserts" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "DIY / Printables", price: 25.0, currency: "USD", url: "https://www.printables.com", inStock: true }],
  },
  {
    name: "21700 Dual-Cell 10000mAh Battery Pack with BMS",
    slug: "21700-dual-cell-10000mah-pack",
    category: "BATTERY",
    description: "High-density 2S 21700 lithium-ion battery pack (7.4V nominal, 10,000mAh, 74Wh) with built-in Texas Instruments BMS protection board, balance charging, and 30W USB-C PD input/output.",
    specs: JSON.stringify({ chemistry: "Li-ion (2× Samsung 50E 21700)", capacity: "10,000 mAh (74 Wh)", output: "USB-C PD 30W (5V/9V/12V/15V)", protection: "Overcharge, Overdischarge, Short-circuit" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "DIY / AliExpress", price: 34.5, currency: "USD", url: "https://www.aliexpress.com", inStock: true }],
  },
];

const ANDRO_BUILDS = [
  {
    title: "Shadow Walker Stealth Androdeck",
    slug: "shadow-walker-stealth-androdeck",
    description: "A pocketable, military-grade Android cyberdeck built on the Khadas VIM4 running hardened Android 12 with Termux and NetHunter. Features a tactile BBQ20 QWERTY keyboard with optical trackpad, 5.5\" 1080p AMOLED display, and integrated 4G LTE / GPS.",
    type: "Androdeck",
    tags: ["androdeck", "android", "khadas", "stealth", "amoled", "bbq20", "lte", "gps", "nethunter", "termux"],
    budget: 450,
    parts: [
      { slug: "khadas-vim4-8gb", qty: 1 },
      { slug: "waveshare-5-5-amoled-touch", qty: 1 },
      { slug: "solder-party-bbq20-keyboard", qty: 1 },
      { slug: "quectel-ec25-e-4g-gnss", qty: 1 },
      { slug: "custom-3d-printed-clamshell-case", qty: 1 },
      { slug: "21700-dual-cell-10000mah-pack", qty: 1 },
    ],
  },
  {
    title: "DeX Command Rig (Ultrawide RK3588)",
    slug: "dex-command-rig-rk3588",
    description: "A futuristic wide-format tactical terminal powered by Radxa Rock 5B (RK3588 16GB) running Android 12 Desktop. Boasts an 11.9\" ultrawide bar touchscreen, NVMe SSD storage, and full Linux terminal emulation alongside Android multitasking.",
    type: "Androdeck",
    tags: ["androdeck", "android", "rk3588", "radxa", "ultrawide", "desktop-mode", "nvme", "workstation"],
    budget: 520,
    parts: [
      { slug: "radxa-rock-5b-16gb", qty: 1 },
      { slug: "waveshare-11-9-bar-touchscreen", qty: 1 },
      { slug: "samsung-t7-500gb", qty: 1 },
      { slug: "custom-3d-printed-clamshell-case", qty: 1 },
      { slug: "20000mah-power-bank", qty: 1 },
    ],
  },
  {
    title: "Pocket Netrunner Android Terminal",
    slug: "pocket-netrunner-android-terminal",
    description: "Ultra-compact EDC cyberdeck with BlackBerry physical keyboard, Orange Pi 5 (RK3588S), and 7-inch IPS display. Fast booting Android OS with custom terminal launcher, Wi-Fi auditing tools, and battery life exceeding 8 hours.",
    type: "Androdeck",
    tags: ["androdeck", "android", "orange-pi", "pocket", "edc", "keyboard", "portable"],
    budget: 290,
    parts: [
      { slug: "orange-pi-5", qty: 1 },
      { slug: "7-inch-ips-touchscreen", qty: 1 },
      { slug: "solder-party-bbq20-keyboard", qty: 1 },
      { slug: "alfa-awus036ach", qty: 1 },
      { slug: "10000mah-lipo-pack", qty: 1 },
      { slug: "custom-3d-printed-clamshell-case", qty: 1 },
    ],
  },
];

async function main() {
  console.log("📱 Seeding Androdeck hardware parts...\n");

  const partIdMap: Record<string, string> = {};

  const existing = await prisma.part.findMany({ select: { id: true, slug: true } });
  for (const p of existing) partIdMap[p.slug] = p.id;

  for (const part of ANDRO_PARTS) {
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

  console.log("\n🚀 Seeding Androdeck builds...\n");

  const user = await prisma.user.findFirst({ where: { email: "guest@decksmith.local" } });
  if (!user) throw new Error("Guest user not found");

  for (const build of ANDRO_BUILDS) {
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

  console.log("\n🎉 Androdecks seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
