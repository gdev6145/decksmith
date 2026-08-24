import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEW_PARTS = [
  // Streaming Parts
  {
    name: "Elgato Cam Link 4K USB Capture Card",
    slug: "elgato-cam-link-4k",
    category: "OTHER",
    description: "Ultra-low-latency 4K@30fps / 1080p@60fps HDMI-to-USB 3.0 video capture card. Plug-and-play UVC standard, compatible with Linux, Raspberry Pi 5, OBS Studio, and BELABOX.",
    specs: JSON.stringify({ input: "HDMI unencrypted", output: "USB 3.0 Type-A", maxResolution: "3840×2160 @ 30fps / 1920×1080 @ 60fps", protocol: "UVC", latency: "< 50ms" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 99.99, currency: "USD", url: "https://www.amazon.com/dp/B07K3FN5MR", inStock: true }],
  },
  {
    name: "Macropad 12-Key Mechanical Stream Controller",
    slug: "macropad-12-key-stream-controller",
    category: "KEYBOARD",
    description: "12-key mechanical switch macro keypad with clickable rotary encoder, per-key RGB backlighting, RP2040 microcontroller, USB-C interface. Program scenes, mutes, and camera transitions.",
    specs: JSON.stringify({ keys: "12× Gateron Red linear switches", encoder: "Rotary dial with push switch", mcu: "RP2040", rgb: "Addressable WS2812B", firmware: "QMK / VIA / CircuitPython" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Adafruit", price: 34.95, currency: "USD", url: "https://www.adafruit.com", inStock: true }],
  },
  {
    name: "Shure MV7X XLR/USB Podcast Broadcast Microphone",
    slug: "shure-mv7x-microphone",
    category: "AUDIO",
    description: "Dynamic broadcast microphone with cardioid polar pattern and voice isolation technology. Delivers crisp studio vocals for live streaming and field reporting.",
    specs: JSON.stringify({ type: "Dynamic", polarPattern: "Cardioid", output: "XLR + USB-C", sampleRate: "24-bit / 48kHz", frequencyResponse: "50Hz – 16kHz" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 179.0, currency: "USD", url: "https://www.amazon.com", inStock: true }],
  },

  // Tablet & Display Parts
  {
    name: "Waveshare 10.1\" 1920×1200 IPS Touch Display (Fully Laminated)",
    slug: "waveshare-10-1-1920x1200-touch",
    category: "DISPLAY",
    description: "10.1-inch 1920×1200 Full HD+ IPS display with 10-point capacitive touch, optical bonding, toughened 6H glass, 178° wide viewing angles, integrated stereo speakers, and HDMI input.",
    specs: JSON.stringify({ size: "10.1 inch", resolution: "1920×1200 (16:10)", panel: "IPS", touch: "10-point capacitive (USB)", audio: "Dual cavity stereo speakers", glass: "6H Toughened Optical Lamination" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 119.99, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },
  {
    name: "Raspberry Pi Camera Module 3 (12MP Wide-Angle)",
    slug: "rpi-camera-module-3-wide",
    category: "SENSOR",
    description: "Sony IMX708 11.9MP sensor with powered autofocus, 120° ultra-wide field of view, HDR support. Ideal for tablet webcam, computer vision, and streaming.",
    specs: JSON.stringify({ sensor: "Sony IMX708", resolution: "4608×2592 (11.9 MP)", fov: "120° diagonal (Wide)", autofocus: "Phase Detection + Contrast", hdr: "Up to 3MP HDR mode" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "RPi Foundation", price: 35.0, currency: "USD", url: "https://www.raspberrypi.com", inStock: true }],
  },
  {
    name: "7.8\" Waveshare E-Paper Display HAT (1872×1404)",
    slug: "7-8-epaper-display-hat",
    category: "DISPLAY",
    description: "7.8-inch high-resolution black/white E-Ink raw panel with driver HAT. 1872×1404 resolution (300 DPI), paper-like reading experience with zero eye strain and daylight readability.",
    specs: JSON.stringify({ size: "7.8 inch", resolution: "1872×1404 (300 DPI)", displayColor: "Black, White, 16 Gray scales", interface: "IT8951 SPI/USB driver", viewingAngle: ">170°" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 139.99, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },

  // Wearables & HUD Parts
  {
    name: "Waveshare 4.0\" Square 720×720 IPS Touchscreen",
    slug: "waveshare-4-0-square-touch",
    category: "DISPLAY",
    description: "4.0-inch 720×720 1:1 aspect ratio square IPS display with capacitive 5-point touch. Compact square format perfect for wrist gauntlets, smart mirrors, and custom instruments.",
    specs: JSON.stringify({ size: "4.0 inch (Square 1:1)", resolution: "720×720", panel: "IPS", touch: "5-point capacitive", interface: "DSI / HDMI", viewingAngle: "170°" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare", price: 42.99, currency: "USD", url: "https://www.waveshare.com", inStock: true }],
  },
  {
    name: "BNO085 9-DOF IMU Sensor Module",
    slug: "bno085-9dof-imu-sensor",
    category: "SENSOR",
    description: "High-precision 9-Degrees-of-Freedom motion sensor combining a triaxial accelerometer, gyroscope, and magnetometer with an ARM Cortex M0+ processor running robotic sensor fusion algorithms.",
    specs: JSON.stringify({ chip: "Bosch / Hillcrest BNO085", channels: "3-axis Accel + 3-axis Gyro + 3-axis Mag", fusion: "On-chip sensor fusion (quaternions, Euler, rotation vector)", interface: "I2C / SPI / UART" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Adafruit", price: 24.95, currency: "USD", url: "https://www.adafruit.com", inStock: true }],
  },
  {
    name: "0.71\" Micro-OLED AR Optical Prism Module",
    slug: "micro-oled-ar-prism-module",
    category: "DISPLAY",
    description: "1080p (1920×1080) Micro-OLED display embedded inside a see-through optical prism waveguide. Creates a floating virtual 80-inch screen overlay in the user's field of vision.",
    specs: JSON.stringify({ size: "0.71 inch Micro-OLED", resolution: "1920×1080 FHD", fov: "43° diagonal", transmittance: "> 80% see-through optical prism", interface: "Micro-HDMI / Type-C DP Alt" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Waveshare / AliExpress", price: 260.0, currency: "USD", url: "https://www.aliexpress.com", inStock: true }],
  },
  {
    name: "Tactical Armored Gauntlet Wrist Enclosure",
    slug: "tactical-armored-gauntlet-enclosure",
    category: "CASE",
    description: "Ergonomic 3D-printed forearm chassis printed in semi-flexible TPU and rigid Carbon Fiber PLA. Features dual hook-and-loop quick-release nylon straps, cable channels, and integrated cooling channels.",
    specs: JSON.stringify({ material: "Nylon PA12 / TPU 95A", straps: "Mil-spec 38mm Velcro quick-release straps", wristCircumference: "160–220 mm adjustable", mounting: "Quick-swap magnetic module bay" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "DIY / Printables", price: 28.0, currency: "USD", url: "https://www.printables.com", inStock: true }],
  },
  {
    name: "Custom CNC Aluminum Tablet Bezel & Backplate",
    slug: "custom-cnc-aluminum-tablet-bezel",
    category: "CASE",
    description: "Precision CNC milled 6061 aircraft-grade anodized aluminum chassis with kickstand, magnetic expansion pins, speaker grilles, and passive heat dissipation fins.",
    specs: JSON.stringify({ material: "6061-T6 Anodized Aluminum", dimensions: "255×175×14 mm", kickstand: "135° friction hinge kickstand", weightG: 340 }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "PCBWay / CNC", price: 65.0, currency: "USD", url: "https://www.pcbway.com", inStock: true }],
  },
];

const NEW_BUILDS = [
  // 1. STREAMING PLATFORM BUILDS
  {
    title: "IRL Mobile Broadcaster Backpack",
    slug: "irl-mobile-broadcaster-backpack",
    description: "Professional backpack-mounted live broadcasting rig built on Raspberry Pi 5 with Elgato Cam Link 4K and bonded 4G/LTE connectivity. Runs BELABOX and OBS Studio for uninterrupted outdoor streaming to Twitch and YouTube.",
    type: "Streaming Platform",
    tags: ["streaming", "broadcasting", "irl", "belabox", "obs", "camlink", "4k", "twitch", "mobile"],
    budget: 680,
    parts: [
      { slug: "raspberry-pi-5", qty: 1 },
      { slug: "elgato-cam-link-4k", qty: 1 },
      { slug: "quectel-ec25-e-4g-gnss", qty: 1 },
      { slug: "macropad-12-key-stream-controller", qty: 1 },
      { slug: "20000mah-power-bank", qty: 1 },
      { slug: "argon-one-case", qty: 1 },
    ],
  },
  {
    title: "Compact Retro Arcade Stream Station",
    slug: "compact-retro-arcade-stream-station",
    description: "All-in-one broadcast and streaming console powered by Orange Pi 5 with mechanical macro stream controller, dynamic broadcast microphone, and integrated dual audio routing for live commentary.",
    type: "Streaming Platform",
    tags: ["streaming", "arcade", "broadcast", "microphone", "macropad", "obs", "orange-pi"],
    budget: 490,
    parts: [
      { slug: "orange-pi-5", qty: 1 },
      { slug: "macropad-12-key-stream-controller", qty: 1 },
      { slug: "shure-mv7x-microphone", qty: 1 },
      { slug: "7-inch-ips-touchscreen", qty: 1 },
      { slug: "samsung-t7-500gb", qty: 1 },
      { slug: "custom-3d-printed-clamshell-case", qty: 1 },
    ],
  },

  // 2. CUSTOM TABLET BUILDS
  {
    title: "OpenPad Pi 5 DIY Tablet",
    slug: "openpad-pi-5-diy-tablet",
    description: "A fully modular open-hardware Linux tablet with a 10.1\" 1920×1200 laminated IPS touchscreen, Sony 12MP wide autofocus camera, CNC aluminum kickstand chassis, and fast NVMe storage. A privacy-first daily driver.",
    type: "Custom Tablet",
    tags: ["tablet", "custom-tablet", "raspberry-pi-5", "touchscreen", "1080p", "camera", "linux-tablet", "diy"],
    budget: 390,
    parts: [
      { slug: "raspberry-pi-5", qty: 1 },
      { slug: "waveshare-10-1-1920x1200-touch", qty: 1 },
      { slug: "rpi-camera-module-3-wide", qty: 1 },
      { slug: "custom-cnc-aluminum-tablet-bezel", qty: 1 },
      { slug: "21700-dual-cell-10000mah-pack", qty: 1 },
      { slug: "samsung-t7-500gb", qty: 1 },
    ],
  },
  {
    title: "Nomad E-Ink Field Slate",
    slug: "nomad-eink-field-slate",
    description: "Ultra-low-power, sunlight-readable field slate with a 7.8\" 300 DPI e-paper display and Raspberry Pi Zero 2W. Designed for markdown journaling, distraction-free writing, technical documentation, and offline survival manuals.",
    type: "Custom Tablet",
    tags: ["tablet", "e-ink", "epaper", "distraction-free", "field-slate", "reading", "raspberry-pi-zero"],
    budget: 270,
    parts: [
      { slug: "raspberry-pi-zero-2-w", qty: 1 },
      { slug: "7-8-epaper-display-hat", qty: 1 },
      { slug: "custom-cnc-aluminum-tablet-bezel", qty: 1 },
      { slug: "5000mah-lipo", qty: 1 },
      { slug: "sandisk-256gb-sd", qty: 1 },
    ],
  },

  // 3. WEARABLE BUILDS
  {
    title: "CyberWrist Tactical Gauntlet Deck",
    slug: "cyberwrist-tactical-gauntlet-deck",
    description: "Forearm-mounted wearable cyberdeck featuring a 4.0\" 720×720 square touchscreen, Bosch 9-DOF IMU orientation sensor, GPS tracking, and TPU flexible armor strap. The ultimate Pip-Boy style tactical field companion.",
    type: "Wearable",
    tags: ["wearable", "gauntlet", "wrist", "pip-boy", "imu", "tactical", "square-display", "gps"],
    budget: 240,
    parts: [
      { slug: "raspberry-pi-zero-2-w", qty: 1 },
      { slug: "waveshare-4-0-square-touch", qty: 1 },
      { slug: "bno085-9dof-imu-sensor", qty: 1 },
      { slug: "tactical-armored-gauntlet-enclosure", qty: 1 },
      { slug: "5000mah-lipo", qty: 1 },
    ],
  },
  {
    title: "Monocle AR Tactical Eyewear HUD",
    slug: "monocle-ar-tactical-eyewear-hud",
    description: "Heads-Up Display (HUD) wearable monocular glass powered by Raspberry Pi Pico W and a 1080p Micro-OLED optical prism waveguide. Projects real-time telemetry, compass direction, wireless alerts, and tactical overlays onto the wearer's line of sight.",
    type: "Wearable",
    tags: ["wearable", "hud", "ar", "smart-glasses", "monocle", "micro-oled", "telemetry", "pico"],
    budget: 380,
    parts: [
      { slug: "raspberry-pi-pico-w", qty: 1 },
      { slug: "micro-oled-ar-prism-module", qty: 1 },
      { slug: "bno085-9dof-imu-sensor", qty: 1 },
      { slug: "5000mah-lipo", qty: 1 },
    ],
  },
];

async function main() {
  console.log("🛠️  Seeding hardware for Streaming, Tablet, and Wearables...\n");

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

  console.log("\n🚀 Seeding Streaming, Tablet, and Wearable builds...\n");

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

    console.log(`  ✅ [${build.type}] "${created.title}" (${parts.length} parts)`);
  }

  console.log("\n🎉 All builds and components seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
