import type { TileOwnership } from "./MapGrid";

interface TerritoryOverlayProps {
  ownership: TileOwnership[];
  tileSize: number;
  playerColors: Record<number, string>;
}

export function TerritoryOverlay({
  ownership,
  tileSize,
  playerColors,
}: TerritoryOverlayProps) {
  // 🔁 Elimina tiles repetidos por playerId + x + y
  const uniqueTiles = new Map<string, TileOwnership>();

  for (const tile of ownership) {
    const key = `${tile.playerId}-${tile.x}-${tile.y}`;
    if (!uniqueTiles.has(key)) {
      uniqueTiles.set(key, tile);
    }
  }

  return (
    <>
      {[...uniqueTiles.values()].map(({ x, y, playerId }) => (
        <div
          key={`ownership-${playerId}-${x}-${y}`}
          className="absolute"
          style={{
            left: x * tileSize,
            top: y * tileSize,
            width: tileSize,
            height: tileSize,
            backgroundColor: playerColors[playerId] ?? "rgba(0,0,0,0.1)",
            pointerEvents: "none",
            border: "1px solid black",
          }}
        />
      ))}
    </>
  );
}
