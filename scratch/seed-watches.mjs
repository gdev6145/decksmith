import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: "guest@decksmith.local" } });
  if (!user) return;

  const parts = await prisma.part.findMany({ take: 5 });
  for (const p of parts) {
    const existing = await prisma.alert.findFirst({ where: { userId: user.id, partId: p.id } });
    if (!existing) {
      await prisma.alert.create({
        data: {
          userId: user.id,
          partId: p.id,
          initialPrice: 85.0,
          lastPrice: 85.0,
          alertOnDrop: true,
          alertOnIncrease: true,
          active: true,
        },
      });
    }
  }
  console.log(`✓ Seeded price watches for ${parts.length} parts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
