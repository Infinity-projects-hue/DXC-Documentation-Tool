export function DxcLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="DXC Logo"
    >
      <defs>
        {/* D letter — left blue, right orange */}
        <linearGradient id="gradD" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#3D8BFF" />
          <stop offset="100%" stopColor="#FF8A3D" />
        </linearGradient>
        {/* X letter — pure orange (centered) */}
        <linearGradient id="gradX" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF9A4A" />
          <stop offset="50%" stopColor="#FFB066" />
          <stop offset="100%" stopColor="#FF8A3D" />
        </linearGradient>
        {/* C letter — left orange, right blue */}
        <linearGradient id="gradC" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF8A3D" />
          <stop offset="100%" stopColor="#3D8BFF" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
        {/* Letter D */}
        <path
          stroke="url(#gradD)"
          d="M20 24 H52 C66 24 74 32 74 40 C74 48 66 56 52 56 H20"
        />
        {/* Letter X - two crossing arcs */}
        <path
          stroke="url(#gradX)"
          d="M96 24 C108 36 120 40 132 40 C144 40 156 36 168 24"
        />
        <path
          stroke="url(#gradX)"
          d="M96 56 C108 44 120 40 132 40 C144 40 156 44 168 56"
        />
        {/* Letter C */}
        <path
          stroke="url(#gradC)"
          d="M220 24 H188 C174 24 166 32 166 40 C166 48 174 56 188 56 H220"
        />
      </g>
    </svg>
  );
}
