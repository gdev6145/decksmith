import { useState, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Maximize2,
  Download,
  FileCode,
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  Crosshair,
  Printer,
  Check,
  Cpu,
  Monitor,
  Keyboard,
  Box,
  Move,
  Grid,
  Info,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Compass,
  RotateCw,
  AlignCenter,
  AlertTriangle,
  Radio,
  Plug,
  Wrench,
  Eye,
  Settings,
  Package,
  Weight,
  Cable,
  Upload,
  Boxes,
  Play,
  Pause,
} from "lucide-react";
import {
  HARDWARE_CAD_SPECS,
  CAD_MATERIALS,
  type CadComponentSpec,
  type FaceplateConfig,
  type PlacedComponent,
  generateDxf,
  generateOpenScad,
  generateGCode,
  generateStl,
  generateBoxJointEnclosure,
  calculateFastenerList,
  calculatePlatePhysicalProperties,
  calculateCableHarnesses,
  detectCollisions,
  getComponentEffectiveDimensions,
} from "../lib/cadEngine";
import { Cad3DViewer } from "../components/Cad3DViewer";

export default function CadStudio() {
  const [searchParams] = useSearchParams();
  const initialCase = searchParams.get("chassis") || "pelican-1150-faceplate";

  // Chassis / Custom Plate state
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    HARDWARE_CAD_SPECS[initialCase] ? initialCase : "pelican-1150-faceplate"
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("acrylic-3mm");
  const [isCustomDimensions, setIsCustomDimensions] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(210);
  const [customHeight, setCustomHeight] = useState<number>(150);
  const [customCornerRadius, setCustomCornerRadius] = useState<number>(8);

  // Multi-Plate Sandwich Layer Stack (Layer 1: Top Faceplate, Layer 2: Sub-Chassis)
  const [activeSandwichLayer, setActiveSandwichLayer] = useState<"TOP_FACEPLATE" | "KEYBOARD_PLATE" | "SUB_CHASSIS" | "BASE_TRAY">("TOP_FACEPLATE");

  // Placed components state
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([
    { instanceId: "disp-1", componentId: "waveshare-11-9-bar-touchscreen", x: 10, y: 12, rotation: 0 },
    { instanceId: "sbc-1", componentId: "raspberry-pi-5", x: 15, y: 88, rotation: 0 },
    { instanceId: "kb-1", componentId: "solder-party-bbq20-keyboard", x: 110, y: 90, rotation: 0 },
    { instanceId: "ant-1", componentId: "sma-antenna-bulkhead", x: 185, y: 95, rotation: 0 },
  ]);

  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>("disp-1");
  const [zoomLevel, setZoomLevel] = useState<number>(2.2);
  const [gridSnapMm, setGridSnapMm] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");

  // 3D Exploded View & Animation
  const [explodedOffset, setExplodedOffset] = useState<number>(25);
  const [isAutoRotate3D, setIsAutoRotate3D] = useState<boolean>(false);

  // Layer Toggles
  const [showDimensions, setShowDimensions] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDrillLabels, setShowDrillLabels] = useState(true);
  const [showCalibrationSquare, setShowCalibrationSquare] = useState(true);
  const [showCableTraces, setShowCableTraces] = useState(true);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"canvas" | "box" | "harnesses" | "fasteners" | "dxf" | "gcode" | "scad" | "specs">("canvas");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  // Dragging on SVG
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clipboard feedback
  const [copiedDxf, setCopiedDxf] = useState(false);
  const [copiedGCode, setCopiedGCode] = useState(false);
  const [copiedScad, setCopiedScad] = useState(false);

  const chassisSpec = HARDWARE_CAD_SPECS[selectedCaseId] || HARDWARE_CAD_SPECS["pelican-1150-faceplate"];

  const plateWidth = isCustomDimensions ? customWidth : chassisSpec.width;
  const plateHeight = isCustomDimensions ? customHeight : chassisSpec.height;
  const plateCornerRadius = isCustomDimensions ? customCornerRadius : chassisSpec.cornerRadii || 8;

  const mountingHoles = useMemo(() => {
    if (isCustomDimensions) {
      return [
        { x: 8.0, y: 8.0, diameter: 3.5, threadType: "M3.5 Screw" },
        { x: plateWidth - 8.0, y: 8.0, diameter: 3.5, threadType: "M3.5 Screw" },
        { x: 8.0, y: plateHeight - 8.0, diameter: 3.5, threadType: "M3.5 Screw" },
        { x: plateWidth - 8.0, y: plateHeight - 8.0, diameter: 3.5, threadType: "M3.5 Screw" },
      ];
    }
    return chassisSpec.holes;
  }, [isCustomDimensions, plateWidth, plateHeight, chassisSpec]);

  const faceplateConfig: FaceplateConfig = useMemo(() => {
    return {
      chassisId: isCustomDimensions ? "custom-plate" : chassisSpec.id,
      plateWidth,
      plateHeight,
      plateCornerRadius,
      mountingHoles,
      placedComponents,
    };
  }, [isCustomDimensions, plateWidth, plateHeight, plateCornerRadius, mountingHoles, chassisSpec, placedComponents]);

  // Collisions
  const collisions = useMemo(() => detectCollisions(placedComponents), [placedComponents]);
  const collidingInstanceIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [a, b] of collisions) {
      ids.add(a);
      ids.add(b);
    }
    return ids;
  }, [collisions]);

  // Physical Mass & Volume
  const physicalProps = useMemo(
    () => calculatePlatePhysicalProperties(faceplateConfig, selectedMaterialId),
    [faceplateConfig, selectedMaterialId]
  );

  // Fasteners BOM
  const fastenerList = useMemo(() => calculateFastenerList(faceplateConfig), [faceplateConfig]);

  // Cable Harnesses
  const cableHarnesses = useMemo(() => calculateCableHarnesses(placedComponents), [placedComponents]);

  // Finger Joint Box Panels
  const boxPanels = useMemo(
    () => generateBoxJointEnclosure(plateWidth, plateHeight, 45.0, physicalProps.material.thicknessMm),
    [plateWidth, plateHeight, physicalProps.material.thicknessMm]
  );

  // Code Generation
  const generatedDxfCode = useMemo(() => generateDxf(faceplateConfig), [faceplateConfig]);
  const generatedGCodeCode = useMemo(() => generateGCode(faceplateConfig), [faceplateConfig]);
  const generatedScadCode = useMemo(() => generateOpenScad(faceplateConfig), [faceplateConfig]);
  const generatedStlCode = useMemo(() => generateStl(faceplateConfig, physicalProps.material.thicknessMm), [faceplateConfig, physicalProps.material.thicknessMm]);

  // Mouse Dragging on Canvas Handlers
  const handleSvgMouseDown = (e: React.MouseEvent, instanceId: string) => {
    e.stopPropagation();
    setSelectedInstanceId(instanceId);
    setIsDragging(true);

    const active = placedComponents.find((p) => p.instanceId === instanceId);
    if (!active || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const clickMmX = (e.clientX - svgRect.left) / zoomLevel - 30;
    const clickMmY = (e.clientY - svgRect.top) / zoomLevel - 30;

    setDragOffset({
      x: clickMmX - active.x,
      y: clickMmY - active.y,
    });
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedInstanceId || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const currentMmX = (e.clientX - svgRect.left) / zoomLevel - 30;
    const currentMmY = (e.clientY - svgRect.top) / zoomLevel - 30;

    let targetX = Math.round((currentMmX - dragOffset.x) / gridSnapMm) * gridSnapMm;
    let targetY = Math.round((currentMmY - dragOffset.y) / gridSnapMm) * gridSnapMm;

    targetX = Math.max(0, Math.min(plateWidth - 10, targetX));
    targetY = Math.max(0, Math.min(plateHeight - 10, targetY));

    setPlacedComponents((prev) =>
      prev.map((p) => (p.instanceId === selectedInstanceId ? { ...p, x: targetX, y: targetY } : p))
    );
  };

  const handleSvgMouseUp = () => {
    setIsDragging(false);
  };

  const handleAddComponent = (componentId: string) => {
    const spec = HARDWARE_CAD_SPECS[componentId];
    if (!spec) return;
    const newInstance: PlacedComponent = {
      instanceId: `inst-${Date.now()}`,
      componentId,
      x: 20,
      y: 20,
      rotation: 0,
    };
    setPlacedComponents((prev) => [...prev, newInstance]);
    setSelectedInstanceId(newInstance.instanceId);
  };

  const handleRemoveComponent = (instanceId: string) => {
    setPlacedComponents((prev) => prev.filter((p) => p.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) setSelectedInstanceId(null);
  };

  const handleRotateSelected = () => {
    if (!selectedInstanceId) return;
    setPlacedComponents((prev) =>
      prev.map((p) => {
        if (p.instanceId !== selectedInstanceId) return p;
        const nextRot = ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...p, rotation: nextRot };
      })
    );
  };

  const handleCenterSelected = () => {
    if (!selectedInstanceId) return;
    const active = placedComponents.find((p) => p.instanceId === selectedInstanceId);
    if (!active) return;
    const spec = HARDWARE_CAD_SPECS[active.componentId];
    if (!spec) return;
    const dim = getComponentEffectiveDimensions(spec, active.rotation);

    const centerX = Math.round((plateWidth - dim.width) / 2);
    setPlacedComponents((prev) =>
      prev.map((p) => (p.instanceId === selectedInstanceId ? { ...p, x: centerX } : p))
    );
  };

  const handleMoveSelected = (dx: number, dy: number) => {
    if (!selectedInstanceId) return;
    setPlacedComponents((prev) =>
      prev.map((p) => {
        if (p.instanceId !== selectedInstanceId) return p;
        const newX = Math.max(0, Math.round((p.x + dx) / gridSnapMm) * gridSnapMm);
        const newY = Math.max(0, Math.round((p.y + dy) / gridSnapMm) * gridSnapMm);
        return { ...p, x: newX, y: newY };
      })
    );
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProjectJson = () => {
    const data = JSON.stringify(
      {
        version: "3.0",
        faceplate: faceplateConfig,
        material: selectedMaterialId,
      },
      null,
      2
    );
    downloadFile(`decksmith-cad-${faceplateConfig.chassisId}.json`, data, "application/json");
  };

  const handlePrint = () => {
    window.print();
  };

  const activePlaced = placedComponents.find((p) => p.instanceId === selectedInstanceId);
  const activeSpec = activePlaced ? HARDWARE_CAD_SPECS[activePlaced.componentId] : null;

  const catalogFiltered = useMemo(() => {
    const all = Object.values(HARDWARE_CAD_SPECS).filter((s) => s.category !== "CASE");
    if (selectedCategoryFilter === "ALL") return all;
    return all.filter((s) => s.category === selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              3D CAD & Fabrication Studio
            </span>
            <span className="text-xs font-mono text-neon-green">WebGL Three.js Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Crosshair className="w-7 h-7 text-cyan-400" />
            3D CAD & Enclosure Fabrication Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Interactive 3D WebGL orbit viewer, exploded assembly animation, 3D printable STL models, laser finger-joint boxes, and CNC vectors.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/builder"
            className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-neon-green" />
            Blueprint Studio
          </Link>
          <button
            onClick={exportProjectJson}
            className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            Export JSON
          </button>
          <button
            onClick={() =>
              downloadFile(`${faceplateConfig.chassisId}-model.stl`, generatedStlCode, "application/sla")
            }
            className="px-3.5 py-2 rounded-lg bg-neon-green hover:bg-emerald-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-neon-green/20"
          >
            <Box className="w-3.5 h-3.5" />
            Export 3D STL
          </button>
          <button
            onClick={() =>
              downloadFile(`${faceplateConfig.chassisId}-laser-cut.dxf`, generatedDxfCode, "application/dxf")
            }
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-gray-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export DXF
          </button>
          <button
            onClick={() =>
              downloadFile(`${faceplateConfig.chassisId}-milling.nc`, generatedGCodeCode, "text/plain")
            }
            className="px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Export G-Code
          </button>
          <button
            onClick={() =>
              downloadFile(`${faceplateConfig.chassisId}-bezel.scad`, generatedScadCode, "text/plain")
            }
            className="px-3 py-2 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            Export OpenSCAD
          </button>
        </div>
      </div>

      {/* Sandwich Layer Stack Switcher */}
      <div className="mt-5 p-2 bg-gray-900/90 border border-gray-800 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-gray-400 font-bold">Sandwich Layer Stack:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "TOP_FACEPLATE", label: "Layer 1: Top Faceplate / Bezel" },
            { id: "KEYBOARD_PLATE", label: "Layer 2: Keyboard Switch Plate" },
            { id: "SUB_CHASSIS", label: "Layer 3: Carrier Sub-Chassis" },
            { id: "BASE_TRAY", label: "Layer 4: Bottom Base Tray" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveSandwichLayer(l.id as any)}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all text-xs ${
                activeSandwichLayer === l.id
                  ? "bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/20"
                  : "bg-gray-950 text-gray-400 hover:text-gray-200 border border-gray-800"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collision Warning Banner */}
      {collisions.length > 0 && (
        <div className="my-5 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Hardware Clearance Warning:</strong> {collisions.length} overlapping component boundaries detected on faceplate. Reposition or rotate modules to prevent physical drill collisions.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 mt-6 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("canvas")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "canvas"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Crosshair className="w-4 h-4" />
          Interactive 3D / 2D Canvas ({plateWidth} × {plateHeight} mm)
        </button>
        <button
          onClick={() => setActiveTab("box")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "box"
              ? "border-indigo-400 text-indigo-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Box className="w-4 h-4" />
          Finger-Joint Box ({boxPanels.length} panels)
        </button>
        <button
          onClick={() => setActiveTab("harnesses")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "harnesses"
              ? "border-rose-400 text-rose-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Cable className="w-4 h-4" />
          Cable Harnesses ({cableHarnesses.length} runs)
        </button>
        <button
          onClick={() => setActiveTab("fasteners")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "fasteners"
              ? "border-yellow-400 text-yellow-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Package className="w-4 h-4" />
          Fasteners BOM ({fastenerList.reduce((s, f) => s + f.quantity, 0)} pcs)
        </button>
        <button
          onClick={() => setActiveTab("dxf")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "dxf"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          DXF Vector
        </button>
        <button
          onClick={() => setActiveTab("gcode")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "gcode"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Wrench className="w-4 h-4" />
          CNC G-Code (.nc)
        </button>
        <button
          onClick={() => setActiveTab("scad")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "scad"
              ? "border-purple-400 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <FileCode className="w-4 h-4" />
          OpenSCAD 3D Bezel
        </button>
        <button
          onClick={() => setActiveTab("specs")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "specs"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Info className="w-4 h-4" />
          Hole Pattern Directory
        </button>
      </div>

      {/* CAD Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Visual Canvas or Code View */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "canvas" && (
            <>
              {/* Canvas Controls Toolbar */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                {/* Chassis selector / Custom Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">Enclosure:</span>
                  <select
                    value={isCustomDimensions ? "custom" : selectedCaseId}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomDimensions(true);
                      } else {
                        setIsCustomDimensions(false);
                        setSelectedCaseId(e.target.value);
                      }
                    }}
                    className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-semibold focus:outline-none"
                  >
                    <option value="pelican-1150-faceplate">Pelican 1150 (211 × 147 mm)</option>
                    <option value="pelican-1200-faceplate">Pelican 1200 (241 × 184 mm)</option>
                    <option value="custom-3d-printed-clamshell-case">3D Clamshell (200 × 130 mm)</option>
                    <option value="tactical-armored-gauntlet-enclosure">Gauntlet Rail (180 × 95 mm)</option>
                    <option value="custom">⚙️ Custom User Dimensions</option>
                  </select>
                </div>

                {/* Material Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">Material:</span>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-semibold focus:outline-none"
                  >
                    {Object.values(CAD_MATERIALS).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2D vs 3D Isometric View Mode Toggle */}
                <div className="flex items-center bg-gray-950 border border-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("3D")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                      viewMode === "3D" ? "bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/20" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    3D WebGL Orbit
                  </button>
                  <button
                    onClick={() => setViewMode("2D")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                      viewMode === "2D" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    2D Blueprint (Drag & Snap)
                  </button>
                </div>

                {/* 3D Exploded View Slider & Auto-Rotate */}
                {viewMode === "3D" && (
                  <div className="flex items-center gap-3 bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-1">
                    <span className="text-[11px] font-mono text-yellow-400 font-bold">Exploded View:</span>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={explodedOffset}
                      onChange={(e) => setExplodedOffset(Number(e.target.value))}
                      className="w-24 accent-yellow-400 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-gray-400 w-8">{explodedOffset}mm</span>
                    <button
                      onClick={() => setIsAutoRotate3D(!isAutoRotate3D)}
                      className={`p-1 rounded text-xs transition-colors ${
                        isAutoRotate3D ? "text-neon-green bg-emerald-950/60 border border-emerald-500/40" : "text-gray-400 hover:text-gray-200"
                      }`}
                      title="Auto-Rotate 3D Scene"
                    >
                      {isAutoRotate3D ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Custom Dimension Inputs */}
              {isCustomDimensions && (
                <div className="p-3.5 bg-gray-900/60 border border-gray-800 rounded-xl grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-mono text-gray-400 mb-1">Plate Width (mm)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-2.5 py-1 font-mono text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-gray-400 mb-1">Plate Height (mm)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-2.5 py-1 font-mono text-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-gray-400 mb-1">Corner Radius (mm)</label>
                    <input
                      type="number"
                      value={customCornerRadius}
                      onChange={(e) => setCustomCornerRadius(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-2.5 py-1 font-mono text-cyan-300"
                    />
                  </div>
                </div>
              )}

              {/* Material Physical Properties Quick HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-3.5 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[10px]">Material Substrate</span>
                  <span className="font-bold text-emerald-400 truncate block">{physicalProps.material.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Net Surface Area</span>
                  <span className="font-bold text-gray-200">{physicalProps.netAreaCm2} cm²</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Fabricated Plate Weight</span>
                  <span className="font-bold text-neon-green">{physicalProps.weightGrams} g ({physicalProps.weightOz} oz)</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Laser Beam Kerf</span>
                  <span className="font-bold text-cyan-400">+{physicalProps.material.laserKerfMm} mm</span>
                </div>
              </div>

              {/* 3D WebGL Viewer vs 2D Drag & Snap Canvas */}
              {viewMode === "3D" ? (
                <Cad3DViewer
                  faceplate={faceplateConfig}
                  materialId={selectedMaterialId}
                  explodedOffset={explodedOffset}
                  autoRotate={isAutoRotate3D}
                />
              ) : (
                <div className="bg-gray-950 border-2 border-gray-800 rounded-2xl p-6 overflow-auto relative min-h-[480px] flex items-center justify-center shadow-inner select-none">
                  <svg
                    ref={svgRef}
                    width={plateWidth * zoomLevel + 60}
                    height={plateHeight * zoomLevel + 60}
                    viewBox={`-30 -30 ${plateWidth + 60} ${plateHeight + 60}`}
                    className="bg-gray-950 rounded-xl"
                    onMouseMove={handleSvgMouseMove}
                    onMouseUp={handleSvgMouseUp}
                    style={{ touchAction: "none" }}
                  >
                    <defs>
                      <pattern id="grid-1mm" width="1" height="1" patternUnits="userSpaceOnUse">
                        <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#1e293b" strokeWidth="0.1" />
                      </pattern>
                      <pattern id="grid-10mm" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.25" />
                      </pattern>
                    </defs>

                    {showGrid && (
                      <>
                        <rect x="-20" y="-20" width={plateWidth + 40} height={plateHeight + 40} fill="url(#grid-1mm)" />
                        <rect x="-20" y="-20" width={plateWidth + 40} height={plateHeight + 40} fill="url(#grid-10mm)" />
                      </>
                    )}

                    <rect
                      x="0"
                      y="0"
                      width={plateWidth}
                      height={plateHeight}
                      rx={plateCornerRadius}
                      ry={plateCornerRadius}
                      fill="#0f172a"
                      fillOpacity="0.8"
                      stroke="#06b6d4"
                      strokeWidth="1.2"
                    />

                    {mountingHoles.map((h, i) => (
                      <g key={`chassis-hole-${i}`}>
                        <circle cx={h.x} cy={h.y} r={h.diameter / 2} fill="#ef4444" fillOpacity="0.4" stroke="#ef4444" strokeWidth="0.5" />
                        <line x1={h.x - 2} y1={h.y} x2={h.x + 2} y2={h.y} stroke="#ef4444" strokeWidth="0.3" />
                        <line x1={h.x} y1={h.y - 2} x2={h.y + 2} stroke="#ef4444" strokeWidth="0.3" />
                      </g>
                    ))}

                    {showCableTraces && (
                      <g>
                        {placedComponents.map((placed, i) => {
                          const next = placedComponents[i + 1];
                          if (!next) return null;
                          const specA = HARDWARE_CAD_SPECS[placed.componentId];
                          const specB = HARDWARE_CAD_SPECS[next.componentId];
                          if (!specA || !specB) return null;

                          return (
                            <line
                              key={`cable-${i}`}
                              x1={placed.x + specA.width / 2}
                              y1={placed.y + specA.height / 2}
                              x2={next.x + specB.width / 2}
                              y2={next.y + specB.height / 2}
                              stroke="#f43f5e"
                              strokeWidth="0.8"
                              strokeDasharray="2,2"
                              strokeOpacity="0.6"
                            />
                          );
                        })}
                      </g>
                    )}

                    {placedComponents.map((placed) => {
                      const spec = HARDWARE_CAD_SPECS[placed.componentId];
                      if (!spec) return null;
                      const isSelected = placed.instanceId === selectedInstanceId;
                      const isColliding = collidingInstanceIds.has(placed.instanceId);
                      const dim = getComponentEffectiveDimensions(spec, placed.rotation);

                      return (
                        <g
                          key={placed.instanceId}
                          transform={`translate(${placed.x}, ${placed.y})`}
                          onMouseDown={(e) => handleSvgMouseDown(e, placed.instanceId)}
                          className="cursor-move"
                        >
                          <rect
                            x="0"
                            y="0"
                            width={dim.width}
                            height={dim.height}
                            rx={spec.cornerRadii || 2}
                            ry={spec.cornerRadii || 2}
                            fill={isColliding ? "#f59e0b" : isSelected ? "#10b981" : "#1e293b"}
                            fillOpacity={isSelected ? "0.3" : "0.5"}
                            stroke={isColliding ? "#f59e0b" : isSelected ? "#10b981" : "#64748b"}
                            strokeWidth={isSelected ? "1.0" : "0.6"}
                            strokeDasharray={isSelected ? "none" : "2,2"}
                          />

                          {spec.cutouts.map((cutout, ci) => {
                            const cw = placed.rotation === 90 || placed.rotation === 270 ? cutout.height : cutout.width;
                            const ch = placed.rotation === 90 || placed.rotation === 270 ? cutout.width : cutout.height;
                            return (
                              <g key={`cutout-${ci}`}>
                                <rect
                                  x={cutout.x}
                                  y={cutout.y}
                                  width={cw}
                                  height={ch}
                                  rx={cutout.radius || 1}
                                  ry={cutout.radius || 1}
                                  fill="#a855f7"
                                  fillOpacity="0.4"
                                  stroke="#a855f7"
                                  strokeWidth="0.8"
                                />
                                <text
                                  x={cutout.x + cw / 2}
                                  y={cutout.y + ch / 2 + 1}
                                  fill="#c084fc"
                                  fontSize="2.8"
                                  fontFamily="monospace"
                                  textAnchor="middle"
                                >
                                  {cutout.label}
                                </text>
                              </g>
                            );
                          })}

                          {spec.holes.map((hole, hi) => (
                            <g key={`hole-${hi}`}>
                              <circle
                                cx={hole.x}
                                cy={hole.y}
                                r={hole.diameter / 2}
                                fill="#10b981"
                                fillOpacity="0.6"
                                stroke="#10b981"
                                strokeWidth="0.4"
                              />
                              <line x1={hole.x - 2} y1={hole.y} x2={hole.x + 2} y2={hole.y} stroke="#10b981" strokeWidth="0.2" />
                              <line x1={hole.x} y1={hole.y - 2} x2={hole.x + 2} y2={hole.y} stroke="#10b981" strokeWidth="0.2" />
                              {showDrillLabels && (
                                <text
                                  x={hole.x + 2.5}
                                  y={hole.y + 1}
                                  fill="#34d399"
                                  fontSize="2.2"
                                  fontFamily="monospace"
                                >
                                  {hole.threadType} (Ø{hole.diameter}mm)
                                </text>
                              )}
                            </g>
                          ))}

                          <text
                            x={dim.width / 2}
                            y={dim.height - 3}
                            fill="#e2e8f0"
                            fontSize="3.0"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {spec.name} {placed.rotation !== 0 ? `(${placed.rotation}°)` : ""}
                          </text>
                        </g>
                      );
                    })}

                    {showDimensions && (
                      <g>
                        <line x1="0" y1="-10" x2={plateWidth} y2="-10" stroke="#eab308" strokeWidth="0.5" />
                        <line x1="0" y1="-14" x2="0" y2="-6" stroke="#eab308" strokeWidth="0.5" />
                        <line x1={plateWidth} y1="-14" x2={plateWidth} y2="-6" stroke="#eab308" strokeWidth="0.5" />
                        <text
                          x={plateWidth / 2}
                          y="-12"
                          fill="#eab308"
                          fontSize="4"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {plateWidth}.00 mm
                        </text>

                        <line x1="-10" y1="0" x2="-10" y2={plateHeight} stroke="#eab308" strokeWidth="0.5" />
                        <line x1="-14" y1="0" x2="-6" y2="0" stroke="#eab308" strokeWidth="0.5" />
                        <line x1="-14" y1={plateHeight} x2="-6" y2={plateHeight} stroke="#eab308" strokeWidth="0.5" />
                        <text
                          x="-14"
                          y={plateHeight / 2}
                          fill="#eab308"
                          fontSize="4"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          transform={`rotate(-90 -14 ${plateHeight / 2})`}
                        >
                          {plateHeight}.00 mm
                        </text>
                      </g>
                    )}

                    {showCalibrationSquare && (
                      <g transform={`translate(${plateWidth - 45}, ${plateHeight + 8})`}>
                        <rect x="0" y="0" width="40" height="15" fill="#1e1b4b" stroke="#818cf8" strokeWidth="0.5" />
                        <text x="20" y="7" fill="#c7d2fe" fontSize="2.8" fontFamily="monospace" textAnchor="middle">
                          1:1 PRINTER SCALE TEST
                        </text>
                        <text x="20" y="12" fill="#818cf8" fontSize="2.5" fontFamily="monospace" textAnchor="middle">
                          MEASURE: 40.0mm
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
              )}

              {/* Selected Component Precision Control Toolbar */}
              {activePlaced && activeSpec && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-neon-green">
                      Selected: {activeSpec.name}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      X: <strong className="text-white">{activePlaced.x}mm</strong> · Y:{" "}
                      <strong className="text-white">{activePlaced.y}mm</strong> · Rot:{" "}
                      <strong className="text-cyan-400">{activePlaced.rotation}°</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRotateSelected}
                      className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900/60 flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      Rotate 90°
                    </button>
                    <button
                      onClick={handleCenterSelected}
                      className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 flex items-center gap-1"
                    >
                      <AlignCenter className="w-3 h-3" />
                      Center X
                    </button>
                    <button
                      onClick={() => handleMoveSelected(-gridSnapMm, 0)}
                      className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => handleMoveSelected(gridSnapMm, 0)}
                      className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200"
                    >
                      →
                    </button>
                    <button
                      onClick={() => handleMoveSelected(0, -gridSnapMm)}
                      className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveSelected(0, gridSnapMm)}
                      className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-200"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleRemoveComponent(activePlaced.instanceId)}
                      className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs font-bold hover:bg-rose-900/60 transition-colors ml-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: FINGER-JOINT BOX ENCLOSURE */}
          {activeTab === "box" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Box className="w-5 h-5 text-indigo-400" />
                    Parametric Laser-Cut Finger-Joint Box Enclosure
                  </h3>
                  <p className="text-xs text-gray-400">
                    Auto-generated 6-sided interlocking box panels with finger tabs designed for laser cutting or CNC routing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {boxPanels.map((p, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{p.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">
                        {p.tabCount} Tabs
                      </span>
                    </div>
                    <div className="text-xs font-mono text-gray-400 space-y-1">
                      <div>Dimensions: {p.width} × {p.height} mm</div>
                      <div>Material Thickness: {p.thickness} mm</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CABLE HARNESSES */}
          {activeTab === "harnesses" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Cable className="w-5 h-5 text-rose-400" />
                    Automated Cable Harness Length Estimations
                  </h3>
                  <p className="text-xs text-gray-400">
                    Estimated ribbon FFC, pigtail, and wire lengths based on active component distances and recommended service loops.
                  </p>
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-950 text-gray-400 uppercase font-mono border-b border-gray-800">
                    <tr>
                      <th className="p-3">Source Module</th>
                      <th className="p-3">Destination Module</th>
                      <th className="p-3">Cable Type</th>
                      <th className="p-3">Direct Distance</th>
                      <th className="p-3 text-right">Recommended Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {cableHarnesses.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-800/30">
                        <td className="p-3 font-semibold text-white">{c.fromName}</td>
                        <td className="p-3 text-gray-300">{c.toName}</td>
                        <td className="p-3 font-mono text-cyan-400">{c.cableType}</td>
                        <td className="p-3 font-mono text-gray-400">{c.straightDistanceMm} mm</td>
                        <td className="p-3 text-right font-mono font-bold text-neon-green">
                          {c.recommendedLengthCm} cm ({Math.round(c.recommendedLengthCm / 2.54)}" in)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FASTENERS BOM */}
          {activeTab === "fasteners" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Package className="w-5 h-5 text-yellow-400" />
                    Fastener & Standoff Procurement Bill of Materials
                  </h3>
                  <p className="text-xs text-gray-400">
                    Exact quantities of brass standoffs, button-head screws, and locknuts required for physical faceplate assembly.
                  </p>
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-950 text-gray-400 uppercase font-mono border-b border-gray-800">
                    <tr>
                      <th className="p-3">Fastener Specification</th>
                      <th className="p-3">Required Qty</th>
                      <th className="p-3">Assembly Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {fastenerList.map((f, i) => (
                      <tr key={i} className="hover:bg-gray-800/30">
                        <td className="p-3 font-semibold text-white">{f.type}</td>
                        <td className="p-3 font-mono font-bold text-neon-green">{f.quantity} pcs</td>
                        <td className="p-3 text-gray-400">{f.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DXF CODE */}
          {activeTab === "dxf" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    AutoCAD R12 ASCII DXF Vector File
                  </h3>
                  <p className="text-xs text-gray-400">
                    Ready to import into LightBurn, Fusion 360, SolidWorks, FreeCAD, or send directly to laser cutter CNCs.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDxfCode);
                      setCopiedDxf(true);
                      setTimeout(() => setCopiedDxf(false), 2000);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5"
                  >
                    {copiedDxf ? <Check className="w-3.5 h-3.5 text-neon-green" /> : null}
                    {copiedDxf ? "Copied!" : "Copy DXF"}
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(`${faceplateConfig.chassisId}-laser-cut.dxf`, generatedDxfCode, "application/dxf")
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-400 text-gray-950 text-xs font-bold hover:bg-cyan-300 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .dxf
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-h-96">
                {generatedDxfCode}
              </pre>
            </div>
          )}

          {/* TAB: CNC G-CODE */}
          {activeTab === "gcode" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-emerald-400" />
                    CNC Milling & Drilling G-Code (.nc)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Standard RS-274D / GRBL / Marlin compatible G-code with plunge drilling and perimeter contour milling.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedGCodeCode);
                      setCopiedGCode(true);
                      setTimeout(() => setCopiedGCode(false), 2000);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5"
                  >
                    {copiedGCode ? <Check className="w-3.5 h-3.5 text-neon-green" /> : null}
                    {copiedGCode ? "Copied!" : "Copy G-Code"}
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(`${faceplateConfig.chassisId}-milling.nc`, generatedGCodeCode, "text/plain")
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-gray-950 text-xs font-bold hover:bg-emerald-300 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .nc
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-h-96">
                {generatedGCodeCode}
              </pre>
            </div>
          )}

          {/* TAB: OPENSCAD SCRIPT */}
          {activeTab === "scad" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-400" />
                    OpenSCAD Parametric 3D Printable Bezel Script
                  </h3>
                  <p className="text-xs text-gray-400">
                    Generates 3D printable solid geometry with countersunk screw holes and chamfers.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedScadCode);
                      setCopiedScad(true);
                      setTimeout(() => setCopiedScad(false), 2000);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 text-purple-300 text-xs font-bold hover:bg-purple-900/60 transition-colors flex items-center gap-1.5"
                  >
                    {copiedScad ? <Check className="w-3.5 h-3.5 text-neon-green" /> : null}
                    {copiedScad ? "Copied!" : "Copy Script"}
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(`${faceplateConfig.chassisId}-bezel.scad`, generatedScadCode, "text/plain")
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-purple-400 text-gray-950 text-xs font-bold hover:bg-purple-300 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .scad
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-h-96">
                {generatedScadCode}
              </pre>
            </div>
          )}

          {/* TAB: SPEC DIRECTORY */}
          {activeTab === "specs" && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-yellow-400" />
                Verified Hardware Hole Patterns & Dimensions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(HARDWARE_CAD_SPECS).map((spec) => (
                  <div
                    key={spec.id}
                    className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{spec.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-neon-green">
                        {spec.category}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-gray-400 space-y-1">
                      <div>Dimensions: {spec.width} × {spec.height} mm</div>
                      <div>Mounting Standoffs: {spec.holes.length}x ({spec.holes[0]?.threadType || "M2.5"})</div>
                      <div>Cutouts: {spec.cutouts.length > 0 ? spec.cutouts.map((c) => c.label).join(", ") : "None"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Component Tray */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Add Hardware Modules
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["ALL", "SBC", "DISPLAY", "KEYBOARD", "PORT"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                    selectedCategoryFilter === cat
                      ? "bg-cyan-500 text-gray-950"
                      : "bg-gray-800 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {catalogFiltered.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => handleAddComponent(spec.id)}
                  className="w-full p-2.5 rounded-lg border border-gray-800 bg-gray-950/60 hover:border-cyan-500/40 hover:bg-gray-900 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-gray-200">{spec.name}</div>
                    <div className="text-[10px] font-mono text-gray-500">
                      {spec.width} × {spec.height} mm · {spec.holes.length}x {spec.holes[0]?.threadType || "Mounts"}
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 shrink-0">
                    + Add
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Placed Components Layer Stack */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-3 shadow-2xl">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Placed Component Layers ({placedComponents.length})
            </h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {placedComponents.map((p) => {
                const spec = HARDWARE_CAD_SPECS[p.componentId];
                const isSelected = p.instanceId === selectedInstanceId;
                const isColliding = collidingInstanceIds.has(p.instanceId);

                return (
                  <div
                    key={p.instanceId}
                    onClick={() => setSelectedInstanceId(p.instanceId)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40 text-white font-bold"
                        : isColliding
                        ? "border-amber-500/60 bg-amber-950/20 text-amber-200"
                        : "border-gray-800 bg-gray-950 text-gray-300 hover:border-gray-700"
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-[10px] font-mono text-cyan-400 mr-1.5">
                        [{spec?.category}]
                      </span>
                      {spec?.name}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 shrink-0 ml-1">
                      ({p.x}, {p.y})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
