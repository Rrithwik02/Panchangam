"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/motion";
import { useTimeOfDayOptional } from "./TimeOfDayProvider";

gsap.registerPlugin(useGSAP);

function Stars() {
  const stars = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (i * 17 + 11) % 100,
    y: (i * 23 + 7) % 55,
    size: 1 + (i % 3) * 0.5,
    delay: (i % 5) * 0.4,
  }));

  return (
    <g className="celestial-stars" aria-hidden="true">
      {stars.map((star) => (
        <circle
          key={star.id}
          cx={`${star.x}%`}
          cy={`${star.y}%`}
          r={star.size}
          fill="currentColor"
          className="celestial-star"
          style={{ animationDelay: `${star.delay}s` }}
        />
      ))}
    </g>
  );
}

export function CelestialScene({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<SVGGElement>(null);
  const moonRef = useRef<SVGGElement>(null);
  const raysRef = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();
  const timeOfDay = useTimeOfDayOptional();

  const sunOpacity = timeOfDay?.info.sunOpacity ?? 1;
  const moonOpacity = timeOfDay?.info.moonOpacity ?? 0;
  const starsOpacity = timeOfDay?.info.starsOpacity ?? 0;

  useGSAP(
    () => {
      if (reduced || !sunRef.current || !raysRef.current) return;

      gsap.to(raysRef.current, {
        rotation: 360,
        transformOrigin: "50% 50%",
        duration: 120,
        repeat: -1,
        ease: "none",
      });

      gsap.to(sunRef.current, {
        y: -6,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      if (moonRef.current) {
        gsap.to(moonRef.current, {
          y: 4,
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    { scope: containerRef, dependencies: [reduced] }
  );

  return (
    <div
      ref={containerRef}
      className={`celestial-scene pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD88A" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#E07A2F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E07A2F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4F0E8" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#C9D4E8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B9BB5" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <g
          className="celestial-stars-group transition-opacity duration-[2000ms]"
          style={{ opacity: starsOpacity }}
          fill="#F4F0E8"
        >
          <Stars />
        </g>

        <g
          ref={moonRef}
          className="celestial-moon transition-opacity duration-[2000ms]"
          style={{ opacity: moonOpacity }}
          transform="translate(620, 95)"
        >
          <circle cx="0" cy="0" r="72" fill="url(#moonGlow)" filter="url(#softBlur)" />
          <circle cx="0" cy="0" r="28" fill="#F2EDE4" />
          <circle cx="-8" cy="-6" r="6" fill="#E8E2D8" opacity="0.5" />
          <circle cx="10" cy="8" r="4" fill="#E8E2D8" opacity="0.35" />
        </g>

        <g
          ref={sunRef}
          className="celestial-sun transition-opacity duration-[2000ms]"
          style={{ opacity: sunOpacity }}
          transform="translate(640, 110)"
        >
          <circle cx="0" cy="0" r="90" fill="url(#sunGlow)" filter="url(#softBlur)" />
          <g ref={raysRef}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="-34"
                x2="0"
                y2="-48"
                stroke="#E07A2F"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.45"
                transform={`rotate(${i * 30})`}
              />
            ))}
          </g>
          <circle cx="0" cy="0" r="26" fill="#FFD88A" />
          <circle cx="0" cy="0" r="26" fill="#E07A2F" opacity="0.12" />
        </g>
      </svg>
    </div>
  );
}
