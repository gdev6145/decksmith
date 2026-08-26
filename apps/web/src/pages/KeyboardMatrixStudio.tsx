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
  Volume2,
  Activity,
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
      { label: "A", row: 1, col: 0 }, { label: "S", row: 1, col: 1 }, { label: "D", row: 1, col: 2 }, { label: "F", row: 1, col: 3 }, { label: "G", row: 1, col: 4 }, { label: "H", row: 1, col: 5 }, { label: "J", row: 1, col: 6 }, { label: "K", row: 1, col: 7 }, { label: "L", row: 1, col: 8 }, { label: ";", row: 1, col: 9 },
      { label: "Z", row: 2, col: 0 }, { label: "X", row: 2, col: 1 }, { label: "C", row: 2, col: 3 }, { label: "V", row: 2, col: 4 }, { label: "B", row: 2, col: 5 }, { label: "N", row: 2, col: 6 }, { label: "M", row: 2, col: 7 }, { label: ",", row: 2, col: 8 }, { label: ".", row: 2, col: 9 }, { label: "/", row: 2, col: 10 },
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
  const [activeTab, setActiveTab] = useState<"qmk" | "kmk" | "cad">("qmk");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [keystrokeCount, setKeystrokeCount] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);

  const selectedLayout = LAYOUT_PRESETS.find((l) => l.id === selectedLayoutId) || LAYOUT_PRESETS[0];

  const handleKeyPress = (keyLabel: string) => {
    soundFx.playClick();
    setActiveKey(keyLabel);
    setKeystrokeCount((c) => c + 1);
    setTimeout(() => setActiveKey(null), 180);
  };

  // Real hardware keyboard typing listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toUpperCase();
      const match = selectedLayout.keys.find((key) => key.label === k || (k === " " && key.label === "SPC") || (k === "BACKSPACE" && key.label === "BSPC") || (k === "ENTER" && key.label === "ENT"));
      if (match) {
        handleKeyPress(match.label);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLayout]);

  const gpioRowPins = useMemo(() => {
    if (mcuTarget === "rp2040_pico") return ["GP2", "GP3", "GP4", "GP5", "GP6"].slice(0, selectedLayout.rows);
    if (mcuTarget === "pro_micro_32u4") return ["PD4", "PD7", "PE6", "PB4"].slice(0, selectedLayout.rows);
    return ["PA0", "PA1", "PA2", "PA3"].slice(0, selectedLayout.rows);
  }, [mcuTarget, selectedLayout]);

  const gpioColPins = useMemo(() => {
    if (mcuTarget === "rp2040_pico") return Array.from({ length: selectedLayout.cols }).map((_, i) => `GP${7 + i}`);
    if (mcuTarget === "pro_micro_32u4") return ["PB5", "PB6", "PB2", "PB3", "PB1", "PF7", "PF6", "PF5", "PF4", "PD1", "PD0", "PD2"].slice(0, selectedLayout.cols);
    return Array.from({ length: selectedLayout.cols }).map((_, i) => `PB${i}`);
  }, [mcuTarget, selectedLayout]);

  const qmkKeymap = useMemo(() => {
    let code = `// DECKSMITH AUTOGENERATED QMK FIRMWARE keymap.c\n`;
    code += `// Layout: ${selectedLayout.name} (${selectedLayout.rows}x${selectedLayout.cols})\n`;
    code += `// Controller: ${mcuTarget} | Diode: ${diodeDirection}\n\n`;
    code += `#include QMK_KEYBOARD_H\n\n`;
    code += `const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n`;
    code += `  [0] = LAYOUT(\n`;

    for (let r = 0; r < selectedLayout.rows; r++) {
      const rowKeys = selectedLayout.keys.filter((k) => k.row === r).map((k) => `KC_${k.label}`);
      code += `    ${rowKeys.join(", ")}${r === selectedLayout.rows - 1 ? "" : ","}\n`;
    }

    code += `  )\n};\n`;
    return code;
  }, [selectedLayout, mcuTarget, diodeDirection]);

  const kmkCode = useMemo(() => {
    let code = `# DECKSMITH AUTOGENERATED KMK FIRMWARE code.py\n`;
    code += `import board\n`;
    code += `from kmk.kmk_keyboard import KMKKeyboard\n`;
    code += `from kmk.keys import KC\n`;
    code += `from kmk.matrix import DiodeOrientation\n\n`;
    code += `keyboard = KMKKeyboard()\n\n`;
    code += `keyboard.row_pins = (${gpioRowPins.map((p) => `board.${p}`).join(", ")})\n`;
    code += `keyboard.col_pins = (${gpioColPins.map((p) => `board.${p}`).join(", ")})\n`;
    code += `keyboard.diode_orientation = DiodeOrientation.${diodeDirection}\n\n`;
    code += `keyboard.keymap = [\n    [\n`;

    for (let r = 0; r < selectedLayout.rows; r++) {
      const rowKeys = selectedLayout.keys.filter((k) => k.row === r).map((k) => `KC.${k.label}`);
      code += `        ${rowKeys.join(", ")},\n`;
    }

    code += `    ]\n]\n\n`;
    code += `if __name__ == '__main__':\n    keyboard.go()\n`;
    return code;
  }, [selectedLayout, gpioRowPins, gpioColPins, diodeDirection]);

  const openscadPlate = useMemo(() => {
    return `// DECKSMITH PARAMETRIC 3D SWITCH PLATE (OpenSCAD)
// Layout: ${selectedLayout.name}
$fn = 40;
plate_width = ${selectedLayout.cols * 19.0 + 8.0};
plate_height = ${selectedLayout.rows * 19.0 + 8.0};
cutout_size = 14.0;
thickness = 1.5;

difference() {
  cube([plate_width, plate_height, thickness]);
  for (r = [0:${selectedLayout.rows - 1}]) {
    for (c = [0:${selectedLayout.cols - 1}]) {
      translate([c * 19.0 + 4.0, r * 19.0 + 4.0, -1])
        cube([cutout_size, cutout_size, thickness + 2]);
    }
  }
}
`;
  }, [selectedLayout]);

  const activeContent = activeTab === "qmk" ? qmkKeymap : activeTab === "kmk" ? kmkCode : openscadPlate;

  const downloadFile = (filename: string, content: string, type: string) => {
    soundFx.playConfirm();
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-2">
            <Keyboard className="w-3.5 h-3.5" />
            Mechanical Switch Matrix & Firmware Studio
          </div>
          <h1 className="text-3xl font-black text-white">Mechanical Keyboard Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Design custom switch matrices, verify pinout buses, simulate live typing acoustics, and export QMK/KMK firmware
          </p>
        </div>

        {/* Keystroke & Typing HUD */}
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-3 shadow-xl">
          <div className="flex items-center gap-2 text-xs">
            <Activity className="w-4 h-4 text-neon-green" />
            <span className="text-gray-400">Keystrokes:</span>
            <span className="text-neon-green font-bold">{keystrokeCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Layout Config (4 Cols) + Matrix Canvas & Code Exporter (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Layout Selection & Matrix Electrical Settings */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Matrix Form Factor
            </h2>

            <div className="space-y-2">
              {LAYOUT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedLayoutId(preset.id);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    selectedLayoutId === preset.id
                      ? "bg-gray-950 border-purple-500 shadow-md shadow-purple-500/10 text-white"
                      : "bg-gray-950/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{preset.name}</span>
                    <span className="text-[10px] text-purple-400">{preset.totalKeys} Keys</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Microcontroller & Diodes
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Controller Target:</label>
                <select
                  value={mcuTarget}
                  onChange={(e) => setMcuTarget(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white font-bold focus:border-purple-500 focus:outline-none"
                >
                  <option value="rp2040_pico">Raspberry Pi Pico (RP2040)</option>
                  <option value="pro_micro_32u4">Pro Micro (ATmega32U4)</option>
                  <option value="stm32_blackpill">STM32F401 BlackPill</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">Diode Direction:</label>
                <select
                  value={diodeDirection}
                  onChange={(e) => setDiodeDirection(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-white font-bold focus:border-purple-500 focus:outline-none"
                >
                  <option value="COL2ROW">COL2ROW (Cathode to Rows - Standard)</option>
                  <option value="ROW2COL">ROW2COL (Cathode to Columns)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Matrix Canvas & Firmware Exporter */}
        <div className="lg:col-span-8 space-y-4">
          {/* Interactive Mechanical Switch Grid */}
          <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-neon-green" />
                  Tactile Typing Simulator ({selectedLayout.rows} Rows × {selectedLayout.cols} Cols)
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Type on your physical keyboard or click keys to test mechanical actuation & acoustics
                </p>
              </div>
              <span className="text-xs text-neon-green font-bold px-2.5 py-1 rounded bg-gray-950 border border-neon-green/30">
                {selectedLayout.totalKeys} Switches
              </span>
            </div>

            <div className="p-6 bg-gray-950 rounded-2xl border border-gray-800 overflow-x-auto flex justify-center">
              <div
                className="inline-grid gap-1.5 select-none"
                style={{ gridTemplateColumns: `repeat(${selectedLayout.cols}, minmax(44px, 50px))` }}
              >
                {selectedLayout.keys.map((k, idx) => {
                  const isActuated = activeKey === k.label;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleKeyPress(k.label)}
                      className={`h-12 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                        isActuated
                          ? "bg-neon-green text-black scale-90 border-emerald-300 shadow-lg shadow-neon-green/40 ring-2 ring-neon-green"
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

            {/* GPIO Pins Allocation */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-neon-green font-bold block">Row GPIO Pins ({gpioRowPins.length})</span>
                <span className="text-gray-400 text-[11px] break-all">{gpioRowPins.join(", ")}</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                <span className="text-purple-400 font-bold block">Column GPIO Pins ({gpioColPins.length})</span>
                <span className="text-gray-400 text-[11px] break-all">{gpioColPins.join(", ")}</span>
              </div>
            </div>
          </div>

          {/* Firmware & OpenSCAD Generator */}
          <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("qmk")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "qmk" ? "bg-neon-green text-black shadow-md" : "bg-gray-950 text-gray-400 hover:text-white"
                  }`}
                >
                  QMK keymap.c
                </button>
                <button
                  onClick={() => setActiveTab("kmk")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "kmk" ? "bg-purple-500 text-white shadow-md" : "bg-gray-950 text-gray-400 hover:text-white"
                  }`}
                >
                  KMK code.py
                </button>
                <button
                  onClick={() => setActiveTab("cad")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "cad" ? "bg-cyan-400 text-black shadow-md" : "bg-gray-950 text-gray-400 hover:text-white"
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
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-bold flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      activeTab === "qmk" ? "keymap.c" : activeTab === "kmk" ? "code.py" : "switch-plate.scad",
                      activeContent,
                      "text/plain"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-neon-green text-black font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-xs text-gray-200 overflow-x-auto leading-relaxed max-h-64 select-all">
              {activeContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
