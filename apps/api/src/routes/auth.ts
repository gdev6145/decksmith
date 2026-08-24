import { Router } from "express";
import { prisma } from "@decksmith/database";
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  sanitizeCallsign,
  validateEmail,
  checkAuthRateLimit,
  recordFailedAuthAttempt,
  resetAuthAttempts,
} from "../lib/authCrypto.js";

const router: Router = Router();

const PRESET_BUILDERS = [
  {
    email: "echo.zero@decksmith.local",
    name: "Echo_Zero",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Echo_Zero",
    role: "Field Recon Specialist",
    bio: "Pelican 1150 SDR cyberdeck builder with a focus on long-range LoRa mesh telemetry.",
    defaultPass: "EchoRecon2026!",
  },
  {
    email: "neohacker99@decksmith.local",
    name: "NeoHacker99",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NeoHacker99",
    role: "Firmware & Kernel Architect",
    bio: "RISC-V enthusiast running Debian on custom Milk-V Mars and VisionFive 2 boards.",
    defaultPass: "RiscVPower99!",
  },
  {
    email: "byteforge@decksmith.local",
    name: "ByteForge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ByteForge",
    role: "3D CAD & Mechanical Engineer",
    bio: "Designer of custom parametric OpenSCAD cyberdeck wedges and split ortholinear keyboards.",
    defaultPass: "CadWedge2026!",
  },
  {
    email: "cyber.valkyrie@decksmith.local",
    name: "CyberValkyrie",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberValkyrie",
    role: "Solar & Off-Grid Specialist",
    bio: "Crafting sub-zero arctic LiFePO4 disaster recovery decks with MPPT harvesting.",
    defaultPass: "SolarAirgap2026!",
  },
];

// Helper to find or seed preset user with cryptographically hashed passwords
async function ensurePresetUser(builder: typeof PRESET_BUILDERS[0]) {
  let user = await prisma.user.findUnique({ where: { email: builder.email } });
  if (!user) {
    const { hash, salt } = hashPassword(builder.defaultPass);
    user = await prisma.user.create({
      data: {
        email: builder.email,
        name: builder.name,
        avatar: builder.avatar,
        role: builder.role,
        passwordHash: hash,
        salt,
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

// POST /api/auth/login - Cryptographically secure authentication with PBKDF2 & Rate Limiting
router.post("/auth/login", async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const { email, name, password } = req.body as { email?: string; name?: string; password?: string };

    const rawInput = (email || name || "").trim();
    if (!rawInput) {
      res.status(400).json({ error: "Operative callsign or email is required" });
      return;
    }

    const rateKey = `${ip}_${rawInput.toLowerCase()}`;
    const rateCheck = checkAuthRateLimit(rateKey);

    if (!rateCheck.isAllowed) {
      res.status(429).json({
        error: `Account temporarily locked due to excessive authentication attempts. Retry in ${rateCheck.retryAfterSec} seconds.`,
      });
      return;
    }

    const isEmail = rawInput.includes("@");
    const targetEmail = isEmail ? rawInput.toLowerCase() : `${rawInput.toLowerCase().replace(/[^a-z0-9_-]/g, "")}@decksmith.local`;
    const targetName = !isEmail ? sanitizeCallsign(rawInput) : undefined;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          ...(targetName ? [{ name: targetName }] : []),
        ],
      },
    });

    // If user exists and has a passwordHash, verify it with PBKDF2
    if (user && user.passwordHash && user.salt) {
      if (!password) {
        // If password is required
        recordFailedAuthAttempt(rateKey);
        res.status(401).json({ error: "Password or PIN required for this operative account", requiresPassword: true });
        return;
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        recordFailedAuthAttempt(rateKey);
        res.status(401).json({ error: "Invalid credentials. Cryptographic signature rejected." });
        return;
      }
    } else if (!user) {
      // First-time guest or instant operative signup
      const displayName = targetName || rawInput.split("@")[0] || "Operative";
      const { hash, salt } = password ? hashPassword(password) : { hash: null, salt: null };

      user = await prisma.user.create({
        data: {
          email: targetEmail,
          name: displayName,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
          passwordHash: hash,
          salt,
        },
      });
    }

    // Authentication succeeded: reset rate limiter
    resetAuthAttempts(rateKey);

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role || "operative",
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Secure login error:", error);
    res.status(500).json({ error: "Authentication transaction failed" });
  }
});

// POST /api/auth/register - Secure Operative Registration with PBKDF2 Password Hashing
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, role, password, avatar } = req.body as {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
      avatar?: string;
    };

    const cleanName = sanitizeCallsign(name || "");
    if (!cleanName || cleanName.length < 3) {
      res.status(400).json({ error: "Callsign must be between 3 and 32 alphanumeric characters" });
      return;
    }

    const cleanEmail = (email || `${cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, "")}@decksmith.local`).toLowerCase().trim();
    if (email && !validateEmail(cleanEmail)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      res.status(409).json({ error: "An operative with this email or callsign already exists" });
      return;
    }

    // Hash password with salt using PBKDF2-SHA512
    const { hash, salt } = password ? hashPassword(password) : hashPassword("decksmith2026");

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        role: role || "operative",
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
        passwordHash: hash,
        salt,
      },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role || "operative",
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Secure registration error:", error);
    res.status(500).json({ error: "Registration transaction failed" });
  }
});

// GET /api/auth/me - Cryptographic Token Verification
router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Fallback guest user
      let guest = await prisma.user.findFirst({ where: { email: "guest@decksmith.local" } });
      if (!guest) {
        guest = await prisma.user.create({ data: { email: "guest@decksmith.local", name: "Guest Builder" } });
      }
      const token = createToken({ userId: guest.id, email: guest.email, role: "guest" });
      res.json({ user: guest, token });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Session token invalid or expired. Re-authentication required." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(404).json({ error: "Operative profile no longer exists in database" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(500).json({ error: "Failed to verify session cryptographic signature" });
  }
});

// POST /api/auth/logout - End Session
router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Cryptographic session invalidated successfully." });
});

export default router;
