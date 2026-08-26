import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Layers,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  DollarSign,
  Maximize2,
  FileCode,
  Zap,
  Tag,
  Radio,
  Check,
  Activity,
  Crosshair,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface PcbLayer {
  id: string;
  name: string;
  extension: string;
  color: string;
  visible: boolean;
  opacity: number;
}

interface TraceItem {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  layer: "f_cu" | "b_cu";
  net?: string;
}

interface PcbPreset {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  layerCount: number;
  description: string;
  specs: {
    widthMm: number;
    heightMm: number;
    minTraceMm: number;
    minViaMm: number;
    copperWeight: string;
    surfaceFinish: string;
  };
  traces: TraceItem[];
  pads: Array<{ x: number; y: number; w: number; h: number; type: "smd" | "thru" | "bga"; label?: string; net?: string }>;
  vias: Array<{ x: number; y: number; r: number; net?: string }>;
  silk: Array<{ text: string; x: number; y: number; size: number }>;
}

const PCB_PRESETS: PcbPreset[] = [
  {
    id: "cm4-carrier",
    name: "CM4 / Pi 5 Dual-NVMe Cyberdeck Carrier Motherboard",
    category: "Mainboard",
    dimensions: "85mm x 56mm",
    layerCount: 4,
    description: "4-layer high-speed carrier board with PCIe M.2 M-Key NVMe SSD slot, dual USB-C PD power sink, 40-pin GPIO header, and I2S MAX98357A audio amplifier.",
    specs: {
      widthMm: 85,
      heightMm: 56,
      minTraceMm: 0.15,
      minViaMm: 0.3,
      copperWeight: "1 oz (35µm)",
      surfaceFinish: "ENIG (Electroless Nickel Immersion Gold)",
    },
    traces: [
      // 40-pin GPIO bus traces
      { x1: 40, y1: 40, x2: 240, y2: 40, width: 2, layer: "f_cu", net: "GPIO_BUS" },
      { x1: 40, y1: 55, x2: 240, y2: 55, width: 2, layer: "f_cu", net: "GPIO_BUS" },
      { x1: 40, y1: 70, x2: 200, y2: 70, width: 2, layer: "f_cu", net: "GPIO_BUS" },
      { x1: 200, y1: 70, x2: 260, y2: 130, width: 2, layer: "f_cu", net: "GPIO_BUS" },
      // PCIe high speed differential pairs
      { x1: 180, y1: 180, x2: 380, y2: 180, width: 3, layer: "f_cu", net: "PCIE_TX_P" },
      { x1: 180, y1: 188, x2: 380, y2: 188, width: 3, layer: "f_cu", net: "PCIE_TX_N" },
      { x1: 180, y1: 200, x2: 380, y2: 200, width: 3, layer: "b_cu", net: "PCIE_RX_P" },
      { x1: 180, y1: 208, x2: 380, y2: 208, width: 3, layer: "b_cu", net: "PCIE_RX_N" },
      // USB-C Power Bus
      { x1: 40, y1: 280, x2: 160, y2: 280, width: 6, layer: "f_cu", net: "VBUS_20V" },
      { x1: 160, y1: 280, x2: 220, y2: 220, width: 6, layer: "f_cu", net: "VBUS_20V" },
      // I2S Audio Traces
      { x1: 320, y1: 60, x2: 440, y2: 60, width: 2, layer: "b_cu", net: "I2S_AUDIO" },
      { x1: 320, y1: 75, x2: 440, y2: 75, width: 2, layer: "b_cu", net: "I2S_AUDIO" },
      { x1: 320, y1: 90, x2: 440, y2: 90, width: 2, layer: "b_cu", net: "I2S_AUDIO" },
    ],
    pads: [
      // 40-pin Header dual row
      ...Array.from({ length: 20 }).map((_, i) => ({ x: 50 + i * 10, y: 40, w: 6, h: 6, type: "thru" as const, net: "GPIO_BUS" })),
      ...Array.from({ length: 20 }).map((_, i) => ({ x: 50 + i * 10, y: 55, w: 6, h: 6, type: "thru" as const, net: "GPIO_BUS" })),
      // Hirose DF40 CM4 Connector Footprints
      ...Array.from({ length: 25 }).map((_, i) => ({ x: 120 + i * 8, y: 140, w: 4, h: 10, type: "smd" as const })),
      ...Array.from({ length: 25 }).map((_, i) => ({ x: 120 + i * 8, y: 220, w: 4, h: 10, type: "smd" as const })),
      // M.2 NVMe Key-M Connector
      ...Array.from({ length: 18 }).map((_, i) => ({ x: 380 + (i % 2) * 6, y: 160 + i * 6, w: 4, h: 4, type: "smd" as const, net: "PCIE_TX_P" })),
      // USB-C Receptacle 16-pin SMT
      ...Array.from({ length: 8 }).map((_, i) => ({ x: 30, y: 260 + i * 6, w: 8, h: 3, type: "smd" as const, net: "VBUS_20V" })),
      // MAX98357A I2S DAC Amp IC (QFN-16)
      ...Array.from({ length: 4 }).map((_, i) => ({ x: 440 + i * 6, y: 50, w: 3, h: 8, type: "smd" as const, net: "I2S_AUDIO" })),
      ...Array.from({ length: 4 }).map((_, i) => ({ x: 440 + i * 6, y: 80, w: 3, h: 8, type: "smd" as const, net: "I2S_AUDIO" })),
    ],
    vias: [
      { x: 160, y: 70, r: 3, net: "GPIO_BUS" },
      { x: 260, y: 130, r: 3, net: "GPIO_BUS" },
      { x: 320, y: 60, r: 3, net: "I2S_AUDIO" },
      { x: 320, y: 75, r: 3, net: "I2S_AUDIO" },
      { x: 320, y: 90, r: 3, net: "I2S_AUDIO" },
      { x: 160, y: 280, r: 4, net: "VBUS_20V" },
      { x: 220, y: 220, r: 4, net: "VBUS_20V" },
      // Mounting holes
      { x: 30, y: 30, r: 8 },
      { x: 480, y: 30, r: 8 },
      { x: 30, y: 310, r: 8 },
      { x: 480, y: 310, r: 8 },
    ],
    silk: [
      { text: "DECKSMITH CM4 CARRIER v2.4", x: 120, y: 28, size: 12 },
      { text: "40-PIN GPIO HEADER (3.3V LV)", x: 60, y: 75, size: 9 },
      { text: "PCIE M.2 NVMe SSD (GEN 3)", x: 240, y: 195, size: 10 },
      { text: "USB-PD 20V 5A SINK", x: 45, y: 305, size: 9 },
      { text: "I2S AUDIO DAC", x: 390, y: 105, size: 9 },
    ],
  },
  {
    id: "sofle-keyboard",
    name: "Sofle v2 Ortholinear Split Mechanical Keyboard PCB",
    category: "Input",
    dimensions: "120mm x 105mm",
    layerCount: 2,
    description: "2-layer low-profile mechanical keyboard half with Kailh Choc V1 hot-swap footprints, EC11 rotary encoder, SSD1306 128x32 OLED, and TRRS serial sync.",
    specs: {
      widthMm: 120,
      heightMm: 105,
      minTraceMm: 0.2,
      minViaMm: 0.4,
      copperWeight: "1 oz",
      surfaceFinish: "HASL Lead-Free",
    },
    traces: [
      // Key switch matrix rows
      { x1: 50, y1: 80, x2: 440, y2: 80, width: 2.5, layer: "f_cu", net: "ROW_BUS" },
      { x1: 50, y1: 140, x2: 440, y2: 140, width: 2.5, layer: "f_cu", net: "ROW_BUS" },
      { x1: 50, y1: 200, x2: 440, y2: 200, width: 2.5, layer: "f_cu", net: "ROW_BUS" },
      { x1: 50, y1: 260, x2: 380, y2: 260, width: 2.5, layer: "f_cu", net: "ROW_BUS" },
      // Key switch matrix cols
      { x1: 80, y1: 60, x2: 80, y2: 280, width: 2.5, layer: "b_cu", net: "COL_BUS" },
      { x1: 150, y1: 60, x2: 150, y2: 280, width: 2.5, layer: "b_cu", net: "COL_BUS" },
      { x1: 220, y1: 60, x2: 220, y2: 280, width: 2.5, layer: "b_cu", net: "COL_BUS" },
      { x1: 290, y1: 60, x2: 290, y2: 280, width: 2.5, layer: "b_cu", net: "COL_BUS" },
      { x1: 360, y1: 60, x2: 360, y2: 280, width: 2.5, layer: "b_cu", net: "COL_BUS" },
    ],
    pads: [
      ...[80, 150, 220, 290, 360].flatMap((colX) =>
        [80, 140, 200, 260].map((rowY) => ({
          x: colX,
          y: rowY,
          w: 12,
          h: 12,
          type: "smd" as const,
          net: "ROW_BUS",
        }))
      ),
      ...Array.from({ length: 12 }).map((_, i) => ({ x: 420, y: 70 + i * 14, w: 6, h: 6, type: "thru" as const })),
      ...Array.from({ length: 12 }).map((_, i) => ({ x: 450, y: 70 + i * 14, w: 6, h: 6, type: "thru" as const })),
      ...Array.from({ length: 4 }).map((_, i) => ({ x: 470, y: 260 + i * 12, w: 7, h: 7, type: "thru" as const })),
    ],
    vias: [
      { x: 80, y: 80, r: 3, net: "ROW_BUS" },
      { x: 150, y: 140, r: 3, net: "ROW_BUS" },
      { x: 220, y: 200, r: 3, net: "ROW_BUS" },
      { x: 290, y: 260, r: 3, net: "ROW_BUS" },
      { x: 30, y: 30, r: 6 },
      { x: 480, y: 30, r: 6 },
      { x: 30, y: 300, r: 6 },
    ],
    silk: [
      { text: "SOFLE v2 SPLIT KEYBOARD (LEFT)", x: 80, y: 35, size: 12 },
      { text: "PRO MICRO / RP2040", x: 380, y: 55, size: 9 },
      { text: "TRRS BUS", x: 430, y: 315, size: 9 },
    ],
  },
  {
    id: "lora-sdr-transceiver",
    name: "Tactical SX1262 LoRa & MPPT Solar Transceiver PCB",
    category: "Wireless & Power",
    dimensions: "70mm x 45mm",
    layerCount: 2,
    description: "Compact 2-layer RF transceiver with Semtech SX1262 915MHz LoRa modem, 50Ω impedance matched coplanar waveguide, and CN3791 MPPT solar charger.",
    specs: {
      widthMm: 70,
      heightMm: 45,
      minTraceMm: 0.18,
      minViaMm: 0.35,
      copperWeight: "2 oz (High Current)",
      surfaceFinish: "ENIG Gold",
    },
    traces: [
      { x1: 300, y1: 170, x2: 450, y2: 170, width: 8, layer: "f_cu", net: "RF_50_OHM" },
      { x1: 50, y1: 80, x2: 200, y2: 80, width: 7, layer: "f_cu", net: "SOLAR_VBUS" },
      { x1: 200, y1: 80, x2: 200, y2: 240, width: 7, layer: "f_cu", net: "SOLAR_VBUS" },
      { x1: 80, y1: 140, x2: 240, y2: 140, width: 2, layer: "b_cu", net: "SPI_LORA" },
      { x1: 80, y1: 155, x2: 240, y2: 155, width: 2, layer: "b_cu", net: "SPI_LORA" },
      { x1: 80, y1: 170, x2: 240, y2: 170, width: 2, layer: "b_cu", net: "SPI_LORA" },
    ],
    pads: [
      ...Array.from({ length: 6 }).map((_, i) => ({ x: 250 + i * 5, y: 150, w: 3, h: 7, type: "smd" as const, net: "SPI_LORA" })),
      ...Array.from({ length: 6 }).map((_, i) => ({ x: 250 + i * 5, y: 185, w: 3, h: 7, type: "smd" as const, net: "RF_50_OHM" })),
      { x: 460, y: 170, w: 16, h: 8, type: "smd" as const, net: "RF_50_OHM" },
      { x: 460, y: 150, w: 16, h: 8, type: "smd" as const },
      { x: 460, y: 190, w: 16, h: 8, type: "smd" as const },
      { x: 50, y: 80, w: 8, h: 8, type: "thru" as const, net: "SOLAR_VBUS" },
      { x: 50, y: 95, w: 8, h: 8, type: "thru" as const, net: "SOLAR_VBUS" },
    ],
    vias: [
      ...Array.from({ length: 12 }).map((_, i) => ({ x: 320 + i * 10, y: 150, r: 2.5 })),
      ...Array.from({ length: 12 }).map((_, i) => ({ x: 320 + i * 10, y: 190, r: 2.5 })),
      { x: 30, y: 30, r: 7 },
      { x: 470, y: 30, r: 7 },
      { x: 30, y: 290, r: 7 },
      { x: 470, y: 290, r: 7 },
    ],
    silk: [
      { text: "SX1262 915MHz LORA + MPPT BMS", x: 70, y: 40, size: 12 },
      { text: "50-OHM RF COAX", x: 320, y: 135, size: 9 },
      { text: "SOLAR IN 6V-18V", x: 65, y: 115, size: 9 },
    ],
  },
];

const SOLDER_MASK_THEMES = [
  { id: "matte-black", name: "Matte Black", bg: "#101319", boardBorder: "#1e2638" },
  { id: "cyber-purple", name: "Cyberpunk Purple", bg: "#241038", boardBorder: "#5e2494" },
  { id: "classic-green", name: "Classic Green", bg: "#0d2b18", boardBorder: "#17522d" },
  { id: "osh-park", name: "OSH Park Royal Purple", bg: "#2a0d45", boardBorder: "#d4af37" },
  { id: "glacier-white", name: "Glacier White", bg: "#d0d7de", boardBorder: "#8c959f" },
];

export default function PcbViewerStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("cm4-carrier");
  const [zoom, setZoom] = useState<number>(100);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [maskTheme, setMaskTheme] = useState<string>("matte-black");
  const [highlightedNet, setHighlightedNet] = useState<string | null>(null);

  const [layers, setLayers] = useState<PcbLayer[]>([
    { id: "f_cu", name: "Top Copper (F.Cu)", extension: ".gtl", color: "#e63946", visible: true, opacity: 0.9 },
    { id: "b_cu", name: "Bottom Copper (B.Cu)", extension: ".gbl", color: "#3a86ff", visible: true, opacity: 0.8 },
    { id: "f_silk", name: "Top Silkscreen (F.SilkS)", extension: ".gto", color: "#ffffff", visible: true, opacity: 1.0 },
    { id: "pads", name: "SMD & Component Pads", extension: ".gts", color: "#d4af37", visible: true, opacity: 1.0 },
    { id: "drills", name: "Drills & Plated Vias", extension: ".drl", color: "#ffd166", visible: true, opacity: 1.0 },
    { id: "edge_cuts", name: "Edge Outline (Edge.Cuts)", extension: ".gko", color: "#00ff66", visible: true, opacity: 1.0 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePreset = PCB_PRESETS.find((p) => p.id === selectedPresetId) || PCB_PRESETS[0];

  const availableNets = Array.from(
    new Set(activePreset.traces.map((t) => t.net).filter(Boolean))
  ) as string[];

  const toggleLayerVisibility = (id: string) => {
    soundFx.playClick();
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  // Render Multi-Layer PCB to HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 480;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#07090e";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + panOffset.x, height / 2 + panOffset.y);
    const scale = zoom / 100;
    ctx.scale(scale, scale);

    const bx = -260;
    const by = -170;
    const bw = 520;
    const bh = 340;

    const themeObj = SOLDER_MASK_THEMES.find((t) => t.id === maskTheme) || SOLDER_MASK_THEMES[0];

    // 1. Draw Solder Mask Substrate
    ctx.fillStyle = themeObj.bg;
    ctx.strokeStyle = themeObj.boardBorder;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 16);
    ctx.fill();
    ctx.stroke();

    // 2. Draw Bottom Copper Layer (B.Cu)
    const bCuLayer = layers.find((l) => l.id === "b_cu");
    if (bCuLayer?.visible) {
      activePreset.traces
        .filter((t) => t.layer === "b_cu")
        .forEach((t) => {
          const isNetMatch = highlightedNet && t.net === highlightedNet;
          ctx.strokeStyle = isNetMatch ? "#00ff66" : bCuLayer.color;
          ctx.lineWidth = isNetMatch ? t.width + 3 : t.width;
          ctx.globalAlpha = isNetMatch ? 1.0 : bCuLayer.opacity;

          ctx.beginPath();
          ctx.moveTo(bx + t.x1, by + t.y1);
          ctx.lineTo(bx + t.x2, by + t.y2);
          ctx.stroke();
        });
      ctx.globalAlpha = 1.0;
    }

    // 3. Draw Top Copper Layer (F.Cu)
    const fCuLayer = layers.find((l) => l.id === "f_cu");
    if (fCuLayer?.visible) {
      activePreset.traces
        .filter((t) => t.layer === "f_cu")
        .forEach((t) => {
          const isNetMatch = highlightedNet && t.net === highlightedNet;
          ctx.strokeStyle = isNetMatch ? "#00ff66" : fCuLayer.color;
          ctx.lineWidth = isNetMatch ? t.width + 3 : t.width;
          ctx.globalAlpha = isNetMatch ? 1.0 : fCuLayer.opacity;

          ctx.beginPath();
          ctx.moveTo(bx + t.x1, by + t.y1);
          ctx.lineTo(bx + t.x2, by + t.y2);
          ctx.stroke();
        });
      ctx.globalAlpha = 1.0;
    }

    // 4. Draw SMD & Component Pads
    const padsLayer = layers.find((l) => l.id === "pads");
    if (padsLayer?.visible) {
      activePreset.pads.forEach((p) => {
        const isNetMatch = highlightedNet && p.net === highlightedNet;
        ctx.fillStyle = isNetMatch ? "#00ff66" : padsLayer.color;
        ctx.globalAlpha = padsLayer.opacity;

        if (p.type === "thru") {
          ctx.beginPath();
          ctx.arc(bx + p.x, by + p.y, (p.w / 2) * (isNetMatch ? 1.4 : 1.0), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(bx + p.x - p.w / 2, by + p.y - p.h / 2, p.w * (isNetMatch ? 1.3 : 1.0), p.h * (isNetMatch ? 1.3 : 1.0));
        }
      });
      ctx.globalAlpha = 1.0;
    }

    // 5. Draw Drills & Plated Through-Hole Vias
    const drillsLayer = layers.find((l) => l.id === "drills");
    if (drillsLayer?.visible) {
      activePreset.vias.forEach((v) => {
        const isNetMatch = highlightedNet && v.net === highlightedNet;
        ctx.fillStyle = isNetMatch ? "#00ff66" : drillsLayer.color;
        ctx.beginPath();
        ctx.arc(bx + v.x, by + v.y, v.r * (isNetMatch ? 1.4 : 1.0), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#07090e";
        ctx.beginPath();
        ctx.arc(bx + v.x, by + v.y, v.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 6. Draw Silkscreen Legends (F.SilkS)
    const silkLayer = layers.find((l) => l.id === "f_silk");
    if (silkLayer?.visible) {
      ctx.fillStyle = silkLayer.color;
      ctx.globalAlpha = silkLayer.opacity;
      activePreset.silk.forEach((s) => {
        ctx.font = `bold ${s.size}px monospace`;
        ctx.fillText(s.text, bx + s.x, by + s.y);
      });
      ctx.globalAlpha = 1.0;
    }

    // 7. Draw Edge Cuts (Board Outline)
    const edgeLayer = layers.find((l) => l.id === "edge_cuts");
    if (edgeLayer?.visible) {
      ctx.strokeStyle = edgeLayer.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 16);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [selectedPresetId, zoom, panOffset, layers, maskTheme, highlightedNet]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleExportGerberBundle = () => {
    soundFx.playConfirm();
    let text = `# Production Gerber RS-274X & Drill Fabrication Package\n`;
    text += `# Board: ${activePreset.name}\n`;
    text += `# Dimensions: ${activePreset.dimensions} | Layers: ${activePreset.layerCount}\n`;
    text += `# Surface Finish: ${activePreset.specs.surfaceFinish}\n`;
    text += `# Min Trace: ${activePreset.specs.minTraceMm}mm | Min Via: ${activePreset.specs.minViaMm}mm\n\n`;

    text += `G04 Layer Stackup Definition*\n`;
    text += `G04 Top Copper: ${activePreset.id}.gtl*\n`;
    text += `G04 Bottom Copper: ${activePreset.id}.gbl*\n`;
    text += `G04 Top Silk: ${activePreset.id}.gto*\n`;
    text += `G04 Top Mask: ${activePreset.id}.gts*\n`;
    text += `G04 Edge Cuts: ${activePreset.id}.gko*\n`;
    text += `G04 Excellon Drill: ${activePreset.id}.drl*\n`;
    text += `M02*\n`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePreset.id}-gerber-fab-package.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            In-Browser Gerber & KiCad PCB Layer Viewer
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Gerber & KiCad PCB Studio
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Multi-layer copper trace inspection, SMT component footprint verification, DRC design rules & Gerber export
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportGerberBundle}
            className="px-4 py-2.5 bg-neon-green text-black font-bold rounded-xl text-xs hover:bg-neon-green/90 transition-all flex items-center gap-2 shadow-lg shadow-neon-green/20"
          >
            <Download className="w-4 h-4" />
            Export Gerber Bundle (.zip)
          </button>
        </div>
      </div>

      {/* Preset Carrier Boards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PCB_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedPresetId(preset.id);
              setHighlightedNet(null);
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedPresetId === preset.id
                ? "bg-gray-900 border-neon-green shadow-lg shadow-neon-green/10"
                : "bg-gray-950/80 border-gray-800 hover:border-gray-700 opacity-70 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 text-cyan-300">
                  {preset.category}
                </span>
                <span className="text-[10px] text-gray-500">{preset.dimensions}</span>
              </div>
              <h3 className="text-xs font-bold text-white">{preset.name}</h3>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </div>
            <div className="mt-3 text-[10px] text-neon-green font-bold flex items-center gap-1">
              <span>{preset.layerCount}-Layer FR4 Stackup</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Grid: PCB Canvas (8 Cols) + Layer Stack & DRC Inspector (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PCB Canvas Area */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl h-[500px]">
            {/* HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />

            {/* Canvas Controls Overlay (Top Right) */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gray-900/90 border border-gray-800 rounded-2xl p-1.5 backdrop-blur-md z-10">
              <button
                onClick={() => setZoom((z) => Math.min(250, z + 20))}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold text-cyan-300 px-1">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 20))}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoom(100);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Solder Mask Theme Picker (Bottom Left) */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-gray-900/90 border border-gray-800 rounded-2xl p-2 backdrop-blur-md z-10">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Finish:</span>
              <div className="flex gap-1.5">
                {SOLDER_MASK_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      soundFx.playClick();
                      setMaskTheme(theme.id);
                    }}
                    style={{ backgroundColor: theme.bg, borderColor: theme.boardBorder }}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      maskTheme === theme.id ? "scale-125 shadow-md shadow-neon-green/40 ring-1 ring-neon-green" : ""
                    }`}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Netlist Trace Highlighting Bar */}
          {availableNets.length > 0 && (
            <div className="p-3 bg-gray-900/90 border border-gray-800 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs shadow-lg">
              <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0 flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5 text-neon-green" />
                Highlight Copper Net:
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setHighlightedNet(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 ${
                  highlightedNet === null ? "bg-gray-800 text-white" : "text-gray-500 hover:text-white"
                }`}
              >
                All Nets
              </button>
              {availableNets.map((net) => (
                <button
                  key={net}
                  onClick={() => {
                    soundFx.playConfirm();
                    setHighlightedNet(net);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 ${
                    highlightedNet === net
                      ? "bg-neon-green text-black shadow-sm"
                      : "bg-gray-950 border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  ⚡ {net}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layer Stack & DRC Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Layer Manager */}
          <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-3.5 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2.5">
              <Layers className="w-4 h-4 text-neon-green" />
              Gerber Layer Stack
            </h2>

            <div className="space-y-1.5">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-2.5 bg-gray-950/80 border border-gray-800/80 rounded-xl text-xs hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ backgroundColor: layer.color }}
                      className="w-3.5 h-3.5 rounded-full border border-gray-700 shrink-0"
                    />
                    <span className="text-gray-200 font-bold">{layer.name}</span>
                  </div>

                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {layer.visible ? <Eye className="w-4 h-4 text-neon-green" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Design Rule Check (DRC) & Manufacturing Metrics */}
          <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-3.5 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              DRC Manufacturing Specs
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Board Dimensions:</span>
                <span className="text-white font-bold">{activePreset.dimensions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Trace / Spacing:</span>
                <span className="text-neon-green font-bold">{activePreset.specs.minTraceMm}mm (6 mil)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Drill Hole / Via:</span>
                <span className="text-cyan-400 font-bold">{activePreset.specs.minViaMm}mm (12 mil)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Copper Weight:</span>
                <span className="text-white font-bold">{activePreset.specs.copperWeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Surface Finish:</span>
                <span className="text-yellow-400 font-bold">{activePreset.specs.surfaceFinish}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Est. Fab Cost (5 pcs):</span>
              <span className="text-neon-green font-black">$2.00 - $12.50 USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
