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
    cautions: ["Handle FPC ribbon cables by blue reinforcement tabs only; never crease", "Do not power on while antenna pigtail is disconnected (SDR/LoRa safety)"],
    specs: {
      "Display Interface": "0.5mm pitch 40-Pin FPC Flat Ribbon",
      "USB Loom": "4-Pin JST-PH 2.0mm",
      "RF Pigtail": "RG178 50Ω IPEX to SMA Female",
    },
  },
  {
    step: 5,
    title: "CNC Top Deck Faceplate",
    subtitle: "Anodized Aluminum / Laser-Cut Acrylic Panel",
    layerIndex: 4,
    description: "Lower the precision CNC-machined 2.5mm anodized aluminum top deck plate over the lower tray assembly. Seat the IP67 waterproof rocker power switch and USB-C bulkhead charging pass-through jack.",
    tools: ["Hex Driver 2.5mm", "Spanner Wrench for SMA Nut"],
    fasteners: ["6x M3x10mm Countersunk Hex Screws"],
    torque: "0.8 N·m (Cross-pattern tightening)",
    cautions: ["Tighten screws in diagonal X-pattern to ensure even compression", "Check that no internal wiring is pinched between plate and case lip"],
    specs: {
      "Material": "6061-T6 Aluminum / 3mm Matte Acrylic",
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

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const layerGroupsRef = useRef<THREE.Group[]>([]);

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
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ff66, 1.8);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d8ff, 1.4);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0xff0077, 0.8);
    dirLight3.position.set(0, 15, -15);
    scene.add(dirLight3);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x00ff66, 0x1f293d);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    // 7 Mechanical Cyberdeck Assembly Layers
    const groups: THREE.Group[] = [];

    // Layer 0: Rugged Pelican 1150 Base Shell
    const g0 = new THREE.Group();
    const shellGeo = new THREE.BoxGeometry(10, 1.8, 7.5);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.4,
      metalness: 0.3,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    g0.add(shellMesh);
    // Reinforcement ribs
    for (let r = -3.5; r <= 3.5; r += 1.75) {
      const ribGeo = new THREE.BoxGeometry(0.3, 0.4, 7.6);
      const ribMesh = new THREE.Mesh(ribGeo, new THREE.MeshStandardMaterial({ color: 0x1e2638 }));
      ribMesh.position.set(r, -0.9, 0);
      g0.add(ribMesh);
    }
    g0.userData = { baseY: -3.0, layerId: 0, name: "Chassis Shell & Heat-Sets" };
    scene.add(g0);
    groups.push(g0);

    // Layer 1: Battery Tray & Buck Converter
    const g1 = new THREE.Group();
    const battTrayGeo = new THREE.BoxGeometry(8.5, 0.6, 6.0);
    const battTrayMat = new THREE.MeshStandardMaterial({ color: 0x182030, roughness: 0.5 });
    const battTrayMesh = new THREE.Mesh(battTrayGeo, battTrayMat);
    g1.add(battTrayMesh);
    // 3x 18650 Cylinders
    for (let b = -1.8; b <= 1.8; b += 1.8) {
      const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 4.5, 16);
      cylGeo.rotateZ(Math.PI / 2);
      const cylMesh = new THREE.Mesh(cylGeo, new THREE.MeshStandardMaterial({ color: 0x00ff66, metalness: 0.6, roughness: 0.2 }));
      cylMesh.position.set(0, 0.4, b);
      g1.add(cylMesh);
    }
    // Buck Converter Module
    const buckGeo = new THREE.BoxGeometry(2.0, 0.5, 1.8);
    const buckMesh = new THREE.Mesh(buckGeo, new THREE.MeshStandardMaterial({ color: 0x003366, metalness: 0.8 }));
    buckMesh.position.set(2.8, 0.4, 0);
    g1.add(buckMesh);
    g1.userData = { baseY: -1.8, layerId: 1, name: "Battery Tray & Buck Converter" };
    scene.add(g1);
    groups.push(g1);

    // Layer 2: SBC Mainboard & Hex Standoffs
    const g2 = new THREE.Group();
    const sbcGeo = new THREE.BoxGeometry(6.5, 0.2, 4.5);
    const sbcMat = new THREE.MeshStandardMaterial({ color: 0x0f5132, roughness: 0.3, metalness: 0.5 });
    const sbcMesh = new THREE.Mesh(sbcGeo, sbcMat);
    g2.add(sbcMesh);
    // SoC chip
    const socGeo = new THREE.BoxGeometry(1.6, 0.2, 1.6);
    const socMesh = new THREE.Mesh(socGeo, new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 }));
    socMesh.position.set(-0.8, 0.2, 0);
    g2.add(socMesh);
    // 40-Pin GPIO Header
    const gpioGeo = new THREE.BoxGeometry(4.2, 0.4, 0.5);
    const gpioMesh = new THREE.Mesh(gpioGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
    gpioMesh.position.set(0, 0.3, -1.8);
    g2.add(gpioMesh);
    // 4 Standoffs
    const standoffCoords = [[-3, -2], [3, -2], [-3, 2], [3, 2]];
    standoffCoords.forEach(([sx, sz]) => {
      const stGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8);
      const stMesh = new THREE.Mesh(stGeo, new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
      stMesh.position.set(sx, -0.4, sz);
      g2.add(stMesh);
    });
    g2.userData = { baseY: -0.6, layerId: 2, name: "SBC Mainboard & Standoffs" };
    scene.add(g2);
    groups.push(g2);

    // Layer 3: FPC Ribbon Cables & LoRa Pigtails
    const g3 = new THREE.Group();
    const ribbonGeo = new THREE.BoxGeometry(5.0, 0.05, 3.2);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xc97a14, metalness: 0.3, roughness: 0.6 });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    g3.add(ribbonMesh);
    // Antenna Coax Pigtail
    const coaxGeo = new THREE.TorusGeometry(1.5, 0.08, 8, 24, Math.PI);
    coaxGeo.rotateX(Math.PI / 2);
    const coaxMesh = new THREE.Mesh(coaxGeo, new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 }));
    coaxMesh.position.set(2.5, 0.1, 0);
    g3.add(coaxMesh);
    g3.userData = { baseY: 0.4, layerId: 3, name: "Internal Wiring & Ribbons" };
    scene.add(g3);
    groups.push(g3);

    // Layer 4: CNC Anodized Aluminum Top Deck Plate
    const g4 = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(9.6, 0.25, 7.2);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x1f2430, metalness: 0.85, roughness: 0.2 });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    g4.add(plateMesh);
    // Screen Cutout Bezel Edge
    const bezelCutGeo = new THREE.BoxGeometry(7.6, 0.28, 2.6);
    const bezelCutMesh = new THREE.Mesh(bezelCutGeo, new THREE.MeshStandardMaterial({ color: 0x00d8ff, wireframe: true }));
    bezelCutMesh.position.set(0, 0.02, -1.8);
    g4.add(bezelCutMesh);
    g4.userData = { baseY: 1.4, layerId: 4, name: "CNC Aluminum Top Deck Plate" };
    scene.add(g4);
    groups.push(g4);

    // Layer 5: Ultrawide Bar LCD & Sofle v2 Split Keyboard
    const g5 = new THREE.Group();
    // 11.9" Bar LCD Glass
    const screenGeo = new THREE.BoxGeometry(7.4, 0.2, 2.4);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x001122, metalness: 0.9, roughness: 0.05 });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.1, -1.8);
    g5.add(screenMesh);
    // Split Keyboard Halves
    for (const kx of [-2.2, 2.2]) {
      const kbGeo = new THREE.BoxGeometry(3.6, 0.35, 3.2);
      const kbMesh = new THREE.Mesh(kbGeo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 }));
      kbMesh.position.set(kx, 0.18, 1.2);
      g5.add(kbMesh);
      // Keycaps Matrix dots
      for (let r = -1.2; r <= 1.2; r += 0.6) {
        for (let c = -1.2; c <= 1.2; c += 0.6) {
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
      g.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (highlightedLayer !== null) {
            if (g.userData.layerId === highlightedLayer) {
              child.material.emissive = new THREE.Color(0x00ff66);
              child.material.emissiveIntensity = 0.5;
            } else {
              child.material.emissive = new THREE.Color(0x000000);
              child.material.opacity = 0.25;
              child.material.transparent = true;
            }
          } else {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.transparent = viewMode === "xray";
            child.material.opacity = viewMode === "xray" ? 0.45 : 1.0;
            child.material.wireframe = viewMode === "wireframe";
          }
        }
      });
    });
  }, [explosionRatio, highlightedLayer, viewMode]);

  const currentStepData = ASSEMBLY_STEPS[activeStep - 1] || ASSEMBLY_STEPS[0];

  const handleNextStep = () => {
    soundFx.playClick();
    if (activeStep < ASSEMBLY_STEPS.length) {
      setActiveStep(activeStep + 1);
      setHighlightedLayer(ASSEMBLY_STEPS[activeStep].layerIndex);
    }
  };

  const handlePrevStep = () => {
    soundFx.playClick();
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      setHighlightedLayer(ASSEMBLY_STEPS[activeStep - 2].layerIndex);
    }
  };

  const handleExportManual = () => {
    soundFx.playConfirm();
    let md = "# 🛠️ Cyberdeck Mechanical Assembly & Stacking Field Manual\n\n";
    md += `*Generated by Decksmith Studio on ${new Date().toLocaleDateString()}*\n\n`;

    ASSEMBLY_STEPS.forEach((s) => {
      md += `## Step ${s.step}: ${s.title}\n`;
      md += `**Subtitle**: ${s.subtitle}\n`;
      md += `**Description**: ${s.description}\n\n`;
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
                className="flex-1 accent-neon-green cursor-pointer h-2 bg-gray-950 rounded-lg"
              />

              <button
                onClick={() => {
                  soundFx.playClick();
                  setExplosionRatio(explosionRatio === 0 ? 60 : 0);
                }}
                className="px-3 py-1 bg-gray-950 border border-gray-700 text-xs font-bold text-cyan-300 rounded-lg shrink-0"
              >
                {explosionRatio === 0 ? "Explode" : "Collapse"}
              </button>
            </div>
          </div>

          {/* Layer Quick Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-gray-500 font-bold uppercase shrink-0">Layers:</span>
            {ASSEMBLY_STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => {
                  soundFx.playClick();
                  setActiveStep(s.step);
                  setHighlightedLayer(s.layerIndex);
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeStep === s.step
                    ? "bg-neon-green text-black border-neon-green shadow-md shadow-neon-green/10"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                L{s.step}: {s.title.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Step-by-Step Mechanical Guide (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Step Detail Card */}
          <div className="p-6 bg-gray-900/80 border border-gray-800 rounded-3xl space-y-5 backdrop-blur-md shadow-xl">
            {/* Step Navigation Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-neon-green uppercase tracking-wider">
                  Phase {activeStep} of {ASSEMBLY_STEPS.length}
                </span>
                <h2 className="text-lg font-black text-white mt-0.5">{currentStepData.title}</h2>
                <div className="text-xs text-cyan-400 font-bold">{currentStepData.subtitle}</div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={handlePrevStep}
                  disabled={activeStep === 1}
                  className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 hover:text-white disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={activeStep === ASSEMBLY_STEPS.length}
                  className="p-2 rounded-xl bg-neon-green text-black font-bold disabled:opacity-30"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Description */}
            <p className="text-xs text-gray-300 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Fasteners, Tools & Torque Specs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-2xl space-y-1">
                <div className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  Required Fasteners
                </div>
                {currentStepData.fasteners.map((f, i) => (
                  <div key={i} className="text-xs font-bold text-white">{f}</div>
                ))}
              </div>

              <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-2xl space-y-1">
                <div className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                  <Hammer className="w-3.5 h-3.5 text-yellow-400" />
                  Torque Limit
                </div>
                <div className="text-xs font-bold text-yellow-400">{currentStepData.torque}</div>
              </div>
            </div>

            {/* Tools Checklist */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Tools Checklist</div>
              <div className="flex flex-wrap gap-1.5">
                {currentStepData.tools.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-[11px] text-gray-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-neon-green" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Assembly Cautions */}
            <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-2xl space-y-1.5">
              <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Assembly Caution & Precautions
              </div>
              {currentStepData.cautions.map((c, i) => (
                <div key={i} className="text-[11px] text-gray-300 leading-relaxed">• {c}</div>
              ))}
            </div>

            {/* Technical Specs Table */}
            <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-2xl space-y-1.5">
              <div className="text-[10px] text-gray-500 font-bold uppercase">Mechanical Stacking Specs</div>
              <div className="space-y-1">
                {Object.entries(currentStepData.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-gray-400">{k}:</span>
                    <span className="text-white font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
