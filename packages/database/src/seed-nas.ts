import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAS_PARTS = [
  {
    name: "Raspberry Pi CM4 (8GB RAM, 32GB eMMC)",
    slug: "raspberry-pi-cm4-8gb-32gb",
    category: "SBC",
    description: "Compute Module 4 with 8 GB LPDDR4 RAM and 32 GB eMMC. PCIe Gen 2 x1 enables full-speed SATA via M.2 adapter.",
    specs: JSON.stringify({ cpu: "Cortex-A72 quad-core 1.5 GHz", ram: "8 GB LPDDR4", storage: "32 GB eMMC", pcie: "PCIe Gen 2 x1", ethernet: "Gigabit" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "RPi Foundation", price: 90, currency: "USD", url: "https://www.raspberrypi.com/products/compute-module-4/", inStock: true }],
  },
  {
    name: "Raspberry Pi CM4 IO Board",
    slug: "raspberry-pi-cm4-io-board",
    category: "OTHER",
    description: "Official CM4 IO board with M.2 M-key PCIe slot, dual HDMI, Gigabit Ethernet, USB, and 40-pin GPIO.",
    specs: JSON.stringify({ pcie: "PCIe Gen 2 x1 (M.2 M-key)", ethernet: "Gigabit", usb: "2× USB 2.0 + 1× USB 3.0", gpio: "40-pin", hdmi: "2× HDMI 2.0" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Adafruit", price: 35, currency: "USD", url: "https://www.adafruit.com/product/4787", inStock: true }],
  },
  {
    name: "WD Red Plus 4TB 3.5\" NAS HDD",
    slug: "wd-red-plus-4tb-nas-hdd",
    category: "STORAGE",
    description: "WD Red Plus 4 TB NAS-optimised HDD, rated 24/7, up to 8 bays. CMR, 5400 RPM, 128 MB cache, NASware 3.0.",
    specs: JSON.stringify({ capacity: "4 TB", interface: "SATA III 6 Gb/s", rpm: 5400, cache: "128 MB", mtbf: "1M hours", formFactor: "3.5\"" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 99.99, currency: "USD", url: "https://www.amazon.com/dp/B08TZPS4QQ", inStock: true }],
  },
  {
    name: "Seagate IronWolf 8TB NAS HDD",
    slug: "seagate-ironwolf-8tb-nas-hdd",
    category: "STORAGE",
    description: "Seagate IronWolf 8 TB CMR NAS drive. AgileArray RAID firmware, 7200 RPM, 256 MB cache, up to 24-bay enclosures.",
    specs: JSON.stringify({ capacity: "8 TB", interface: "SATA III 6 Gb/s", rpm: 7200, cache: "256 MB", mtbf: "1M hours", formFactor: "3.5\"" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 189.99, currency: "USD", url: "https://www.amazon.com/dp/B07H289S79", inStock: true }],
  },
  {
    name: "Samsung 870 QVO 2TB 2.5\" SATA SSD",
    slug: "samsung-870-qvo-2tb-sata-ssd",
    category: "STORAGE",
    description: "Samsung 870 QVO 2 TB SATA SSD — silent, low-power NAS storage or ZFS L2ARC/SLOG cache device.",
    specs: JSON.stringify({ capacity: "2 TB", interface: "SATA III 6 Gb/s", readMBs: 560, writeMBs: 530, formFactor: "2.5\"", mtbf: "1.5M hours" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 109.99, currency: "USD", url: "https://www.amazon.com/dp/B08QB93S6R", inStock: true }],
  },
  {
    name: "JMicron JMS580 USB-C to SATA Bridge",
    slug: "jmicron-jms580-usbc-sata-bridge",
    category: "OTHER",
    description: "USB 3.2 Gen 2 (10 Gb/s) to SATA III bridge board with UASP and TRIM support. Connect SATA drives via USB-C.",
    specs: JSON.stringify({ interface: "USB 3.2 Gen 2 (10 Gbps)", sata: "SATA III 6 Gb/s", trim: true, uasp: true }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "AliExpress", price: 8.99, currency: "USD", url: "https://www.aliexpress.com", inStock: true }],
  },
  {
    name: "ODROID-HC4 NAS Board",
    slug: "odroid-hc4",
    category: "SBC",
    description: "Hardkernel ODROID-HC4: Amlogic S905X3 2.1 GHz quad-core, 4 GB DDR4, dual native SATA3 via PCIe, OLED display, Gigabit Ethernet.",
    specs: JSON.stringify({ cpu: "Amlogic S905X3 quad-core Cortex-A55 2.1 GHz", ram: "4 GB DDR4", sata: "2× SATA3 (PCIe)", ethernet: "Gigabit", usb: "1× USB 3.0 + 1× USB 2.0", display: "OLED" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Hardkernel", price: 65, currency: "USD", url: "https://www.hardkernel.com/shop/odroid-hc4/", inStock: true }],
  },
  {
    name: "Fractal Node 304 Mini-ITX NAS Case",
    slug: "fractal-node-304-mini-itx",
    category: "CASE",
    description: "Compact Mini-ITX case with 6× 3.5\" HDD bays, rubber-mounted drives, 2× 92 mm fans. The go-to chassis for home NAS builds.",
    specs: JSON.stringify({ formFactor: "Mini-ITX", driveBays: "6× 3.5\" + 2× 2.5\"", fans: "2× 92 mm front + 1× 60 mm rear", dimensions: "250×210×374 mm", psuSupport: "SFX/ATX" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 109.99, currency: "USD", url: "https://www.amazon.com/dp/B00MZAF71Q", inStock: true }],
  },
  {
    name: "4-Port SATA PCIe Adapter (ASM1064)",
    slug: "4port-sata-pcie-asm1064",
    category: "OTHER",
    description: "PCIe Gen 2 x1 to 4× SATA III card using the ASM1064 chip. Expands any Mini-ITX board to support a full 6-drive NAS.",
    specs: JSON.stringify({ ports: 4, interface: "PCIe Gen 2 x1", chip: "ASM1064", speed: "6 Gb/s per port", profile: "Low-profile bracket included" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 28.99, currency: "USD", url: "https://www.amazon.com", inStock: true }],
  },
  {
    name: "Noctua NF-A8 80mm PWM Fan",
    slug: "noctua-nf-a8-80mm-fan",
    category: "COOLING",
    description: "Premium 80 mm PWM fan: 2200 RPM max, 17.7 dB(A), SSO2 bearing rated for 24/7. Industry standard for silent NAS enclosures.",
    specs: JSON.stringify({ size: "80 mm", maxRPM: 2200, minRPM: 450, noise: "17.7 dB(A)", connector: "4-pin PWM", bearing: "SSO2" }),
    images: "[]",
    compatibility: "[]",
    prices: [{ source: "Amazon", price: 19.99, currency: "USD", url: "https://www.amazon.com/dp/B009NQLT0M", inStock: true }],
  },
];

const NAS_BUILDS = [
  {
    title: "Pi CM4 2-Bay Home NAS",
    slug: "pi-cm4-2bay-home-nas",
    description: "A sleek, low-power 2-bay NAS built on the Raspberry Pi Compute Module 4. Runs OpenMediaVault for Samba, NFS, Docker, and Plex. ~6 W idle — perfect for 24/7 operation.",
    type: "NAS",
    tags: ["nas", "raspberry-pi", "home-server", "openmediavault", "cm4", "2-bay"],
    budget: 350,
    notes: `## Pi CM4 2-Bay Home NAS

Built around the **Raspberry Pi Compute Module 4** (8 GB RAM, 32 GB eMMC) on the official IO board. The PCIe M.2 slot hosts a SATA adapter for two 3.5" drives at full SATA3 speed.

### Software Stack
- **OS**: Raspberry Pi OS Lite (Debian 12)
- **NAS**: OpenMediaVault 6
- **File sharing**: Samba (SMB/CIFS) + NFS
- **Containers**: Docker + Portainer
- **Media**: Plex or Jellyfin

### Features
- RAID 1 mirror across two WD Red Plus 4 TB drives
- Gigabit Ethernet (no Wi-Fi bottleneck)
- ~6–7 W idle power — costs ~$6/yr to run 24/7
- Headless setup via SSH

### Setup Notes
1. Flash CM4 eMMC via rpiboot + Raspberry Pi Imager
2. Enable PCIe Gen 2: add dtparam=pciex1_gen=2 to /boot/config.txt
3. Connect SATA M.2 adapter to IO board
4. Set up RAID 1 with mdadm
5. Install OMV via the official install script
`,
    parts: ["raspberry-pi-cm4-8gb-32gb", "raspberry-pi-cm4-io-board", "wd-red-plus-4tb-nas-hdd", "noctua-nf-a8-80mm-fan"],
    quantities: [1, 1, 2, 1],
  },
  {
    title: "ODROID-HC4 Dual-Bay NAS",
    slug: "odroid-hc4-dual-bay-nas",
    description: "Purpose-built 2-bay NAS on the ODROID-HC4 — dual native SATA3 ports, 4 GB DDR4, built-in OLED status display. Rock-solid RAID 1 with zero USB bottleneck.",
    type: "NAS",
    tags: ["nas", "odroid", "dual-bay", "sata", "armbian", "home-server", "raid1"],
    budget: 470,
    notes: `## ODROID-HC4 Dual-Bay NAS

The **ODROID-HC4** is engineered specifically for NAS use — dual SATA3 ports via PCIe (no USB!), passive SoC cooling, and a built-in OLED status display.

### Software Stack
- **OS**: Armbian (Debian) or Ubuntu 22.04
- **NAS**: OpenMediaVault or plain Samba + mergerfs
- **Optional**: Nextcloud, Home Assistant, Jellyfin via Docker

### RAID 1 Layout
| Drives | Raw | Usable | Fault Tolerance |
|--------|-----|--------|----------------|
| 2× 8 TB | 16 TB | 8 TB | 1 drive |

### Features
- Built-in OLED: IP address, temperatures, disk I/O at a glance
- Near-silent passive SoC cooling
- 2.1 GHz Cortex-A55 handles RAID parity + Plex transcoding
- Standard 12 V DC barrel jack power

### Setup Notes
1. Write Armbian to microSD or eMMC module
2. Install OpenMediaVault or configure mdadm RAID manually
3. Mount drives using HC4's integrated plastic sleds
`,
    parts: ["odroid-hc4", "seagate-ironwolf-8tb-nas-hdd", "noctua-nf-a8-80mm-fan"],
    quantities: [1, 2, 1],
  },
  {
    title: "Silent 6-Bay TrueNAS Scale Build",
    slug: "silent-6bay-x86-truenas",
    description: "A whisper-quiet 6-bay home NAS in the Fractal Node 304. TrueNAS Scale with ZFS RAIDZ2 — 16 TB usable, 2-drive fault tolerance, self-healing checksums, and automatic snapshots.",
    type: "NAS",
    tags: ["nas", "truenas", "zfs", "6-bay", "mini-itx", "home-server", "x86", "silent", "raidz2"],
    budget: 1200,
    notes: `## Silent 6-Bay TrueNAS Scale Build

A serious home NAS in the **Fractal Node 304** Mini-ITX chassis. Pair with a low-power Intel N100 or Celeron J6412 board.

### Software Stack
- **OS**: TrueNAS Scale (Debian-based Linux)
- **Filesystem**: ZFS with RAIDZ2
- **Apps**: Plex, Nextcloud, Jellyfin via TrueNAS SCALE apps
- **SSD**: Samsung 870 QVO as dedicated L2ARC + SLOG cache

### ZFS RAIDZ2 Layout
| Drives | Raw | Usable | Fault Tolerance |
|--------|-----|--------|----------------|
| 6× 4 TB | 24 TB | ~16 TB | **2 drives** |

### Features
- 2× Noctua NF-A8 fans — near-silent 24/7
- ZFS self-healing checksums, snapshots, replication
- Automatic weekly scrubs via TrueNAS UI
- SMB, NFS, iSCSI sharing built in

### Setup Notes
- Pair with Intel N100 Mini-ITX (~6 W idle TDP)
- 4 drives via PCIe SATA card + 2 on motherboard SATA ports
- 16 GB RAM recommended for ZFS ARC (1 GB/TB minimum)
- Add Samsung SSD as SLOG + L2ARC for faster sync writes
- Install TrueNAS to a USB stick (dedicated OS drive, not in the pool)
`,
    parts: ["fractal-node-304-mini-itx", "4port-sata-pcie-asm1064", "wd-red-plus-4tb-nas-hdd", "samsung-870-qvo-2tb-sata-ssd", "noctua-nf-a8-80mm-fan"],
    quantities: [1, 1, 6, 1, 2],
  },
  {
    title: "Pi Zero 2W Pocket NAS",
    slug: "pi-zero-2w-pocket-nas",
    description: "The smallest possible NAS — Pi Zero 2W + USB-C SATA bridge + 2.5\" SSD. Powered by a single USB-C cable. Under 5 W, completely silent. Perfect as a travel server or backup target.",
    type: "NAS",
    tags: ["nas", "raspberry-pi", "pi-zero", "portable", "usb", "minimalist", "ssd", "travel"],
    budget: 130,
    notes: `## Pi Zero 2W Pocket NAS

The **smallest and cheapest NAS possible** — under 5 W, no fans, fits in a pocket.

### Specs
| Item | Value |
|------|-------|
| CPU | Cortex-A53 quad-core 1 GHz |
| RAM | 512 MB |
| Storage | 2 TB Samsung 870 QVO SSD |
| Transfer | ~40 MB/s (USB 2.0 bottleneck) |
| Power | ~4 W via USB-C |
| Total cost | ~$130 |

### Software Stack
- **OS**: Raspberry Pi OS Lite 64-bit
- **File sharing**: Samba
- **Backup**: rsync over SSH
- **Optional**: WireGuard VPN for remote access

### Setup Notes
1. Flash Pi OS Lite with SSH pre-enabled
2. Enable UASP in cmdline.txt for better USB drive throughput
3. Install Samba and configure /etc/samba/smb.conf
4. Auto-mount the SSD via /etc/fstab
5. Add a cron job for nightly rsync backups
`,
    parts: ["raspberry-pi-zero-2-w", "samsung-870-qvo-2tb-sata-ssd", "jmicron-jms580-usbc-sata-bridge"],
    quantities: [1, 1, 1],
  },
];

async function main() {
  console.log("🔧 Seeding NAS parts...\n");

  const partIdMap: Record<string, string> = {};

  // Pre-load existing parts
  const existing = await prisma.part.findMany({ select: { id: true, slug: true } });
  for (const p of existing) partIdMap[p.slug] = p.id;

  for (const part of NAS_PARTS) {
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

  // Re-fetch so we get all slugs including newly created ones
  const allParts = await prisma.part.findMany({ select: { id: true, slug: true } });
  for (const p of allParts) partIdMap[p.slug] = p.id;

  console.log("\n🏗️  Seeding NAS builds...\n");

  const user = await prisma.user.findFirst({ where: { email: "guest@decksmith.local" } });
  if (!user) throw new Error("Guest user not found — run the main seed first");

  for (const build of NAS_BUILDS) {
    const exists = await prisma.build.findUnique({ where: { slug: build.slug } });
    if (exists) {
      console.log(`  ↩  "${build.title}" (already exists)`);
      continue;
    }

    const { parts, quantities, notes, ...buildMeta } = build;
    const created = await prisma.build.create({
      data: { ...buildMeta, tags: JSON.stringify(buildMeta.tags), images: "[]", authorId: user.id },
    });

    for (let i = 0; i < parts.length; i++) {
      const pid = partIdMap[parts[i]];
      if (!pid) { console.warn(`    ⚠️  Unknown slug: ${parts[i]}`); continue; }
      await prisma.buildPart.create({ data: { buildId: created.id, partId: pid, quantity: quantities[i] } });
    }

    console.log(`  ✅ "${created.title}" (${parts.length} parts)`);
  }

  console.log("\n🎉 NAS builds seeded!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
