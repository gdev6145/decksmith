---
trigger: always_on
---

# Decksmith Performance & Security Standards

These rules enforce client-side performance, security hardening, and WebGL resource management across Decksmith.

---

## 1. WebGL & Canvas Memory Hygiene

- **Context Disposal**: Always call `.dispose()` on geometries, materials, and textures when unmounting Three.js / Canvas scenes in `apps/web`.
- **Render Loop**: Pause `requestAnimationFrame` loops when the studio tab or canvas is hidden (`document.hidden`).
- **Texture Size**: Cap 3D textures and Gerber rendering canvas layers to `2048x2048` max to ensure fluid 60 FPS performance on embedded hardware and low-end GPUs.

---

## 2. WebSerial & Hardware Communication Security

- **Baud Rate Validation**: Validate user-selected baud rates against supported UART speeds (`9600`, `115200`, `230400`, `921600`).
- **Buffer Overflow Protection**: Implement ring buffers or maximum string queues (e.g. 5,000 lines max) in serial terminal components to prevent browser tab freezing during high-frequency telemetry streaming.
- **Input Sanitization**: Strip ANSI escape control sequences and sanitize device output before rendering to HTML.

---

## 3. Monorepo Security Guidelines

- **API Secrets**: Never hardcode API keys or database connection strings in `apps/web` or `packages/shared`. Always use `process.env` in `apps/api`.
- **CORS**: Ensure Express API routes validate origins and rate limit requests (`120 req/min` max per IP).
