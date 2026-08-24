import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Keyboard,
  Cpu,
  Layers,
  Download,
  Copy,
  Check,
  FileCode,
  Sliders,
  Sparkles,
  Zap,
  Crosshair,
  HardDrive,
  Compass,
  RefreshCw,
  Terminal,
  Grid,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface LayoutPreset {
  id: string;
  name: string;
  category: "Ortholinear" | "Split" | "Compact" | "Thumbpad";
  rows: number;
  cols: number;
  totalKeys: number;
  description: string;
  controller: string;
  keys: Array<{ label: string; row: number; col: number }>;
}

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "ortho-40",
    name: "40% Ortholinear Grid (4x12 Planck)",
    category: "Ortholinear",
    rows: 4,
    cols: 12,
    totalKeys: 48,
    controller: "Raspberry Pi Pico / RP2040 Zero",
    description: "Ultra-compact grid layout with zero finger stagger. Standard for cyberdecks and portable field terminals.",
    keys: [
      { label: "TAB", row: 0, col: 0 }, { label: "Q", row: 0, col: 1 }, { label: "W", row: 0, col: 2 }, { label: "E", row: 0, col: 3 }, { label: "R", row: 0, col: 4 }, { label: "T", row: 0, col: 5 }, { label: "Y", row: 0, col: 6 }, { label: "U", row: 0, col: 7 }, { label: "I", row: 0, col: 8 }, { label: "O", row: 0, col: 9 }, { label: "P", row: 0, col: 10 }, { label: "BSPC", row: 0, col: 11 },
      { label: "ESC", row: 1, col: 0 }, { label: "A", row: 1, col: 1 }, { label: "S", row: 1, col: 2 }, { label: "D", row: 1, col: 3 }, { label: "F", row: 1, col: 4 }, { label: "G", row: 1, col: 5 }, { label: "H", row: 1, col: 6 }, { label: "J", row: 1, col: 7 }, { label: "K", row: 1, col: 8 }, { label: "L", row: 1, col: 9 }, { label: ";", row: 1, col: 10 }, { label: "'", row: 1, col: 11 },
      { label: "SHFT", row: 2, col: 0 }, { label: "Z", row: 2, col: 1 }, { label: "X", row: 2, col: 2 }, { label: "C", row: 2, col: 3 }, { label: "V", row: 2, col: 4 }, { label: "B", row: 2, col: 5 }, { label: "N", row: 2, col: 6 }, { label: "M", row: 2, col: 7 }, { label: ",", row: 2, col: 8 }, { label: ".", row: 2, col: 9 }, { label: "/", row: 2, col: 10 }, { label: "ENT", row: 2, col: 11 },
      { label: "CTRL", row: 3, col: 0 }, { label: "ALT", row: 3, col: 1 }, { label: "GUI", row: 3, col: 2 }, { label: "LOWER", row: 3, col: 3 }, { label: "SPC", row: 3, col: 4 }, { label: "SPC", row: 3, col: 5 }, { label: "SPC", row: 3, col: 6 }, { label: "SPC", row: 3, col: 7 }, { label: "RAISE", row: 3, col: 8 }, { label: "LEFT", row: 3, col: 9 }, { label: "DOWN", row: 3, col: 10 }, { label: "RGHT", row: 3, col: 11 },
    ],
  },
  {
    id: "split-36",
    name: "36-Key Split Ergonomic (Corne / Sweep)",
    category: "Split",
    rows: 4,
    cols: 10,
    totalKeys: 36,
    controller: "Dual RP2040 / Pro Micro",
    description: "Columnar staggered split layout with dedicated 3-key thumb clusters. Extreme ergonomics for wrist health.",
    keys: [
      { label: "Q", row: 0, col: 0 }, { label: "W", row: 0, col: 1 }, { label: "E", row: 0, col: 2 }, { label: "R", row: 0, col: 3 }, { label: "T", row: 0, col: 4 }, { label: "Y", row: 0, col: 5 }, { label: "U", row: 0, col: 6 }, { label: "I", row: 0, col: 7 }, { label: "O", row: 0, col: 8 }, { label: "P", row: 0, col: 9 },
      { label: "A", row: 1, col: 0 }, { label: "S", row: 1, col: 1 }, { label: "D", row: 1, col: 2 }, { label: "F", row: 1, col: 3 }, { label: "G", row: 1, col: 4 }, { label: "H", row: 1, col: 5 }, { label: "J", row: 1, col: 7 }, { label: "K", row: 1, col: 7 }, { label: "L", row: 1, col: 8 }, { label: ";", row: 1, col: 9 },
      { label: "Z", row: 2, col: 0 }, { label: "X", row: 2, col: 1 }, { label: "C", row: 2, col: 2 }, { label: "V", row: 2, col: 3 }, { label: "B", row: 2, col: 4 }, { label: "N", row: 2, col: 5 }, { label: "M", row: 2, col: 6 }, { label: ",", row: 2, col: 7 }, { label: ".", row: 2, col: 8 }, { label: "/", row: 2, col: 9 },
      { label: "NAV", row: 3, col: 2 }, { label: "SPC", row: 3, col: 3 }, { label: "SHFT", row: 3, col: 4 }, { label: "ENT", row: 3, col: 5 }, { label: "NUM", row: 3, col: 6 }, { label: "BSPC", row: 3, col: 7 },
    ],
  },
  {
    id: "bbq20",
    name: "Tactile BBQ20 / Q10 Handheld Matrix",
    category: "Thumbpad",
    rows: 4,
    cols: 9,
    totalKeys: 35,
    controller: "SAMD21 / RP2040 I2C Bridge",
    description: "Compact thumb-typing keypad with optical trackpad. Best for handheld cyberdecks and gauntlets.",
    keys: [
      { label: "Q", row: 0, col: 0 }, { label: "W", row: 0, col: 1 }, { label: "E", row: 0, col: 2 }, { label: "R", row: 0, col: 3 }, { label: "T", row: 0, col: 4 }, { label: "Y", row: 0, col: 5 }, { label: "U", row: 0, col: 6 }, { label: "I", row: 0, col: 7 }, { label: "O", row: 0, col: 8 },
      { label: "A", row: 1, col: 0 }, { label: "S", row: 1, col: 1 }, { label: "D", row: 1, col: 2 }, { label: "F", row: 1, col: 3 }, { label: "G", row: 1, col: 4 }, { label: "H", row: 1, col: 5 }, { label: "J", row: 1, col: 6 }, { label: "K", row: 1, col: 7 }, { label: "L", row: 1, col: 8 },
      { label: "ALT", row: 2, col: 0 }, { label: "Z", row: 2, col: 1 }, { label: "X", row: 2, col: 2 }, { label: "C", row: 2, col: 3 }, { label: "V", row: 2, col: 4 }, { label: "B", row: 2, col: 5 }, { label: "N", row: 2, col: 6 }, { label: "M", row: 2, col: 7 }, { label: "$", row: 2, col: 8 },
      { label: "SHFT", row: 3, col: 0 }, { label: "MIC", row: 3, col: 1 }, { label: "SYM", row: 3, col: 2 }, { label: "SPC", row: 3, col: 4 }, { label: "ENT", row: 3, col: 6 }, { label: "BSPC", row: 3, col: 8 },
    ],
  },
];

export default function KeyboardMatrixStudio() {
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("ortho-40");
  const [switchType, setSwitchType] = useState<"choc_v1" | "cherry_mx" | "gateron_lp">("choc_v1");
  const [diodeDirection, setDiodeDirection] = useState<"COL2ROW" | "ROW2COL">("COL2ROW");
  const [mcuTarget, setMcuTarget] = useState<"rp2040_pico" | "pro_micro_32u4" | "stm32_blackpill">("rp2040_pico");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "qmk" | "kmk" | "cad" | "vial">("matrix");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const selectedLayout = LAYOUT_PRESETS.find((l) => l.id === selectedLayoutId) || LAYOUT_PRESETS[0];

  const switchSpecs = useMemo(() => {
    switch (switchType) {
      case "choc_v1":
        return { name: "Kailh Choc V1 (Low Profile)", cutoutMm: 13.8, plateThicknessMm: 1.2, spacingX: 18.0, spacingY: 17.0 };
      case "cherry_mx":
        return { name: "Cherry MX Standard", cutoutMm: 14.0, plateThicknessMm: 1.5, spacingX: 19.05, spacingY: 19.05 };
      case "gateron_lp":
        return { name: "Gateron KS-33 Low Profile", cutoutMm: 14.0, plateThicknessMm: 1.3, spacingX: 18.5, spacingY: 17.5 };
    }
  }, [switchType]);

  const gpioRowPins = useMemo(() => {
    if (mcuTarget === "rp2040_pico") {
      return Array.from({ length: selectedLayout.rows }, (_, i) => `GP${i}`);
    } else if (mcuTarget === "pro_micro_32u4") {
      return ["D3", "D2", "D1", "D0"].slice(0, selectedLayout.rows);
    } else {
      return ["PA0", "PA1", "PA2", "PA3"].slice(0, selectedLayout.rows);
    }
  }, [mcuTarget, selectedLayout]);

  const gpioColPins = useMemo(() => {
    if (mcuTarget === "rp2040_pico") {
      return Array.from({ length: selectedLayout.cols }, (_, i) => `GP${i + 4}`);
    } else if (mcuTarget === "pro_micro_32u4") {
      return ["F4", "F5", "F6", "F7", "B1", "B3", "B2", "B6", "B5", "B4", "E6", "D7"].slice(0, selectedLayout.cols);
    } else {
      return ["PB0", "PB1", "PB2", "PB3", "PB4", "PB5", "PB6", "PB7", "PB8", "PB9", "PB10", "PB11"].slice(0, selectedLayout.cols);
    }
  }, [mcuTarget, selectedLayout]);

  // Generated QMK rules.mk & keymap.c
  const qmkKeymapCode = useMemo(() => {
    return `// ================================================================
// DECKSMITH AUTOGENERATED QMK KEYMAP
// Layout: ${selectedLayout.name} (${selectedLayout.totalKeys} keys)
// Controller: ${mcuTarget.toUpperCase()}
// Diode Direction: ${diodeDirection}
// ================================================================

#include QMK_KEYBOARD_H

// Row GPIO Pins: ${gpioRowPins.join(", ")}
// Col GPIO Pins: ${gpioColPins.join(", ")}

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [0] = LAYOUT(
        ${selectedLayout.keys.map((k) => `KC_${k.label.replace(/[^A-Z0-9]/g, "") || "NO"}`).join(", ")}
    )
};
`;
  }, [selectedLayout, mcuTarget, diodeDirection, gpioRowPins, gpioColPins]);

  // Generated KMK CircuitPython code.py
  const kmkCodePy = useMemo(() => {
    return `import board
from kmk.kmk_keyboard import KMKKeyboard
from kmk.keys import KC
from kmk.scanners import DiodeOrientation

keyboard = KMKKeyboard()

# Hardware Matrix Pins
keyboard.col_pins = (${gpioColPins.map((p) => `board.${p}`).join(", ")})
keyboard.row_pins = (${gpioRowPins.map((p) => `board.${p}`).join(", ")})
keyboard.diode_orientation = DiodeOrientation.${diodeDirection}

# Keymap Matrix
keyboard.keymap = [
    [
        ${selectedLayout.keys.map((k) => `KC.${k.label.replace(/[^A-Z0-9]/g, "") || "NO"}`).join(", ")}
    ]
]

if __name__ == '__main__':
    keyboard.go()
`;
  }, [selectedLayout, gpioColPins, gpioRowPins, diodeDirection]);

  // Generated OpenSCAD Switch Plate
  const openScadPlateCode = useMemo(() => {
    const widthMm = (selectedLayout.cols * switchSpecs.spacingX) + 10;
    const heightMm = (selectedLayout.rows * switchSpecs.spacingY) + 10;
    return `// ================================================================
// DECKSMITH OPENSCAD 3D SWITCH PLATE
// Layout: ${selectedLayout.name}
// Switch: ${switchSpecs.name} (Cutout: ${switchSpecs.cutoutMm}mm)
// Plate Size: ${widthMm.toFixed(1)}mm x ${heightMm.toFixed(1)}mm x ${switchSpecs.plateThicknessMm}mm
// ================================================================

$fn = 60;
plate_w = ${widthMm.toFixed(1)};
plate_h = ${heightMm.toFixed(1)};
plate_thick = ${switchSpecs.plateThicknessMm};
cutout = ${switchSpecs.cutoutMm};
spacing_x = ${switchSpecs.spacingX};
spacing_y = ${switchSpecs.spacingY};

difference() {
    // Outer Chamfered Plate
    hull() {
        translate([3, 3, 0]) cylinder(r=3, h=plate_thick);
        translate([plate_w - 3, 3, 0]) cylinder(r=3, h=plate_thick);
        translate([3, plate_h - 3, 0]) cylinder(r=3, h=plate_thick);
        translate([plate_w - 3, plate_h - 3, 0]) cylinder(r=3, h=plate_thick);
    }
    
    // Switch Cutouts
    for (r = [0 : ${selectedLayout.rows - 1}]) {
        for (c = [0 : ${selectedLayout.cols - 1}]) {
            translate([8 + (c * spacing_x), 8 + (r * spacing_y), -1])
                cube([cutout, cutout, plate_thick + 2]);
        }
    }
}
`;
  }, [selectedLayout, switchSpecs]);

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case "qmk": return qmkKeymapCode;
      case "kmk": return kmkCodePy;
      case "cad": return openScadPlateCode;
      case "vial": return JSON.stringify({ name: selectedLayout.name, matrix: { rows: selectedLayout.rows, cols: selectedLayout.cols } }, null, 2);
      default: return "";
    }
  }, [activeTab, qmkKeymapCode, kmkCodePy, openScadPlateCode, selectedLayout]);

  const handleKeyPress = (label: string) => {
    soundFx.playClick();
    setActiveKey(label);
    setTimeout(() => setActiveKey(null), 300);
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    soundFx.playConfirm();
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30">
              Cyberdeck Matrix Engine
            </span>
            <span className="text-xs font-mono text-cyan-400">QMK · KMK · ZMK · Vial · OpenSCAD</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Keyboard className="w-7 h-7 text-neon-green" />
            Mechanical Keyboard Matrix & Switch Plate Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Design handwired ortholinear and split keyboard matrices, auto-assign GPIO diodes, and export QMK/CircuitPython firmware with laser-cut switch plates.
          </p>
        </div>

        {/* Quick Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/cad"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            CAD Studio
          </Link>
          <Link
            to="/builder"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-neon-green" />
            Blueprint Studio
          </Link>
          <button
            onClick={() => downloadFile(`${selectedLayout.id}-switch-plate.scad`, openScadPlateCode, "text/plain")}
            className="px-3.5 py-2 rounded-lg bg-neon-green hover:bg-emerald-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-neon-green/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export 3D Switch Plate
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Preset Layout Selector */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Grid className="w-4 h-4 text-neon-green" />
              1. Keyboard Matrix Layout
            </h3>
            <div className="space-y-2">
              {LAYOUT_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedLayoutId(preset.id);
                  }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedLayoutId === preset.id
                      ? "border-neon-green bg-emerald-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{preset.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-neon-green">
                      {preset.totalKeys} keys
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-normal">{preset.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Switch Footprint & Hardware Specs */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              2. Switch Type & Diode Routing
            </h3>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">Switch Standard</label>
              <select
                value={switchType}
                onChange={(e) => setSwitchType(e.target.value as any)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-cyan-300 font-bold focus:outline-none"
              >
                <option value="choc_v1">Kailh Choc V1 (Low Profile - 13.8mm cutout)</option>
                <option value="cherry_mx">Cherry MX Standard (14.0mm cutout)</option>
                <option value="gateron_lp">Gateron Low Profile KS-33 (14.0mm cutout)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">Microcontroller (MCU)</label>
              <select
                value={mcuTarget}
                onChange={(e) => setMcuTarget(e.target.value as any)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-purple-300 font-bold focus:outline-none"
              >
                <option value="rp2040_pico">Raspberry Pi Pico / RP2040 Zero (30 GPIO)</option>
                <option value="pro_micro_32u4">Pro Micro ATmega32U4 (18 GPIO)</option>
                <option value="stm32_blackpill">STM32F401 BlackPill (ARM Cortex-M4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5">Diode Orientation</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => setDiodeDirection("COL2ROW")}
                  className={`p-2 rounded-lg border transition-all ${
                    diodeDirection === "COL2ROW"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold"
                      : "border-gray-800 bg-gray-950 text-gray-400"
                  }`}
                >
                  COL2ROW (Cathode to Row)
                </button>
                <button
                  onClick={() => setDiodeDirection("ROW2COL")}
                  className={`p-2 rounded-lg border transition-all ${
                    diodeDirection === "ROW2COL"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold"
                      : "border-gray-800 bg-gray-950 text-gray-400"
                  }`}
                >
                  ROW2COL (Cathode to Col)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Visual Matrix & Code Exporters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Matrix Interactive Keyboard Grid */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-neon-green" />
                  Interactive Switch Matrix ({selectedLayout.rows} Rows × {selectedLayout.cols} Cols)
                </h3>
                <p className="text-xs text-gray-400">
                  Click any switch to simulate mechanical actuation and verify electrical matrix coordinates.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-gray-800 text-neon-green border border-neon-green/30 font-bold">
                {selectedLayout.totalKeys} Total Switches
              </span>
            </div>

            {/* Visual Keys */}
            <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 overflow-x-auto flex justify-center">
              <div className="inline-grid gap-1.5 select-none" style={{ gridTemplateColumns: `repeat(${selectedLayout.cols}, minmax(42px, 50px))` }}>
                {selectedLayout.keys.map((k, idx) => {
                  const isActuated = activeKey === k.label;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleKeyPress(k.label)}
                      className={`h-11 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center transition-all ${
                        isActuated
                          ? "bg-neon-green text-gray-950 scale-95 border-emerald-300 shadow-md shadow-neon-green/40"
                          : "bg-gray-900 border-gray-700 text-gray-200 hover:border-neon-green/70 hover:bg-gray-800"
                      }`}
                    >
                      <span>{k.label}</span>
                      <span className="text-[8px] text-gray-500 font-normal">
                        R{k.row}:C{k.col}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pin Allocation HUD */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
              <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 space-y-1">
                <span className="text-neon-green font-bold block">Active Row Pins ({gpioRowPins.length})</span>
                <span className="text-gray-400 break-all">{gpioRowPins.join(", ")}</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 space-y-1">
                <span className="text-cyan-400 font-bold block">Active Column Pins ({gpioColPins.length})</span>
                <span className="text-gray-400 break-all">{gpioColPins.join(", ")}</span>
              </div>
            </div>
          </div>

          {/* Firmware & CAD Code Generator Tabs */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveTab("qmk")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    activeTab === "qmk" ? "bg-neon-green text-gray-950" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  QMK keymap.c
                </button>
                <button
                  onClick={() => setActiveTab("kmk")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    activeTab === "kmk" ? "bg-purple-500 text-gray-950" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  KMK code.py
                </button>
                <button
                  onClick={() => setActiveTab("cad")}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                    activeTab === "cad" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  OpenSCAD 3D Plate
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    soundFx.playConfirm();
                    navigator.clipboard.writeText(activeContent);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      activeTab === "qmk"
                        ? "keymap.c"
                        : activeTab === "kmk"
                        ? "code.py"
                        : "switch-plate.scad",
                      activeContent,
                      "text/plain"
                    )
                  }
                  className="px-2.5 py-1 rounded bg-neon-green hover:bg-emerald-400 text-xs text-gray-950 font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>

            <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-h-72 select-all">
              {activeContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
