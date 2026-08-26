import { Router } from "express";
import { prisma } from "@decksmith/database";
import { verifyToken } from "../lib/authCrypto.js";
import { checkAllPriceWatches } from "../services/priceChecker.js";

const router: Router = Router();

const GUEST_EMAIL = "guest@decksmith.local";

async function getAuthUser(req: any) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (payload?.userId) {
      const u = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (u) return u;
    }
  }
  return prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: { email: GUEST_EMAIL, name: "Guest" },
  });
}

// GET /api/alerts - List all price watched parts for user
router.get("/", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    const alerts = await prisma.alert.findMany({
      where: { userId: user.id },
      include: {
        part: {
          include: {
            prices: true,
            priceHistory: {
              orderBy: { scrapedAt: "desc" },
              take: 10,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = alerts.map((a) => {
      const currentPrice = a.part.prices[0]?.price || a.lastPrice || 0;
      const initial = a.initialPrice || currentPrice;
      const delta = currentPrice - initial;
      const deltaPercent = initial > 0 ? Math.round((delta / initial) * 1000) / 10 : 0;

      return {
        id: a.id,
        partId: a.partId,
        partName: a.part.name,
        partSlug: a.part.slug,
        partCategory: a.part.category,
        vendor: a.part.prices[0]?.source || "Default Vendor",
        initialPrice: initial,
        currentPrice,
        minPriceTarget: a.minPrice,
        deltaAmount: delta,
        deltaPercent,
        alertOnDrop: a.alertOnDrop,
        alertOnIncrease: a.alertOnIncrease,
        active: a.active,
        lastCheckedAt: a.lastCheckedAt,
        history: a.part.priceHistory,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Fetch alerts error:", error);
    res.status(500).json({ error: "Failed to fetch price alerts" });
  }
});

// POST /api/alerts/watch - Watch or toggle watch on a part
router.post("/watch", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    const { partId, minPrice, alertOnDrop = true, alertOnIncrease = false } = req.body;

    if (!partId) {
      return res.status(400).json({ error: "partId is required" });
    }

    const part = await prisma.part.findUnique({
      where: { id: partId },
      include: { prices: true },
    });

    if (!part) {
      return res.status(404).json({ error: "Part not found" });
    }

    const currentPrice = part.prices[0]?.price || 50.0;

    // Check if already watching
    let existing = await prisma.alert.findFirst({
      where: { userId: user.id, partId },
    });

    if (existing) {
      // Toggle or update
      existing = await prisma.alert.update({
        where: { id: existing.id },
        data: {
          minPrice: minPrice !== undefined ? Number(minPrice) : existing.minPrice,
          alertOnDrop,
          alertOnIncrease,
          active: true,
          lastCheckedAt: new Date(),
        },
      });
      return res.json({ watched: true, alert: existing });
    }

    const newAlert = await prisma.alert.create({
      data: {
        userId: user.id,
        partId,
        initialPrice: currentPrice,
        lastPrice: currentPrice,
        minPrice: minPrice ? Number(minPrice) : null,
        alertOnDrop,
        alertOnIncrease,
        active: true,
      },
    });

    res.json({ watched: true, alert: newAlert });
  } catch (error) {
    console.error("Watch part error:", error);
    res.status(500).json({ error: "Failed to watch part" });
  }
});

// DELETE /api/alerts/:id - Unwatch part
router.delete("/:id", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    await prisma.alert.deleteMany({
      where: { id: req.params.id, userId: user.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete alert error:", error);
    res.status(500).json({ error: "Failed to delete alert" });
  }
});

// POST /api/alerts/check-now - Force live price check across all watched items
router.post("/check-now", async (_req, res) => {
  try {
    const results = await checkAllPriceWatches();
    res.json({
      success: true,
      checkedCount: results.length,
      alertsTriggered: results.filter((r) => r.notificationCreated).length,
      results,
    });
  } catch (error) {
    console.error("Live price check error:", error);
    res.status(500).json({ error: "Failed to run price checks" });
  }
});

export default router;
