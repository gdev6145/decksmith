import { chromium } from "playwright";
import * as cheerio from "cheerio";
import { prisma } from "@decksmith/database";

interface ScrapedProduct {
  name: string;
  price: number;
  currency: string;
  url: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
}

const SEARCH_QUERIES = [
  "raspberry pi 5",
  "raspberry pi 4",
  "orange pi 5",
  "7 inch touchscreen ips",
  "5 inch hdmi lcd",
  "lithium polymer battery 10000mah",
  "ups hat raspberry pi",
  "cyberdeck case",
  "portable monitor usb",
  "mechanical keyboard 60%",
];

export async function scrapeAliExpress(query: string): Promise<ScrapedProduct[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const url = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for dynamic content

    const html = await page.content();
    const $ = cheerio.load(html);
    const products: ScrapedProduct[] = [];

    // AliExpress product cards
    $('[class*="product-card"], [class*="CardWrapper"], [class*="item-card"]').each((_, el) => {
      const $el = $(el);
      const name = $el.find('[class*="title"], [class*="name"], h1').first().text().trim();
      const priceText = $el.find('[class*="price"]').first().text().trim();
      const link = $el.find("a").first().attr("href");
      const image = $el.find("img").first().attr("src");

      if (name && priceText) {
        const priceMatch = priceText.match(/[\d.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

        if (price > 0) {
          products.push({
            name: name.substring(0, 200),
            price,
            currency: "USD",
            url: link ? `https:${link}` : "",
            image,
            inStock: true,
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

export async function saveAliExpressPrices(products: ScrapedProduct[], partId?: string) {
  for (const product of products) {
    // Try to match to existing part by name similarity
    let matchedPartId = partId;

    if (!matchedPartId) {
      const parts = await prisma.part.findMany();
      for (const part of parts) {
        const partName = part.name.toLowerCase();
        const prodName = product.name.toLowerCase();
        if (partName.split(" ").some((word) => word.length > 3 && prodName.includes(word))) {
          matchedPartId = part.id;
          break;
        }
      }
    }

    if (matchedPartId) {
      await prisma.price.create({
        data: {
          partId: matchedPartId,
          source: "ALIEXPRESS",
          price: product.price,
          currency: product.currency,
          url: product.url,
          inStock: product.inStock,
        },
      });
    }
  }
}

export async function runAliExpressScraper() {
  console.log("🔍 Starting AliExpress scraper...");

  for (const query of SEARCH_QUERIES) {
    const products = await scrapeAliExpress(query);
    await saveAliExpressPrices(products);
    await new Promise((r) => setTimeout(r, 2000)); // Rate limit
  }

  console.log("✅ AliExpress scraper complete");
}
