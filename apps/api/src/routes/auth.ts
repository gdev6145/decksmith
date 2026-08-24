import { Router } from "express";
import { prisma } from "@decksmith/database";

const router: Router = Router();

const PRESET_BUILDERS = [
  {
    email: "echo.zero@decksmith.local",
    name: "Echo_Zero",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Echo_Zero",
    role: "Field Recon Specialist",
    bio: "Pelican 1150 SDR cyberdeck builder with a focus on long-range LoRa mesh telemetry.",
  },
  {
    email: "neohacker99@decksmith.local",
    name: "NeoHacker99",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NeoHacker99",
    role: "Firmware & Kernel Architect",
    bio: "RISC-V enthusiast running Debian on custom Milk-V Mars and VisionFive 2 boards.",
  },
  {
    email: "byteforge@decksmith.local",
    name: "ByteForge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ByteForge",
    role: "3D CAD & Mechanical Engineer",
    bio: "Designer of custom parametric OpenSCAD cyberdeck wedges and split ortholinear keyboards.",
  },
  {
    email: "cyber.valkyrie@decksmith.local",
    name: "CyberValkyrie",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberValkyrie",
    role: "Solar & Off-Grid Specialist",
    bio: "Crafting sub-zero arctic LiFePO4 disaster recovery decks with MPPT harvesting.",
  },
];

// Helper to find or seed preset user
async function ensurePresetUser(builder: typeof PRESET_BUILDERS[0]) {
  let user = await prisma.user.findUnique({ where: { email: builder.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: builder.email,
        name: builder.name,
        avatar: builder.avatar,
      },
    });
  }
  return user;
}

// GET /api/auth/builders - List available demo builder profiles
router.get("/auth/builders", async (_req, res) => {
  try {
    const list = await Promise.all(
      PRESET_BUILDERS.map(async (b) => {
        const u = await ensurePresetUser(b);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          role: b.role,
          bio: b.bio,
        };
      })
    );
    res.json(list);
  } catch (error) {
    console.error("Fetch builders error:", error);
    res.status(500).json({ error: "Failed to fetch builders" });
  }
});

// POST /api/auth/login - Log in with email or callsign
router.post("/auth/login", async (req, res) => {
  try {
    const { email, name, password } = req.body as { email?: string; name?: string; password?: string };

    const targetEmail = (email || (name ? `${name.toLowerCase().replace(/\s+/g, "")}@decksmith.local` : "") || "guest@decksmith.local").trim();
    const displayName = (name || email?.split("@")[0] || "Guest Builder").trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          { name: displayName },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name: displayName,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
        },
      });
    }

    const token = `ds_token_${user.id}_${Date.now()}`;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// POST /api/auth/register - Create a new cyberdeck builder account
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, role, avatar } = req.body as { name?: string; email?: string; role?: string; avatar?: string };

    if (!name && !email) {
      res.status(400).json({ error: "Callsign name or email is required" });
      return;
    }

    const displayName = (name || email?.split("@")[0] || "Cyber Builder").trim();
    const targetEmail = (email || `${displayName.toLowerCase().replace(/\s+/g, "")}@decksmith.local`).trim();

    let user = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name: displayName,
          avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
        },
      });
    }

    const token = `ds_token_${user.id}_${Date.now()}`;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register account" });
  }
});

// GET /api/auth/me - Validate current session token
router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Return guest user
      const guest = await prisma.user.findFirst({ where: { email: "guest@decksmith.local" } }) ||
        await prisma.user.create({ data: { email: "guest@decksmith.local", name: "Guest" } });
      res.json({ user: guest, token: `ds_token_${guest.id}` });
      return;
    }

    const token = authHeader.split(" ")[1];
    // Token format: ds_token_<userId>_<timestamp>
    const parts = token.split("_");
    const userId = parts[2];

    if (!userId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user, token });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(500).json({ error: "Failed to verify session" });
  }
});

// POST /api/auth/logout - End session
router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
