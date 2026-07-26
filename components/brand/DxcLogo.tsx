export function DxcLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="DXC"
    >
      <defs>
        <linearGradient id="dxc-main" x1="0%" y1="45%" x2="100%" y2="55%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="32%" stopColor="#FF7A45" />
          <stop offset="67%" stopColor="#FFA447" />
          <stop offset="100%" stopColor="#5678F4" />
        </linearGradient>
        <filter id="dxc-glow" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        fill="none"
        stroke="url(#dxc-main)"
        strokeLinecap="square"
        strokeLinejoin="round"
        strokeWidth="9"
        filter="url(#dxc-glow)"
      >
        <path d="M18 24 H52 C68 24 78 31 78 40 C78 49 68 56 52 56 H18" />
        <path d="M98 24 C111 35 121 40 133 40 C145 40 156 35 169 24" />
        <path d="M98 56 C111 45 121 40 133 40 C145 40 156 45 169 56" />
        <path d="M222 24 H190 C175 24 166 31 166 40 C166 49 175 56 190 56 H222" />
      </g>
    </svg>
  );
}
