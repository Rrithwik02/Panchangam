"use client";

interface StarShapeProps {
  x: number;
  y: number;
  size?: number;
  delay?: number;
}

export function StarShape({ x, y, size = 8, delay = 0 }: StarShapeProps) {
  const s = size;
  return (
    <g
      className="celestial-star"
      transform={`translate(${x}, ${y})`}
      style={{ animationDelay: `${delay}s` }}
    >
      <path
        d={`M 0 ${-s} L ${s * 0.22} ${-s * 0.22} L ${s} 0 L ${s * 0.22} ${s * 0.22} L 0 ${s} L ${-s * 0.22} ${s * 0.22} L ${-s} 0 L ${-s * 0.22} ${-s * 0.22} Z`}
        fill="#FFF8E7"
      />
      <path
        d={`M 0 ${-s * 0.55} L ${s * 0.12} ${-s * 0.12} L 0 0 L ${-s * 0.12} ${-s * 0.12} Z M 0 0 L ${s * 0.12} ${s * 0.12} L 0 ${s * 0.55} L ${-s * 0.12} ${s * 0.12} Z`}
        fill="#FFE4A8"
        opacity="0.85"
      />
    </g>
  );
}

export function SunBody({ size = 26 }: { size?: number }) {
  const rayCount = 8;
  const rays = Array.from({ length: rayCount }, (_, i) => i * (360 / rayCount));

  return (
    <g>
      <circle cx="0" cy="0" r={size * 2.8} fill="url(#sunGlow)" filter="url(#softBlur)" />
      <g>
        {rays.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path
              d={`M 0 ${-size * 1.15} L ${size * 0.18} ${-size * 1.55} L 0 ${-size * 1.95} L ${-size * 0.18} ${-size * 1.55} Z`}
              fill="#FFB84D"
              opacity="0.75"
            />
          </g>
        ))}
      </g>
      <circle cx="0" cy="0" r={size} fill="#FFD066" />
      <circle cx="0" cy="0" r={size * 0.92} fill="#FFEB99" opacity="0.6" />
      <circle
        cx={-size * 0.2}
        cy={-size * 0.15}
        r={size * 0.25}
        fill="#FFF5CC"
        opacity="0.5"
      />
    </g>
  );
}

interface MoonBodyProps {
  size?: number;
  illumination: number;
  isWaxing: boolean;
  shadowColor?: string;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function MoonBody({
  size = 24,
  illumination,
  isWaxing,
  shadowColor = "#0f1117",
}: MoonBodyProps) {
  const clipId = "moon-phase-clip";

  if (illumination <= 0.02) return null;

  const r = size;
  const isFull = illumination >= 0.98;

  let shadowOffset: number;
  if (isFull) {
    shadowOffset = r * 2;
  } else if (isWaxing) {
    shadowOffset = lerp(r * 1.85, -r * 0.15, illumination);
  } else {
    shadowOffset = lerp(-r * 1.85, r * 0.15, illumination);
  }

  return (
    <g>
      <circle cx="0" cy="0" r={r * 2.6} fill="url(#moonGlow)" filter="url(#softBlur)" />
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r={r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="0" cy="0" r={r} fill="#E8E4DC" />
        <circle cx={-r * 0.25} cy={-r * 0.2} r={r * 0.35} fill="#D4D0C8" opacity="0.35" />
        <circle cx={r * 0.3} cy={r * 0.25} r={r * 0.22} fill="#D4D0C8" opacity="0.28" />
        <circle cx={-r * 0.05} cy={r * 0.35} r={r * 0.15} fill="#C8C4BC" opacity="0.22" />
        {!isFull && (
          <circle cx={shadowOffset} cy="0" r={r * 0.98} fill={shadowColor} opacity="0.93" />
        )}
        <circle cx="0" cy="0" r={r} fill="url(#moonSurface)" opacity="0.15" />
      </g>
    </g>
  );
}

export function StarField() {
  const stars = [
    { x: 90, y: 55, size: 5, delay: 0 },
    { x: 180, y: 38, size: 4, delay: 0.6 },
    { x: 260, y: 72, size: 6, delay: 1.1 },
    { x: 340, y: 45, size: 4.5, delay: 0.3 },
    { x: 420, y: 28, size: 5.5, delay: 1.8 },
    { x: 510, y: 62, size: 4, delay: 0.9 },
    { x: 590, y: 40, size: 6, delay: 2.2 },
    { x: 670, y: 58, size: 4.5, delay: 1.4 },
    { x: 130, y: 110, size: 3.5, delay: 2.6 },
    { x: 230, y: 95, size: 4, delay: 0.5 },
    { x: 450, y: 88, size: 3.5, delay: 1.7 },
    { x: 620, y: 105, size: 4, delay: 2.9 },
    { x: 720, y: 78, size: 5, delay: 0.8 },
    { x: 55, y: 130, size: 3, delay: 3.1 },
    { x: 750, y: 120, size: 3.5, delay: 1.2 },
  ];

  return (
    <g className="celestial-stars" aria-hidden="true">
      {stars.map((star) => (
        <StarShape key={`${star.x}-${star.y}`} {...star} />
      ))}
    </g>
  );
}
