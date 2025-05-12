import { useBattle } from "../../contexts/BattleContext";
import BattleHeader from "./BattleHeader";
import BattleMapContainer from "./BattleMapContainer";
import BattleTurnPanel from "./BattleTurnPanel";

export default function BattleScreen() {
  const { battle, endBattle } = useBattle();
  if (!battle) return null;

  const numPlayers = battle.players.length;
  const mapSize = numPlayers * 5;
  const tileSize = 64;

  const units = battle.players.flatMap((player) => player.units);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: "2rem",
      }}
    >
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <BattleHeader
            terrainType={battle.terrainType}
            terrainCoords={battle.terrainCoords}
            onClose={endBattle}
          />
          <BattleMapContainer
            mapSize={mapSize}
            terrainType={battle.terrainType}
            units={units}
            tileSize={tileSize}
          />
        </div>

        <BattleTurnPanel />
      </div>
    </div>
  );
}
