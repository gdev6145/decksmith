---
trigger: always_on
---

# Decksmith Code & Architecture Standards

These rules enforce development guidelines, architectural patterns, and code quality standards across all apps and packages in the **Decksmith** repository.

---

## 1. Monorepo & Package Boundaries

- **`apps/web`**: React 19 + Vite frontend. Should consume `@decksmith/shared`, `@decksmith/ai`, and `@decksmith/database`.
- **`apps/api`**: Express.js REST API backend. Handles auth, streaming chat routes, and scraper triggering.
- **`apps/desktop`**: Electron shell wrapping `apps/web`.
- **`packages/ai`**: Vercel AI SDK (`ai`) wrapper supporting Gemini, OpenAI, Anthropic, and Ollama.
- **`packages/database`**: Prisma ORM client export, seed scripts, and migration helpers.
- **`packages/scraper`**: Hardware scraping scripts for AliExpress, Amazon, Adafruit, etc.
- **`packages/shared`**: Pure TypeScript types, constants, system prompts, and utility helpers.

---

## 2. TypeScript & React 19 Guidelines

- **Strict Typing**: Always define explicit interfaces or types. Avoid `any`.
- **React 19 Hooks**: Prefer modern React hooks (`useState`, `useCallback`, `useMemo`, `useEffect`).
- **Icons**: Use `lucide-react` for all UI icons to maintain Cyberpunk / Sci-Fi visual consistency.
- **Styling**: Use Tailwind CSS utility classes. Maintain the dark cyberpunk theme (`bg-slate-950`, `text-cyan-400`, `border-cyan-500/30`, `bg-slate-900/50` glassmorphism).

---

## 3. Prisma & SQLite Data Conventions

SQLite does not support native `JSON` columns or arrays. Follow these strict rules for models in `prisma/schema.prisma`:
- Store JSON data and arrays as stringified JSON (`@default("[]")` or `@default("{}")`).
- When querying Prisma models in API routes or React components, parse JSON strings safely using standard `try/catch` or helper parsing functions:
  ```ts
  const specs = JSON.parse(part.specs || "{}");
  const images = JSON.parse(part.images || "[]");
  ```

---

## 4. Hardware Studio Protocols (WebSerial, WebUSB, WebGL)

When building or editing Studios in `apps/web/src/pages/`:
- **WebSerial / WebUSB**: Always wrap connection requests in `try/catch`. Handle unexpected device disconnect events with user notifications.
- **3D Canvas / WebGL**: Ensure WebGL contexts are properly disposed on component unmount to prevent memory leaks in Electron/Browser contexts.
