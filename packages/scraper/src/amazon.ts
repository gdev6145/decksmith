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
  "raspberry pi 5 8gb",
  "raspberry pi 4 4gb",
  "7 inch touchscreen raspberry pi",
  "5 inch hdmi lcd display",
  "lithium polymer battery pack 10000mah",
  "ups hat raspberry pi",
  "portable monitor usb c",
  "60 percent mechanical keyboard",
  "nvme ssd 256gb",
  "wifi adapter usb",
];

export async function scrapeAmazon(query: string): Promise<ScrapedProduct[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);

    const html = await page.content();
    const $ = cheerio.load(html);
    const products: ScrapedProduct[] = [];

    // Amazon product cards
    $('[data-component-type="s-search-result"]').each((_, el) => {
      const $el = $(el);
      const name = $el.find("h2 a span, h2 span").first().text().trim();
      const priceWhole = $el.find(".a-price-whole").first().text().trim();
      const priceFraction = $el.find(".a-price-fraction").first().text().trim();
      const link = $el.find("h2 a").first().attr("href");
      const image = $el.find("img").first().attr("src");
      const ratingText = $el.find(".a-icon-alt").first().text();
      const reviewText = $el.find('[aria-label*="stars"] + span, .a-size-base.s-underline-text').first().text();

      if (name && priceWhole) {
        const price = parseFloat(`${priceWhole.replace(",", "")}${priceFraction ? "." + priceFraction : ""}`);

        if (price > 0) {
          const ratingMatch = ratingText.match(/([\d.]+)\s*out/);
          const reviewMatch = reviewText?.replace(/[,]/g, "").match(/(\d+)/);

          products.push({
            name: name.substring(0, 200),
            price,
            currency: "USD",
            url: link ? `https://www.amazon.com${link}` : "",
            image,
            rating: ratingMatch ? parseFloat(ratingMatch[1]) : undefined,
            reviewCount: reviewMatch ? parseInt(reviewMatch[1]) : undefined,
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

export async function saveAmazonPrices(products: ScrapedProduct[], partId?: string) {
  for (const product of products) {
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
          source: "AMAZON",
          price: product.price,
          currency: product.currency,
          url: product.url,
          inStock: product.inStock,
        },
      });
    }
  }
}

export async function runAmazonScraper() {
  console.log("🔍 Starting Amazon scraper...");

  for (const query of SEARCH_QUERIES) {
    const products = await scrapeAmazon(query);
    await saveAmazonPrices(products);
    await new Promise((r) => setTimeout(r, 2000)); // Rate limit
  }

  console.log("✅ Amazon scraper complete");
}
