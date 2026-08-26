import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Layers,
  Box,
  Cpu,
  Monitor,
  BatteryCharging,
  Keyboard,
  Wrench,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sliders,
  Maximize2,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Zap,
  Check,
  Hammer,
  Play,
  Pause,
  CheckSquare,
  Square,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";

interface AssemblyStep {
  step: number;
  title: string;
  subtitle: string;
  layerIndex: number;
  description: string;
  tools: string[];
  fasteners: string[];
  torque: string;
  cautions: string[];
  specs: Record<string, string>;
}

const ASSEMBLY_STEPS: AssemblyStep[] = [
  {
    step: 1,
    title: "Chassis Shell & Heat-Set Inserts",
    subtitle: "Pelican / Apache 1150 Rugged Base Preparation",
    layerIndex: 0,
    description: "Prepare the injection-molded rugged copolymer case. Use a temperature-controlled soldering iron (280°C) with a conical tip to gently press M3 brass heat-set threaded inserts into the pre-modeled mounting bosses.",
    tools: ["Soldering Iron @ 280°C", "Heat-Set Insert Tip", "Flush Cutters"],
    fasteners: ["6x M3x4.5mm Brass Heat-Set Inserts"],
    torque: "Friction Melt (Flush to rim)",
    cautions: ["Do not overheat the plastic to avoid warping outer chassis walls", "Allow inserts to cool for 2 minutes before testing threads"],
    specs: {
      "Case Model": "Pelican 1150 / Apache 1800",
      "Insert Type": "M3 x 4.5mm x 5.0mm Brass Knurled",
      "Boss Diameter": "4.2mm Core Bore",
    },
  },
  {
    step: 2,
    title: "Battery Tray & Power Isolation",
    subtitle: "3S 18650 LiFePO4 Pack & 5V 5A Buck Converter",
    layerIndex: 1,
    description: "Install the 3D-printed PETG battery containment cradle into the lower chassis bay. Seat the 3S battery pack with Kapton electrical insulation tape, then mount the synchronous 5V 5A step-down buck converter.",
    tools: ["Hex Driver 2.0mm", "Kapton Tape", "Silicone Thermal Pad"],
    fasteners: ["4x M3x6mm Button Head Screws", "4x M3 Nylon Washers"],
    torque: "0.6 N·m (Snug)",
    cautions: ["Verify battery terminal polarity with multimeter before connecting converter", "Ensure 1mm silicone thermal pad sits under buck inductor"],
    specs: {
      "Pack Configuration": "3S1P 18650 (11.1V Nominal, 3500mAh)",
      "Buck Efficiency": "94.5% @ 5V 5A continuous",
      "Protection": "Over-discharge cutoff @ 9.0V",
    },
  },
  {
    step: 3,
    title: "SBC Mainboard & Hex Standoffs",
    subtitle: "Raspberry Pi 5 / CM4 Carrier Alignment",
    layerIndex: 2,
    description: "Thread four M2.5x12mm female-female brass standoffs into the chassis base. Place the SBC mainboard over the standoffs, aligning the 40-pin GPIO header and USB ports toward the access ports.",
    tools: ["Hex Nut Driver 5.0mm", "PH1 Precision Screwdriver"],
    fasteners: ["4x M2.5x12mm Brass Hex Standoffs", "4x M2.5x4mm Pan Head Screws"],
    torque: "0.4 N·m (Do not crush PCB)",
    cautions: ["Use nylon washers under screw heads to prevent trace abrasion", "Ensure active cooler fan clearance above SoC"],
    specs: {
      "SBC Compatibility": "Raspberry Pi 5 / Orange Pi 5 / CM4 IO",
      "Standoff Height": "12.0mm Brass",
      "Mounting Pattern": "58.0mm x 49.0mm",
    },
  },
  {
    step: 4,
    title: "Internal Wiring & Ribbon Looms",
    subtitle: "Micro-HDMI FPC, USB Interconnects & LoRa SMA",
    layerIndex: 3,
    description: "Route the ultra-thin FPC ribbon cable from the SBC Micro-HDMI port to the display bridge board. Connect the internal USB JST-PH harness to the split keyboard controller and route the SMA coaxial pigtail to the antenna gland.",
    tools: ["Curved Tweezers", "Anti-Static Wrist Strap", "FPC Cable Bender"],
    fasteners: ["2x Adhesive Zip Tie Anchors", "Kapton Wire Tape"],
    torque: "Hand seated & ZIF latch locked",
    cautions: ["Do not crease FPC ribbon cables beyond 90-degree radius", "Ensure antenna coaxial cable avoids high-current 5V power leads"],
    specs: {
      "HDMI Cable": "Ultra-flexible 0.2mm FPC Ribbon",
      "Antenna Lead": "RG178 50Ω Coaxial (15cm)",
      "I2C Bus Wire": "28 AWG Silicone Stranded",
    },
  },
  {
    step: 5,
    title: "Laser-Cut Top Deck Faceplate",
    subtitle: "3.0mm Matte Black Acrylic / 6061-T6 Aluminum",
    layerIndex: 4,
    description: "Position the laser-cut or CNC-milled top deck panel over the internal sub-chassis. Align the display cutout, keyboard bezel wells, and toggle switch ports with the sub-chassis mounting pillars.",
    tools: ["Hex Driver 2.5mm", "Microfiber Cloth"],
    fasteners: ["6x M3x8mm Countersunk Hex Screws"],
    torque: "0.5 N·m (Even diagonal sequence)",
    cautions: ["Tighten screws in a criss-cross star pattern to prevent panel bowing", "Check that no internal wiring is pinched between plates"],
    specs: {
      "Material": "6061-T6 Aluminum / Cast Acrylic",
      "Finish": "Hard Anodized Matte Black",
      "Panel Thickness": "2.5mm ±0.1mm",
    },
  },
  {
    step: 6,
    title: "Bar Display & Split Keyboard Latch",
    subtitle: "11.9\" Ultrawide Touch LCD & Sofle v2 Integration",
    layerIndex: 5,
    description: "Snap the 11.9-inch 320x1480 ultrawide bar display into the custom 3D-printed bezel retaining frame. Seat the Sofle v2 ortholinear keyboard halves into their magnetic quick-release bays and connect the TRRS interconnect cord.",
    tools: ["Plastic Pry Tool", "Microfiber Cleaning Cloth"],
    fasteners: ["4x M2.5x6mm Bezel Retaining Screws", "8x N52 Neodymium Magnets"],
    torque: "0.3 N·m (Gentle bezel hold)",
    cautions: ["Peel LCD protective film only after bezel is securely fastened", "Do not press on bare glass LCD corners during seating"],
    specs: {
      "Display Panel": "11.9-inch IPS (320 x 1480, Capacitive Touch)",
      "Keyboard Switch": "Kailh Choc V1 Low-Profile Brown",
      "Keycap Profile": "MBK PBT Ergonomic",
    },
  },
  {
    step: 7,
    title: "Final Fastening & Weather Sealing",
    subtitle: "IP65 O-Ring Gasket Seal & Power-On Self-Test",
    layerIndex: 6,
    description: "Install the silicone perimeter O-ring gasket around the outer lip. Perform final torque check on all enclosure perimeter screws, close the Pelican latches, and initiate first-boot Built-In Self-Test (BIST).",
    tools: ["Torque Screwdriver (0.8 N·m)", "Digital Caliper"],
    fasteners: ["Perimeter EPDM Silicone O-Ring Gasket", "M3 Anti-Vibration O-Rings"],
    torque: "0.8 N·m Final Torque",
    cautions: ["Verify O-ring is fully seated in channel with no twists", "Perform cold boot test on battery power before sealing case"],
    specs: {
      "Ingress Protection": "IP65 Dust & Water Jet Resistant",
      "Total Weight": "1,240g (Fully Loaded Field Deck)",
      "Drop Rating": "MIL-STD-810G 1.2m Shock",
    },
  },
];

export default function AssemblyGuideStudio() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [explosionRatio, setExplosionRatio] = useState<number>(45);
  const [viewMode, setViewMode] = useState<"solid" | "xray" | "wireframe">("solid");
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [highlightedLayer, setHighlightedLayer] = useState<number | null>(null);
  const [isAutoAssembling, setIsAutoAssembling] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const layerGroupsRef = useRef<THREE.Group[]>([]);

  // Auto-assembly animation timer
  useEffect(() => {
    let interval: any = null;
    if (isAutoAssembling) {
      interval = setInterval(() => {
        setExplosionRatio((prev) => {
          if (prev <= 2) {
            setIsAutoAssembling(false);
            soundFx.playConfirm();
            return 0;
          }
          return Math.max(0, prev - 2);
        });
      }, 40);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoAssembling]);

  const toggleStepCompleted = (stepNum: number) => {
    soundFx.playClick();
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 540;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 14, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ff66, 1.6);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f3ff, 1.2);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // Grid Floor
    const grid = new THREE.GridHelper(30, 30, 0x00f3ff, 0x1e2638);
    grid.position.y = -6;
    scene.add(grid);

    // Build 7 Discrete Mechanical Stacking Layers
    const groups: THREE.Group[] = [];

    // Layer 0: Copolymer Chassis Enclosure
    const g0 = new THREE.Group();
    const caseGeo = new THREE.BoxGeometry(10, 2.5, 8);
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x181e29, roughness: 0.8, metalness: 0.2 });
    const caseMesh = new THREE.Mesh(caseGeo, caseMat);
    g0.add(caseMesh);
    g0.userData = { baseY: -3.5, layerId: 0, name: "Chassis Base Enclosure" };
    scene.add(g0);
    groups.push(g0);

    // Layer 1: Battery Tray & 18650 LiFePO4 Pack
    const g1 = new THREE.Group();
    const batTrayGeo = new THREE.BoxGeometry(8, 0.6, 6);
    const batTrayMat = new THREE.MeshStandardMaterial({ color: 0x222d3d });
    const batTray = new THREE.Mesh(batTrayGeo, batTrayMat);
    g1.add(batTray);
    for (let i = 0; i < 3; i++) {
      const cellGeo = new THREE.CylinderGeometry(0.5, 0.5, 3.2, 16);
      const cellMat = new THREE.MeshStandardMaterial({ color: 0x00cc44, metalness: 0.6 });
      const cell = new THREE.Mesh(cellGeo, cellMat);
      cell.rotation.z = Math.PI / 2;
      cell.position.set(-1.8 + i * 1.8, 0.4, 0);
      g1.add(cell);
    }
    g1.userData = { baseY: -2.2, layerId: 1, name: "Battery Tray & Power Module" };
    scene.add(g1);
    groups.push(g1);

    // Layer 2: Mainboard PCB & Active Cooler
    const g2 = new THREE.Group();
    const sbcGeo = new THREE.BoxGeometry(5.8, 0.2, 4.9);
    const sbcMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 });
    const sbcMesh = new THREE.Mesh(sbcGeo, sbcMat);
    g2.add(sbcMesh);
    const coolerGeo = new THREE.BoxGeometry(2.4, 0.5, 2.4);
    const coolerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const cooler = new THREE.Mesh(coolerGeo, coolerMat);
    cooler.position.set(0, 0.35, 0);
    g2.add(cooler);
    g2.userData = { baseY: -0.9, layerId: 2, name: "SBC Mainboard & Cooler" };
    scene.add(g2);
    groups.push(g2);

    // Layer 3: Cable Loom, FPC Ribbon & Antenna Routing
    const g3 = new THREE.Group();
    const loomCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2, 0, -1.5),
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(2, 0, 1.5),
    ]);
    const loomGeo = new THREE.TubeGeometry(loomCurve, 20, 0.12, 8, false);
    const loomMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const loomMesh = new THREE.Mesh(loomGeo, loomMat);
    g3.add(loomMesh);
    g3.userData = { baseY: 0.3, layerId: 3, name: "Internal Wiring Loom & Antennas" };
    scene.add(g3);
    groups.push(g3);

    // Layer 4: Laser-Cut Top Faceplate
    const g4 = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(9.6, 0.3, 7.6);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    g4.add(plateMesh);
    g4.userData = { baseY: 1.4, layerId: 4, name: "Top Deck Faceplate" };
    scene.add(g4);
    groups.push(g4);

    // Layer 5: Ultrawide Bar Display & Split Keyboard
    const g5 = new THREE.Group();
    const lcdGeo = new THREE.BoxGeometry(8.2, 0.15, 2.2);
    const lcdMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, roughness: 0.1, metalness: 0.9 });
    const lcdMesh = new THREE.Mesh(lcdGeo, lcdMat);
    lcdMesh.position.set(0, 0.2, -2.2);
    g5.add(lcdMesh);
    for (const kx of [-2.4, 2.4]) {
      const kbGeo = new THREE.BoxGeometry(3.6, 0.2, 3.2);
      const kbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const kbMesh = new THREE.Mesh(kbGeo, kbMat);
      kbMesh.position.set(kx, 0.2, 1.2);
      g5.add(kbMesh);
      for (let r = -1.2; r <= 1.2; r += 0.6) {
        for (let c = -1.0; c <= 1.0; c += 0.5) {
          const capGeo = new THREE.BoxGeometry(0.45, 0.2, 0.45);
          const capMesh = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0x00ff66 }));
          capMesh.position.set(kx + r, 0.4, 1.2 + c);
          g5.add(capMesh);
        }
      }
    }
    g5.userData = { baseY: 2.6, layerId: 5, name: "Bar Display & Split Keyboard" };
    scene.add(g5);
    groups.push(g5);

    // Layer 6: Fasteners, Countersunk Screws & O-Ring Gasket
    const g6 = new THREE.Group();
    const screwCoords = [
      [-4.6, -3.4], [0, -3.4], [4.6, -3.4],
      [-4.6, 3.4], [0, 3.4], [4.6, 3.4],
    ];
    screwCoords.forEach(([sx, sz]) => {
      const scrGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12);
      const scrMesh = new THREE.Mesh(scrGeo, new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95 }));
      scrMesh.position.set(sx, 0, sz);
      g6.add(scrMesh);
    });
    // Perimeter Silicone Gasket
    const gasketGeo = new THREE.BoxGeometry(9.8, 0.15, 7.4);
    const gasketMesh = new THREE.Mesh(gasketGeo, new THREE.MeshStandardMaterial({ color: 0xff0055, wireframe: true }));
    g6.add(gasketMesh);
    g6.userData = { baseY: 3.8, layerId: 6, name: "Fasteners & O-Ring Gasket" };
    scene.add(g6);
    groups.push(g6);

    layerGroupsRef.current = groups;

    // Animation Loop
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating) {
        angle += 0.005;
        camera.position.x = Math.cos(angle) * 18;
        camera.position.z = Math.sin(angle) * 18;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Explosion Spacing
  useEffect(() => {
    const factor = explosionRatio / 50; // 0 to 2
    layerGroupsRef.current.forEach((g) => {
      const baseY = g.userData.baseY || 0;
      g.position.y = baseY * factor;

      // Apply highlighting
      const isTarget = highlightedLayer === null || highlightedLayer === g.userData.layerId;
      g.visible = isTarget;
    });
  }, [explosionRatio, highlightedLayer]);

  // Update Material Shading Mode
  useEffect(() => {
    layerGroupsRef.current.forEach((g) => {
      g.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (viewMode === "wireframe") {
            mat.wireframe = true;
            mat.transparent = false;
            mat.opacity = 1.0;
          } else if (viewMode === "xray") {
            mat.wireframe = false;
            mat.transparent = true;
            mat.opacity = 0.35;
          } else {
            mat.wireframe = false;
            mat.transparent = false;
            mat.opacity = 1.0;
          }
        }
      });
    });
  }, [viewMode]);

  const currentStepData = ASSEMBLY_STEPS[activeStep - 1];

  const handleNextStep = () => {
    soundFx.playClick();
    if (activeStep < ASSEMBLY_STEPS.length) {
      setActiveStep((s) => s + 1);
      setHighlightedLayer(ASSEMBLY_STEPS[activeStep].layerIndex);
    }
  };

  const handlePrevStep = () => {
    soundFx.playClick();
    if (activeStep > 1) {
      setActiveStep((s) => s - 1);
      setHighlightedLayer(ASSEMBLY_STEPS[activeStep - 2].layerIndex);
    }
  };

  const handleExportManual = () => {
    soundFx.playConfirm();
    let md = `# DECKSMITH CYBERDECK FIELD ASSEMBLY MANUAL\n`;
    md += `Generated: ${new Date().toUTCString()}\n\n`;
    md += `## Overview\n`;
    md += `This step-by-step mechanical stacking manual guides the assembly of a modular cyberdeck enclosure with verified fastener torque specifications.\n\n`;
    md += `---\n\n`;

    ASSEMBLY_STEPS.forEach((s) => {
      md += `## Step ${s.step}: ${s.title}\n`;
      md += `**Subsystem**: ${s.subtitle}\n\n`;
      md += `${s.description}\n\n`;
      md += `### Fasteners & Tools\n`;
      md += `- **Fasteners**: ${s.fasteners.join(", ")}\n`;
      md += `- **Required Tools**: ${s.tools.join(", ")}\n`;
      md += `- **Torque Spec**: ${s.torque}\n\n`;
      md += `### Assembly Cautions\n`;
      s.cautions.forEach((c) => (md += `- ⚠️ ${c}\n`));
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decksmith-assembly-field-manual.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Interactive 3D Exploded Assembly Simulator
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            3D Stacking Guide & Mechanical Assembly
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Step-by-step layer explosion, fastener torque limits, tool checklists & printable build manual
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportManual}
            className="px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-neon-green text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-neon-green" />
            Export Field Manual (.md)
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Viewport (7 Cols) + Stepper & Fastener Guide (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Exploded Assembly Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl h-[560px]">
            {/* Three.js Canvas Container */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Viewport Overlay Controls (Top Left) */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
              <div className="flex bg-gray-900/90 border border-gray-800 rounded-xl p-1 backdrop-blur-md">
                {(["solid", "xray", "wireframe"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      soundFx.playClick();
                      setViewMode(m);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      viewMode === m
                        ? "bg-neon-green text-black shadow-md shadow-neon-green/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsRotating(!isRotating);
                }}
                className={`p-2 rounded-xl border backdrop-blur-md text-xs font-bold transition-all ${
                  isRotating
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-gray-900/90 text-gray-400 border-gray-800"
                }`}
                title="Toggle Auto-Rotation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Auto-Assemble Play Button */}
              <button
                onClick={() => {
                  soundFx.playConfirm();
                  if (!isAutoAssembling && explosionRatio === 0) setExplosionRatio(100);
                  setIsAutoAssembling(!isAutoAssembling);
                }}
                className="px-3 py-1.5 bg-neon-green/20 border border-neon-green/50 text-neon-green rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md hover:bg-neon-green/30"
              >
                {isAutoAssembling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoAssembling ? "Pause Animation" : "Auto-Assemble"}</span>
              </button>
            </div>

            {/* Explosion Slider Overlay (Bottom) */}
            <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-gray-900/90 border border-gray-800/90 rounded-2xl backdrop-blur-md flex items-center gap-4 z-10 shadow-2xl">
              <div className="flex items-center gap-2 shrink-0">
                <Sliders className="w-4 h-4 text-neon-green" />
                <span className="text-xs font-bold text-white uppercase">Explosion: {explosionRatio}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={explosionRatio}
                onChange={(e) => setExplosionRatio(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-neon-green"
              />

              <button
                onClick={() => {
                  soundFx.playClick();
                  setExplosionRatio(explosionRatio === 0 ? 60 : 0);
                }}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] font-bold rounded-lg border border-gray-700 shrink-0"
              >
                {explosionRatio === 0 ? "Explode View" : "Collapse 0%"}
              </button>
            </div>
          </div>
        </div>

        {/* Stepper Guide & Fastener Details (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Step Card */}
          <div className="p-6 bg-gray-900/90 border border-gray-800 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neon-green text-black">
                  Stage {currentStepData.step} / {ASSEMBLY_STEPS.length}
                </span>
                <span className="text-xs text-gray-400 font-bold">{currentStepData.subtitle}</span>
              </div>

              {/* Fastener Checked Indicator */}
              <button
                onClick={() => toggleStepCompleted(currentStepData.step)}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  completedSteps.has(currentStepData.step)
                    ? "bg-emerald-950 text-neon-green border-neon-green/40"
                    : "bg-gray-950 text-gray-500 border-gray-800 hover:text-white"
                }`}
              >
                {completedSteps.has(currentStepData.step) ? <CheckSquare className="w-4 h-4 text-neon-green" /> : <Square className="w-4 h-4" />}
                <span>{completedSteps.has(currentStepData.step) ? "Torqued ✓" : "Mark Done"}</span>
              </button>
            </div>

            <div>
              <h2 className="text-lg font-black text-white">{currentStepData.title}</h2>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">{currentStepData.description}</p>
            </div>

            {/* Fasteners & Torque Limits */}
            <div className="p-4 bg-gray-950/80 border border-gray-800/80 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-yellow-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Torque Limit:
                </span>
                <span>{currentStepData.torque}</span>
              </div>

              <div className="text-[11px] text-gray-400">
                <span className="font-bold text-gray-300">Fasteners: </span>
                {currentStepData.fasteners.join(", ")}
              </div>

              <div className="text-[11px] text-gray-400">
                <span className="font-bold text-gray-300">Tools: </span>
                {currentStepData.tools.join(", ")}
              </div>
            </div>

            {/* Cautions */}
            <div className="space-y-1.5">
              {currentStepData.cautions.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <button
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                className="px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Layer
              </button>

              <button
                onClick={handleNextStep}
                disabled={activeStep === ASSEMBLY_STEPS.length}
                className="px-4 py-2 bg-neon-green text-black font-bold rounded-xl text-xs hover:bg-neon-green/90 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 shadow-md shadow-neon-green/20"
              >
                Next Layer
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
