import { runAliExpressScraper } from "./aliexpress.js";
import { runAmazonScraper } from "./amazon.js";
import { runAdafruitScraper } from "./adafruit.js";
import { pathToFileURL } from "node:url";

export { runAliExpressScraper, runAmazonScraper, runAdafruitScraper };

async function main() {
  console.log("🚀 Decksmith Scraper Starting...\n");

  const source = process.argv[2];

  if (source === "ali") {
    await runAliExpressScraper();
  } else if (source === "amazon") {
    await runAmazonScraper();
  } else if (source === "adafruit") {
    await runAdafruitScraper();
  } else {
    await runAdafruitScraper();
    await runAliExpressScraper();
    await runAmazonScraper();
  }

  console.log("\n🎉 Scraping complete!");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch(console.error);
}
