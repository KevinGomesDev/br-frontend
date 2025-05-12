import { useBattle } from "../../contexts/BattleContext";
import BattleActions from "./BattleActions";
import { useState, useEffect } from "react";

export default function BattleTurnPanel() {
  const { battle, turnState, selectedUnit, setSelectedUnit, nextTurn } =
    useBattle();
  const [diceResults, setDiceResults] = useState<number[] | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      const { rolls } = e.detail;
      setDiceResults(rolls);
      setTimeout(() => setDiceResults(null), 3000); // limpa após 3s
    };
    window.addEventListener("dice-rolled", handler);
    return () => window.removeEventListener("dice-rolled", handler);
  }, []);

  if (!battle) return null;

  const movementLeft = selectedUnit
    ? turnState.unitMovementLeft[selectedUnit.id] ?? 0
    : 0;
  const actionUsed = selectedUnit
    ? turnState.unitActionUsed[selectedUnit.id] ?? false
    : false;
  const currentPlayerId = turnState.actionOrder[turnState.currentTurn];
  const currentPlayer = battle.players.find((p) => p.id === currentPlayerId);

  return (
    <div className="battle-turn-panel bg-gray-800 text-white p-4 rounded shadow-md relative">
      <h3 className="text-lg font-bold">Etapas da Batalha</h3>
      <ol className="text-sm text-gray-200 space-y-2 mt-2">
        <li>
          <strong>1º Passo:</strong> Jogadores declaram suprimentos (leilão).
        </li>
        <li>
          <strong>2º Passo:</strong> Jogador da vez escolhe unidade para agir.
        </li>
        <li>
          <strong>3º Passo:</strong> Jogadores se alternam até todos agirem.
        </li>
      </ol>

      <div className="mt-4">
        <h4 className="font-semibold text-white">Jogadores</h4>
        <ul className="text-sm mt-1 space-y-1">
          {battle.players.map((player) => (
            <li key={player.id}>
              <span className="text-blue-200 font-medium">{player.name}</span>:{" "}
              {player.units.length} unidades | Suprimento:{" "}
              {turnState.declaredSupplies[player.id] ?? 0}
              <ul className="ml-4 mt-1 list-disc list-inside text-yellow-300">
                {player.units.map((unit) => (
                  <li
                    key={unit.id}
                    className={
                      unit.id === selectedUnit?.id
                        ? "font-bold text-yellow-400"
                        : ""
                    }
                  >
                    {unit.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {turnState.actionOrder.length > 0 && currentPlayer && (
        <div className="mt-4">
          <h4 className="text-green-400 font-semibold">Jogador da Vez</h4>
          <p className="text-sm">{currentPlayer.name}</p>
        </div>
      )}

      {selectedUnit && (
        <div className="mt-4 bg-gray-900 p-4 rounded shadow-inner text-sm">
          <h4 className="font-bold text-yellow-400 mb-2">
            {selectedUnit.name}
          </h4>
          <p className="text-gray-300 italic mb-1">
            {selectedUnit.description}
          </p>
          <p>
            <strong>Tipo:</strong> {selectedUnit.type}
          </p>
          <p>
            <strong>Nível:</strong> {selectedUnit.level}
          </p>
          <p>
            <strong>XP:</strong> {selectedUnit.xp}
          </p>
          <p>
            <strong>Marcas de Ação:</strong> {selectedUnit.actionMarks ?? 0} /{" "}
            {selectedUnit.type === "troop"
              ? 1
              : selectedUnit.type === "hero"
              ? 2
              : 3}
          </p>
          <p>
            <strong>Movimento restante:</strong> {movementLeft} /{" "}
            {selectedUnit.attributes.accuracy}
          </p>
          <p>
            <strong>Ação deste turno:</strong>{" "}
            {actionUsed ? (
              <span className="text-red-400 font-semibold">Usada</span>
            ) : (
              <span className="text-green-400 font-semibold">Disponível</span>
            )}
          </p>

          <div className="mt-2">
            <p className="font-semibold">Atributos:</p>
            <ul className="list-disc list-inside">
              {Object.entries(selectedUnit.attributes).map(([key, value]) => (
                <li key={key}>
                  <span className="capitalize">{key}</span>: {value}
                </li>
              ))}
            </ul>
          </div>
          <BattleActions />
        </div>
      )}

      {diceResults && (
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 p-2 rounded shadow-lg flex gap-1 animate-spin-slow">
          {diceResults.map((r, i) => (
            <div
              key={i}
              className="w-6 h-6 bg-white text-black font-bold flex items-center justify-center rounded"
            >
              {r}
            </div>
          ))}
        </div>
      )}

      {currentPlayer && (
        <button
          onClick={() => {
            setSelectedUnit(null);
            nextTurn();
          }}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
        >
          Passar Turno
        </button>
      )}
    </div>
  );
}
