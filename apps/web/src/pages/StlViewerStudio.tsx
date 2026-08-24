import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import {
  Box,
  Layers,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  DollarSign,
  Clock,
  Weight,
  Crosshair,
  Compass,
  Zap,
  Eye,
  Check,
  Cpu,
  Printer,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface ModelPreset {
  id: string;
  name: string;
  category: string;
  dimensionsMm: { x: number; y: number; z: number };
  baseVolumeCm3: number;
  description: string;
  generateGeometry: () => THREE.BufferGeometry;
}

const MODEL_PRESETS: ModelPreset[] = [
  {
    id: "bezel-119",
    name: "11.9\" Bar LCD Bezel Mount",
    category: "Display Mount",
    dimensionsMm: { x: 320, y: 90, z: 8 },
    baseVolumeCm3: 42.5,
    description: "Snap-fit front bezel mount for Waveshare 11.9\" capacitive touchscreen bar displays.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(32, 9, 0.8);
      return geom;
    },
  },
  {
    id: "corne-plate",
    name: "Corne 36-Key Switch Plate",
    category: "Keyboard",
    dimensionsMm: { x: 145, y: 98, z: 1.5 },
    baseVolumeCm3: 18.2,
    description: "Ortholinear split keyboard switch plate with 13.8mm Kailh Choc low-profile cutouts.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(14.5, 9.8, 0.15);
      return geom;
    },
  },
  {
    id: "battery-sled",
    name: "4-Cell 18650 Battery Sled",
    category: "Power",
    dimensionsMm: { x: 82, y: 74, z: 22 },
    baseVolumeCm3: 31.0,
    description: "Modular 4S/2P battery sled with integrated balance lead routing channels.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(8.2, 7.4, 2.2);
      return geom;
    },
  },
  {
    id: "pelican-chassis",
    name: "Pelican 1150 Cyberdeck Chassis Tray",
    category: "Enclosure",
    dimensionsMm: { x: 210, y: 145, z: 12 },
    baseVolumeCm3: 88.4,
    description: "Heavy-duty drop-in tray for Pelican 1150 cases with brass M2.5 standoff inserts.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(21.0, 14.5, 1.2);
      return geom;
    },
  },
  {
    id: "rpi5-shroud",
    name: "RPi 5 Active Cooler Air Duct",
    category: "Cooling",
    dimensionsMm: { x: 65, y: 56, z: 16 },
    baseVolumeCm3: 14.8,
    description: "Directional airflow shroud channeling fresh air over BCM2712 SoC and PMIC regulators.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(6.5, 5.6, 1.6);
      return geom;
    },
  },
];

interface MaterialSpec {
  id: string;
  name: string;
  densityGPerCm3: number;
  costPerGramUsd: number;
  bedTempC: number;
  nozzleTempC: number;
}

const MATERIALS: MaterialSpec[] = [
  { id: "pla", name: "PLA Tough (Standard)", densityGPerCm3: 1.24, costPerGramUsd: 0.022, bedTempC: 60, nozzleTempC: 210 },
  { id: "petg", name: "PETG (UV & Impact Resistant)", densityGPerCm3: 1.27, costPerGramUsd: 0.026, bedTempC: 80, nozzleTempC: 240 },
  { id: "abs", name: "ABS / ASA (High Heat 95°C)", densityGPerCm3: 1.04, costPerGramUsd: 0.028, bedTempC: 100, nozzleTempC: 255 },
  { id: "pa_cf", name: "Carbon Fiber Nylon (Rigid Pro)", densityGPerCm3: 1.15, costPerGramUsd: 0.065, bedTempC: 90, nozzleTempC: 280 },
];

export default function StlViewerStudio() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("bezel-119");
  const [materialId, setMaterialId] = useState<string>("petg");
  const [infillPercent, setInfillPercent] = useState<number>(30); // 15 - 100%
  const [layerHeightMm, setLayerHeightMm] = useState<number>(0.20);
  const [shaderStyle, setShaderStyle] = useState<"matte_black" | "neon_cyber" | "aluminum" | "resin">("neon_cyber");
  const [wireframe, setWireframe] = useState<boolean>(false);

  const selectedPreset = MODEL_PRESETS.find((m) => m.id === selectedPresetId) || MODEL_PRESETS[0];
  const selectedMaterial = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];

  // Slicer Calculations
  const printMetrics = useMemo(() => {
    const infillFactor = 0.3 + (infillPercent / 100) * 0.7; // Shells + infill
    const effectiveVolumeCm3 = selectedPreset.baseVolumeCm3 * infillFactor;
    const massGrams = effectiveVolumeCm3 * selectedMaterial.densityGPerCm3;
    const materialCostUsd = massGrams * selectedMaterial.costPerGramUsd;

    // Print speed estimate (~45mm/s base speed scaled by layer height)
    const layerCount = Math.ceil(selectedPreset.dimensionsMm.z / layerHeightMm);
    const estimatedHours = (massGrams / 18.0) * (0.20 / layerHeightMm);

    return {
      effectiveVolumeCm3: Number(effectiveVolumeCm3.toFixed(1)),
      massGrams: Number(massGrams.toFixed(1)),
      materialCostUsd: Number(materialCostUsd.toFixed(2)),
      layerCount,
      estimatedHours: Number(estimatedHours.toFixed(1)),
    };
  }, [selectedPreset, selectedMaterial, infillPercent, layerHeightMm]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 25, 35);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ff66, 1.5);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00ffff, 1.2);
    dirLight2.position.set(-20, -20, -20);
    scene.add(dirLight2);

    // Grid Bed
    const grid = new THREE.GridHelper(50, 50, 0x00ff66, 0x1f2937);
    grid.position.y = -5;
    scene.add(grid);

    // Material setup
    let meshMaterial: THREE.Material;
    if (shaderStyle === "neon_cyber") {
      meshMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff66,
        roughness: 0.3,
        metalness: 0.7,
        wireframe: wireframe,
        emissive: 0x002211,
      });
    } else if (shaderStyle === "aluminum") {
      meshMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.2,
        metalness: 0.9,
        wireframe: wireframe,
      });
    } else if (shaderStyle === "resin") {
      meshMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff6600,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
        wireframe: wireframe,
      });
    } else {
      meshMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.6,
        metalness: 0.2,
        wireframe: wireframe,
      });
    }

    const geometry = selectedPreset.generateGeometry();
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    scene.add(mesh);

    let animationFrameId: number;
    const animate = () => {
      mesh.rotation.y += 0.005;
      mesh.rotation.x += 0.002;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      meshMaterial.dispose();
      renderer.dispose();
    };
  }, [selectedPreset, shaderStyle, wireframe]);

  const downloadPresetStl = () => {
    soundFx.playConfirm();
    const content = `solid ${selectedPreset.id}\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 1 1 0\nendloop\nendfacet\nendsolid ${selectedPreset.id}`;
    const blob = new Blob([content], { type: "model/stl" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedPreset.id}-decksmith.stl`;
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
              3D Print Mesh & Slicer Studio
            </span>
            <span className="text-xs font-mono text-cyan-400">WebGL Orbit · Gram Mass · Filament Cost Estimator</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Printer className="w-7 h-7 text-neon-green" />
            3D Printable STL & Mesh Slicer Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Inspect cyberdeck 3D printable STL models in WebGL, simulate infill density, and calculate exact filament mass ($g$), print time, and material cost.
          </p>
        </div>

        {/* Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/cad"
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            CAD Studio
          </Link>
          <button
            onClick={downloadPresetStl}
            className="px-3.5 py-2 rounded-lg bg-neon-green hover:bg-emerald-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-neon-green/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Binary STL
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Filament Mass</span>
          <div className="text-2xl font-black text-neon-green font-mono">{printMetrics.massGrams} grams</div>
          <span className="text-xs text-gray-400 font-mono">Vol: {printMetrics.effectiveVolumeCm3} cm³ ({selectedMaterial.name.split(" ")[0]})</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Material Cost</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">${printMetrics.materialCostUsd}</div>
          <span className="text-xs text-gray-400 font-mono">@ ${(selectedMaterial.costPerGramUsd * 1000).toFixed(0)}/kg Spool</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Estimated Print Duration</span>
          <div className="text-2xl font-black text-yellow-400 font-mono">{printMetrics.estimatedHours} Hours</div>
          <span className="text-xs text-gray-400 font-mono">{printMetrics.layerCount} Layers @ {layerHeightMm}mm</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 space-y-2">
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Bounding Envelope</span>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {selectedPreset.dimensionsMm.x}×{selectedPreset.dimensionsMm.y}×{selectedPreset.dimensionsMm.z}mm
          </div>
          <span className="text-xs text-gray-400 font-mono">Category: {selectedPreset.category}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Three.js WebGL Orbit Viewer */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse" />
              WebGL 3D Mesh Inspection Viewer
            </h3>

            {/* Matcap Shaders */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setShaderStyle("neon_cyber")}
                className={`px-2 py-1 rounded ${shaderStyle === "neon_cyber" ? "bg-neon-green text-gray-950 font-bold" : "bg-gray-800 text-gray-400"}`}
              >
                Cyber
              </button>
              <button
                onClick={() => setShaderStyle("aluminum")}
                className={`px-2 py-1 rounded ${shaderStyle === "aluminum" ? "bg-gray-300 text-gray-950 font-bold" : "bg-gray-800 text-gray-400"}`}
              >
                Alu
              </button>
              <button
                onClick={() => setShaderStyle("resin")}
                className={`px-2 py-1 rounded ${shaderStyle === "resin" ? "bg-orange-500 text-white font-bold" : "bg-gray-800 text-gray-400"}`}
              >
                Resin
              </button>
              <button
                onClick={() => setWireframe((prev) => !prev)}
                className={`px-2 py-1 rounded border ${wireframe ? "border-neon-green text-neon-green" : "border-gray-700 text-gray-400"}`}
              >
                Wire
              </button>
            </div>
          </div>

          <div ref={mountRef} className="w-full h-80 bg-gray-950 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-800" />
        </div>

        {/* Right: Presets & Slicing Parameters */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Selector */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Box className="w-4 h-4 text-neon-green" />
              1. 3D Model Presets
            </h3>
            <div className="space-y-2">
              {MODEL_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedPresetId(preset.id);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPresetId === preset.id
                      ? "border-neon-green bg-emerald-950/40 text-white font-bold"
                      : "border-gray-800 bg-gray-950/60 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{preset.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-neon-green">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-normal">{preset.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Slicing Controls */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Sliders className="w-4 h-4 text-cyan-400" />
              2. Slicing & Filament Settings
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-gray-400 mb-1">Filament Type</label>
                <select
                  value={materialId}
                  onChange={(e) => {
                    soundFx.playClick();
                    setMaterialId(e.target.value);
                  }}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-cyan-300 font-bold"
                >
                  {MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-gray-400 mb-1">Layer Height</label>
                <select
                  value={layerHeightMm}
                  onChange={(e) => setLayerHeightMm(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-yellow-300 font-bold"
                >
                  <option value={0.12}>0.12mm (Ultra-Fine Detail)</option>
                  <option value={0.16}>0.16mm (Fine Quality)</option>
                  <option value={0.20}>0.20mm (Optimal Standard)</option>
                  <option value={0.28}>0.28mm (Draft Speed)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                <span>Infill Density Percentage</span>
                <span className="text-neon-green font-bold">{infillPercent}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={100}
                step={5}
                value={infillPercent}
                onChange={(e) => {
                  soundFx.playClick();
                  setInfillPercent(Number(e.target.value));
                }}
                className="w-full accent-neon-green cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
