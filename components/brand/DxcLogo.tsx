export function DxcLogo({ className = "h-auto w-full" }: { className?: string }) {
  return (
    <img
      src="/DXC-Full-Color.png"
      alt="DXC"
      className={className}
      width={1290}
      height={360}
      draggable={false}
    />
  );
}
