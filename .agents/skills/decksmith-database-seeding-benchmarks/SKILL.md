---
name: decksmith-database-seeding-benchmarks
description: >-
  Manage Prisma database schemas, seed datasets, hardware benchmark scoring, and part compatibility matrices in `@decksmith/database`.
  Use when writing Prisma seed scripts, adding hardware parts to the database, or setting up benchmark tests.
---

# Decksmith Database Seeding & Benchmarks Guide

This skill guides adding initial hardware parts, benchmarks, and category seed data in `packages/database/`.

---

## 1. Hardware Parts Database Seeder (`packages/database/src/seed.ts`)

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Decksmith Hardware Database...");

  // 1. Categories
  const sbcCategory = await prisma.buildCategory.upsert({
    where: { slug: "sbc" },
    update: {},
    create: {
      name: "Single Board Computers",
      slug: "sbc",
      description: "ARM / RISC-V compute boards for cyberdecks",
      icon: "Cpu",
    },
  });

  // 2. Hardware Parts
  await prisma.part.upsert({
    where: { slug: "raspberry-pi-5-8gb" },
    update: {},
    create: {
      name: "Raspberry Pi 5 (8GB RAM)",
      slug: "raspberry-pi-5-8gb",
      category: "sbc",
      description: "Broadcom BCM2712 quad-core ARM Cortex-A76 @ 2.4GHz with PCIe 2.0 interface.",
      specs: JSON.stringify({
        cpu: "Quad-core Cortex-A76 @ 2.4GHz",
        ram: "8GB LPDDR4X",
        powerDrawWatt: 12.5,
        dimensions: "85 x 56 mm",
      }),
      prices: {
        create: [
          { source: "Adafruit", price: 80.0, url: "https://www.adafruit.com/product/5813" },
        ],
      },
    },
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

---

## 2. Hardware Benchmark Test Types

The `Benchmark` model stores empirical performance metrics:
- **`cpu_score`**: Geekbench / Sysbench multi-core CPU score
- **`gpu_score`**: Glmark2 / WebGL FPS score
- **`memory_bandwidth`**: MB/s RAM read/write speed
- **`power_draw`**: Idle and peak power draw in Watts
