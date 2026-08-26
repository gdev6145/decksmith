import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const RECENT_ADDITIONS = [
  {
    type: "new_studio",
    title: "🧩 New Studio: 3D Exploded Assembly Guide",
    message: "Interactive 3D layer explosion slider, step-by-step mechanical stacking, screw torque limits, and printable field manual.",
    url: "/assembly",
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
  },
  {
    type: "new_studio",
    title: "🔌 New Studio: WebSerial Terminal & MCU Flasher",
    message: "Connect USB-UART microcontrollers directly in browser, view live ASCII/Hex debug streams, and flash MicroPython/CircuitPython.",
    url: "/serial",
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    type: "new_studio",
    title: "🎵 New Studio: Audio DSP & Chiptune Synth",
    message: "16-step tracker synthesizer, resonant lowpass filter, Cyberpunk musical scales, I2S DAC profiles, and ALSA asound.conf export.",
    url: "/synth",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hrs ago
  },
  {
    type: "new_studio",
    title: "⚡ New Studio: Logic Analyzer & Bus Sniffer",
    message: "4-channel digital waveform timing analyzer with protocol decoders for I2C (400kHz), SPI (10MHz), UART (115200), and 1-Wire.",
    url: "/logic",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000), // 4 hrs ago
  },
  {
    type: "new_part",
    title: "📦 12+ New Verified Cyberdeck Parts Added",
    message: "StarFive VisionFive 2 RISC-V SBC, Khadas VIM4, 11.9\" Bar Touch LCD, BlackBerry Q10 I2C Keyboard, HackRF One SDR, and SCD41 sensor.",
    url: "/parts",
    createdAt: new Date(Date.now() - 6 * 3600 * 1000),
  },
  {
    type: "security_update",
    title: "🛡️ Zero-Trust Cryptographic Auth Live",
    message: "Salted PBKDF2-SHA512 password hashing (100,000 rounds), constant-time timing safe checks, and signed HMAC-SHA256 bearer tokens.",
    url: "/settings",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    type: "new_feature",
    title: "✨ Interactive Mission Guide v2.0",
    message: "Cyberdeck diagnostic archetype quiz, battery runtime calculator, antenna whip resonator, and gamified builder achievement badges.",
    url: "/builder",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
  },
];

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in database.`);

  for (const user of users) {
    for (const item of RECENT_ADDITIONS) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          title: item.title,
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: item.type,
            title: item.title,
            message: item.message,
            url: item.url,
            read: false,
            createdAt: item.createdAt,
          },
        });
      }
    }
    console.log(`✓ Seeded update notifications for user [${user.name || user.email}]`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
