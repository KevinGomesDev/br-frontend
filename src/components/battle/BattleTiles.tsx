import { useBattle } from "../../contexts/BattleContext";
import type { TileType } from "../../contexts/MapContext";
import type { Unit } from "../../contexts/UnitContext";

const terrainColors: Record<TileType, string> = {
  grass: "#a8d5a0",
  water: "#85c1e9",
  forest: "#2e8b57",
  snow: "#f0f8ff",
  desert: "#f4e19c",
  frozen_water: "#d0eaff",
};

type BattleTilesProps = {
  mapSize: number;
  terrainType: TileType;
  tileSize: number;
  selectedUnit: Unit | null;
};

export default function BattleTiles({
  mapSize,
  terrainType,
  tileSize,
  selectedUnit,
}: BattleTilesProps) {
  const { updateUnitPosition, turnState } = useBattle();

  const tiles = Array.from({ length: mapSize * mapSize }, (_, i) => ({
    x: i % mapSize,
    y: Math.floor(i / mapSize),
  }));

  const canMoveTo = (tileX: number, tileY: number) => {
    if (!selectedUnit) return false;
    const dx = Math.abs(tileX - selectedUnit.x);
    const dy = Math.abs(tileY - selectedUnit.y);
    const remaining = turnState.unitMovementLeft[selectedUnit.id] ?? 0;
    return dx + dy <= remaining;
  };

  return (
    <>
      {tiles.map((tile) => {
        const isMovable = selectedUnit && canMoveTo(tile.x, tile.y);
        return (
          <div
            key={`${tile.x}-${tile.y}`}
            onClick={() => {
              if (isMovable) {
                updateUnitPosition(selectedUnit.id, tile.x, tile.y);
              }
            }}
            style={{
              width: tileSize,
              height: tileSize,
              backgroundColor: terrainColors[terrainType],
              border: "1px solid #555",
              boxShadow: isMovable ? "inset 0 0 0 2px yellow" : undefined,
              cursor: isMovable ? "pointer" : "default",
              zIndex: 1,
            }}
          />
        );
      })}
    </>
  );
}
