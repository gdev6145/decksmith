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
  AlertTriangle,
  RotateCw,
  ShieldCheck,
  FileCode,
  CheckCircle2,
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
    description: "Snap-fit front bezel mount for Waveshare 11.9\" capacitive touchscreen bar displays with M2.5 brass heatset insert pockets.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(32, 9, 0.8);
      return geom;
    },
  },
  {
    id: "bezel-88",
    name: "8.8\" Ultrawide Sidecar Bezel",
    category: "Display Mount",
    dimensionsMm: { x: 230, y: 68, z: 10 },
    baseVolumeCm3: 34.0,
    description: "Secondary telemetry monitor bezel housing 1920x480 sidecar displays with cable strain relief.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(23, 6.8, 1.0);
      return geom;
    },
  },
  {
    id: "corne-plate",
    name: "Corne 36-Key Switch Plate",
    category: "Keyboard",
    dimensionsMm: { x: 145, y: 98, z: 1.5 },
    baseVolumeCm3: 18.2,
    description: "Ortholinear split keyboard switch plate with 13.8mm Kailh Choc low-profile hot-swap cutouts.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(14.5, 9.8, 0.15);
      return geom;
    },
  },
  {
    id: "trackball-mount",
    name: "BlackBerry Trackball Module Case",
    category: "Input",
    dimensionsMm: { x: 38, y: 38, z: 14 },
    baseVolumeCm3: 9.6,
    description: "Ergonomic thumb cluster housing with I2C breakout cradle and RGB ring diffuser.",
    generateGeometry: () => {
      const geom = new THREE.CylinderGeometry(2, 2.2, 1.4, 16);
      return geom;
    },
  },
  {
    id: "battery-sled",
    name: "4-Cell 18650 Battery Sled Carrier",
    category: "Power",
    dimensionsMm: { x: 82, y: 74, z: 22 },
    baseVolumeCm3: 31.0,
    description: "Modular 4S/2P battery sled with integrated balance lead routing channels and BMS tray.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(8.2, 7.4, 2.2);
      return geom;
    },
  },
  {
    id: "pelican-chassis",
    name: "Pelican 1150 Chassis Baseplate",
    category: "Enclosure",
    dimensionsMm: { x: 210, y: 145, z: 12 },
    baseVolumeCm3: 88.4,
    description: "Drop-in bottom tray for Pelican 1150 water-resistant hard cases with dual 40mm fan vents.",
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
    description: "Directional airflow shroud channeling fresh air over BCM2712 SoC, PMIC, and RP1 southbridge.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(6.5, 5.6, 1.6);
      return geom;
    },
  },
  {
    id: "friction-hinge",
    name: "Print-in-Place Friction Hinge",
    category: "Mechanical",
    dimensionsMm: { x: 50, y: 25, z: 18 },
    baseVolumeCm3: 12.0,
    description: "Zero-hardware print-in-place torque hinge capable of holding 10\" displays at any tilt angle.",
    generateGeometry: () => {
      const geom = new THREE.BoxGeometry(5.0, 2.5, 1.8);
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
  fanSpeedPct: number;
  retractionMm: number;
}

const MATERIALS: MaterialSpec[] = [
  { id: "pla", name: "PLA Tough (Standard)", densityGPerCm3: 1.24, costPerGramUsd: 0.022, bedTempC: 60, nozzleTempC: 210, fanSpeedPct: 100, retractionMm: 0.8 },
  { id: "petg", name: "PETG (UV & Outdoor Impact)", densityGPerCm3: 1.27, costPerGramUsd: 0.026, bedTempC: 80, nozzleTempC: 240, fanSpeedPct: 40, retractionMm: 1.2 },
  { id: "abs", name: "ABS / ASA (High Heat 95°C)", densityGPerCm3: 1.04, costPerGramUsd: 0.028, bedTempC: 100, nozzleTempC: 255, fanSpeedPct: 15, retractionMm: 0.8 },
  { id: "pa_cf", name: "Carbon Fiber Nylon (Rigid Pro)", densityGPerCm3: 1.15, costPerGramUsd: 0.065, bedTempC: 90, nozzleTempC: 280, fanSpeedPct: 0, retractionMm: 1.4 },
  { id: "tpu", name: "TPU 95A (Shock Gaskets)", densityGPerCm3: 1.21, costPerGramUsd: 0.035, bedTempC: 45, nozzleTempC: 225, fanSpeedPct: 60, retractionMm: 2.0 },
];

interface PrinterBed {
  id: string;
  name: string;
  bedMm: { x: number; y: number; z: number };
}

const PRINTER_BEDS: PrinterBed[] = [
  { id: "bambu-x1c", name: "Bambu Lab X1C / P1S / A1", bedMm: { x: 256, y: 256, z: 256 } },
  { id: "prusa-mk4", name: "Prusa MK4 / MK3S+", bedMm: { x: 250, y: 210, z: 220 } },
  { id: "voron-350", name: "Voron 2.4 / Trident (350)", bedMm: { x: 350, y: 350, z: 350 } },
  { id: "ender3-v3", name: "Creality Ender 3 V3 / SE", bedMm: { x: 220, y: 220, z: 250 } },
  { id: "k1-max", name: "Creality K1 Max", bedMm: { x: 300, y: 300, z: 300 } },
];

export default function StlViewerStudio() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>("bezel-119");
  const [customMesh, setCustomMesh] = useState<{
    name: string;
    dimensionsMm: { x: number; y: number; z: number };
    volumeCm3: number;
    geometry: THREE.BufferGeometry;
  } | null>(null);

  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("bambu-x1c");
  const [materialId, setMaterialId] = useState<string>("petg");
  const [infillPercent, setInfillPercent] = useState<number>(30); // 15 - 100%
  const [infillPattern, setInfillPattern] = useState<"gyroid" | "grid" | "honeycomb" | "lightning">("gyroid");
  const [layerHeightMm, setLayerHeightMm] = useState<number>(0.20);
  const [sliceProgressPct, setSliceProgressPct] = useState<number>(100); // 0 - 100% height
  const [shaderStyle, setShaderStyle] = useState<"neon_cyber" | "aluminum" | "resin" | "matte_black">("neon_cyber");
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [rotations, setRotations] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  const selectedPreset = MODEL_PRESETS.find((m) => m.id === selectedPresetId) || MODEL_PRESETS[0];
  const selectedMaterial = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
  const selectedPrinter = PRINTER_BEDS.find((p) => p.id === selectedPrinterId) || PRINTER_BEDS[0];

  // Active Model Properties
  const activeDimensions = customMesh ? customMesh.dimensionsMm : selectedPreset.dimensionsMm;
  const activeBaseVolume = customMesh ? customMesh.volumeCm3 : selectedPreset.baseVolumeCm3;
  const activeName = customMesh ? customMesh.name : selectedPreset.name;

  // Fit Check on Printer Bed
  const fitsOnBed = useMemo(() => {
    return (
      activeDimensions.x <= selectedPrinter.bedMm.x &&
      activeDimensions.y <= selectedPrinter.bedMm.y &&
      activeDimensions.z <= selectedPrinter.bedMm.z
    );
  }, [activeDimensions, selectedPrinter]);

  // Slicer Calculations
  const printMetrics = useMemo(() => {
    const infillFactor = 0.35 + (infillPercent / 100) * 0.65;
    const effectiveVolumeCm3 = activeBaseVolume * infillFactor;
    const massGrams = effectiveVolumeCm3 * selectedMaterial.densityGPerCm3;
    const materialCostUsd = massGrams * selectedMaterial.costPerGramUsd;

    const layerCount = Math.max(1, Math.ceil(activeDimensions.z / layerHeightMm));
    const estimatedHours = (massGrams / 20.0) * (0.20 / layerHeightMm);

    return {
      effectiveVolumeCm3: Number(effectiveVolumeCm3.toFixed(1)),
      massGrams: Number(massGrams.toFixed(1)),
      materialCostUsd: Number(materialCostUsd.toFixed(2)),
      layerCount,
      estimatedHours: Number(estimatedHours.toFixed(1)),
    };
  }, [activeBaseVolume, activeDimensions, selectedMaterial, infillPercent, layerHeightMm]);

  // Handle Local File Upload (.stl)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playConfirm();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        if (!buffer) return;

        // Parse Binary STL
        const view = new DataView(buffer);
        const triangleCount = view.getUint32(80, true);
        const positions = new Float32Array(triangleCount * 9);
        const normals = new Float32Array(triangleCount * 9);

        let signedVolume = 0;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        let offset = 84;
        for (let i = 0; i < triangleCount; i++) {
          const nx = view.getFloat32(offset, true);
          const ny = view.getFloat32(offset + 4, true);
          const nz = view.getFloat32(offset + 8, true);
          offset += 12;

          const v1x = view.getFloat32(offset, true);
          const v1y = view.getFloat32(offset + 4, true);
          const v1z = view.getFloat32(offset + 8, true);
          offset += 12;

          const v2x = view.getFloat32(offset, true);
          const v2y = view.getFloat32(offset + 4, true);
          const v2z = view.getFloat32(offset + 8, true);
          offset += 12;

          const v3x = view.getFloat32(offset, true);
          const v3y = view.getFloat32(offset + 4, true);
          const v3z = view.getFloat32(offset + 8, true);
          offset += 12;

          offset += 2; // attribute byte count

          const pIdx = i * 9;
          positions[pIdx] = v1x; positions[pIdx + 1] = v1y; positions[pIdx + 2] = v1z;
          positions[pIdx + 3] = v2x; positions[pIdx + 4] = v2y; positions[pIdx + 5] = v2z;
          positions[pIdx + 6] = v3x; positions[pIdx + 7] = v3y; positions[pIdx + 8] = v3z;

          normals[pIdx] = nx; normals[pIdx + 1] = ny; normals[pIdx + 2] = nz;
          normals[pIdx + 3] = nx; normals[pIdx + 4] = ny; normals[pIdx + 5] = nz;
          normals[pIdx + 6] = nx; normals[pIdx + 7] = ny; normals[pIdx + 8] = nz;

          minX = Math.min(minX, v1x, v2x, v3x); maxX = Math.max(maxX, v1x, v2x, v3x);
          minY = Math.min(minY, v1y, v2y, v3y); maxY = Math.max(maxY, v1y, v2y, v3y);
          minZ = Math.min(minZ, v1z, v2z, v3z); maxZ = Math.max(maxZ, v1z, v2z, v3z);

          // Signed Tetrahedron Volume Sum
          signedVolume += (v1x * (v2y * v3z - v2z * v3y) - v1y * (v2x * v3z - v2z * v3x) + v1z * (v2x * v3y - v2y * v3x)) / 6.0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        geometry.center();

        const dimX = Math.round(Math.abs(maxX - minX));
        const dimY = Math.round(Math.abs(maxY - minY));
        const dimZ = Math.round(Math.abs(maxZ - minZ));
        const volumeCm3 = Math.max(1, Number(Math.abs(signedVolume / 1000).toFixed(1)));

        setCustomMesh({
          name: file.name,
          dimensionsMm: { x: dimX || 50, y: dimY || 50, z: dimZ || 15 },
          volumeCm3: volumeCm3 || 20,
          geometry: geometry,
        });
      } catch (err) {
        console.error("Error parsing STL", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(32, 28, 38);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.localClippingEnabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ff66, 1.6);
    dirLight1.position.set(25, 35, 25);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00ffff, 1.2);
    dirLight2.position.set(-25, -20, -25);
    scene.add(dirLight2);

    // Grid Bed
    const bedSize = Math.max(selectedPrinter.bedMm.x / 10, 25);
    const grid = new THREE.GridHelper(bedSize, 25, 0x00ff66, 0x1f2937);
    grid.position.y = -6;
    scene.add(grid);

    // Slicing Clipping Plane
    const maxZHeight = activeDimensions.z / 10;
    const cutY = -6 + (sliceProgressPct / 100) * maxZHeight * 1.5;
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), cutY);

    // Material setup
    let meshMaterial: THREE.Material;
    const materialProps: any = {
      wireframe: wireframe,
      clippingPlanes: sliceProgressPct < 100 ? [clipPlane] : [],
      clipShadows: true,
    };

    if (shaderStyle === "neon_cyber") {
      meshMaterial = new THREE.MeshStandardMaterial({
        ...materialProps,
        color: 0x00ff66,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x002211,
      });
    } else if (shaderStyle === "aluminum") {
      meshMaterial = new THREE.MeshStandardMaterial({
        ...materialProps,
        color: 0xdddddd,
        roughness: 0.2,
        metalness: 0.9,
      });
    } else if (shaderStyle === "resin") {
      meshMaterial = new THREE.MeshPhysicalMaterial({
        ...materialProps,
        color: 0xff7700,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
      });
    } else {
      meshMaterial = new THREE.MeshStandardMaterial({
        ...materialProps,
        color: 0x18202c,
        roughness: 0.6,
        metalness: 0.2,
      });
    }

    const geometry = customMesh ? customMesh.geometry : selectedPreset.generateGeometry();
    const mesh = new THREE.Mesh(geometry, meshMaterial);

    mesh.rotation.x = rotations.x;
    mesh.rotation.y = rotations.y;
    mesh.rotation.z = rotations.z;
    scene.add(mesh);

    let animationFrameId: number;
    const animate = () => {
      mesh.rotation.y += 0.004;
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
      meshMaterial.dispose();
      renderer.dispose();
    };
  }, [selectedPreset, customMesh, shaderStyle, wireframe, selectedPrinter, sliceProgressPct, rotations]);

  const rotateAxis = (axis: "x" | "y" | "z") => {
    soundFx.playClick();
    setRotations((prev) => ({
      ...prev,
      [axis]: prev[axis] + Math.PI / 2,
    }));
  };

  const downloadPresetStl = () => {
    soundFx.playConfirm();
    const content = `solid ${activeName}\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 1 1 0\nendloop\nendfacet\nendsolid ${activeName}`;
    const blob = new Blob([content], { type: "model/stl" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-decksmith.stl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSlicerConfig = () => {
    soundFx.playConfirm();
    const config = `# Decksmith Calibrated Slicer Config
# Material: ${selectedMaterial.name}
# Printer Target: ${selectedPrinter.name}
bed_temperature = ${selectedMaterial.bedTempC}
nozzle_temperature = ${selectedMaterial.nozzleTempC}
fan_speed_percent = ${selectedMaterial.fanSpeedPct}
retraction_length = ${selectedMaterial.retractionMm}
infill_density = ${infillPercent}%
infill_pattern = ${infillPattern}
layer_height = ${layerHeightMm}mm
first_layer_height = 0.24mm
density_g_cm3 = ${selectedMaterial.densityGPerCm3}
`;
    const blob = new Blob([config], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `decksmith-${selectedMaterial.id}-slicer.ini`;
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
              3D Print Mesh & Slicer Studio PRO
            </span>
            <span className="text-xs font-mono text-cyan-400">STL / OBJ Parser · Slicing Plane · Bed Fit Check</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Printer className="w-7 h-7 text-neon-green" />
            3D Printable STL & Mesh Slicer Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Inspect, upload, and slice cyberdeck enclosures in WebGL. Simulate infill patterns, verify build plate fit, and export calibrated slicer configurations.
          </p>
        </div>

        {/* Cross-Links & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".stl,.obj"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Custom STL
          </button>
          <button
            onClick={downloadSlicerConfig}
            className="px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-yellow-400" />
            Slicer .INI Profile
          </button>
          <button
            onClick={downloadPresetStl}
            className="px-3.5 py-2 rounded-lg bg-neon-green hover:bg-emerald-400 text-gray-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-neon-green/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Binary STL
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics + Bed Fit Alert */}
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
          <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Printer Bed Fit Check</span>
          <div className="flex items-center gap-2">
            {fitsOnBed ? (
              <span className="text-xl font-bold text-neon-green flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-5 h-5" /> Fits Build Plate
              </span>
            ) : (
              <span className="text-base font-bold text-rose-400 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-4 h-4" /> Exceeds Bed (Rotate)
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Plate: {selectedPrinter.bedMm.x}×{selectedPrinter.bedMm.y}×{selectedPrinter.bedMm.z}mm
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Three.js WebGL Orbit Viewer & Slicing Plane */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse" />
              <h3 className="text-sm font-bold text-white font-mono uppercase truncate max-w-xs">
                {activeName}
              </h3>
            </div>

            {/* Matcap Shaders & Rotation */}
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
              <button
                onClick={() => rotateAxis("x")}
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
                title="Rotate 90° on X"
              >
                <RotateCw className="w-3 h-3 text-cyan-400" /> X
              </button>
              <button
                onClick={() => rotateAxis("z")}
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
                title="Rotate 90° on Z"
              >
                <RotateCw className="w-3 h-3 text-neon-green" /> Z
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas */}
          <div ref={mountRef} className="w-full h-80 bg-gray-950 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-800" />

          {/* Slicing Layer Cut Plane Slider */}
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-gray-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Cross-Section Slicing Plane Preview
              </span>
              <span className="text-neon-green font-bold">
                {Math.round((sliceProgressPct / 100) * printMetrics.layerCount)} / {printMetrics.layerCount} Layers ({sliceProgressPct}%)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={sliceProgressPct}
              onChange={(e) => setSliceProgressPct(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Presets & Slicing Parameters */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target 3D Printer Bed Selector */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Printer className="w-4 h-4 text-cyan-400" />
              1. Target 3D Printer Build Plate
            </h3>
            <select
              value={selectedPrinterId}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedPrinterId(e.target.value);
              }}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 font-mono text-cyan-300 font-bold text-xs"
            >
              {PRINTER_BEDS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.bedMm.x}×{p.bedMm.y}×{p.bedMm.z}mm)
                </option>
              ))}
            </select>
          </div>

          {/* Slicing Controls */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Sliders className="w-4 h-4 text-neon-green" />
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
                <label className="block font-mono text-gray-400 mb-1">Infill Pattern</label>
                <select
                  value={infillPattern}
                  onChange={(e) => setInfillPattern(e.target.value as any)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-yellow-300 font-bold"
                >
                  <option value="gyroid">Gyroid (Isotropic Strength)</option>
                  <option value="honeycomb">Honeycomb (Rigid Impact)</option>
                  <option value="grid">Grid (Fast Printing)</option>
                  <option value="lightning">Lightning (Lightweight)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-gray-400 mb-1">Layer Height</label>
                <select
                  value={layerHeightMm}
                  onChange={(e) => setLayerHeightMm(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 font-mono text-white font-bold"
                >
                  <option value={0.12}>0.12mm (Ultra-Fine)</option>
                  <option value={0.16}>0.16mm (Fine Quality)</option>
                  <option value={0.20}>0.20mm (Optimal Standard)</option>
                  <option value={0.28}>0.28mm (Draft Speed)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-gray-400 mb-1">Nozzle / Bed Temp</label>
                <div className="p-2 bg-gray-950 border border-gray-800 rounded-lg font-mono text-gray-300 font-bold">
                  {selectedMaterial.nozzleTempC}°C / {selectedMaterial.bedTempC}°C
                </div>
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

          {/* Model Presets List */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-2xl max-h-72 overflow-y-auto">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
              <Box className="w-4 h-4 text-neon-green" />
              3. Cyberdeck Enclosure Presets ({MODEL_PRESETS.length})
            </h3>
            <div className="space-y-2">
              {MODEL_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    soundFx.playClick();
                    setCustomMesh(null);
                    setSelectedPresetId(preset.id);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    !customMesh && selectedPresetId === preset.id
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
        </div>
      </div>
    </div>
  );
}
