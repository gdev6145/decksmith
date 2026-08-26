---
name: decksmith-monorepo-testing
description: >-
  Run verification tasks, TypeScript type checks, lints, and test suites across the Decksmith monorepo.
  Use when verifying build integrity, validating Prisma schema, or running unit tests for hardware studios and calculations.
---

# Decksmith Monorepo Testing & Verification Guide

This skill provides testing and verification workflows across `apps/` and `packages/` in Decksmith.

---

## 1. Monorepo Verification Commands

Execute these verification commands sequentially:

### A. Typecheck Monorepo Packages
```bash
pnpm -r typecheck
```

### B. Lint All Packages
```bash
pnpm -r lint
```

### C. Validate Prisma Schema & Generate Types
```bash
pnpm db:generate
```

---

## 2. Unit Testing Calculators & Business Logic

Hardware calculators in `apps/web/src/utils/` (e.g. Solar calculation, Thermal dissipation, Power Delivery BMS limits) should be tested with Vitest.

### Example Unit Test Pattern (`solarCalc.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { calculateSolarCapacity } from "../utils/solarCalc";

describe("Solar Energy Calculator", () => {
  it("computes required panel wattage for 50W daily load with 5 sun hours", () => {
    const result = calculateSolarCapacity({ dailyLoadWh: 250, sunHours: 5, safetyFactor: 1.2 });
    expect(result.requiredWattage).toBeCloseTo(60);
  });
});
```

---

## 3. Pre-Commit Checklist

Before pushing changes to git:
1. Ensure all `pnpm -r typecheck` errors are resolved.
2. Confirm Prisma seed scripts work (`pnpm db:seed`).
3. Build the web app bundle (`pnpm build`).
