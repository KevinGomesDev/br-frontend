import { useGame } from "../contexts/GameContext";
import { useUser } from "../contexts/UserContext";
import StageAdministration from "../stages/StageAdministration";
import { useBattle } from "../contexts/BattleContext";
import { useArmy } from "../contexts/ArmyContext";
import { BASE_ATTRIBUTES } from "../data/attributes";
import type { RegentUnit } from "../contexts/UnitContext";

type InfoCardProps = {
  selectedTile: { x: number; y: number; type: string } | null;
  onClear: () => void;
};

const STAGE_COMPONENTS: Record<
  number,
  React.FC<{
    onFinish: () => void;
    selectedTile: { x: number; y: number; type: string } | null;
  }>
> = {
  1: StageAdministration,
  // 2: StageArmies,
  // 3: StageMovement,
  // 4: StageCrisis,
  // 5: StageAction,
  // 6: StageBattle,
};

export default function InfoCard({ selectedTile, onClear }: InfoCardProps) {
  const {
    round,
    stage,
    stageName,
    currentPlayer,
    players,
    finishedPlayers,
    markPlayerFinished,
  } = useGame();
  const { startBattle } = useBattle();

  function handleStartBattleTest() {
    const regentUnit: RegentUnit = {
      id: crypto.randomUUID(),
      type: "regent",
      name: "General Varell",
      description: "Líder das forças rebeldes",
      image: "https://i.imgur.com/Hp9NOzC.png",
      level: 1,
      xp: 0,
      attributes: { ...BASE_ATTRIBUTES },
      baseAttributes: { ...BASE_ATTRIBUTES },
      conditions: [],
      spells: [],
      actionMarks: 0,
      classes: ["Guerreiro"],
      features: [],
      x: 0,
      y: 0,
      currentHp: BASE_ATTRIBUTES.vitality,
    };
    const regentUnit2: RegentUnit = {
      id: crypto.randomUUID(),
      type: "regent",
      name: "General Varell",
      description: "Líder das forças rebeldes",
      image: "https://i.imgur.com/Hp9NOzC.png",
      level: 1,
      xp: 0,
      attributes: { ...BASE_ATTRIBUTES },
      baseAttributes: { ...BASE_ATTRIBUTES },
      conditions: [],
      spells: [],
      actionMarks: 0,
      classes: ["Guerreiro"],
      features: [],
      x: 0,
      y: 0,
      currentHp: BASE_ATTRIBUTES.vitality,
    };

    startBattle({
      mapSize: 10, // ✅ valor sugerido
      terrainType: "grass",
      terrainCoords: { x: 10, y: 12 },
      players: [
        {
          id: 1,
          name: "Jogador 1",
          units: [regentUnit],
        },
        {
          id: 2,
          name: "Jogador 2",
          units: [regentUnit2],
        },
      ],
    });
  }

  const { user } = useUser();
  const isCurrentUserFinished = user && finishedPlayers.includes(user.id);

  const StageComponent = STAGE_COMPONENTS[stage];

  const isPlayerFinished =
    currentPlayer && finishedPlayers.includes(currentPlayer.id);

  return (
    <div className="bg-bg text-text p-4 rounded shadow-md w-full space-y-4">
      <h2 className="text-xl font-bold text-primary">Game Panel</h2>

      <div>
        <p>Round: {round}</p>
        <p>Stage: {stageName}</p>
        <p>
          Current Player:{" "}
          {currentPlayer ? currentPlayer.name : "All players simultaneously"}
        </p>
      </div>

      <div className="bg-card p-3 rounded">
        <h3 className="font-semibold mt-2">Selected Tile</h3>
        {selectedTile ? (
          <>
            <p>
              Coordinates: {selectedTile.x} / {selectedTile.y}
            </p>
            <p>
              Type: <span className="capitalize">{selectedTile.type}</span>
            </p>
            <button
              onClick={onClear}
              className="mt-2 bg-[var(--button-danger)] text-[var(--button-danger-text)] px-3 py-1 rounded hover:bg-[var(--button-danger-hover)]"
            >
              Clear Selection
            </button>
          </>
        ) : (
          <p className="italic text-[var(--muted-text)]">No tile selected.</p>
        )}
      </div>

      <hr className="border-[var(--input-border)]" />

      {StageComponent && !isCurrentUserFinished && (
        <StageComponent
          onFinish={() => markPlayerFinished(user!.id)}
          selectedTile={selectedTile}
        />
      )}

      {isCurrentUserFinished && (
        <p className="text-[var(--resource-positive)] font-semibold">
          tsx Copiar Editar You have finished this stage.
        </p>
      )}

      {isPlayerFinished && (
        <p className="text-[var(--resource-positive)] font-semibold">
          tsx Copiar Editar You have finished this stage.
        </p>
      )}

      <hr className="border-[var(--input-border)]" />
      <div>
        <h3 className="font-semibold">Players</h3>
        <ul className="text-sm space-y-1">
          {players.map((p) => (
            <li
              key={p.id}
              className={
                finishedPlayers.includes(p.id)
                  ? "text-[var(--resource-positive)]"
                  : ""
              }
            >
              {p.name} {finishedPlayers.includes(p.id) ? "✓" : ""}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleStartBattleTest}>Iniciar Batalha de Teste</button>
    </div>
  );
}
