---
name: decksmith-community-collaboration-api
description: >-
  Develop or enhance community features, user builds, version forks, Q&A, price drop alerts, and activity notifications in `apps/api`.
  Use when modifying Express routes in `apps/api/src/routes/` for builds, alerts, user profiles, or notification feeds.
---

# Decksmith Community & Collaboration API Guide

This skill provides patterns for building community API endpoints in `apps/api/src/routes/`.

---

## 1. Build Version Forking Endpoint

Allows users to fork an existing cyberdeck build and track changes (`BuildVersion`):

```ts
import { Router } from "express";
import { prisma } from "@decksmith/database";

const router = Router();

router.post("/builds/:id/fork", async (req, res) => {
  const originalBuildId = req.params.id;
  const userId = req.body.userId; // Authenticated user ID

  const original = await prisma.build.findUnique({
    where: { id: originalBuildId },
    include: { parts: true },
  });

  if (!original) return res.status(404).json({ error: "Build not found" });

  const forkedBuild = await prisma.build.create({
    data: {
      title: `${original.title} (Fork)`,
      slug: `${original.slug}-fork-${Date.now()}`,
      type: original.type,
      description: `Forked from ${original.title}`,
      authorId: userId,
      parts: {
        create: original.parts.map((p) => ({
          partId: p.partId,
          quantity: p.quantity,
          role: p.role,
        })),
      },
    },
  });

  res.json(forkedBuild);
});
```

---

## 2. Price Drop Alert Checker Service (`apps/api/src/services/priceChecker.ts`)

Scans user `Alert` entries and triggers notifications when scraped prices drop below `minPrice`:

```ts
export async function checkPriceAlerts() {
  const activeAlerts = await prisma.alert.findMany({
    where: { active: true },
    include: { part: { include: { prices: true } } },
  });

  for (const alert of activeAlerts) {
    const latestPrice = alert.part.prices[0]?.price;
    if (latestPrice && alert.minPrice && latestPrice <= alert.minPrice) {
      await prisma.notification.create({
        data: {
          userId: alert.userId,
          type: "price_drop",
          title: `Price Drop Alert: ${alert.part.name}`,
          message: `${alert.part.name} is now $${latestPrice} (Target: $${alert.minPrice})`,
          url: `/parts/${alert.part.slug}`,
        },
      });
    }
  }
}
```
