import { useState, useEffect, useRef } from "react";
import { useMap, type TileType } from "../contexts/MapContext";
import { TokenLayer } from "./TokenLayer";
import { MapToken } from "./MapToken";
import { useFeedback } from "../contexts/AlertContext";
import { useResources } from "../contexts/ResourceContext";
import { TerritoryOverlay } from "./TerritoryOverlay";
import { useUser } from "../contexts/UserContext";
import { useGame } from "../contexts/GameContext";
import { usePlayer, type Construction } from "../contexts/PlayerContext";
import { useTokens } from "../contexts/TokenContext";
import type { Token } from "../contexts/TokenContext";

export type TileOwnership = {
  x: number;
  y: number;
  playerId: number;
};

function isAreaFree(
  x: number,
  y: number,
  size: number,
  tokens: Token[],
  ignoreId?: string
): boolean {
  return !tokens.some((t) => {
    if (t.id === ignoreId) return false; // Ignora o próprio token

    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        const checkX = x + dx;
        const checkY = y + dy;

        if (
          checkX >= t.x &&
          checkX < t.x + t.size &&
          checkY >= t.y &&
          checkY < t.y + t.size
        ) {
          return true;
        }
      }
    }

    return false;
  });
}
function placeInitialCapitals(
  players: { id: number }[],
  map: TileType[][],
  tokens: Token[],
  addTerritory: (
    playerId: number,
    tiles: { x: number; y: number; construction?: Construction }[]
  ) => void,
  addToken: (token: Token) => void
) {
  const isValidTile = (x: number, y: number) => {
    const tile = map[y]?.[x];
    return tile && tile !== "water" && tile !== "frozen_water";
  };

  const isFarEnough = (
    x: number,
    y: number,
    placed: { x: number; y: number }[],
    minDist: number
  ) => {
    return placed.every((cap) => {
      const dx = cap.x - x;
      const dy = cap.y - y;
      return Math.sqrt(dx * dx + dy * dy) >= minDist;
    });
  };

  const newTokens: Token[] = [];
  const placedCapitals: { x: number; y: number }[] = [];

  for (const player of players) {
    let attempts = 0;
    let placed = false;

    while (!placed && attempts < 1000) {
      const x = Math.floor(Math.random() * map[0].length);
      const y = Math.floor(Math.random() * map.length);

      if (
        isValidTile(x, y) &&
        isFarEnough(x, y, placedCapitals, 10) &&
        !tokens.some((t) => t.x === x && t.y === y)
      ) {
        placedCapitals.push({ x, y });

        newTokens.push({
          id: `capital-${player.id}`,
          x,
          y,
          type: "capital",
          playerId: player.id,
          size: 1,
          image: "/icons/capital.png",
        });

        const tilesAroundCapital: {
          x: number;
          y: number;
          construction?: Construction;
        }[] = [];

        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 &&
              ny >= 0 &&
              ny < map.length &&
              nx < map[0].length &&
              Math.sqrt(dx * dx + dy * dy) <= 2 &&
              isValidTile(nx, ny)
            ) {
              if (nx === x && ny === y) {
                tilesAroundCapital.push({
                  x: nx,
                  y: ny,
                  construction: {
                    type: "capital",
                    position: { x: nx, y: ny },
                  },
                });
              } else {
                tilesAroundCapital.push({ x: nx, y: ny });
              }
            }
          }
        }

        addTerritory(player.id, tilesAroundCapital);
        placed = true;
      }

      attempts++;
    }
  }

  newTokens.forEach(addToken);
}

export default function MapGrid({
  selectedTile,
  setSelectedTile,
}: {
  selectedTile: { x: number; y: number; type: TileType } | null;
  setSelectedTile: (
    tile: { x: number; y: number; type: TileType } | null
  ) => void;
}) {
  const { territories, addTerritory } = usePlayer();
  const { players } = useGame();
  const { user } = useUser();
  const { map, offset, setOffset, zoom, setZoom, tileSize } = useMap();
  const rows = map.length;
  const cols = map[0]?.length || 0;
  const { feedback, setFeedback } = useFeedback();
  const { tokens, setTokens, addToken } = useTokens();
  const [isTokenDragging, setIsTokenDragging] = useState(false);
  const { spendResource } = useResources();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const tileColors: Record<TileType, string> = {
    grass: "border bg-[var(--tile-grass)] border-[var(--tile-grass-border)]",
    water: " bg-[var(--tile-water)] ",
    forest: "border bg-[var(--tile-forest)] border-[var(--tile-forest-border)]",
    snow: "border bg-[var(--tile-snow)] border-[var(--tile-snow-border)]",
    desert: "border bg-[var(--tile-desert)] border-[var(--tile-desert-border)]",
    frozen_water:
      "border bg-[var(--tile-frozen-water)] border-[var(--tile-frozen-water-border)]",
  };

  useEffect(() => {
    if (
      map.length === 0 ||
      players.length === 0 ||
      !user ||
      tokens.some((t) => t.type === "capital" && t.playerId === user.id)
    ) {
      return;
    }

    const playersWithoutCapital = players.filter(
      (p) => !tokens.some((t) => t.type === "capital" && t.playerId === p.id)
    );

    if (playersWithoutCapital.length > 0) {
      placeInitialCapitals(
        playersWithoutCapital,
        map,
        tokens,
        addTerritory,
        addToken
      );
    }
  }, [map, players, user, tokens]);

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
    if (isTokenDragging) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStart.current || isTokenDragging) return;
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
  const playerColors: Record<number, string> = {
    1: "rgba(255, 0, 0, 0.2)", // Jogador 1
    2: "rgba(0, 0, 255, 0.2)", // Jogador 2
    3: "rgba(0, 255, 0, 0.2)", // etc.
  };

  const validTerritory = territories.filter(({ x, y }) => {
    const tile = map[y]?.[x];
    return tile !== "water" && tile !== "frozen_water";
  });

  return (
    <div
      ref={containerRef}
      className="bg-bg text-text rounded shadow-md w-full h-[calc(100vh-14rem)] overflow-hidden relative touch-none"
      onWheel={handleZoom}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          width: `${cols * tileSize}px`,
          height: `${rows * tileSize}px`,
        }}
      >
        <TokenLayer width={cols * tileSize} height={rows * tileSize}>
          <TerritoryOverlay
            playerColors={playerColors}
            ownership={validTerritory}
            tileSize={tileSize}
          />

          {tokens.map((token) => (
            <MapToken
              key={token.id}
              x={token.x}
              y={token.y}
              offset={offset}
              zoom={zoom}
              tileSize={tileSize}
              containerRef={containerRef}
              image={token.image}
              size={token.size}
              movable={token.type === "unit"}
              onMoveEnd={(newX, newY) => {
                if (token.type === "capital") return;
                if (!user) return;

                const tokenTerritoryTiles = territories.filter(
                  (tile) => tile.playerId === user.id
                );

                function isInsideTerritory(x: number, y: number) {
                  return tokenTerritoryTiles.some(
                    (tile) => tile.x === x && tile.y === y
                  );
                }

                let inside = 0;
                let outside = 0;

                const dx = newX - token.x;
                const dy = newY - token.y;

                const steps = Math.max(Math.abs(dx), Math.abs(dy));

                for (let i = 1; i <= steps; i++) {
                  const stepX = token.x + Math.sign(dx) * i;
                  const stepY = token.y + Math.sign(dy) * i;

                  if (isInsideTerritory(stepX, stepY)) {
                    inside++;
                  } else {
                    outside++;
                  }
                }

                const credit = token.moveCredit ?? 0;
                const effectiveCost =
                  Math.floor((outside + credit) / 3) + Math.floor(inside / 6);

                const newCredit = ((outside + credit) % 3) + (inside % 6);

                const canMove =
                  isAreaFree(newX, newY, token.size, tokens, token.id) &&
                  spendResource("suprimento", effectiveCost);

                if (canMove) {
                  setTokens((prev) =>
                    prev.map((t) =>
                      t.id === token.id
                        ? { ...t, x: newX, y: newY, moveCredit: newCredit }
                        : t
                    )
                  );
                } else {
                  setFeedback({
                    message:
                      "Movimento bloqueado: colisão ou suprimento insuficiente.",
                    type: "error",
                  });
                }
              }}
              onDragStart={() => setIsTokenDragging(true)}
              onDragEnd={() => setIsTokenDragging(false)}
            />
          ))}
        </TokenLayer>

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
                  borderClasses +=
                    " border-t border-[var(--tile-water-border-deep)]";
                if (getTile(y + 1, x) !== "water")
                  borderClasses +=
                    " border-b border-[var(--tile-water-border-deep)]";
                if (getTile(y, x - 1) !== "water")
                  borderClasses +=
                    " border-l border-[var(--tile-water-border-deep)]";
                if (getTile(y, x + 1) !== "water")
                  borderClasses +=
                    " border-r border-[var(--tile-water-border-deep)]";
              }

              return (
                <div
                  onClick={() => {
                    setSelectedTile({ x, y, type: tile });
                  }}
                  key={`tile-${x}-${y}`}
                  tabIndex={-1}
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                  }}
                  className={`select-none cursor-pointer text-xs ${
                    tileColors[tile]
                  } ${borderClasses} ${
                    selectedTile?.x === x && selectedTile?.y === y
                      ? "border-[var(--tile-selected)]"
                      : "hover:border-[var(--tile-selected)]"
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
