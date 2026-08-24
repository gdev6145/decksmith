import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding custom router builds...");

  let author = await prisma.user.findFirst();
  if (!author) {
    author = await prisma.user.create({
      data: {
        email: "router-master@decksmith.local",
        name: "Gateway Architect",
      },
    });
  }

  const routerBuilds = [
    {
      title: "Apex 10G SFP+ Dual-WAN OpenWrt Gateway",
      slug: "apex-10g-openwrt-gateway",
      description: "Enterprise-grade 10-Gigabit fiber router powered by MediaTek MT7988A with Wi-Fi 7 BE19000 tri-band and hardware NAT offloading.",
      type: "Router",
      tags: ["openwrt", "10gbe", "sfp+", "wifi7", "router", "networking"],
      upvotes: 68,
      views: 520,
    },
    {
      title: "NanoPi R6S 2.5GbE Edge Firewall Fortress",
      slug: "nanopi-r6s-edge-firewall",
      description: "Dual 2.5GbE fanless edge security gateway with WireGuard crypto acceleration, Cake SQM bufferbloat mitigation, and isolated IoT VLANs.",
      type: "Router",
      tags: ["rk3588", "2.5gbe", "firewall", "wireguard", "openwrt", "security"],
      upvotes: 54,
      views: 410,
    },
    {
      title: "Intel N100 Quad-Port OPNsense IDS/IPS Box",
      slug: "intel-n100-opnsense-firewall",
      description: "Silent fanless 4x i226-V 2.5GbE security appliance running OPNsense with Suricata intrusion detection and ZFS mirrored root.",
      type: "Router",
      tags: ["opnsense", "pfsense", "n100", "suricata", "ids", "homelab"],
      upvotes: 91,
      views: 780,
    },
    {
      title: "Tactical Beryl AX Pocket Travel Cyber-Router",
      slug: "tactical-beryl-ax-travel-router",
      description: "Pocket-sized travel cyberdeck router with captive portal bypass, physical VPN killswitch, and dual 18650 emergency power sled.",
      type: "Router",
      tags: ["travel", "portable", "vpn", "tor", "glinet", "wifi6"],
      upvotes: 42,
      views: 315,
    },
  ];

  for (const b of routerBuilds) {
    const existing = await prisma.build.findUnique({ where: { slug: b.slug } });
    if (!existing) {
      await prisma.build.create({
        data: {
          title: b.title,
          slug: b.slug,
          description: b.description,
          type: b.type,
          tags: JSON.stringify(b.tags),
          upvotes: b.upvotes,
          views: b.views,
          authorId: author.id,
        },
      });
      console.log(`+ Created build: ${b.title}`);
    } else {
      console.log(`= Existing build: ${b.title}`);
    }
  }

  console.log("Router builds seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
