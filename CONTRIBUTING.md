# Contributing to Decksmith

First off, thank you for considering contributing to Decksmith! We are building the definitive open-source hardware engineering platform for cyberdecks, portable field terminals, and edge computers.

---

## 🚀 Development Setup

1. **Prerequisites**:
   - Node.js 20+ (v24 LTS recommended)
   - pnpm 9+ (`npm install -g pnpm`)

2. **Clone & Install**:
   ```bash
   git clone https://github.com/gdev6145/decksmith.git
   cd decksmith
   pnpm install
   ```

3. **Database Initialization**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm --filter @decksmith/database seed
   ```

4. **Run Development Servers**:
   ```bash
   pnpm dev
   ```

---

## 🛠️ Code Structure & Monorepo

- `apps/web`: React 19 SPA with Vite, Tailwind CSS, Three.js 3D WebGL CAD engine, and Web Audio synthesis.
- `apps/api`: Express.js backend serving `/api/parts`, `/api/builds`, `/api/chat`, and hardware telemetry.
- `apps/desktop`: Electron wrapper with zero-GPU fallback and hardware socket bridges.
- `packages/shared`: Shared types, pinout matrix algorithms, and validation rules.
- `packages/database`: Prisma schema, migrations, and seed data.

---

## 🧪 Verification Before Submitting a PR

Always ensure all packages typecheck and build cleanly:
```bash
pnpm typecheck
pnpm -r build
```

---

## 📜 Code Style & Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature or tool studio
- `fix:` Bug fix or calculation correction
- `docs:` Documentation or README updates
- `refactor:` Code refactoring with no behavior change
