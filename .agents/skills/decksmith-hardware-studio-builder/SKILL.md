---
name: decksmith-hardware-studio-builder
description: >-
  Build, scaffold, or update interactive Cyberdeck Hardware Studios in Decksmith.
  Use when creating hardware calculators, WebSerial UART tools, 3D STL viewers,
  KiCad Gerber PCB inspectors, QMK/ZMK keyboard matrix configurators, or SDR spectrum visualizers.
---

# Decksmith Hardware Studio Builder

This skill provides step-by-step instructions for creating and integrating interactive engineering studios into Decksmith (`apps/web`).

---

## 1. Studio File Location & Naming

All studio components live in `apps/web/src/pages/` and follow the pattern `<FeatureName>Studio.tsx` (e.g. `ThermalCoolingStudio.tsx`, `PcbViewerStudio.tsx`).

### Studio Template Structure

```tsx
import React, { useState } from "react";
import { Cpu, Terminal, AlertTriangle, Play, Save } from "lucide-react";

export default function CustomStudio() {
  const [activeTab, setActiveTab] = useState<"config" | "telemetry" | "export">("config");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Custom Hardware Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure parameters, run physical calculations, or stream real-time telemetry.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Parameters
          </h2>
          {/* Inputs go here */}
        </div>

        {/* Visualizer / Output Panel */}
        <div className="lg:col-span-2 bg-slate-950 border border-cyan-500/30 rounded-xl p-5 relative overflow-hidden">
          <h2 className="text-sm font-semibold text-cyan-400 mb-4">
            Interactive Output / Telemetry
          </h2>
          {/* Visualizer / Canvas goes here */}
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Registering Routes & Navigation

When adding a new Studio:
1. Export the component from `apps/web/src/pages/<StudioName>.tsx`.
2. Add route entries in `apps/web/src/App.tsx`:
   ```tsx
   import MyNewStudio from "./pages/MyNewStudio";
   // ...
   <Route path="my-studio" element={<MyNewStudio />} />
   ```
3. Add a sidebar navigation entry in `apps/web/src/components/Layout.tsx` under the appropriate category.

---

## 3. Hardware API Integration Checklist

- **WebSerial (UART)**: Check `if ("serial" in navigator)` before attempting connection. Handle baud rates (default: `115200`).
- **WebUSB**: Request devices with `navigator.usb.requestDevice({ filters: [...] })`.
- **Canvas / WebGL**: Maintain an explicit animation frame loop (`requestAnimationFrame`) and cancel it inside the `useEffect` cleanup return.
