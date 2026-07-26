export function DxcLogo({ className = "h-auto w-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1170 371"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="DXC — Impossible. Delivered."
    >
      <defs>
        <linearGradient id="dxc-d" x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#4387F4" />
          <stop offset="58%" stopColor="#EF6F69" />
          <stop offset="100%" stopColor="#FF7A2E" />
        </linearGradient>
        <linearGradient id="dxc-x" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF7A2E" />
          <stop offset="50%" stopColor="#FFA43B" />
          <stop offset="100%" stopColor="#FF6A35" />
        </linearGradient>
        <linearGradient id="dxc-c" x1="0%" y1="60%" x2="100%" y2="30%">
          <stop offset="0%" stopColor="#FF6A35" />
          <stop offset="55%" stopColor="#E56878" />
          <stop offset="100%" stopColor="#4B7FF2" />
        </linearGradient>
      </defs>

      <g fill="none" strokeLinecap="square" strokeLinejoin="round" strokeWidth="37">
        <path
          stroke="url(#dxc-d)"
          d="M58 44 H254 C319 44 349 76 349 111 C349 148 319 180 254 180 H58"
        />
        <path
          stroke="url(#dxc-x)"
          d="M410 44 C490 110 543 111 585 111 C628 111 681 110 760 44"
        />
        <path
          stroke="url(#dxc-x)"
          d="M410 180 C490 114 543 111 585 111 C628 111 681 114 760 180"
        />
        <path
          stroke="url(#dxc-c)"
          d="M1112 44 H916 C852 44 821 76 821 111 C821 148 852 180 916 180 H1112"
        />
      </g>

      <text
        x="585"
        y="274"
        textAnchor="middle"
        fill="#141218"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="48"
        fontWeight="900"
        letterSpacing="1.5"
      >
        IMPOSSIBLE.
      </text>
      <text
        x="585"
        y="337"
        textAnchor="middle"
        fill="#141218"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="48"
        fontWeight="900"
        letterSpacing="1.5"
      >
        DELIVERED.
      </text>
    </svg>
  );
}
