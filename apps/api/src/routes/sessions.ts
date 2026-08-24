import { Router } from "express";
import { prisma } from "@decksmith/database";
import type { ChatMessage } from "@decksmith/shared";

const router: Router = Router();

const GUEST_EMAIL = "guest@decksmith.local";
const MAX_MESSAGES_PER_SAVE = 40;
const MAX_MESSAGE_LENGTH = 8_000;

async function getGuestUser() {
  return prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: { email: GUEST_EMAIL, name: "Guest" },
  });
}

async function getGuestSession(sessionId: string) {
  const user = await getGuestUser();
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId: user.id },
    select: { id: true, title: true },
  });
  return session;
}

router.get("/sessions", async (_req, res) => {
  try {
    const user = await getGuestUser();
    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });
    res.json(sessions);
  } catch (error) {
    console.error("Sessions error:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const { title } = req.body as { title?: string };
    const user = await getGuestUser();
    const session = await prisma.chatSession.create({
      data: { title: title || "New Chat", userId: user.id },
    });
    res.status(201).json(session);
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

router.get("/sessions/:id", async (req, res) => {
  try {
    const session = await getGuestSession(req.params.id);
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: req.params.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    console.error("Session messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/sessions/:id/messages", async (req, res) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES_PER_SAVE) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }
    if (messages.some((message) =>
      !["system", "user", "assistant"].includes(message.role) ||
      typeof message.content !== "string" ||
      message.content.length > MAX_MESSAGE_LENGTH
    )) {
      res.status(400).json({ error: "Invalid message format" });
      return;
    }

    const session = await getGuestSession(req.params.id);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const firstUserMessage = messages.find((m) => m.role === "user");
    const newTitle =
      session.title === "New Chat" && firstUserMessage
        ? firstUserMessage.content.slice(0, 60)
        : session.title;

    await prisma.$transaction([
      ...messages.map((m) =>
        prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: m.role,
            content: m.content,
            metadata: m.metadata ? JSON.stringify(m.metadata) : null,
            createdAt: new Date(m.timestamp || Date.now()),
          },
        })
      ),
      prisma.chatSession.update({
        where: { id: session.id },
        data: { title: newTitle },
      }),
    ]);

    res.json({ ok: true, title: newTitle });
  } catch (error) {
    console.error("Save messages error:", error);
    res.status(500).json({ error: "Failed to save messages" });
  }
});

router.delete("/sessions/:id", async (req, res) => {
  try {
    const session = await getGuestSession(req.params.id);
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    await prisma.chatSession.delete({ where: { id: session.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;