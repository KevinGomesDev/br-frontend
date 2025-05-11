interface TokenLayerProps {
  children?: React.ReactNode;
  width: number;
  height: number;
}

export function TokenLayer({ children, width, height }: TokenLayerProps) {
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        width,
        height,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}
