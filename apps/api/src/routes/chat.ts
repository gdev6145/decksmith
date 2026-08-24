import { Router } from "express";
import { streamChat, chat } from "@decksmith/ai";
import { prisma } from "@decksmith/database";
import { getPartRecommendations } from "@decksmith/ai";
import { AI_MODELS } from "@decksmith/shared";
import type { AIProvider, ChatMessage } from "@decksmith/shared";

const router: Router = Router();
const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 8_000;

function validateMessages(messages: ChatMessage[] | undefined): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return "messages array is required";
  if (messages.length > MAX_MESSAGES) return `A maximum of ${MAX_MESSAGES} messages is allowed`;
  if (messages.some((message) => !["system", "user", "assistant"].includes(message.role))) {
    return "Invalid message role";
  }
  if (messages.some((message) => typeof message.content !== "string" || message.content.length > MAX_MESSAGE_LENGTH)) {
    return `Each message must be a string of at most ${MAX_MESSAGE_LENGTH} characters`;
  }
  return null;
}

router.post("/chat", async (req, res) => {
  try {
    const { messages, provider = "openai", model } = req.body as {
      messages: ChatMessage[];
      provider: AIProvider;
      model?: string;
    };

    const validationError = validateMessages(messages);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const response = await chat({
      provider,
      model,
      messages: messages.map((m) => ({
        ...m,
        id: m.id || crypto.randomUUID(),
        timestamp: new Date(m.timestamp),
      })),
    });

    res.json({ content: response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

router.post("/chat/stream", async (req, res) => {
  try {
    const { messages, provider = "openai", model } = req.body as {
      messages: ChatMessage[];
      provider: AIProvider;
      model?: string;
    };

    const validationError = validateMessages(messages);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await streamChat({
      provider,
      model,
      messages: messages.map((m) => ({
        ...m,
        id: m.id || crypto.randomUUID(),
        timestamp: new Date(m.timestamp),
      })),
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
    });

    // Consume the stream
    const reader = stream.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Stream chat error:", error);
    res.status(500).json({ error: "Failed to stream chat" });
  }
});

router.post("/chat/recommend", async (req, res) => {
  try {
    const { query, provider } = req.body as { query: string; provider?: AIProvider };
    if (!query) {
      res.status(400).json({ error: "query is required" });
      return;
    }

    const allParts = await prisma.part.findMany({
      include: { prices: { orderBy: { price: "asc" }, take: 1 } },
    });

    const stopwords = new Set([
      "the", "a", "an", "for", "with", "and", "or", "to", "my", "i", "of", "in", "on",
      "build", "building", "want", "need", "looking", "help", "me", "cyberdeck", "deck",
      "portable", "portable", "setup", "rig", "recommend", "suggest", "best", "good",
    ]);
    const tokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !stopwords.has(t));

    const scored = allParts.map((part) => {
      const haystack = `${part.name} ${part.category} ${part.description ?? ""} ${
        part.specs ? JSON.stringify(part.specs).toLowerCase() : ""
      }`.toLowerCase();
      let score = 0;
      const hits: string[] = [];
      for (const token of tokens) {
        if (haystack.includes(token)) {
          score += 1;
          hits.push(token);
        }
      }
      const bestPrice = part.prices[0];
      let imagesArr: string[] = [];
      try {
        imagesArr = JSON.parse(part.images || "[]");
      } catch {
        imagesArr = [];
      }
      const image = bestPrice?.image ?? imagesArr[0] ?? undefined;
      return {
        partId: part.id,
        name: part.name,
        category: part.category,
        reason: hits.length ? `Matches: ${hits.join(", ")}` : "Recommended part",
        confidence: tokens.length ? hits.length / tokens.length : 0,
        price: bestPrice?.price ?? undefined,
        currency: bestPrice?.currency ?? "USD",
        slug: part.slug,
        image,
        _categoryHits: hits.filter((h) => h === part.category.toLowerCase()).length,
      };
    });

    const matches = scored
      .filter((s) => s.confidence > 0)
      .sort(
        (a, b) =>
          b.confidence - a.confidence ||
          (b._categoryHits ?? 0) - (a._categoryHits ?? 0) ||
          (b.price ?? 0) - (a.price ?? 0)
      )
      .slice(0, 5);

    if (provider && provider !== "ollama") {
      try {
        const llm = await getPartRecommendations(query, scored.map((s) => ({
          id: s.partId,
          name: s.name,
          category: s.category,
          specs: s,
        })), provider);
        if (llm.length) {
          const enriched = llm
            .map((rec: { partId: string }) => scored.find((s) => s.partId === rec.partId))
            .filter(Boolean)
.slice(0, 6);
          if (enriched.length) {
            res.json(enriched);
            return;
          }
        }
      } catch (error) {
        console.error("LLM recommendations failed, using keyword match:", error);
      }
    }

    res.json(matches);
  } catch (error) {
    console.error("Chat recommend error:", error);
    res.status(500).json({ error: "Failed to process recommendations" });
  }
});

router.get("/models", (_req, res) => {
  const models = AI_MODELS.map((m) => {
    if (m.provider === "ollama") {
      const model = process.env.OLLAMA_MODEL || m.model;
      return { ...m, model, displayName: `${model} (Local)` };
    }
    return m;
  });
  res.json(models);
});

export default router;
