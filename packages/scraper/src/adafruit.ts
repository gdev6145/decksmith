import { chromium } from "playwright";
import * as cheerio from "cheerio";
import { prisma } from "@decksmith/database";

interface ScrapedProduct {
  name: string;
  price: number;
  currency: string;
  url: string;
  image?: string;
  inStock: boolean;
}

const SEARCH_QUERIES = [
  "raspberry pi 5",
  "raspberry pi 4",
  "raspberry pi zero",
  "orange pi",
  "touchscreen display",
  "hdmi lcd",
  "lithium polymer battery",
  "lipo battery",
  "ups hat raspberry pi",
  "cyberdeck case",
  "portable monitor",
  "mechanical keyboard",
  "nvme ssd",
  "usb wifi adapter",
];

export async function scrapeAdafruit(query: string): Promise<ScrapedProduct[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const url = `https://www.adafruit.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const $ = cheerio.load(html);
    const products: ScrapedProduct[] = [];

    $("ul.productListing > li").each((_, el) => {
      const $el = $(el);
      const link = $el.find("h2 a").first();
      const href = link.attr("href");
      if (!href) return;

      const name = link.text().trim();
      const priceMeta = $el.find('meta[itemprop="price"]').first().attr("content");
      const imageSrc = $el.find(".imgContainer img").first().attr("src");
      const stockText = $el.find(".stock").text().trim().toLowerCase();

      let image: string | undefined;
      if (imageSrc) {
        image = imageSrc.startsWith("//")
          ? `https:${imageSrc}`
          : imageSrc.startsWith("http")
            ? imageSrc
            : `https://www.adafruit.com${imageSrc}`;
      }

      if (name && priceMeta) {
        const price = parseFloat(priceMeta);

        if (price > 0) {
          products.push({
            name: name.substring(0, 200),
            price,
            currency: "USD",
            url: href.startsWith("http") ? href : `https://www.adafruit.com${href}`,
            image,
            inStock: stockText.includes("in stock"),
          });
        }
      }
    });

    console.log(`  Found ${products.length} products for "${query}"`);
    return products;
  } catch (error) {
    console.error(`  Error scraping "${query}":`, error);
    return [];
  } finally {
    await browser.close();
  }
}

const ACCESSORY_KEYWORDS = [
  "heatsink",
  "heat sink",
  "cooler",
  "cooling",
  "fan",
  "case",
  "enclosure",
  "cable",
  "adapter",
  "power supply",
  "psu",
  "charger",
  "mount",
  "stand",
  "bracket",
  "cover",
  "holder",
  "protector",
  "breakout",
  "ribbon",
  "jumper",
  "wire",
  "kit",
  "bundle",
  "accessory",
  "battery",
  "hat",
  "pico",
  "camera",
  "hub",
  "nvme",
  "ssd",
  "m.2",
  "base",
  "rtc",
  "module",
  "shield",
  "pcie",
  "expansion",
  "proto",
  "display",
  "screen",
  "monitor",
  "hdmi",
];

function tokenize(text: string): string[] {
  const STOPWORDS = new Set(["for", "with", "and", "the", "of", "to", "a", "an", "in", "on"]);
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

const CATEGORY_CORE: Record<string, string[]> = {
  DISPLAY: ["display", "screen", "touchscreen", "monitor", "lcd", "hdmi"],
  BATTERY: ["battery", "lipo", "power", "charger", "pack"],
  POWER: ["power", "charger", "battery", "lipo"],
  STORAGE: ["ssd", "nvme", "storage", "drive"],
  NETWORK: ["wifi", "adapter", "ethernet", "network"],
  INPUT: ["keyboard", "key", "switch"],
  AUDIO: ["audio", "speaker", "mic"],
};

function isAccessory(prodName: string, partName: string, category: string): boolean {
  const core = CATEGORY_CORE[category] ?? [];
  return ACCESSORY_KEYWORDS.some(
    (kw) => prodName.includes(kw) && !partName.includes(kw) && !core.includes(kw)
  );
}

interface Match {
  partId: string;
  score: number;
  prodLength: number;
  strong: boolean;
}

export async function saveAdafruitPrices(products: ScrapedProduct[], partId?: string) {
  for (const product of products) {
    let matchedPartId = partId;

    if (!matchedPartId) {
      const parts = await prisma.part.findMany();
      const prodName = product.name.toLowerCase();
      const prodTokens = tokenize(prodName);

      let bestStrong: Match | undefined;
      let bestFuzzy: Match | undefined;

      for (const part of parts) {
        const partName = part.name.toLowerCase();
        if (isAccessory(prodName, partName, part.category)) continue;

        const partTokens = tokenize(partName);

        let strong = false;
        {
          let pi = 0;
          for (const token of prodTokens) {
            if (token === partTokens[pi]) pi++;
          }
          strong = pi === partTokens.length;
        }

        const score = partTokens.reduce(
          (acc, token) => (prodTokens.includes(token) ? acc + 1 : acc),
          0
        );

        const match: Match = {
          partId: part.id,
          score,
          prodLength: prodTokens.length,
          strong,
        };

        const beatsStrong =
          strong &&
          (!bestStrong ||
            match.score > bestStrong.score ||
            (match.score === bestStrong.score && match.prodLength < bestStrong.prodLength));
        if (beatsStrong) bestStrong = match;

        const threshold = Math.max(2, Math.ceil(partTokens.length * 0.6));
        const beatsFuzzy =
          score >= threshold &&
          (!bestFuzzy ||
            match.score > bestFuzzy.score ||
            (match.score === bestFuzzy.score && match.prodLength < bestFuzzy.prodLength));
        if (beatsFuzzy) bestFuzzy = match;
      }

      if (bestStrong) matchedPartId = bestStrong.partId;
      else if (bestFuzzy) matchedPartId = bestFuzzy.partId;
    }

    if (matchedPartId) {
      const existing = await prisma.price.findFirst({
        where: { partId: matchedPartId, url: product.url },
      });
      if (existing) continue;

      await prisma.price.create({
        data: {
          partId: matchedPartId,
          source: "Adafruit",
          price: product.price,
          currency: product.currency,
          url: product.url,
          image: product.image,
          inStock: product.inStock,
        },
      });

      await prisma.priceHistory.create({
        data: {
          partId: matchedPartId,
          source: "Adafruit",
          price: product.price,
          currency: product.currency,
          url: product.url,
        },
      });
    }
  }
}

export async function runAdafruitScraper() {
  console.log("🔍 Starting Adafruit scraper...");

  await prisma.price.deleteMany({ where: { source: "Adafruit" } });
  console.log("  Cleared existing Adafruit prices");

  for (const query of SEARCH_QUERIES) {
    const products = await scrapeAdafruit(query);
    await saveAdafruitPrices(products);
    await new Promise((r) => setTimeout(r, 1500));
  }

  await updatePartImages();
  console.log("✅ Adafruit scraper complete");
}

export async function updatePartImages() {
  const parts = await prisma.part.findMany({
    include: { prices: { orderBy: { price: "asc" } } },
  });

  for (const part of parts) {
    const images = part.prices
      .map((price) => price.image)
      .filter((image): image is string => Boolean(image))
      .filter((image, index, all) => all.indexOf(image) === index);

    if (images.length === 0) continue;

    await prisma.part.update({
      where: { id: part.id },
      data: { images: JSON.stringify(images.slice(0, 5)) },
    });
    console.log(`  🖼  ${part.name}: ${images.length} image(s)`);
  }
}