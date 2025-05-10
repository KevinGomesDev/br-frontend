import { useState, useEffect, useRef } from "react";

export type TileType =
  | "grass"
  | "water"
  | "forest"
  | "snow"
  | "desert"
  | "frozen_water";

function generateContinentMap(
  rows: number,
  cols: number,
  landRatio: number
): TileType[][] {
  const maxTries = 10;
  let tries = 0;

  function hasInvalidNeighbor(
    map: TileType[][],
    y: number,
    x: number,
    type: TileType,
    invalidAdjacents: Record<TileType, TileType[]>
  ): boolean {
    for (const [dy, dx] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length) {
        const neighbor = map[ny][nx];
        if (invalidAdjacents[type]?.includes(neighbor)) {
          return true;
        }
      }
    }
    return false;
  }

  function hasInvalidNeighbor8(
    map: TileType[][],
    y: number,
    x: number,
    type: TileType,
    invalidAdjacents: Record<TileType, TileType[]>
  ): boolean {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length) {
          const neighbor = map[ny][nx];
          if (invalidAdjacents[type]?.includes(neighbor)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  const invalidAdjacents: Record<TileType, TileType[]> = {
    snow: ["desert", "forest"],
    desert: ["snow", "forest"],
    forest: ["desert", "snow"],
    grass: [],
    water: [],
    frozen_water: [],
  };

  while (tries < maxTries) {
    const map: TileType[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "water")
    );

    const totalTiles = rows * cols;
    const landTarget = Math.floor(totalTiles * landRatio);
    let landCount = 0;

    const centerY = Math.floor(rows / 2);
    const centerX = Math.floor(cols / 2);
    map[centerY][centerX] = "grass";
    landCount++;
    const landQueue: [number, number][] = [[centerY, centerX]];

    while (landCount < landTarget && landQueue.length) {
      const [y, x] = landQueue.shift()!;

      for (const [dy, dx] of directions) {
        const ny = y + dy;
        const nx = x + dx;

        if (
          ny >= 1 &&
          ny < rows - 1 &&
          nx >= 1 &&
          nx < cols - 1 &&
          map[ny][nx] === "water"
        ) {
          const distY = Math.min(ny, rows - 1 - ny);
          const distX = Math.min(nx, cols - 1 - nx);
          const distMin = Math.min(distY, distX);
          const edgePenalty = distMin < 5 ? distMin / 5 : 1;

          const spreadChance = 0.6 * edgePenalty;

          if (Math.random() < spreadChance) {
            map[ny][nx] = "grass";
            landQueue.push([ny, nx]);
            landCount++;
            if (landCount >= landTarget) break;
          }
        }
      }
    }

    if (landCount >= landTarget * 0.9) {
      const terrainRatios: Partial<Record<TileType, number>> = {
        forest: 0.15,
        snow: 0.15,
        desert: 0.1,
      };

      for (const type of Object.keys(terrainRatios) as TileType[]) {
        const zoneSize = Math.floor(landTarget * (terrainRatios[type] ?? 0));
        let painted = 0;
        let found = false;
        let paintTries = 0;

        while (!found && paintTries < 1000) {
          const y = Math.floor(Math.random() * rows);
          const x = Math.floor(Math.random() * cols);
          if (
            map[y][x] === "grass" &&
            !hasInvalidNeighbor(map, y, x, type, invalidAdjacents)
          ) {
            found = true;
            const queue: [number, number][] = [[y, x]];
            map[y][x] = type;
            painted++;

            while (queue.length && painted < zoneSize) {
              const [cy, cx] = queue.shift()!;

              for (const [dy, dx] of directions) {
                const ny = cy + dy;
                const nx = cx + dx;

                if (
                  ny >= 0 &&
                  ny < rows &&
                  nx >= 0 &&
                  nx < cols &&
                  map[ny][nx] === "grass" &&
                  !hasInvalidNeighbor8(map, ny, nx, type, invalidAdjacents) &&
                  Math.random() < 0.8
                ) {
                  map[ny][nx] = type;
                  queue.push([ny, nx]);
                  painted++;
                  if (painted >= zoneSize) break;
                }
              }
            }
          }
          paintTries++;
        }
      }

      for (let repeat = 0; repeat < 4; repeat++) {
        const newMap = map.map((row) => [...row]);

        for (let y = 1; y < rows - 1; y++) {
          for (let x = 1; x < cols - 1; x++) {
            const current = map[y][x];
            if (current === "water") continue;

            const freq: Record<TileType, number> = {
              grass: 0,
              water: 0,
              forest: 0,
              snow: 0,
              desert: 0,
              frozen_water: 0,
            };

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dy === 0 && dx === 0) continue;
                const ny = y + dy;
                const nx = x + dx;

                if (
                  ny >= 0 &&
                  ny < rows &&
                  nx >= 0 &&
                  nx < cols &&
                  map[ny][nx] !== "water"
                ) {
                  freq[map[ny][nx]]++;
                }
              }
            }

            const currentCount = freq[current];
            const mostCommon = Object.entries(freq)
              .filter(([type]) => type !== current)
              .sort((a, b) => b[1] - a[1])[0];

            if (currentCount < 2 && mostCommon && mostCommon[1] > 0) {
              newMap[y][x] = mostCommon[0] as TileType;
            }
          }
        }

        map.forEach((row, i) => row.splice(0, cols, ...newMap[i]));
      }

      // Propaga água congelada evitando bordas
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (map[y][x] === "snow") {
            for (const [dy, dx] of directions) {
              let ny = y + dy;
              let nx = x + dx;
              let depth = 0;
              const maxDepth = 1 + Math.floor(Math.random() * 2);

              while (
                ny > 0 &&
                ny < rows - 1 &&
                nx > 0 &&
                nx < cols - 1 &&
                depth < maxDepth &&
                map[ny][nx] === "water"
              ) {
                map[ny][nx] = "frozen_water";
                ny += dy;
                nx += dx;
                depth++;
              }
            }
          }
        }
      }

      return map;
    }

    tries++;
  }

  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "water")
  );
}

export default function MapGrid({
  rows = 40,
  cols = 40,
  landRatio = 0.3,
  selectedTile,
  setSelectedTile,
}: {
  rows?: number;
  cols?: number;
  landRatio?: number;
  selectedTile: { x: number; y: number; type: TileType } | null;
  setSelectedTile: (
    tile: { x: number; y: number; type: TileType } | null
  ) => void;
}) {
  const [map] = useState<TileType[][]>(() =>
    generateContinentMap(rows, cols, landRatio)
  );
  const [tileSize, setTileSize] = useState(32);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTileSize = () => {
      const padding = 32; // margem segura para evitar overflow
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  function handleZoom(e: React.WheelEvent) {
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
