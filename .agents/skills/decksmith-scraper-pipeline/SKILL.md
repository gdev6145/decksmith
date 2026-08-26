---
name: decksmith-scraper-pipeline
description: >-
  Develop, maintain, and harden web scrapers in `@decksmith/scraper`.
  Use when adding new hardware vendors (AliExpress, Amazon, Adafruit, Pimoroni, PCBWay),
  updating DOM selectors, parsing price history, or troubleshooting scraper pipeline execution.
---

# Decksmith Scraper Pipeline Guide

This skill details how to build and maintain scrapers inside `packages/scraper/`.

---

## 1. Structure of a Scraper Module

Scrapers should live in `packages/scraper/src/<vendor>.ts`. Each scraper must export an async execution function:

```ts
import type { ScrapingResult, ScrapedPart } from "./types.js";

export async function runVendorScraper(): Promise<ScrapingResult> {
  console.log("🔍 Starting Vendor Scraper...");
  
  const scrapedParts: ScrapedPart[] = [];
  
  try {
    // 1. Fetch search or catalog pages
    // 2. Parse HTML / JSON API payloads
    // 3. Normalize pricing and technical specifications
  } catch (error) {
    console.error("❌ Scraper error:", error);
  }

  return {
    vendor: "VendorName",
    count: scrapedParts.length,
    parts: scrapedParts,
  };
}
```

---

## 2. Scraping Data Normalization Standard

Ensure scraped parts adhere to the standard JSON specs schema:

```ts
export interface ScrapedPart {
  name: string;
  slug: string;
  category: "sbc" | "display" | "battery" | "keyboard" | "chassis" | "antenna" | "accessory";
  description: string;
  price: number;
  currency: string;
  url: string;
  imageUrl?: string;
  specs: {
    dimensions?: string;
    voltage?: string;
    weightGrams?: number;
    connectorType?: string;
  };
}
```

---

## 3. Database Ingestion Pattern

Scrapers persist pricing history directly to Prisma `Price` and `PriceHistory` tables:

```ts
import { prisma } from "@decksmith/database";

await prisma.price.create({
  data: {
    partId: existingPart.id,
    source: "AliExpress",
    price: scrapedPrice,
    currency: "USD",
    url: partUrl,
  },
});

await prisma.priceHistory.create({
  data: {
    partId: existingPart.id,
    source: "AliExpress",
    price: scrapedPrice,
    currency: "USD",
    url: partUrl,
  },
});
```
