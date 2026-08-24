import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  HARDWARE_CAD_SPECS,
  type FaceplateConfig,
  getComponentEffectiveDimensions,
} from "../lib/cadEngine";

interface Cad3DViewerProps {
  faceplate: FaceplateConfig;
  materialId: string;
  explodedOffset: number;
  autoRotate?: boolean;
}

export function Cad3DViewer({ faceplate, materialId, explodedOffset, autoRotate = false }: Cad3DViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const width = container.clientWidth || 700;
      const height = container.clientHeight || 500;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0f1d);

      const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
      camera.position.set(0, -240, 260);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x00f3ff, 1.8);
      dirLight.position.set(150, -150, 300);
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0xff007f, 1.2);
      rimLight.position.set(-150, 150, -100);
      scene.add(rimLight);

      // Grid
      const grid = new THREE.GridHelper(400, 40, 0x00f3ff, 0x1e293b);
      grid.rotation.x = Math.PI / 2;
      grid.position.z = -30;
      scene.add(grid);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Faceplate Dimensions
      const w = faceplate.plateWidth;
      const h = faceplate.plateHeight;
      const hw = w / 2;
      const hh = h / 2;

      // Base Faceplate Mesh (Using robust BoxGeometry with beveled look)
      let plateColor = 0x0f172a;
      let plateMetal = 0.2;
      let plateRough = 0.2;
      let plateTrans = 0.5;

      if (materialId.includes("aluminum")) {
        plateColor = 0x94a3b8;
        plateMetal = 0.85;
        plateRough = 0.25;
        plateTrans = 0.0;
      } else if (materialId.includes("carbon")) {
        plateColor = 0x1e293b;
        plateMetal = 0.1;
        plateRough = 0.4;
        plateTrans = 0.0;
      } else if (materialId.includes("fr4")) {
        plateColor = 0x064e3b;
        plateMetal = 0.2;
        plateRough = 0.3;
        plateTrans = 0.0;
      }

      const plateMat = new THREE.MeshStandardMaterial({
        color: plateColor,
        metalness: plateMetal,
        roughness: plateRough,
        transparent: plateTrans > 0,
        opacity: plateTrans > 0 ? 0.85 : 1.0,
      });

      const plateGeo = new THREE.BoxGeometry(w, h, 3.0);
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.z = explodedOffset * 0.8;
      rootGroup.add(plateMesh);

      const standoffMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.9,
        roughness: 0.2,
      });

      const screwMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.15,
      });

      // Mounting Holes / Screws on Faceplate Corners
      for (const hole of faceplate.mountingHoles) {
        const hx = hole.x - hw;
        const hy = hh - hole.y;
        const screwGeo = new THREE.CylinderGeometry(hole.diameter / 2 + 0.5, hole.diameter / 2 + 0.5, 1.2, 12);
        const screw = new THREE.Mesh(screwGeo, screwMat);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(hx, hy, 2.0 + explodedOffset * 0.8);
        rootGroup.add(screw);
      }

      // Placed Component 3D Models
      for (const placed of faceplate.placedComponents) {
        const spec = HARDWARE_CAD_SPECS[placed.componentId];
        if (!spec) continue;

        const dim = getComponentEffectiveDimensions(spec, placed.rotation);
        const cx = placed.x + dim.width / 2 - hw;
        const cy = hh - (placed.y + dim.height / 2);

        const compGroup = new THREE.Group();

        // Base PCB
        const pcbColor =
          spec.category === "DISPLAY" ? 0x0284c7 : spec.category === "SBC" ? 0x16a34a : spec.category === "KEYBOARD" ? 0x6366f1 : 0x475569;
        const pcbMat = new THREE.MeshStandardMaterial({ color: pcbColor, metalness: 0.3, roughness: 0.3 });
        const pcbGeo = new THREE.BoxGeometry(dim.width, dim.height, 1.6);
        const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
        compGroup.add(pcbMesh);

        // Screen glass / Key dome top feature
        if (spec.category === "DISPLAY") {
          const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x030712, roughness: 0.05, metalness: 0.8 });
          const glassGeo = new THREE.BoxGeometry(dim.width * 0.88, dim.height * 0.82, 1.2);
          const glassMesh = new THREE.Mesh(glassGeo, glassMat);
          glassMesh.position.z = 1.4;
          compGroup.add(glassMesh);
        } else if (spec.category === "KEYBOARD") {
          const keyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
          const keyGeo = new THREE.BoxGeometry(dim.width * 0.85, dim.height * 0.75, 2.5);
          const keyMesh = new THREE.Mesh(keyGeo, keyMat);
          keyMesh.position.z = 2.0;
          compGroup.add(keyMesh);
        } else if (spec.category === "SBC") {
          // Port Block Extrusions (Ethernet, USB)
          const portMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
          const portGeo = new THREE.BoxGeometry(15, 14, 12);
          const portMesh = new THREE.Mesh(portGeo, portMat);
          portMesh.position.set(dim.width / 2 - 8, 0, 6.0);
          compGroup.add(portMesh);
        }

        // Standoffs
        for (const h of spec.holes) {
          const shx = h.x - spec.width / 2;
          const shy = spec.height / 2 - h.y;
          const standoffGeo = new THREE.CylinderGeometry(1.8, 1.8, 10.0, 6);
          const standoffMesh = new THREE.Mesh(standoffGeo, standoffMat);
          standoffMesh.rotation.x = Math.PI / 2;
          standoffMesh.position.set(shx, shy, -5.0 - explodedOffset * 0.4);
          compGroup.add(standoffMesh);
        }

        compGroup.position.set(cx, cy, -8.0 - explodedOffset * 0.3);
        rootGroup.add(compGroup);
      }

      // Drag Orbit Handling
      let isMouseDown = false;
      let prevMousePos = { x: 0, y: 0 };

      const onMouseDown = (e: MouseEvent) => {
        isMouseDown = true;
        prevMousePos = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isMouseDown) return;
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;

        rootGroup.rotation.z += deltaX * 0.008;
        rootGroup.rotation.x += deltaY * 0.008;

        prevMousePos = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isMouseDown = false;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        camera.position.z = Math.max(100, Math.min(800, camera.position.z + e.deltaY * 0.3));
      };

      container.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      container.addEventListener("wheel", onWheel, { passive: false });

      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (autoRotate && !isMouseDown) {
          rootGroup.rotation.z += 0.004;
        }
        renderer?.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animId);
        container.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        container.removeEventListener("wheel", onWheel);
        renderer?.dispose();
      };
    } catch (err) {
      console.error("WebGL 3D Viewer Initialization error:", err);
      setHasError(true);
    }
  }, [faceplate, materialId, explodedOffset, autoRotate]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-950 border border-gray-800 rounded-2xl min-h-[480px] text-center">
        <div className="space-y-2">
          <div className="text-sm font-bold text-amber-400">3D WebGL Acceleration Unavailable</div>
          <p className="text-xs text-gray-400">Switching to 2D Technical Blueprint view mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-gray-950 border border-gray-800">
      <div ref={mountRef} className="w-full h-full min-h-[480px] cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 left-4 pointer-events-none text-[11px] font-mono text-cyan-400 bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-1.5 backdrop-blur-md">
        🖱️ Click & Drag to Orbit · Scroll to Zoom
      </div>
    </div>
  );
}
