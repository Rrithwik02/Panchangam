"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTimeOfDayOptional } from "./TimeOfDayProvider";

interface CelestialOrbit3DProps {
  className?: string;
  height?: number | string;
}

export function CelestialOrbit3D({
  className = "",
  height = "260px",
}: CelestialOrbit3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeOfDay = useTimeOfDayOptional();

  const info = timeOfDay?.info;
  const sunProgress = info?.sun.progress ?? 0.45;
  const moonProgress = info?.moon.progress ?? 0.8;
  const isNight = info?.phase === "night" || info?.phase === "dusk";
  const sunVisible = info?.sun.visible ?? true;
  const moonVisible = info?.moon.visible ?? true;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Canvas size
    const width = container.clientWidth || 600;
    const h = container.clientHeight || 260;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    camera.position.set(0, 0, 14);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // Fallback if WebGL unavailable
      return;
    }

    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(
      isNight ? 0x1e293b : 0xfffbeb,
      isNight ? 0.6 : 1.2
    );
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfbbf24, isNight ? 0.2 : 2.5, 30);
    scene.add(sunLight);

    // Celestial Arc Curve (Semi-circle in 3D)
    const radius = 7.5;
    const curvePoints: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI; // 0 to PI
      const x = -radius * Math.cos(theta); // Left to right (-radius to +radius)
      const y = radius * Math.sin(theta) - 2.5; // Arc height peaking at center
      const z = -Math.sin(theta) * 1.5; // Subtle depth curvature
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const arcGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const arcMaterial = new THREE.LineBasicMaterial({
      color: isNight ? 0x334155 : 0xd97706,
      transparent: true,
      opacity: isNight ? 0.35 : 0.45,
    });
    const arcLine = new THREE.Line(arcGeometry, arcMaterial);
    scene.add(arcLine);

    // Horizon Line (Subtle bottom reference)
    const horizonPoints = [
      new THREE.Vector3(-radius - 1, -2.5, 0),
      new THREE.Vector3(radius + 1, -2.5, 0),
    ];
    const horizonGeometry = new THREE.BufferGeometry().setFromPoints(horizonPoints);
    const horizonMaterial = new THREE.LineDashedMaterial({
      color: isNight ? 0x475569 : 0xc2410c,
      transparent: true,
      opacity: 0.25,
      dashSize: 0.3,
      gapSize: 0.2,
    });
    const horizonLine = new THREE.Line(horizonGeometry, horizonMaterial);
    horizonLine.computeLineDistances();
    scene.add(horizonLine);

    // Sun Sphere
    const sunGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);

    // Sun Glow Halo
    const sunHaloGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const sunHaloMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: isNight ? 0.05 : 0.25,
    });
    const sunHaloMesh = new THREE.Mesh(sunHaloGeo, sunHaloMat);
    sunMesh.add(sunHaloMesh);

    scene.add(sunMesh);

    // Moon Sphere
    const moonGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x94a3b8,
      emissiveIntensity: isNight ? 0.6 : 0.2,
      roughness: 0.6,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    // Helper function to position body along arc
    const updateBodyPosition = (
      mesh: THREE.Mesh,
      prog: number,
      visible: boolean
    ) => {
      const clampProg = Math.max(0, Math.min(1, prog));
      const theta = clampProg * Math.PI;
      const x = -radius * Math.cos(theta);
      const y = radius * Math.sin(theta) - 2.5;
      const z = -Math.sin(theta) * 1.5;

      mesh.position.set(x, y, z);
      mesh.visible = visible;
    };

    updateBodyPosition(sunMesh, sunProgress, sunVisible);
    sunLight.position.copy(sunMesh.position);
    updateBodyPosition(moonMesh, moonProgress, moonVisible);

    // Subtle animation loop (gently pulsing glow & mouse interaction)
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Subtle pulse on Sun halo
      sunHaloMesh.scale.setScalar(1 + Math.sin(elapsedTime * 1.5) * 0.06);

      // Smooth camera tilt towards mouse
      camera.position.x += (mouseX - camera.position.x) * 0.04;
      camera.position.y += (-mouseY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h_res = container.clientHeight;
      camera.aspect = w / h_res;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h_res);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      arcGeometry.dispose();
      arcMaterial.dispose();
    };
  }, [sunProgress, moonProgress, isNight, sunVisible, moonVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height }}
      aria-hidden="true"
    />
  );
}
