import { useGame } from "../contexts/GameContext";
import { useUser } from "../contexts/UserContext";
import StageAdministration from "../stages/StageAdministration";

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
  const { user } = useUser();
  const isCurrentUserFinished = user && finishedPlayers.includes(user.id);

  const StageComponent = STAGE_COMPONENTS[stage];

  const isPlayerFinished =
    currentPlayer && finishedPlayers.includes(currentPlayer.id);

  return (
    <div className="bg-white p-4 rounded shadow-md w-full space-y-4">
      <h2 className="text-xl font-bold">Game Panel</h2>

      <div>
        <p>Round: {round}</p>
        <p>Stage: {stageName}</p>
        <p>
          Current Player:{" "}
          {currentPlayer ? currentPlayer.name : "All players simultaneously"}
        </p>
      </div>

      <div>
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
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Clear Selection
            </button>
          </>
        ) : (
          <p className="italic text-gray-500">No tile selected.</p>
        )}
      </div>

      <hr />

      {StageComponent && !isCurrentUserFinished && (
        <StageComponent
          onFinish={() => markPlayerFinished(user!.id)}
          selectedTile={selectedTile}
        />
      )}

      {isCurrentUserFinished && (
        <p className="text-green-600 font-semibold">
          You have finished this stage.
        </p>
      )}

      {isPlayerFinished && (
        <p className="text-green-600 font-semibold">
          You have finished this stage.
        </p>
      )}

      <hr />
      <div>
        <h3 className="font-semibold">Players</h3>
        <ul className="text-sm space-y-1">
          {players.map((p) => (
            <li
              key={p.id}
              className={finishedPlayers.includes(p.id) ? "text-green-600" : ""}
            >
              {p.name} {finishedPlayers.includes(p.id) ? "✓" : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
