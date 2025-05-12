import BattleTiles from "./BattleTiles";
import BattleUnits from "./BattleUnits";
import type { TileType } from "../../contexts/MapContext";
import type { Unit } from "../../contexts/UnitContext";
import { useBattle } from "../../contexts/BattleContext";

type BattleMapContainerProps = {
  mapSize: number;
  terrainType: TileType;
  units: Unit[];
  tileSize: number;
};

export default function BattleMapContainer({
  mapSize,
  terrainType,
  tileSize,
}: BattleMapContainerProps) {
  const { selectedUnit, battle } = useBattle();
  return (
    <div
      style={{
        position: "relative",
        width: mapSize * tileSize,
        height: mapSize * tileSize,
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mapSize}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${mapSize}, ${tileSize}px)`,
          width: "100%",
          height: "100%",
        }}
      >
        <BattleTiles
          mapSize={mapSize}
          terrainType={terrainType}
          tileSize={tileSize}
          selectedUnit={selectedUnit}
        />
      </div>

      <BattleUnits
        units={battle?.players.flatMap((p) => p.units)}
        tileSize={tileSize}
      />
    </div>
  );
}
