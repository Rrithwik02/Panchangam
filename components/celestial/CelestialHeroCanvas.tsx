"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTimeOfDayOptional } from "./TimeOfDayProvider";

export function CelestialHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeOfDay = useTimeOfDayOptional();

  const info = timeOfDay?.info;
  const sunProgress = info?.sun.progress ?? 0.4;
  const moonProgress = info?.moon.progress ?? 0.8;
  const isNight = info?.phase === "night" || info?.phase === "dusk";
  const sunVisible = info?.sun.visible ?? true;
  const moonVisible = info?.moon.visible ?? true;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(
      isNight ? 0x1e293b : 0xfffbeb,
      isNight ? 0.7 : 1.4
    );
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfbbf24, isNight ? 0.3 : 2.8, 40);
    scene.add(sunLight);

    // Subtle Stars Background (for night/dusk)
    const starCount = 180;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 35;
      starPositions[i + 1] = Math.random() * 14 - 2;
      starPositions[i + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 0.12,
      transparent: true,
      opacity: isNight ? 0.6 : 0.05,
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // Semi-Circular Celestial Arc (Left to Right)
    const radius = 9.0;
    const curvePoints: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI; // 0 (left) to PI (right)
      const x = -radius * Math.cos(theta); // -9 (left rise) to +9 (right set)
      const y = radius * Math.sin(theta) - 3.2; // Arc peak in upper center
      const z = -Math.sin(theta) * 2.0; // Subtle Z depth
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const arcGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const arcMaterial = new THREE.LineBasicMaterial({
      color: isNight ? 0x475569 : 0xd97706,
      transparent: true,
      opacity: isNight ? 0.25 : 0.35,
    });
    const arcLine = new THREE.Line(arcGeometry, arcMaterial);
    scene.add(arcLine);

    // Sun Sphere
    const sunGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);

    // Sun Halo
    const haloGeo = new THREE.SphereGeometry(1.25, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: isNight ? 0.08 : 0.22,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    sunMesh.add(haloMesh);
    scene.add(sunMesh);

    // Moon Sphere
    const moonGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x94a3b8,
      emissiveIntensity: isNight ? 0.7 : 0.15,
      roughness: 0.5,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    // Helper: Position body along arc from left (rise) to right (set)
    const setPositionOnArc = (mesh: THREE.Mesh, prog: number, visible: boolean) => {
      const p = Math.max(0, Math.min(1, prog));
      const theta = p * Math.PI;
      const x = -radius * Math.cos(theta);
      const y = radius * Math.sin(theta) - 3.2;
      const z = -Math.sin(theta) * 2.0;

      mesh.position.set(x, y, z);
      mesh.visible = visible;
    };

    setPositionOnArc(sunMesh, sunProgress, sunVisible);
    sunLight.position.copy(sunMesh.position);
    setPositionOnArc(moonMesh, moonProgress, moonVisible);

    // Gentle Animation Loop
    let animId: number;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Gentle pulsing of Sun halo
      haloMesh.scale.setScalar(1 + Math.sin(elapsedTime * 1.2) * 0.05);

      // Subtle parallax camera motion
      camera.position.x += (mouseX - camera.position.x) * 0.03;
      camera.position.y += (-mouseY - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      arcGeometry.dispose();
      arcMaterial.dispose();
    };
  }, [sunProgress, moonProgress, isNight, sunVisible, moonVisible]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
