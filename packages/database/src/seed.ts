import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PARTS = [
  // SBCs
  {
    name: "Raspberry Pi 5",
    slug: "raspberry-pi-5",
    category: "SBC",
    description: "Latest generation Raspberry Pi with improved performance",
    specs: JSON.stringify({
      processor: "Broadcom BCM2712",
      cores: 4,
      clockSpeed: "2.4GHz",
      ram: "4GB / 8GB",
      wifi: "WiFi 6",
      bluetooth: "5.0",
      gpio: 40,
      usbPorts: 3,
      hdmiPorts: 2,
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.8,
    reviewCount: 1250,
  },
  {
    name: "Raspberry Pi 4 Model B",
    slug: "raspberry-pi-4",
    category: "SBC",
    description: "Powerful SBC with great community support",
    specs: JSON.stringify({
      processor: "Broadcom BCM2711",
      cores: 4,
      clockSpeed: "1.5GHz",
      ram: "1GB / 2GB / 4GB / 8GB",
      wifi: "WiFi 5",
      bluetooth: "5.0",
      gpio: 40,
      usbPorts: 4,
      hdmiPorts: 2,
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.7,
    reviewCount: 3200,
  },
  {
    name: "Raspberry Pi Zero 2 W",
    slug: "raspberry-pi-zero-2-w",
    category: "SBC",
    description: "Ultra-compact SBC for portable builds",
    specs: JSON.stringify({
      processor: "RP3A0",
      cores: 4,
      clockSpeed: "1GHz",
      ram: "512MB",
      wifi: "WiFi 4",
      bluetooth: "4.2",
      gpio: 40,
      usbPorts: 1,
      hdmiPorts: 1,
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.5,
    reviewCount: 890,
  },
  {
    name: "Orange Pi 5",
    slug: "orange-pi-5",
    category: "SBC",
    description: "High-performance SBC with RK3588S",
    specs: JSON.stringify({
      processor: "Rockchip RK3588S",
      cores: 8,
      clockSpeed: "2.4GHz",
      ram: "4GB / 8GB / 16GB",
      wifi: "WiFi 6",
      bluetooth: "5.0",
      gpio: 40,
      usbPorts: 3,
      hdmiPorts: 2,
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.4,
    reviewCount: 420,
  },
  // Displays
  {
    name: "7 inch IPS Touchscreen",
    slug: "7-inch-ips-touchscreen",
    category: "DISPLAY",
    description: "1024x600 IPS display with capacitive touch",
    specs: JSON.stringify({
      screenSize: "7 inch",
      resolution: "1024x600",
      panelType: "IPS",
      touchScreen: true,
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.3,
    reviewCount: 560,
  },
  {
    name: "5 inch HDMI LCD",
    slug: "5-inch-hdmi-lcd",
    category: "DISPLAY",
    description: "Compact 800x480 display for small builds",
    specs: JSON.stringify({
      screenSize: "5 inch",
      resolution: "800x480",
      panelType: "IPS",
      touchScreen: true,
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.2,
    reviewCount: 340,
  },
  // Batteries
  {
    name: "10000mAh LiPo Battery Pack",
    slug: "10000mah-lipo-pack",
    category: "BATTERY",
    description: "High capacity battery with built-in protection",
    specs: JSON.stringify({
      capacity: "10000mAh",
      chemistry: "LiPo",
      voltage: 3.7,
      maxDischarge: "2A",
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.6,
    reviewCount: 780,
  },
  {
    name: "UPS HAT for Raspberry Pi",
    slug: "ups-hat-rpi",
    category: "POWER",
    description: "Uninterruptible power supply HAT with 5000mAh battery",
    specs: JSON.stringify({
      capacity: "5000mAh",
      chemistry: "LiPo",
      voltage: 5,
    }),
    images: "[]",
    compatibility: "[]",
    rating: 4.4,
    reviewCount: 420,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const part of PARTS) {
    await prisma.part.upsert({
      where: { slug: part.slug },
      update: {},
      create: part,
    });
  }

  console.log(`Seeded ${PARTS.length} parts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
