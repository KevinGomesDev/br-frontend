import { useBattle } from "../../contexts/BattleContext";
import { rollTest, isAdjacent } from "../../utils/roll";

export default function BattleActions() {
  const {
    selectedUnit,
    battle,
    applyDamageToUnit,
    markUnitActedThisTurn,
    turnState,
  } = useBattle();

  const owner = battle?.players.find((p) =>
    p.units.some((u) => u.id === selectedUnit?.id)
  );

  const adjacentEnemies =
    battle?.players
      .filter((p) => p.id !== owner?.id)
      .flatMap((p) => p.units)
      .filter((u) => selectedUnit && isAdjacent(selectedUnit, u)) ?? [];

  const actionUsed = selectedUnit
    ? turnState.unitActionUsed[selectedUnit.id] ?? false
    : false;

  return (
    <div className="space-y-2 mt-4">
      {adjacentEnemies.map((enemy) => (
        <button
          key={enemy.id}
          disabled={actionUsed}
          className={`px-3 py-1 text-white rounded w-full ${
            actionUsed
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-red-600 cursor-pointer hover:bg-red-700"
          }`}
          onClick={() => {
            if (!selectedUnit || actionUsed) return;

            const dx = enemy.x - selectedUnit.x;
            const dy = enemy.y - selectedUnit.y;
            const direction = { x: dx, y: dy };

            const attackEvent = new CustomEvent("unit-attack", {
              detail: { attackerId: selectedUnit.id, direction },
            });
            window.dispatchEvent(attackEvent);

            setTimeout(() => {
              const { hits, rolls } = rollTest({
                attributeValue: selectedUnit.attributes.combat,
              });
              applyDamageToUnit(enemy.id, hits);
              markUnitActedThisTurn(selectedUnit.id);
              window.dispatchEvent(
                new CustomEvent("dice-rolled", { detail: { rolls } })
              );
            }, 300);
          }}
        >
          Atacar {enemy.name}
        </button>
      ))}
    </div>
  );
}
