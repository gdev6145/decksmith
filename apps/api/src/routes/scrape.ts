import { Router } from "express";
import { runAdafruitScraper } from "@decksmith/scraper";

const router: Router = Router();
let scrapeInProgress = false;

router.post("/scrape", async (_req, res) => {
  if (scrapeInProgress) {
    res.status(409).json({ error: "A scrape is already in progress" });
    return;
  }

  scrapeInProgress = true;
  try {
    res.json({ status: "started", source: "adafruit" });
    runAdafruitScraper()
      .then(() => console.log("✅ On-demand scrape complete"))
      .catch((e: unknown) => console.error("On-demand scrape error:", e))
      .finally(() => { scrapeInProgress = false; });
  } catch (error) {
    scrapeInProgress = false;
    console.error("Scrape trigger error:", error);
    res.status(500).json({ error: "Failed to start scrape" });
  }
});

export default router;