---
name: decksmith-diagnostics-logic-analyzer-studio
description: >-
  Develop or enhance field diagnostics, logic analyzer pulse sniffers, protocol decoders (I2C, SPI, UART, CAN bus), and OpenWrt router tools.
  Use when modifying FieldDiagnosticsStudio, LogicAnalyzerStudio, RouterStudio, or bus waveform canvas components.
---

# Decksmith Field Diagnostics & Logic Analyzer Studio Guide

This skill provides patterns for logic analyzer waveform decoders and network telemetry in `LogicAnalyzerStudio.tsx` and `FieldDiagnosticsStudio.tsx`.

---

## 1. Protocol Waveform Rendering on Canvas

Logic Analyzers render digital logic transitions (HIGH `1` / LOW `0`) over time:

```tsx
export function WaveformCanvas({ channels }: { channels: { name: string; pulses: number[] }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rowHeight = 60;
    channels.forEach((ch, idx) => {
      const yBase = idx * rowHeight + 40;
      
      // Label
      ctx.fillStyle = "#06b6d4"; // Cyan
      ctx.font = "12px monospace";
      ctx.fillText(ch.name, 10, yBase - 15);

      // Pulse line
      ctx.strokeStyle = "#22c65e"; // Green logic high
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let x = 60;
      ch.pulses.forEach((state) => {
        const yVal = state === 1 ? yBase - 25 : yBase;
        ctx.lineTo(x, yVal);
        x += 20;
        ctx.lineTo(x, yVal);
      });
      ctx.stroke();
    });
  }, [channels]);

  return <canvas ref={canvasRef} width={800} height={300} className="w-full h-64 rounded-lg border border-slate-800" />;
}
```

---

## 2. I2C Bus Address Scanner Decoder

When parsing I2C bus traffic (SDA / SCL lines):
- **Start Condition**: SDA goes LOW while SCL is HIGH.
- **Stop Condition**: SDA goes HIGH while SCL is HIGH.
- **ACK / NACK**: 9th clock pulse bit (`0` = ACK, `1` = NACK).
