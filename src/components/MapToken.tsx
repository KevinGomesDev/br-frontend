import { useEffect, useState } from "react";

interface MapTokenProps {
  x: number;
  y: number;
  tileSize: number;
  image?: string;
  onMoveEnd?: (x: number, y: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  offset: { x: number; y: number };
  zoom: number;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  size: number;
  movable?: boolean;
}

export function MapToken({
  x,
  y,
  tileSize,
  image,
  onMoveEnd,
  onDragStart,
  onDragEnd,
  offset,
  zoom,
  containerRef,
  size,
  movable,
}: MapTokenProps) {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [visualPosition, setVisualPosition] = useState({
    x: x * tileSize,
    y: y * tileSize,
  });

  const posX = dragging ? visualPosition.x : x * tileSize;
  const posY = dragging ? visualPosition.y : y * tileSize;

  useEffect(() => {
    if (!dragging) {
      setVisualPosition({ x: x * tileSize, y: y * tileSize });
    }
  }, [x, y, tileSize, dragging]);

  useEffect(() => {
    if (!movable || !dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const adjustedX = (mouseX - offset.x) / zoom - dragOffset.x;
      const adjustedY = (mouseY - offset.y) / zoom - dragOffset.y;

      setVisualPosition({ x: adjustedX, y: adjustedY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setDragging(false);
      onDragEnd?.();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !onMoveEnd) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldMouseX = (mouseX - offset.x) / zoom;
      const worldMouseY = (mouseY - offset.y) / zoom;

      const finalX = Math.floor(worldMouseX / tileSize);
      const finalY = Math.floor(worldMouseY / tileSize);

      onMoveEnd(finalX, finalY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragging,
    movable,
    dragOffset,
    offset,
    zoom,
    tileSize,
    containerRef,
    onMoveEnd,
    onDragEnd,
  ]);

  function handleMouseDown(e: React.MouseEvent) {
    if (!movable) return;

    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    onDragStart?.();
    setDragOffset({
      x: (e.clientX - offset.x) / zoom - x * tileSize,
      y: (e.clientY - offset.y) / zoom - y * tileSize,
    });
  }

  return (
    <div
      className={`absolute z-20 ${
        movable ? "cursor-pointer" : "cursor-default"
      } border border-[var(--token-border)] bg-[var(--token-bg)]`}
      style={{
        left: posX,
        top: posY,
        width: tileSize * size,
        height: tileSize * size,
        pointerEvents: "auto",
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={image || "/default-token.png"}
        alt="Token"
        draggable={false}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
