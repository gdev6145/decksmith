---
name: decksmith-ai-tool-calling
description: >-
  Add or modify AI function calling, tool execution, and structured streaming in `@decksmith/ai` and `apps/api`.
  Use when extending the AI chat assistant with capabilities to query Prisma hardware parts, calculate power budgets,
  check component physical compatibility, or generate custom cyberdeck build guides.
---

# Decksmith AI Tool Calling & Structured Output Guide

This skill guides the implementation of schema-enforced AI tools using Vercel AI SDK (`ai`) and Zod within Decksmith.

---

## 1. Defining Tools in `@decksmith/ai`

Tools allow the AI assistant to call TypeScript functions during a chat session.

### Example Tool Definition Pattern

```ts
import { tool } from "ai";
import { z } from "zod";

export const searchPartsTool = tool({
  description: "Search the Decksmith hardware database for parts by category, query, or price limit.",
  parameters: z.object({
    category: z.string().optional().describe("e.g. sbc, display, battery, keyboard, chassis, antenna"),
    query: z.string().optional().describe("Search keyword for part name or specs"),
    maxPrice: z.number().optional().describe("Maximum price in USD"),
  }),
  execute: async ({ category, query, maxPrice }) => {
    // Perform database search or API query
    return {
      results: [
        { id: "part-1", name: "Raspberry Pi 5 8GB", category: "sbc", price: 80.0 },
      ],
    };
  },
});
```

---

## 2. Integrating Tools in `apps/api/src/routes/chat.ts`

When streaming chat responses in `apps/api`:
1. Pass available tools to `streamText({ model, system, messages, tools, maxSteps: 5 })`.
2. `maxSteps: 5` enables multi-step agent execution (where the model calls a tool, receives results, and generates a final synthesis response).

```ts
import { streamText } from "ai";
import { getProvider, getModelId } from "@decksmith/ai";
import { searchPartsTool } from "../tools/partsTool.js";

const result = streamText({
  model: getProvider("gemini")("gemini-2.5-flash"),
  system: SYSTEM_PROMPT,
  messages,
  tools: {
    searchParts: searchPartsTool,
  },
  maxSteps: 5,
});

return result.toDataStreamResponse();
```

---

## 3. Handling Structured Recommendations

For recommendations requiring strict schema output, use `generateObject`:

```ts
import { generateObject } from "ai";
import { z } from "zod";

const BuildRecommendationSchema = z.object({
  buildTitle: z.string(),
  totalCostEstimate: z.number(),
  compatibilityScore: z.number().min(0).max(100),
  parts: z.array(z.object({
    category: z.string(),
    partName: z.string(),
    reason: z.string(),
  })),
});
```
