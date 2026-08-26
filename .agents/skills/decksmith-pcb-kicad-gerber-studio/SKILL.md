---
name: decksmith-pcb-kicad-gerber-studio
description: >-
  Develop or modify Gerber PCB inspectors, KiCad file parsers, and PCB layout visualizers in Decksmith.
  Use when enhancing PcbViewerStudio, AirgapSurvivalStudio, Gerber canvas rendering, or BOM extraction.
---

# Decksmith PCB & Gerber Studio Guide

This skill guides the construction of KiCad PCB and Gerber inspection tools in `apps/web/src/pages/PcbViewerStudio.tsx`.

---

## 1. Gerber Layer Standards

Decksmith supports rendering standard RS-274X Gerber layers on HTML5 Canvas:

| Extension | Layer Name | Color Code | Description |
| :--- | :--- | :--- | :--- |
| `.gtl` / `.gcu` | Top Copper (F_Cu) | `#ef4444` (Red) | Top side PCB copper traces & pads |
| `.gbl` | Bottom Copper (B_Cu) | `#3b82f6` (Blue) | Bottom side PCB copper traces |
| `.gto` | Top Silkscreen (F_SilkS) | `#f8fafc` (White) | Component labels, text, outlines |
| `.gml` / `.gko` | Edge Cuts (Board Outline)| `#eab308` (Yellow) | Physical PCB border dimensions |

---

## 2. Canvas Gerber Rendering Pattern

```tsx
export function GerberCanvas({ gerberData, layerColor }: { gerberData: string; layerColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = "rgba(6, 182, 212, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Render parsed Gerber vectors
    ctx.strokeStyle = layerColor;
    ctx.lineWidth = 2;
    // Parsing logic iterates over X/Y coordinates
  }, [gerberData, layerColor]);

  return <canvas ref={canvasRef} width={800} height={600} className="w-full h-auto rounded-lg border border-slate-800" />;
}
```
