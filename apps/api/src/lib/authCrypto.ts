import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "decksmith-cyberdeck-hyper-secure-secret-key-2026-sha512-salt";
const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

/**
 * Generates a cryptographically secure salt and hashes the password using PBKDF2-SHA512
 */
export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return { hash, salt };
}

/**
 * Verifies password against stored hash using timing-safe comparison to prevent timing attacks
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash || !salt) return false;
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
    const storedBuf = Buffer.from(storedHash, "hex");
    const computedBuf = Buffer.from(computedHash, "hex");

    if (storedBuf.length !== computedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(storedBuf, computedBuf);
  } catch {
    return false;
  }
}

/**
 * Creates an HMAC-SHA256 cryptographically signed session token (7-day validity)
 */
export function createToken(payload: { userId: string; email: string; role?: string }, expiresInMs = 7 * 24 * 60 * 60 * 1000): string {
  const now = Date.now();
  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInMs,
  };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Verifies HMAC-SHA256 signature and validates expiration
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;

  try {
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp < Date.now()) {
      return null; // Expired token
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sanitize Operative Callsigns to prevent XSS & Injection attacks
 */
export function sanitizeCallsign(name: string): string {
  if (!name) return "";
  const cleaned = name.replace(/<[^>]*>?/gm, "").replace(/[^a-zA-Z0-9_\-\s]/g, "").trim();
  return cleaned.slice(0, 32);
}

/**
 * Validate RFC 5322 compliant email format
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
}

interface AttemptRecord {
  attempts: number;
  lockedUntil: number;
}
const authAttempts = new Map<string, AttemptRecord>();

export function checkAuthRateLimit(key: string, maxAttempts = 6, lockTimeMs = 15 * 60 * 1000): { isAllowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = authAttempts.get(key);

  if (!record) {
    return { isAllowed: true, remainingAttempts: maxAttempts };
  }

  if (record.lockedUntil > now) {
    return {
      isAllowed: false,
      remainingAttempts: 0,
      retryAfterSec: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  if (record.lockedUntil <= now && record.attempts >= maxAttempts) {
    authAttempts.delete(key);
    return { isAllowed: true, remainingAttempts: maxAttempts };
  }

  return { isAllowed: true, remainingAttempts: maxAttempts - record.attempts };
}

export function recordFailedAuthAttempt(key: string, maxAttempts = 6, lockTimeMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = authAttempts.get(key) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockTimeMs;
  }

  authAttempts.set(key, record);
}

export function resetAuthAttempts(key: string) {
  authAttempts.delete(key);
}
