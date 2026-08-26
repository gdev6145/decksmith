---
name: decksmith-docker-deployment-ci
description: >-
  Containerize, deploy, and set up CI/CD pipelines for Decksmith using Docker, docker-compose, and GitHub Actions.
  Use when updating Dockerfile, configuring self-hosting deployments, or configuring CI test runs.
---

# Decksmith Docker Containerization & CI/CD Guide

This skill provides patterns for containerizing Decksmith for self-hosting and CI/CD pipelines.

---

## 1. Monorepo Production `Dockerfile`

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/ai/package.json ./packages/ai/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY prisma/schema.prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client & build packages
RUN pnpm db:generate
RUN pnpm build

EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "apps/api/dist/index.js"]
```

---

## 2. Self-Hosting `docker-compose.yml`

```yaml
version: "3.8"

services:
  decksmith:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=file:/app/prisma/prod.db
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - decksmith-data:/app/prisma

volumes:
  decksmith-data:
```
