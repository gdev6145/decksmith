---
name: decksmith-assembly-pinout-guide-studio
description: >-
  Develop or enhance exploded-view assembly guides, step-by-step build manuals, GPIO pinout inspectors, and wiring harness diagrams.
  Use when modifying AssemblyGuideStudio, PinoutStudio, WiringHarnessStudio, or interactive build step components.
---

# Decksmith Assembly Guide & Pinout Studio Guide

This skill provides patterns for building interactive build manuals and pinout diagrams in `AssemblyGuideStudio.tsx` and `PinoutStudio.tsx`.

---

## 1. Step-by-Step Build Manual Schema

```ts
export interface BuildAssemblyStep {
  stepNumber: number;
  title: string;
  description: string;
  category: "frame" | "electronics" | "wiring" | "firmware" | "testing";
  toolsRequired: string[]; // e.g. ["M3 Hex Key", "Soldering Iron", "Wire Stripper"]
  partsUsed: { partId: string; quantity: number }[];
  warningNote?: string;
  imageUrl?: string;
}

export function AssemblyStepCard({ step }: { step: BuildAssemblyStep }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30">
          STEP {step.stepNumber}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{step.category}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{step.title}</h3>
      <p className="text-slate-300 text-sm">{step.description}</p>
    </div>
  );
}
```

---

## 2. Interactive GPIO Pinout Standard (Raspberry Pi 40-pin header)

| Pin | Name | Primary Function | Alternate Function | Color Coding |
| :--- | :--- | :--- | :--- | :--- |
| **Pin 1 / 17** | 3.3V Power | DC Power | - | `#ef4444` (Red) |
| **Pin 2 / 4** | 5V Power | DC Power | - | `#f97316` (Orange) |
| **Pin 3** | GPIO 2 | I2C1 SDA | Board ID | `#eab308` (Yellow) |
| **Pin 5** | GPIO 3 | I2C1 SCL | Board ID | `#eab308` (Yellow) |
| **Pin 6 / 9 / 14**| Ground | GND | - | `#475569` (Slate) |
| **Pin 8 / 10** | GPIO 14 / 15 | UART TX / RX | Serial Console | `#3b82f6` (Blue) |
| **Pin 19 / 21 / 23**| SPI0 | MOSI / MISO / SCLK | Hardware SPI | `#a855f7` (Purple) |
