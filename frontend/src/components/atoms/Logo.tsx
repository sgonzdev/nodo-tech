interface Props {
  size?: number;
}

export function Logo({ size = 38 }: Props) {
  return (
    <span className="logo-mark" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/nodotech-mark.webp" alt="NodoTech" width={size} height={size} />
    </span>
  );
}
