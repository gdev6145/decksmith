---
name: decksmith-3d-cad-stl-studio
description: >-
  Develop, enhance, or optimize 3D CAD modeling, STL mesh rendering, and 3D printing tools in Decksmith.
  Use when modifying CadStudio, StlViewerStudio, Three.js scenes, mesh bounding box calculations, or STL file exports.
---

# Decksmith 3D CAD & STL Mesh Studio Guide

This skill provides patterns for building high-performance 3D CAD and STL visualization studios in `apps/web/src/pages/`.

---

## 1. Setting Up Three.js / React Three Fiber Scene

When rendering 3D STL cyberdeck parts or chassis:

```tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function StlCanvas({ stlUrl }: { stlUrl: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020617"); // slate-950

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.2); // Cyan accent
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    // 3. Load STL
    const loader = new STLLoader();
    let mesh: THREE.Mesh | null = null;

    loader.load(stlUrl, (geometry) => {
      geometry.center();
      const material = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9, // sky-500
        roughness: 0.3,
        metalness: 0.8,
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });

    // 4. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 5. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, [stlUrl]);

  return <div ref={mountRef} className="w-full h-[500px] rounded-xl overflow-hidden" />;
}
```

---

## 2. Calculating Bounding Box & Print Dimensions

Always compute physical dimensions (mm) from STL geometries:

```ts
function getMeshDimensions(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  return {
    widthMm: size.x.toFixed(1),
    heightMm: size.y.toFixed(1),
    depthMm: size.z.toFixed(1),
  };
}
```
