import { useState } from "react";

type TileType =
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
  rows = 20,
  cols = 20,
  landRatio = 0.3,
}: {
  rows?: number;
  cols?: number;
  landRatio?: number;
}) {
  const [map] = useState<TileType[][]>(() =>
    generateContinentMap(rows, cols, landRatio)
  );

  const tileColors: Record<TileType, string> = {
    grass: "border border-green-500 bg-green-600",
    water: "border border-blue-500 bg-blue-600",
    forest: "border border-emerald-800 bg-emerald-900",
    snow: "border border-gray-100 bg-gray-200",
    desert: "border border-yellow-400 bg-yellow-500",
    frozen_water: "border border-cyan-100 bg-cyan-200",
  };

  const [selectedTile, setSelectedTile] = useState<{
    x: number;
    y: number;
    type: TileType;
  } | null>(null);

  return (
    <div className="mt-6">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 2rem)` }}
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
                className={`w-8 h-8 select-none cursor-pointer ${
                  selectedTile?.x === x && selectedTile?.y === y
                    ? "border-red-900 ring-2 ring-red-900"
                    : "hover:border-red-900"
                } hover:border-red-900
                } ${tileColors[tile]} ${borderClasses}`}
              />
            );
          })
        )}
        {selectedTile && (
          <div className="fixed bottom-4 left-4 bg-white bg-opacity-90 text-black p-4 rounded shadow-lg z-50 w-64">
            <p className="font-semibold">
              Coordenadas:{" "}
              <span className="font-normal">
                {selectedTile.x} / {selectedTile.y}
              </span>
            </p>
            <p className="font-semibold">
              Tipo de Terreno:{" "}
              <span className="font-normal capitalize">
                {selectedTile.type}
              </span>
            </p>
            <button
              onClick={() => setSelectedTile(null)}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Limpar Seleção
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
