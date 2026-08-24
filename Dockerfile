# syntax=docker/dockerfile:1.4
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm & dependencies
RUN npm install -g pnpm@9

# Copy root workspace configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY prisma ./prisma/
COPY packages ./packages/
COPY apps ./apps/

# Install and build all workspace packages
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm -r build

# Production Runner stage
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN npm install -g pnpm@9

# Copy built artifacts
COPY --from=builder /app ./

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
