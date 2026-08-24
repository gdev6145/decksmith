import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing all images from parts database...");
  const result = await prisma.part.updateMany({
    data: {
      images: "[]",
    },
  });
  console.log(`✅ Cleared images from all ${result.count} parts in database.`);

  const pubDir = path.resolve(__dirname, "../../../apps/web/public/parts");
  const distDir = path.resolve(__dirname, "../../../apps/web/dist/parts");

  if (fs.existsSync(pubDir)) {
    fs.rmSync(pubDir, { recursive: true, force: true });
    console.log("🗑️  Deleted apps/web/public/parts directory.");
  }
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log("🗑️  Deleted apps/web/dist/parts directory.");
  }
}

main().finally(() => prisma.$disconnect());
