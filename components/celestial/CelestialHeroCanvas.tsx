"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTimeOfDayOptional } from "./TimeOfDayProvider";

export function CelestialHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const timeOfDay = useTimeOfDayOptional();
  const info = timeOfDay?.info;
  const moonPhase = timeOfDay?.moonPhase;

  const sunProgress = info?.sun.progress ?? 0.4;
  const moonProgress = info?.moon.progress ?? 0.75;
  const isNight = info?.phase === "night" || info?.phase === "dusk";

  // Real Moon Phase Illumination and Waxing state from API
  const illumination = moonPhase?.illumination ?? 0.65;
  const isWaxing = moonPhase?.isWaxing ?? true;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 450;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Three.js Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(
      isNight ? 0x1e293b : 0xfffbeb,
      isNight ? 0.35 : 0.85
    );
    scene.add(ambientLight);

    // --- REALISTIC SUN ---
    const sunRadius = 0.85;
    const sunGeo = new THREE.SphereGeometry(sunRadius, 64, 64);
    
    // Custom Procedural Solar Surface Material
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfff7ed,
      emissive: 0xf59e0b,
      emissiveIntensity: isNight ? 0.4 : 1.2,
      roughness: 0.2,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);

    // Soft Solar Corona Glow Halo
    const coronaGeo = new THREE.SphereGeometry(sunRadius * 1.4, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: isNight ? 0.08 : 0.25,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunMesh.add(coronaMesh);

    // Sun Point Light
    const sunLight = new THREE.PointLight(0xfef08a, isNight ? 0.4 : 3.0, 50);
    sunMesh.add(sunLight);
    sceneGroup.add(sunMesh);

    // --- REALISTIC MOON & DYNAMIC MOON PHASE ---
    const moonRadius = 0.65;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 64, 64);

    // Realistic Lunar Surface with Bump/Terrain feel
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
      metalness: 0.1,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;

    // Dedicated Directional Light for Moon Phase (Positioned according to illumination & waxing)
    // Angle ranges: Waxing (0 to PI), Waning (PI to 2*PI)
    const phaseAngle = (isWaxing ? illumination : 2 - illumination) * Math.PI;
    const moonLight = new THREE.DirectionalLight(0xffffff, isNight ? 2.5 : 1.8);
    
    // Position light source relative to Moon to illuminate exact crescent/quarter/gibbous phase
    const lightDist = 10;
    moonLight.position.set(
      Math.sin(phaseAngle) * lightDist,
      0.5 * lightDist,
      Math.cos(phaseAngle) * lightDist
    );
    scene.add(moonLight);
    sceneGroup.add(moonMesh);

    // --- CELESTIAL ARC PATH & STARS ---
    const arcRadius = 9.5;
    const arcPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI; // 0 (left rise) to PI (right set)
      const x = -arcRadius * Math.cos(theta);
      const y = arcRadius * Math.sin(theta) - 3.8;
      const z = -Math.sin(theta) * 2.2;
      arcPoints.push(new THREE.Vector3(x, y, z));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineBasicMaterial({
      color: isNight ? 0x334155 : 0xd97706,
      transparent: true,
      opacity: isNight ? 0.25 : 0.35,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    sceneGroup.add(arcLine);

    // Static Background Stars
    const starCount = 150;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 40;
      starPos[i + 1] = Math.random() * 16 - 2;
      starPos[i + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 0.1,
      transparent: true,
      opacity: isNight ? 0.55 : 0.05,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Update Celestial Body Positions on Arc
    const updateArcPosition = (mesh: THREE.Mesh, progress: number, visible: boolean) => {
      const p = Math.max(0, Math.min(1, progress));
      const theta = p * Math.PI;
      const x = -arcRadius * Math.cos(theta);
      const y = arcRadius * Math.sin(theta) - 3.8;
      const z = -Math.sin(theta) * 2.2;
      mesh.position.set(x, y, z);
      mesh.visible = visible;
    };

    updateArcPosition(sunMesh, sunProgress, info?.sun.visible ?? true);
    updateArcPosition(moonMesh, moonProgress, info?.moon.visible ?? true);

    // --- INTERACTIVE POINTER DRAG & PARALLAX ---
    let targetRotX = 0;
    let targetRotY = 0;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMouseX = clientX;
      previousMouseY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - previousMouseX;
        const deltaY = clientY - previousMouseY;
        targetRotY += deltaX * 0.003;
        targetRotX += deltaY * 0.003;
        previousMouseX = clientX;
        previousMouseY = clientY;
      } else {
        // Subtle hover tilt
        const rect = container.getBoundingClientRect();
        targetRotY = ((clientX - rect.left) / rect.width - 0.5) * 0.25;
        targetRotX = ((clientY - rect.top) / rect.height - 0.5) * 0.2;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", handlePointerDown);
    container.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    container.addEventListener("touchstart", handlePointerDown, { passive: true });
    container.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Very slow natural rotation of Sun & Moon
      sunMesh.rotation.y = elapsedTime * 0.05;
      moonMesh.rotation.y = elapsedTime * 0.02;

      // Smooth Lerp Dampening for Pointer Drag & Parallax
      sceneGroup.rotation.y += (targetRotY - sceneGroup.rotation.y) * 0.05;
      sceneGroup.rotation.x += (targetRotX - sceneGroup.rotation.x) * 0.05;

      // Clamp rotation angles so scene doesn't flip upside down
      sceneGroup.rotation.x = Math.max(-0.35, Math.min(0.35, sceneGroup.rotation.x));
      sceneGroup.rotation.y = Math.max(-0.6, Math.min(0.6, sceneGroup.rotation.y));

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
      container.removeEventListener("mousedown", handlePointerDown);
      container.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      container.removeEventListener("touchstart", handlePointerDown);
      container.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      window.removeEventListener("resize", handleResize);

      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      arcGeo.dispose();
      arcMat.dispose();
    };
  }, [sunProgress, moonProgress, isNight, illumination, isWaxing, info?.sun.visible, info?.moon.visible]);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-card-muted/40 via-background to-background pointer-events-none" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing overflow-hidden select-none"
      aria-label="Interactive Astronomical Instrument"
    />
  );
}
