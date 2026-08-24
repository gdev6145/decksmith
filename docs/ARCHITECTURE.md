# 🏛️ Decksmith Architecture & Internal Systems

## Monorepo Architecture
Decksmith is designed as a unified monorepo powered by `pnpm workspaces`:

```
┌────────────────────────────────────────────────────────┐
│                      APPS / FRONTENDS                  │
├───────────────────┬───────────────────┬────────────────┤
│    apps/web       │   apps/desktop    │   apps/mobile  │
│  (React 19 + CAD) │  (Electron Shell) │ (Expo / React) │
└───────────────────┴───────────────────┴────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      BACKEND / API                     │
│               apps/api (Express.js + Prisma)           │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                    SHARED PACKAGES                     │
├───────────────────┬───────────────────┬────────────────┤
│  packages/shared  │ packages/database │  packages/ai   │
└───────────────────┴───────────────────┴────────────────┘
```

## 1. 3D WebGL CAD Rendering Pipeline (`apps/web/src/lib/cadEngine.ts`)
- Utilizes Three.js PerspectiveCamera with OrbitControls.
- Generates procedural multi-plate geometries with real-world dimensions ($mm$).
- Layer thickness, standoff heights, and exploded assembly offsets ($0 - 80\text{mm}$) are computed dynamically along the Z-axis.

## 2. 40-Pin GPIO & Bus Allocation Engine (`apps/web/src/pages/BuildCreator.tsx`)
- Maps standard Raspberry Pi / RK3588 40-pin headers.
- Tracks pin bus claims:
  - **I2C**: SDA (Pin 3), SCL (Pin 5)
  - **SPI0**: MOSI (Pin 19), MISO (Pin 21), SCLK (Pin 23), CE0 (Pin 24), CE1 (Pin 26)
  - **UART**: TXD (Pin 8), RXD (Pin 10)
  - **PWM**: GPIO 18 (Pin 12), GPIO 12 (Pin 32)
- Prevents hardware bus contention by warning users when two stacked HATs claim conflicting pins.

## 3. Web Audio Synthesis Engine (`apps/web/src/lib/soundFx.ts`)
- Pure zero-dependency Web Audio API oscillator synthesis.
- Generates custom cybernetic clicks ($800\text{Hz} \rightarrow 200\text{Hz}$ triangle sweep) and chord confirmations ($523.25\text{Hz} \rightarrow 659.25\text{Hz}$ sine).
