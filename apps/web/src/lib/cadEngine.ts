/**
 * Decksmith Precision CAD & Fabrication Engine v3.0
 * Generates exact 1:1 millimeter-precision schematics, DXF laser-cut vector files,
 * CNC milling G-Code, OpenSCAD parametric 3D printable bezels, material mass calculations,
 * and automated cable harness length estimations for custom cyberdecks.
 */

export interface CadHole {
  x: number; // mm from component top-left
  y: number;
  diameter: number; // mm (e.g. 2.75 for M2.5, 3.2 for M3)
  threadType: string;
}

export interface CadCutout {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  label: string;
}

export interface CadComponentSpec {
  id: string;
  name: string;
  category: "SBC" | "DISPLAY" | "KEYBOARD" | "CASE" | "PORT" | "MISC";
  width: number; // mm
  height: number; // mm
  depth?: number; // mm
  cornerRadii?: number;
  holes: CadHole[];
  cutouts: CadCutout[];
  portOverhangs?: Array<{ side: "top" | "bottom" | "left" | "right"; label: string; overhangMm: number }>;
}

export interface PlacedComponent {
  instanceId: string;
  componentId: string;
  x: number; // mm from faceplate top-left
  y: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface FaceplateConfig {
  chassisId: string;
  plateWidth: number; // mm
  plateHeight: number; // mm
  plateCornerRadius: number; // mm
  mountingHoles: CadHole[];
  placedComponents: PlacedComponent[];
}

export interface FastenerRequirement {
  type: string;
  quantity: number;
  purpose: string;
}

export interface CadMaterial {
  id: string;
  name: string;
  thicknessMm: number;
  densityGPerCm3: number; // g/cm³
  laserKerfMm: number; // mm
  description: string;
}

export interface CableHarnessRequirement {
  id: string;
  fromName: string;
  toName: string;
  cableType: "DSI FFC Ribbon" | "Micro-HDMI to HDMI" | "I2C 4-Pin Wire" | "USB-C Ribbon" | "SMA Coax Pigtail" | "Power DC Leads";
  straightDistanceMm: number;
  recommendedLengthCm: number;
}

export const CAD_MATERIALS: Record<string, CadMaterial> = {
  "acrylic-3mm": {
    id: "acrylic-3mm",
    name: "3.0mm Cast Acrylic (Smoked / Matte Black)",
    thicknessMm: 3.0,
    densityGPerCm3: 1.18,
    laserKerfMm: 0.18,
    description: "Standard laser-cut material. High optical clarity, clean polished edge finish.",
  },
  "aluminum-1-5mm": {
    id: "aluminum-1-5mm",
    name: "1.5mm Anodized 6061-T6 Aluminum",
    thicknessMm: 1.5,
    densityGPerCm3: 2.70,
    laserKerfMm: 0.12,
    description: "Industrial strength & EMI shielding. Ideal for CNC router milling.",
  },
  "carbon-fiber-2mm": {
    id: "carbon-fiber-2mm",
    name: "2.0mm 3K Matte Weave Carbon Fiber",
    thicknessMm: 2.0,
    densityGPerCm3: 1.55,
    laserKerfMm: 0.15,
    description: "Ultra-rigid & aerospace grade. Extreme tensile strength and stealth look.",
  },
  "fr4-pcb-1-6mm": {
    id: "fr4-pcb-1-6mm",
    name: "1.6mm Matte Black FR-4 Glass Epoxy PCB",
    thicknessMm: 1.6,
    densityGPerCm3: 1.85,
    laserKerfMm: 0.10,
    description: "Gold ENIG plated solder mask faceplate with integrated ground plane.",
  },
  "petg-3d-print-3mm": {
    id: "petg-3d-print-3mm",
    name: "3.0mm 3D Printed PETG (25% Infill)",
    thicknessMm: 3.0,
    densityGPerCm3: 0.75, // Effective with infill
    laserKerfMm: 0.0,
    description: "3D printed on FDM printers. Impact resistant, UV stable, customizable colors.",
  },
};

export const HARDWARE_CAD_SPECS: Record<string, CadComponentSpec> = {
  // --- SINGLE BOARD COMPUTERS ---
  "raspberry-pi-5": {
    id: "raspberry-pi-5",
    name: "Raspberry Pi 5 (85x56mm)",
    category: "SBC",
    width: 85.0,
    height: 56.0,
    depth: 17.0,
    cornerRadii: 3.0,
    holes: [
      { x: 3.5, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 61.5, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 3.5, y: 52.5, diameter: 2.75, threadType: "M2.5" },
      { x: 61.5, y: 52.5, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [],
    portOverhangs: [
      { side: "right", label: "Gigabit Ethernet + 4x USB", overhangMm: 2.5 },
      { side: "bottom", label: "Dual Micro-HDMI + USB-C PD", overhangMm: 1.5 },
    ],
  },
  "raspberry-pi-4": {
    id: "raspberry-pi-4",
    name: "Raspberry Pi 4 Model B (85x56mm)",
    category: "SBC",
    width: 85.0,
    height: 56.0,
    depth: 16.0,
    cornerRadii: 3.0,
    holes: [
      { x: 3.5, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 61.5, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 3.5, y: 52.5, diameter: 2.75, threadType: "M2.5" },
      { x: 61.5, y: 52.5, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [],
    portOverhangs: [
      { side: "right", label: "Dual USB 3.0 + Ethernet", overhangMm: 2.5 },
      { side: "bottom", label: "Micro-HDMI + USB-C Power", overhangMm: 1.5 },
    ],
  },
  "raspberry-pi-zero-2-w": {
    id: "raspberry-pi-zero-2-w",
    name: "Raspberry Pi Zero 2 W (65x30mm)",
    category: "SBC",
    width: 65.0,
    height: 30.0,
    depth: 5.2,
    cornerRadii: 3.0,
    holes: [
      { x: 3.5, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 61.5, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 3.5, y: 26.5, diameter: 2.75, threadType: "M2.5" },
      { x: 61.5, y: 26.5, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [],
    portOverhangs: [{ side: "bottom", label: "Micro-USB + Mini-HDMI", overhangMm: 1.2 }],
  },
  "orange-pi-5": {
    id: "orange-pi-5",
    name: "Orange Pi 5 (100x62mm)",
    category: "SBC",
    width: 100.0,
    height: 62.0,
    depth: 18.0,
    cornerRadii: 4.0,
    holes: [
      { x: 3.5, y: 3.5, diameter: 3.0, threadType: "M3" },
      { x: 96.5, y: 3.5, diameter: 3.0, threadType: "M3" },
      { x: 3.5, y: 58.5, diameter: 3.0, threadType: "M3" },
      { x: 96.5, y: 58.5, diameter: 3.0, threadType: "M3" },
    ],
    cutouts: [],
  },
  "radxa-rock-5b": {
    id: "radxa-rock-5b",
    name: "Radxa Rock 5B (100x72mm)",
    category: "SBC",
    width: 100.0,
    height: 72.0,
    depth: 19.0,
    cornerRadii: 4.0,
    holes: [
      { x: 4.0, y: 4.0, diameter: 3.0, threadType: "M3" },
      { x: 96.0, y: 4.0, diameter: 3.0, threadType: "M3" },
      { x: 4.0, y: 68.0, diameter: 3.0, threadType: "M3" },
      { x: 96.0, y: 68.0, diameter: 3.0, threadType: "M3" },
    ],
    cutouts: [],
  },
  "lattepanda-3-delta": {
    id: "lattepanda-3-delta",
    name: "LattePanda 3 Delta (125x78mm)",
    category: "SBC",
    width: 125.0,
    height: 78.0,
    depth: 21.0,
    cornerRadii: 4.0,
    holes: [
      { x: 5.0, y: 5.0, diameter: 3.0, threadType: "M3" },
      { x: 120.0, y: 5.0, diameter: 3.0, threadType: "M3" },
      { x: 5.0, y: 73.0, diameter: 3.0, threadType: "M3" },
      { x: 120.0, y: 73.0, diameter: 3.0, threadType: "M3" },
    ],
    cutouts: [],
  },

  // --- DISPLAYS & SCREENS ---
  "waveshare-11-9-bar-touchscreen": {
    id: "waveshare-11-9-bar-touchscreen",
    name: "Waveshare 11.9\" Bar (320x1480)",
    category: "DISPLAY",
    width: 286.0,
    height: 70.0,
    depth: 13.5,
    cornerRadii: 2.0,
    holes: [
      { x: 5.0, y: 5.0, diameter: 2.75, threadType: "M2.5" },
      { x: 281.0, y: 5.0, diameter: 2.75, threadType: "M2.5" },
      { x: 5.0, y: 65.0, diameter: 2.75, threadType: "M2.5" },
      { x: 281.0, y: 65.0, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [
      { x: 9.0, y: 6.0, width: 268.0, height: 58.0, label: "Active 320x1480 Viewport" },
    ],
  },
  "waveshare-8-8-bar-touchscreen": {
    id: "waveshare-8-8-bar-touchscreen",
    name: "Waveshare 8.8\" Bar (480x1920)",
    category: "DISPLAY",
    width: 231.0,
    height: 60.0,
    depth: 12.0,
    cornerRadii: 2.0,
    holes: [
      { x: 4.5, y: 4.5, diameter: 2.75, threadType: "M2.5" },
      { x: 226.5, y: 4.5, diameter: 2.75, threadType: "M2.5" },
      { x: 4.5, y: 55.5, diameter: 2.75, threadType: "M2.5" },
      { x: 226.5, y: 55.5, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [
      { x: 7.5, y: 6.0, width: 216.0, height: 48.0, label: "Active 480x1920 Viewport" },
    ],
  },
  "waveshare-10-1-1920x1200-touch": {
    id: "waveshare-10-1-1920x1200-touch",
    name: "Waveshare 10.1\" IPS (1920x1200)",
    category: "DISPLAY",
    width: 240.0,
    height: 155.0,
    depth: 14.0,
    cornerRadii: 4.0,
    holes: [
      { x: 6.0, y: 6.0, diameter: 3.0, threadType: "M3" },
      { x: 234.0, y: 6.0, diameter: 3.0, threadType: "M3" },
      { x: 6.0, y: 149.0, diameter: 3.0, threadType: "M3" },
      { x: 234.0, y: 149.0, diameter: 3.0, threadType: "M3" },
    ],
    cutouts: [{ x: 11.5, y: 9.5, width: 217.0, height: 136.0, label: "10.1\" Active FHD Viewport" }],
  },
  "waveshare-5-5-amoled-touch": {
    id: "waveshare-5-5-amoled-touch",
    name: "Waveshare 5.5\" AMOLED (1080x1920)",
    category: "DISPLAY",
    width: 140.0,
    height: 75.0,
    depth: 10.0,
    cornerRadii: 3.0,
    holes: [
      { x: 5.0, y: 5.0, diameter: 2.75, threadType: "M2.5" },
      { x: 135.0, y: 5.0, diameter: 2.75, threadType: "M2.5" },
      { x: 5.0, y: 70.0, diameter: 2.75, threadType: "M2.5" },
      { x: 135.0, y: 70.0, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [{ x: 9.0, y: 3.5, width: 122.0, height: 68.0, label: "AMOLED Active Viewport" }],
  },
  "waveshare-4-0-square-touch": {
    id: "waveshare-4-0-square-touch",
    name: "Waveshare 4.0\" 720x720 Square Touch",
    category: "DISPLAY",
    width: 84.0,
    height: 84.0,
    depth: 8.5,
    cornerRadii: 3.0,
    holes: [
      { x: 4.0, y: 4.0, diameter: 2.75, threadType: "M2.5" },
      { x: 80.0, y: 4.0, diameter: 2.75, threadType: "M2.5" },
      { x: 4.0, y: 80.0, diameter: 2.75, threadType: "M2.5" },
      { x: 80.0, y: 80.0, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [{ x: 6.0, y: 6.0, width: 72.0, height: 72.0, label: "720x720 Square Viewport" }],
  },
  "2-9-eink-hat": {
    id: "2-9-eink-hat",
    name: "Waveshare 2.9\" E-Paper Module",
    category: "DISPLAY",
    width: 89.5,
    height: 38.0,
    depth: 7.0,
    cornerRadii: 2.0,
    holes: [
      { x: 3.5, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 86.0, y: 3.5, diameter: 2.75, threadType: "M2.5" },
      { x: 3.5, y: 34.5, diameter: 2.75, threadType: "M2.5" },
      { x: 86.0, y: 34.5, diameter: 2.75, threadType: "M2.5" },
    ],
    cutouts: [{ x: 11.3, y: 4.45, width: 66.9, height: 29.1, label: "296x128 E-Ink Active Area" }],
  },

  // --- KEYBOARDS & INPUT ---
  "solder-party-bbq20-keyboard": {
    id: "solder-party-bbq20-keyboard",
    name: "Solder Party BBQ20 QWERTY + Trackpad",
    category: "KEYBOARD",
    width: 65.0,
    height: 50.0,
    depth: 6.5,
    cornerRadii: 3.0,
    holes: [
      { x: 3.0, y: 3.0, diameter: 2.2, threadType: "M2" },
      { x: 62.0, y: 3.0, diameter: 2.2, threadType: "M2" },
      { x: 3.0, y: 47.0, diameter: 2.2, threadType: "M2" },
      { x: 62.0, y: 47.0, diameter: 2.2, threadType: "M2" },
    ],
    cutouts: [
      { x: 5.0, y: 13.0, width: 55.0, height: 34.0, radius: 2.0, label: "QWERTY Key Dome Cutout" },
      { x: 27.5, y: 2.5, width: 10.0, height: 9.0, radius: 1.0, label: "Optical Trackpad Cutout" },
    ],
  },
  "corne-cherry-split-keyboard": {
    id: "corne-cherry-split-keyboard",
    name: "Corne Cherry Split Half-Plate",
    category: "KEYBOARD",
    width: 140.0,
    height: 90.0,
    depth: 4.0,
    cornerRadii: 4.0,
    holes: [
      { x: 6.0, y: 6.0, diameter: 2.2, threadType: "M2" },
      { x: 134.0, y: 6.0, diameter: 2.2, threadType: "M2" },
      { x: 6.0, y: 84.0, diameter: 2.2, threadType: "M2" },
      { x: 134.0, y: 84.0, diameter: 2.2, threadType: "M2" },
    ],
    cutouts: [
      { x: 14.0, y: 18.0, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 33.05, y: 18.0, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 52.1, y: 18.0, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 71.15, y: 18.0, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 90.2, y: 18.0, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 109.25, y: 18.0, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 14.0, y: 37.05, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 33.05, y: 37.05, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 52.1, y: 37.05, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 71.15, y: 37.05, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 90.2, y: 37.05, width: 14.0, height: 14.0, label: "MX Key" },
      { x: 109.25, y: 37.05, width: 14.0, height: 14.0, label: "MX Key" },
    ],
  },
  "12-key-macropad": {
    id: "12-key-macropad",
    name: "12-Key Mechanical Macropad Plate (3x4)",
    category: "KEYBOARD",
    width: 85.0,
    height: 65.0,
    depth: 4.0,
    cornerRadii: 3.0,
    holes: [
      { x: 4.0, y: 4.0, diameter: 2.2, threadType: "M2" },
      { x: 81.0, y: 4.0, diameter: 2.2, threadType: "M2" },
      { x: 4.0, y: 61.0, diameter: 2.2, threadType: "M2" },
      { x: 81.0, y: 61.0, diameter: 2.2, threadType: "M2" },
    ],
    cutouts: [
      { x: 10.0, y: 10.0, width: 14.0, height: 14.0, label: "Key 1" },
      { x: 29.05, y: 10.0, width: 14.0, height: 14.0, label: "Key 2" },
      { x: 48.1, y: 10.0, width: 14.0, height: 14.0, label: "Key 3" },
      { x: 67.15, y: 10.0, width: 14.0, height: 14.0, label: "Key 4" },
      { x: 10.0, y: 29.05, width: 14.0, height: 14.0, label: "Key 5" },
      { x: 29.05, y: 29.05, width: 14.0, height: 14.0, label: "Key 6" },
      { x: 48.1, y: 29.05, width: 14.0, height: 14.0, label: "Key 7" },
      { x: 67.15, y: 29.05, width: 14.0, height: 14.0, label: "Key 8" },
      { x: 10.0, y: 48.1, width: 14.0, height: 14.0, label: "Key 9" },
      { x: 29.05, y: 48.1, width: 14.0, height: 14.0, label: "Key 10" },
      { x: 48.1, y: 48.1, width: 14.0, height: 14.0, label: "Key 11" },
      { x: 67.15, y: 48.1, width: 14.0, height: 14.0, label: "Key 12" },
    ],
  },

  // --- HARDWARE PORTS & BULKHEADS ---
  "sma-antenna-bulkhead": {
    id: "sma-antenna-bulkhead",
    name: "SMA Antenna Bulkhead Hole (Ø6.5mm)",
    category: "PORT",
    width: 14.0,
    height: 14.0,
    holes: [{ x: 7.0, y: 7.0, diameter: 6.5, threadType: "SMA Female Bulkhead" }],
    cutouts: [],
  },
  "toggle-switch-heavy-duty": {
    id: "toggle-switch-heavy-duty",
    name: "Military Heavy-Duty Toggle (Ø12.2mm)",
    category: "PORT",
    width: 20.0,
    height: 20.0,
    holes: [{ x: 10.0, y: 10.0, diameter: 12.2, threadType: "12mm Toggle Hole" }],
    cutouts: [],
  },
  "usb-c-panel-mount": {
    id: "usb-c-panel-mount",
    name: "USB-C Bulkhead Cutout (15x8mm)",
    category: "PORT",
    width: 25.0,
    height: 16.0,
    holes: [
      { x: 3.5, y: 8.0, diameter: 2.2, threadType: "M2" },
      { x: 21.5, y: 8.0, diameter: 2.2, threadType: "M2" },
    ],
    cutouts: [{ x: 5.0, y: 4.0, width: 15.0, height: 8.0, radius: 2.0, label: "USB-C Port" }],
  },

  // --- ENCLOSURE FACEPLATES ---
  "pelican-1150-faceplate": {
    id: "pelican-1150-faceplate",
    name: "Pelican 1150 Bezel Faceplate (211x147mm)",
    category: "CASE",
    width: 211.0,
    height: 147.0,
    cornerRadii: 10.0,
    holes: [
      { x: 8.0, y: 8.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
      { x: 203.0, y: 8.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
      { x: 8.0, y: 139.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
      { x: 203.0, y: 139.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
    ],
    cutouts: [],
  },
  "pelican-1200-faceplate": {
    id: "pelican-1200-faceplate",
    name: "Pelican 1200 Bezel Faceplate (241x184mm)",
    category: "CASE",
    width: 241.0,
    height: 184.0,
    cornerRadii: 12.0,
    holes: [
      { x: 9.0, y: 9.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
      { x: 232.0, y: 9.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
      { x: 9.0, y: 175.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
      { x: 232.0, y: 175.0, diameter: 3.5, threadType: "M3.5 Bezel Screw" },
    ],
    cutouts: [],
  },
  "custom-3d-printed-clamshell-case": {
    id: "custom-3d-printed-clamshell-case",
    name: "3D-Printed Clamshell Baseplate (200x130mm)",
    category: "CASE",
    width: 200.0,
    height: 130.0,
    cornerRadii: 8.0,
    holes: [
      { x: 6.0, y: 6.0, diameter: 3.0, threadType: "M3" },
      { x: 194.0, y: 6.0, diameter: 3.0, threadType: "M3" },
      { x: 6.0, y: 124.0, diameter: 3.0, threadType: "M3" },
      { x: 194.0, y: 124.0, diameter: 3.0, threadType: "M3" },
    ],
    cutouts: [],
  },
  "tactical-armored-gauntlet-enclosure": {
    id: "tactical-armored-gauntlet-enclosure",
    name: "Tactical Forearm Gauntlet Rail (180x95mm)",
    category: "CASE",
    width: 180.0,
    height: 95.0,
    cornerRadii: 6.0,
    holes: [
      { x: 5.0, y: 5.0, diameter: 3.0, threadType: "M3" },
      { x: 175.0, y: 5.0, diameter: 3.0, threadType: "M3" },
      { x: 5.0, y: 90.0, diameter: 3.0, threadType: "M3" },
      { x: 175.0, y: 90.0, diameter: 3.0, threadType: "M3" },
    ],
    cutouts: [],
  },
};

function rotatePoint(x: number, y: number, w: number, h: number, rot: 0 | 90 | 180 | 270): { x: number; y: number } {
  if (rot === 90) return { x: h - y, y: x };
  if (rot === 180) return { x: w - x, y: h - y };
  if (rot === 270) return { x: y, y: w - x };
  return { x, y };
}

export function getComponentEffectiveDimensions(spec: CadComponentSpec, rot: 0 | 90 | 180 | 270): { width: number; height: number } {
  if (rot === 90 || rot === 270) {
    return { width: spec.height, height: spec.width };
  }
  return { width: spec.width, height: spec.height };
}

export function detectCollisions(placed: PlacedComponent[]): Array<[string, string]> {
  const collisions: Array<[string, string]> = [];
  for (let i = 0; i < placed.length; i++) {
    const a = placed[i];
    const specA = HARDWARE_CAD_SPECS[a.componentId];
    if (!specA) continue;
    const dimA = getComponentEffectiveDimensions(specA, a.rotation);

    for (let j = i + 1; j < placed.length; j++) {
      const b = placed[j];
      const specB = HARDWARE_CAD_SPECS[b.componentId];
      if (!specB) continue;
      const dimB = getComponentEffectiveDimensions(specB, b.rotation);

      const overlap =
        a.x < b.x + dimB.width &&
        a.x + dimA.width > b.x &&
        a.y < b.y + dimB.height &&
        a.y + dimA.height > b.y;

      if (overlap) {
        collisions.push([a.instanceId, b.instanceId]);
      }
    }
  }
  return collisions;
}

/**
 * Fastener & Assembly Hardware Calculator
 */
export function calculateFastenerList(faceplate: FaceplateConfig): FastenerRequirement[] {
  const requirements: Record<string, FastenerRequirement> = {};

  const add = (type: string, qty: number, purpose: string) => {
    if (!requirements[type]) {
      requirements[type] = { type, quantity: 0, purpose };
    }
    requirements[type].quantity += qty;
  };

  // Faceplate mounting screws
  add("M3.5 x 12mm Countersunk Bezel Screws", faceplate.mountingHoles.length, "Faceplate to chassis mounting");

  for (const placed of faceplate.placedComponents) {
    const spec = HARDWARE_CAD_SPECS[placed.componentId];
    if (!spec) continue;

    const count = spec.holes.length;
    if (count === 0) continue;

    const thread = spec.holes[0].threadType;
    if (thread.includes("M2.5")) {
      add("M2.5 x 10mm Brass Female/Female Standoffs", count, `${spec.name} standoff elevation`);
      add("M2.5 x 6mm Pan Head Screws", count * 2, `${spec.name} top and bottom fastener`);
      add("M2.5 Hex Locknuts", count, `${spec.name} PCB retaining nuts`);
    } else if (thread.includes("M3")) {
      add("M3 x 12mm Brass Female/Female Standoffs", count, `${spec.name} standoff elevation`);
      add("M3 x 6mm Socket Cap Screws", count * 2, `${spec.name} fasteners`);
      add("M3 Nylon Locknuts", count, `${spec.name} nuts`);
    } else if (thread.includes("M2")) {
      add("M2 x 8mm Brass Standoffs", count, `${spec.name} mounting`);
      add("M2 x 4mm Button Head Screws", count * 2, `${spec.name} screws`);
    }
  }

  return Object.values(requirements);
}

/**
 * Calculates physical faceplate volume, surface area, and mass in grams
 */
export function calculatePlatePhysicalProperties(
  faceplate: FaceplateConfig,
  materialId: string
): { grossAreaCm2: number; cutoutAreaCm2: number; netAreaCm2: number; weightGrams: number; weightOz: number; material: CadMaterial } {
  const material = CAD_MATERIALS[materialId] || CAD_MATERIALS["acrylic-3mm"];

  const grossAreaCm2 = (faceplate.plateWidth * faceplate.plateHeight) / 100;

  let cutoutAreaCm2 = 0;
  for (const placed of faceplate.placedComponents) {
    const spec = HARDWARE_CAD_SPECS[placed.componentId];
    if (!spec) continue;
    for (const c of spec.cutouts) {
      cutoutAreaCm2 += (c.width * c.height) / 100;
    }
    for (const h of spec.holes) {
      cutoutAreaCm2 += (Math.PI * Math.pow(h.diameter / 2, 2)) / 100;
    }
  }

  for (const h of faceplate.mountingHoles) {
    cutoutAreaCm2 += (Math.PI * Math.pow(h.diameter / 2, 2)) / 100;
  }

  const netAreaCm2 = Math.max(1, grossAreaCm2 - cutoutAreaCm2);
  const thicknessCm = material.thicknessMm / 10;
  const volumeCm3 = netAreaCm2 * thicknessCm;
  const weightGrams = Number((volumeCm3 * material.densityGPerCm3).toFixed(1));
  const weightOz = Number((weightGrams * 0.035274).toFixed(2));

  return {
    grossAreaCm2: Number(grossAreaCm2.toFixed(1)),
    cutoutAreaCm2: Number(cutoutAreaCm2.toFixed(1)),
    netAreaCm2: Number(netAreaCm2.toFixed(1)),
    weightGrams,
    weightOz,
    material,
  };
}

/**
 * Cable Harness & Interlink Length Calculator
 */
export function calculateCableHarnesses(placed: PlacedComponent[]): CableHarnessRequirement[] {
  const sbc = placed.find((p) => HARDWARE_CAD_SPECS[p.componentId]?.category === "SBC");
  const display = placed.find((p) => HARDWARE_CAD_SPECS[p.componentId]?.category === "DISPLAY");
  const keyboard = placed.find((p) => HARDWARE_CAD_SPECS[p.componentId]?.category === "KEYBOARD");
  const antenna = placed.find((p) => p.componentId === "sma-antenna-bulkhead");
  const usbPort = placed.find((p) => p.componentId === "usb-c-panel-mount");

  const harnesses: CableHarnessRequirement[] = [];

  if (sbc && display) {
    const sbcSpec = HARDWARE_CAD_SPECS[sbc.componentId];
    const dispSpec = HARDWARE_CAD_SPECS[display.componentId];
    const dx = Math.abs(sbc.x + sbcSpec.width / 2 - (display.x + dispSpec.width / 2));
    const dy = Math.abs(sbc.y + sbcSpec.height / 2 - (display.y + dispSpec.height / 2));
    const straightDist = Math.round(Math.sqrt(dx * dx + dy * dy));
    const recommendedCm = Math.max(10, Math.ceil((straightDist + 40) / 50) * 5); // Add bend radius slack

    const isDsi = dispSpec.id.includes("dsi") || dispSpec.id.includes("touch");
    harnesses.push({
      id: "cable-display",
      fromName: sbcSpec.name,
      toName: dispSpec.name,
      cableType: isDsi ? "DSI FFC Ribbon" : "Micro-HDMI to HDMI",
      straightDistanceMm: straightDist,
      recommendedLengthCm: recommendedCm,
    });
  }

  if (sbc && keyboard) {
    const sbcSpec = HARDWARE_CAD_SPECS[sbc.componentId];
    const kbSpec = HARDWARE_CAD_SPECS[keyboard.componentId];
    const dx = Math.abs(sbc.x - keyboard.x);
    const dy = Math.abs(sbc.y - keyboard.y);
    const straightDist = Math.round(Math.sqrt(dx * dx + dy * dy));
    const recommendedCm = Math.max(8, Math.ceil((straightDist + 35) / 50) * 5);

    harnesses.push({
      id: "cable-keyboard",
      fromName: sbcSpec.name,
      toName: kbSpec.name,
      cableType: "I2C 4-Pin Wire",
      straightDistanceMm: straightDist,
      recommendedLengthCm: recommendedCm,
    });
  }

  if (sbc && antenna) {
    const sbcSpec = HARDWARE_CAD_SPECS[sbc.componentId];
    const dx = Math.abs(sbc.x - antenna.x);
    const dy = Math.abs(sbc.y - antenna.y);
    const straightDist = Math.round(Math.sqrt(dx * dx + dy * dy));
    const recommendedCm = Math.max(10, Math.ceil((straightDist + 30) / 50) * 5);

    harnesses.push({
      id: "cable-antenna",
      fromName: `${sbcSpec.name} (u.FL Header)`,
      toName: "SMA Antenna Bulkhead",
      cableType: "SMA Coax Pigtail",
      straightDistanceMm: straightDist,
      recommendedLengthCm: recommendedCm,
    });
  }

  if (sbc && usbPort) {
    const sbcSpec = HARDWARE_CAD_SPECS[sbc.componentId];
    const dx = Math.abs(sbc.x - usbPort.x);
    const dy = Math.abs(sbc.y - usbPort.y);
    const straightDist = Math.round(Math.sqrt(dx * dx + dy * dy));
    const recommendedCm = Math.max(10, Math.ceil((straightDist + 30) / 50) * 5);

    harnesses.push({
      id: "cable-usbc",
      fromName: `${sbcSpec.name} (USB-C Header)`,
      toName: "USB-C Bulkhead",
      cableType: "USB-C Ribbon",
      straightDistanceMm: straightDist,
      recommendedLengthCm: recommendedCm,
    });
  }

  return harnesses;
}

/**
 * Generates an AutoCAD R12 ASCII DXF vector file with millimeter units
 */
export function generateDxf(faceplate: FaceplateConfig): string {
  const lines: string[] = [
    "0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1009", "9", "$INSUNITS", "70", "4", "0", "ENDSEC",
    "0", "SECTION", "2", "ENTITIES",
  ];

  const addLine = (x1: number, y1: number, x2: number, y2: number, layer: string) => {
    lines.push("0", "LINE", "8", layer, "10", x1.toFixed(3), "20", (-y1).toFixed(3), "30", "0.0", "11", x2.toFixed(3), "21", (-y2).toFixed(3), "31", "0.0");
  };

  const addRect = (x: number, y: number, w: number, h: number, layer: string) => {
    addLine(x, y, x + w, y, layer);
    addLine(x + w, y, x + w, y + h, layer);
    addLine(x + w, y + h, x, y + h, layer);
    addLine(x, y + h, x, y, layer);
  };

  const addCircle = (cx: number, cy: number, r: number, layer: string) => {
    lines.push("0", "CIRCLE", "8", layer, "10", cx.toFixed(3), "20", (-cy).toFixed(3), "30", "0.0", "40", r.toFixed(3));
  };

  addRect(0, 0, faceplate.plateWidth, faceplate.plateHeight, "OUTLINE_CUT");

  for (const hole of faceplate.mountingHoles) {
    addCircle(hole.x, hole.y, hole.diameter / 2, "DRILL_HOLES");
  }

  for (const placed of faceplate.placedComponents) {
    const spec = HARDWARE_CAD_SPECS[placed.componentId];
    if (!spec) continue;

    for (const h of spec.holes) {
      const p = rotatePoint(h.x, h.y, spec.width, spec.height, placed.rotation);
      addCircle(placed.x + p.x, placed.y + p.y, h.diameter / 2, "DRILL_HOLES");
    }

    for (const c of spec.cutouts) {
      const p = rotatePoint(c.x, c.y, spec.width, spec.height, placed.rotation);
      const cw = placed.rotation === 90 || placed.rotation === 270 ? c.height : c.width;
      const ch = placed.rotation === 90 || placed.rotation === 270 ? c.width : c.height;
      addRect(placed.x + p.x, placed.y + p.y, cw, ch, "INTERIOR_CUTOUT");
    }
  }

  lines.push("0", "ENDSEC", "0", "EOF");
  return lines.join("\n");
}

/**
 * Generates CNC Milling G-Code
 */
export function generateGCode(faceplate: FaceplateConfig): string {
  const gcode: string[] = [
    "; ================================================================",
    "; DECKSMITH AUTOGENERATED CNC MILLING G-CODE",
    `; Faceplate: ${faceplate.plateWidth}x${faceplate.plateHeight}mm`,
    `; Generated: ${new Date().toISOString()}`,
    "; ================================================================",
    "G21 ; Set units to millimeters",
    "G90 ; Absolute positioning",
    "G17 ; XY Plane",
    "G00 Z5.000 F800 ; Retract to safe height",
    "M03 S12000 ; Start spindle at 12,000 RPM",
    "G04 P2 ; Dwell 2 seconds for spindle spinup",
    "",
    "; --- PHASE 1: DRILL MOUNTING HOLES ---",
  ];

  for (const h of faceplate.mountingHoles) {
    gcode.push(`G00 X${h.x.toFixed(3)} Y${h.y.toFixed(3)} ; Rapid to hole`);
    gcode.push(`G01 Z-3.500 F150 ; Plunge drill hole`);
    gcode.push(`G00 Z3.000 F800 ; Retract`);
  }

  for (const placed of faceplate.placedComponents) {
    const spec = HARDWARE_CAD_SPECS[placed.componentId];
    if (!spec) continue;
    for (const h of spec.holes) {
      const p = rotatePoint(h.x, h.y, spec.width, spec.height, placed.rotation);
      gcode.push(`G00 X${(placed.x + p.x).toFixed(3)} Y${(placed.y + p.y).toFixed(3)} ; ${spec.name} standoff`);
      gcode.push(`G01 Z-3.500 F150 ; Drill`);
      gcode.push(`G00 Z3.000 F800 ; Retract`);
    }
  }

  gcode.push(
    "",
    "; --- PHASE 2: MILL PERIMETER OUTLINE ---",
    "G00 X0.000 Y0.000",
    "G01 Z-3.200 F300",
    `G01 X${faceplate.plateWidth.toFixed(3)} Y0.000 F600`,
    `G01 X${faceplate.plateWidth.toFixed(3)} Y${faceplate.plateHeight.toFixed(3)}`,
    `G01 X0.000 Y${faceplate.plateHeight.toFixed(3)}`,
    "G01 X0.000 Y0.000",
    "G00 Z15.000 ; Retract to toolchange clearance",
    "M05 ; Stop spindle",
    "G00 X0 Y0 ; Return home",
    "M30 ; End of program"
  );

  return gcode.join("\n");
}

/**
 * Generates OpenSCAD parametric script
 */
export function generateOpenScad(faceplate: FaceplateConfig): string {
  return `// ================================================================
// DECKSMITH AUTOGENERATED OPENSCAD FACEPLATE & BEZEL SCRIPT
// Units: Millimeters (mm)
// Generated: ${new Date().toISOString()}
// ================================================================

$fn = 60;

plate_width = ${faceplate.plateWidth};
plate_height = ${faceplate.plateHeight};
plate_thickness = 3.0;
corner_radius = ${faceplate.plateCornerRadius};

module rounded_box(w, h, t, r) {
    linear_extrude(height = t) {
        hull() {
            translate([r, r, 0]) circle(r = r);
            translate([w - r, r, 0]) circle(r = r);
            translate([r, h - r, 0]) circle(r = r);
            translate([w - r, h - r, 0]) circle(r = r);
        }
    }
}

module faceplate() {
    difference() {
        rounded_box(plate_width, plate_height, plate_thickness, corner_radius);

        ${faceplate.mountingHoles
          .map((h) => `translate([${h.x}, ${h.y}, -1]) cylinder(h = plate_thickness + 2, d = ${h.diameter});`)
          .join("\n        ")}

        ${faceplate.placedComponents
          .map((placed) => {
            const spec = HARDWARE_CAD_SPECS[placed.componentId];
            if (!spec) return "";
            const holes = spec.holes
              .map((h) => {
                const p = rotatePoint(h.x, h.y, spec.width, spec.height, placed.rotation);
                return `translate([${placed.x + p.x}, ${placed.y + p.y}, -1]) cylinder(h = plate_thickness + 2, d = ${h.diameter});`;
              })
              .join("\n        ");
            const cutouts = spec.cutouts
              .map((c) => {
                const p = rotatePoint(c.x, c.y, spec.width, spec.height, placed.rotation);
                const cw = placed.rotation === 90 || placed.rotation === 270 ? c.height : c.width;
                const ch = placed.rotation === 90 || placed.rotation === 270 ? c.width : c.height;
                return `translate([${placed.x + p.x}, ${placed.y + p.y}, -1]) cube([${cw}, ${ch}, plate_thickness + 2]);`;
              })
              .join("\n        ");
            return `// ${spec.name}\n        ${holes}\n        ${cutouts}`;
          })
          .join("\n\n        ")}
    }
}

color([0.15, 0.15, 0.18, 0.9]) faceplate();
`;
}

/**
 * 3D STL ASCII Mesh Generator for Direct 3D Printing & Slicing
 */
export function generateStl(faceplate: FaceplateConfig, thicknessMm: number = 3.0): string {
  const stl: string[] = [
    `solid decksmith_${faceplate.chassisId}`,
  ];

  const w = faceplate.plateWidth;
  const h = faceplate.plateHeight;
  const t = thicknessMm;

  // Function to add a normal and 3 vertices
  const addFacet = (
    nx: number, ny: number, nz: number,
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number]
  ) => {
    stl.push(
      `  facet normal ${nx.toFixed(4)} ${ny.toFixed(4)} ${nz.toFixed(4)}`,
      "    outer loop",
      `      vertex ${v1[0].toFixed(3)} ${v1[1].toFixed(3)} ${v1[2].toFixed(3)}`,
      `      vertex ${v2[0].toFixed(3)} ${v2[1].toFixed(3)} ${v2[2].toFixed(3)}`,
      `      vertex ${v3[0].toFixed(3)} ${v3[1].toFixed(3)} ${v3[2].toFixed(3)}`,
      "    endloop",
      "  endfacet"
    );
  };

  // Top Surface (Z = t)
  addFacet(0, 0, 1, [0, 0, t], [w, 0, t], [w, h, t]);
  addFacet(0, 0, 1, [0, 0, t], [w, h, t], [0, h, t]);

  // Bottom Surface (Z = 0)
  addFacet(0, 0, -1, [0, 0, 0], [0, h, 0], [w, h, 0]);
  addFacet(0, 0, -1, [0, 0, 0], [w, h, 0], [w, 0, 0]);

  // North Side Wall (Y = h)
  addFacet(0, 1, 0, [0, h, 0], [0, h, t], [w, h, t]);
  addFacet(0, 1, 0, [0, h, 0], [w, h, t], [w, h, 0]);

  // South Side Wall (Y = 0)
  addFacet(0, -1, 0, [0, 0, 0], [w, 0, 0], [w, 0, t]);
  addFacet(0, -1, 0, [0, 0, 0], [w, 0, t], [0, 0, t]);

  // East Side Wall (X = w)
  addFacet(1, 0, 0, [w, 0, 0], [w, h, 0], [w, h, t]);
  addFacet(1, 0, 0, [w, 0, 0], [w, h, t], [w, 0, t]);

  // West Side Wall (X = 0)
  addFacet(-1, 0, 0, [0, 0, 0], [0, 0, t], [0, h, t]);
  addFacet(-1, 0, 0, [0, 0, 0], [0, h, t], [0, h, 0]);

  stl.push(`endsolid decksmith_${faceplate.chassisId}`);
  return stl.join("\n");
}

export interface BoxPanel {
  name: string;
  width: number;
  height: number;
  thickness: number;
  tabCount: number;
}

/**
 * Laser-Cut Finger-Joint Box Enclosure Generator
 */
export function generateBoxJointEnclosure(
  plateWidth: number,
  plateHeight: number,
  boxDepthMm: number = 45.0,
  materialThicknessMm: number = 3.0
): BoxPanel[] {
  return [
    { name: "Top Bezel / Faceplate", width: plateWidth, height: plateHeight, thickness: materialThicknessMm, tabCount: 6 },
    { name: "Bottom Base Plate", width: plateWidth, height: plateHeight, thickness: materialThicknessMm, tabCount: 6 },
    { name: "Front Wall", width: plateWidth, height: boxDepthMm, thickness: materialThicknessMm, tabCount: 4 },
    { name: "Rear I/O Wall", width: plateWidth, height: boxDepthMm, thickness: materialThicknessMm, tabCount: 4 },
    { name: "Left Side Wall", width: plateHeight, height: boxDepthMm, thickness: materialThicknessMm, tabCount: 3 },
    { name: "Right Side Wall", width: plateHeight, height: boxDepthMm, thickness: materialThicknessMm, tabCount: 3 },
  ];
}
