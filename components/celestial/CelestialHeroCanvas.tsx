"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTimeOfDayOptional } from "./TimeOfDayProvider";

/** Generates a realistic lunar surface texture with craters and maria patches */
function createLunarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Base lunar grey terrain
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(0, 0, 512, 256);

  // Maria (dark basaltic plains)
  const mariaColors = ["#475569", "#334155", "#1e293b"];
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 45 + 15;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, mariaColors[i % mariaColors.length]);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters (light rims with dark centers)
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 12 + 2;

    // Rim
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Floor shadow
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(x + r * 0.2, y + r * 0.2, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

/** Generates a natural radial sunbeam/ray texture (Ref Image 1 & 2) */
function createSunbeamTexture(isSunset: boolean): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const center = 256;

  // Core radial glow
  const coreGrad = ctx.createRadialGradient(center, center, 0, center, center, 240);
  if (isSunset) {
    coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    coreGrad.addColorStop(0.2, "rgba(251, 146, 60, 0.7)");
    coreGrad.addColorStop(0.5, "rgba(234, 88, 12, 0.35)");
    coreGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  } else {
    coreGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    coreGrad.addColorStop(0.25, "rgba(254, 240, 138, 0.8)");
    coreGrad.addColorStop(0.55, "rgba(245, 158, 11, 0.35)");
    coreGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
  }
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, 512, 512);

  // 16 Bursting Radial Sunbeams (Ref Image 1)
  const numRays = 16;
  ctx.save();
  ctx.translate(center, center);
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2;
    const rayLength = 230 + Math.random() * 20;
    const width = 0.08 + Math.random() * 0.04;

    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-Math.sin(width) * rayLength, rayLength);
    ctx.lineTo(Math.sin(width) * rayLength, rayLength);
    ctx.closePath();

    const rayGrad = ctx.createLinearGradient(0, 0, 0, rayLength);
    if (isSunset) {
      rayGrad.addColorStop(0, "rgba(254, 215, 170, 0.45)");
      rayGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
    } else {
      rayGrad.addColorStop(0, "rgba(255, 255, 255, 0.55)");
      rayGrad.addColorStop(1, "rgba(250, 204, 21, 0)");
    }
    ctx.fillStyle = rayGrad;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

export function CelestialHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const timeOfDay = useTimeOfDayOptional();
  const info = timeOfDay?.info;
  const moonPhase = timeOfDay?.moonPhase;

  const sunProgress = info?.sun.progress ?? 0.45;
  const moonProgress = info?.moon.progress ?? 0.8;
  const phase = info?.phase ?? "day";
  const isNight = phase === "night";
  const isSunsetOrSunrise = phase === "dawn" || phase === "dusk" || sunProgress < 0.18 || sunProgress > 0.82;

  // Real API Moon Phase Illumination and Waxing state
  const illumination = moonPhase?.illumination ?? 0.65;
  const isWaxing = moonPhase?.isWaxing ?? true;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 450;

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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // Dynamic Ambient Light
    const ambientLight = new THREE.AmbientLight(
      isSunsetOrSunrise ? 0xea580c : isNight ? 0x1e293b : 0xfffbeb,
      isSunsetOrSunrise ? 0.7 : isNight ? 0.35 : 0.95
    );
    scene.add(ambientLight);

    // --- 1. REALISTIC SUN & RADIAL SUNBEAMS (Ref Image 1 & 2) ---
    const sunRadius = 0.9;
    const sunGeo = new THREE.SphereGeometry(sunRadius, 64, 64);
    
    // Core Sun Material (Brilliant warm-white/golden core)
    const sunMat = new THREE.MeshStandardMaterial({
      color: isSunsetOrSunrise ? 0xffedd5 : 0xffffff,
      emissive: isSunsetOrSunrise ? 0xea580c : 0xf59e0b,
      emissiveIntensity: isSunsetOrSunrise ? 1.4 : 1.1,
      roughness: 0.1,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);

    // Natural Radial Sunbeams Sprite Billboard (Ref Image 1 & 2)
    const sunbeamTexture = createSunbeamTexture(isSunsetOrSunrise);
    const sunbeamMat = new THREE.SpriteMaterial({
      map: sunbeamTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: isNight ? 0.1 : isSunsetOrSunrise ? 0.85 : 0.75,
    });
    const sunbeamSprite = new THREE.Sprite(sunbeamMat);
    sunbeamSprite.scale.set(7.5, 7.5, 1);
    sunMesh.add(sunbeamSprite);

    // Sun Point Light
    const sunLight = new THREE.PointLight(
      isSunsetOrSunrise ? 0xf97316 : 0xfef08a,
      isNight ? 0.3 : 3.2,
      45
    );
    sunMesh.add(sunLight);
    sceneGroup.add(sunMesh);

    // --- 2. REALISTIC MOON & DYNAMIC API PHASE SHADER (Ref Image 3) ---
    const moonRadius = 0.7;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 64, 64);
    const lunarTexture = createLunarTexture();

    const moonMat = new THREE.MeshStandardMaterial({
      map: lunarTexture,
      bumpMap: lunarTexture,
      bumpScale: 0.04,
      roughness: 0.85,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;

    // Dedicated Directional Sunlight for Dynamic Moon Phase Shadowing (Ref Image 3)
    const phaseAngle = (isWaxing ? illumination : 2 - illumination) * Math.PI;
    const moonSunlight = new THREE.DirectionalLight(0xffffff, isNight ? 2.6 : 1.6);
    
    const lightDist = 12;
    moonSunlight.position.set(
      Math.sin(phaseAngle) * lightDist,
      0.4 * lightDist,
      Math.cos(phaseAngle) * lightDist
    );
    scene.add(moonSunlight);
    sceneGroup.add(moonMesh);

    // --- 3. CELESTIAL ARC PATH & STARS ---
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
      color: isSunsetOrSunrise ? 0xea580c : isNight ? 0x334155 : 0xd97706,
      transparent: true,
      opacity: isSunsetOrSunrise ? 0.45 : isNight ? 0.25 : 0.35,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    sceneGroup.add(arcLine);

    // Static Background Stars
    const starCount = 160;
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
      opacity: isNight ? 0.55 : isSunsetOrSunrise ? 0.2 : 0.05,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Update Celestial Arc Positions
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

    // --- 4. INTERACTIVE POINTER DRAG & PARALLAX ---
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

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Very slow natural rotation
      sunMesh.rotation.y = elapsedTime * 0.04;
      moonMesh.rotation.y = elapsedTime * 0.015;

      // Gentle rotation pulse of sunbeam rays
      sunbeamSprite.rotation.z = Math.sin(elapsedTime * 0.5) * 0.03;

      // Smooth Lerp Dampening
      sceneGroup.rotation.y += (targetRotY - sceneGroup.rotation.y) * 0.05;
      sceneGroup.rotation.x += (targetRotX - sceneGroup.rotation.x) * 0.05;

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
      sunbeamTexture.dispose();
      sunbeamMat.dispose();
      moonGeo.dispose();
      lunarTexture.dispose();
      moonMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      arcGeo.dispose();
      arcMat.dispose();
    };
  }, [sunProgress, moonProgress, phase, isNight, isSunsetOrSunrise, illumination, isWaxing, info?.sun.visible, info?.moon.visible]);

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
