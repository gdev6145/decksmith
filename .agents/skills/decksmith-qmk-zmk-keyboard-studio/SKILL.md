---
name: decksmith-qmk-zmk-keyboard-studio
description: >-
  Build or enhance mechanical keyboard matrix tools, QMK/ZMK keymap generators, and custom keycap visualizers.
  Use when modifying KeyboardMatrixStudio, matrix diode routing, or firmware compilation pipelines in Decksmith.
---

# Decksmith QMK & ZMK Keyboard Matrix Studio Guide

This skill guides the implementation of mechanical keyboard matrix tools in `apps/web/src/pages/KeyboardMatrixStudio.tsx`.

---

## 1. Matrix Wiring & Diode Direction

When mapping custom Cyberdeck keyboards (e.g. 40%, Ortholinear, Split, or Cyberdeck integrated keypads):
- **ROW2COL**: Diodes point from rows to columns (common in hand-wired builds).
- **COL2ROW**: Diodes point from columns to rows (standard PCB layout).

---

## 2. Generating QMK `info.json` & `keymap.json`

```ts
export interface KeyboardMatrixConfig {
  name: string;
  rows: number;
  cols: number;
  diodeDirection: "COL2ROW" | "ROW2COL";
  matrixPins: {
    rowPins: string[]; // e.g. ["GP0", "GP1", "GP2"]
    colPins: string[]; // e.g. ["GP3", "GP4", "GP5", "GP6"]
  };
  layers: string[][][]; // [LayerIndex][RowIndex][ColIndex] = Keycode
}

export function generateQmkInfoJson(config: KeyboardMatrixConfig) {
  return JSON.stringify({
    keyboard_name: config.name,
    manufacturer: "Decksmith Custom",
    maintainer: "Decksmith Operative",
    development_board: "rp2040",
    diode_direction: config.diodeDirection,
    matrix_pins: {
      cols: config.matrixPins.colPins,
      rows: config.matrixPins.rowPins,
    },
  }, null, 2);
}
```
