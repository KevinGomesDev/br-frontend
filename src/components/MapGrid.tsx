import { useState, useEffect, useRef } from "react";
import { useMap, type TileType } from "../contexts/MapContext";

export default function MapGrid({
  selectedTile,
  setSelectedTile,
}: {
  selectedTile: { x: number; y: number; type: TileType } | null;
  setSelectedTile: (
    tile: { x: number; y: number; type: TileType } | null
  ) => void;
}) {
  const { map, offset, setOffset, zoom, setZoom } = useMap();
  const rows = map.length;
  const cols = map[0]?.length || 0;

  const [tileSize, setTileSize] = useState(32);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTileSize = () => {
      const padding = 32;
      const maxWidth = window.innerWidth - padding;
      const maxHeight = window.innerHeight - padding;

      const tileWidth = Math.floor(maxWidth / cols);
      const tileHeight = Math.floor(maxHeight / rows);
      const newTileSize = Math.min(tileWidth, tileHeight);

      setTileSize(newTileSize);
    };

    updateTileSize();
    window.addEventListener("resize", updateTileSize);
    return () => window.removeEventListener("resize", updateTileSize);
  }, [cols, rows]);

  const tileColors: Record<TileType, string> = {
    grass: "border bg-green-600 border-green-500",
    water: "border bg-blue-600 border-blue-500",
    forest: "border bg-emerald-900 border-emerald-800",
    snow: "border bg-gray-200 border-gray-100",
    desert: "border bg-yellow-400 border-gray-100",
    frozen_water: "border bg-cyan-200 border-cyan-100",
  };

  // Camera
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  function handleZoom(e: React.WheelEvent) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const nextZoom = Math.min(4, Math.max(0.5, zoom + delta));
    setZoom(nextZoom);
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() {
    setIsDragging(false);
    dragStart.current = null;
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging || e.touches.length !== 1 || !dragStart.current) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        setZoom((prev) => Math.min(4, Math.max(0.5, prev + delta)));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Fim - Camera

  return (
    <div
      ref={containerRef}
      className="bg-white rounded shadow-md w-full h-[calc(100vh-14rem)] overflow-hidden relative touch-none"
      onWheel={handleZoom}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* Wrapper que aplica o zoom e offset */}

      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "top left",
          width: `${cols * tileSize}px`,
          height: `${rows * tileSize}px`,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
          }}
        >
          {map.map((row, y) =>
            row.map((tile, x) => {
              let borderClasses = "";

              if (tile === "water") {
                const getTile = (yy: number, xx: number) =>
                  yy >= 0 && yy < rows && xx >= 0 && xx < cols
                    ? map[yy][xx]
                    : "water";

                if (getTile(y - 1, x) !== "water")
                  borderClasses += " border-t border-blue-800";
                if (getTile(y + 1, x) !== "water")
                  borderClasses += " border-b border-blue-800";
                if (getTile(y, x - 1) !== "water")
                  borderClasses += " border-l border-blue-800";
                if (getTile(y, x + 1) !== "water")
                  borderClasses += " border-r border-blue-800";
              }

              return (
                <div
                  onClick={() => {
                    setSelectedTile({ x, y, type: tile });
                  }}
                  key={`${y}-${x}`}
                  tabIndex={-1}
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                  }}
                  className={`select-none cursor-pointer text-xs ${
                    tileColors[tile]
                  } ${borderClasses} ${
                    selectedTile?.x === x && selectedTile?.y === y
                      ? "border-red-900"
                      : "hover:border-red-900"
                  }`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
