"use client";

import { useTimeOfDayOptional } from "./TimeOfDayProvider";
import { MoonBody, StarField, SunBody } from "./CelestialIcons";

export function CelestialScene({ className = "" }: { className?: string }) {
  const timeOfDay = useTimeOfDayOptional();

  const info = timeOfDay?.info;
  const moonPhase = timeOfDay?.moonPhase;

  const sunOpacity = info?.sunOpacity ?? 0;
  const moonOpacity = info?.moonOpacity ?? 0;
  const starsOpacity = info?.starsOpacity ?? 0;

  const sunX = info?.sun.x ?? 72;
  const sunY = info?.sun.y ?? 390;
  const moonX = info?.moon.x ?? 728;
  const moonY = info?.moon.y ?? 390;

  const illumination = moonPhase?.illumination ?? 0.5;
  const isWaxing = moonPhase?.isWaxing ?? true;
  const showMoon = moonPhase?.isVisible !== false && illumination > 0.02;
  const shadowColor = info?.theme === "light" ? "#faf8f4" : "#0f1117";

  return (
    <div
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
            <stop offset="0%" stopColor="#FFD88A" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#E07A2F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E07A2F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8EEF8" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#9AABB8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#5A6A78" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moonSurface" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <g
          className="celestial-stars-group transition-opacity duration-[2000ms]"
          style={{ opacity: starsOpacity }}
        >
          <StarField />
        </g>

        <g
          className="celestial-moon transition-[opacity,transform] duration-[1200ms] ease-in-out"
          style={{ opacity: showMoon ? moonOpacity : 0 }}
          transform={`translate(${moonX}, ${moonY})`}
        >
          {showMoon && (
            <MoonBody
              size={22}
              illumination={illumination}
              isWaxing={isWaxing}
              shadowColor={shadowColor}
            />
          )}
        </g>

        <g
          className="celestial-sun transition-[opacity,transform] duration-[1200ms] ease-in-out"
          style={{ opacity: sunOpacity }}
          transform={`translate(${sunX}, ${sunY})`}
        >
          <SunBody size={24} />
        </g>
      </svg>
    </div>
  );
}
