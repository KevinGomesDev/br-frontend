import { useBattle } from "../../contexts/BattleContext";
import type { Unit } from "../../contexts/UnitContext";
import { useUser } from "../../contexts/UserContext";
import { useEffect, useState } from "react";

type BattleUnitsProps = {
  units: Unit[] | undefined;
  tileSize: number;
};

export default function BattleUnits({ units, tileSize }: BattleUnitsProps) {
  const { selectedUnit, setSelectedUnit, turnState, battle } = useBattle();
  const currentPlayerId = turnState.actionOrder[turnState.currentTurn];
  const { user } = useUser();
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null);
  const [attackDirection, setAttackDirection] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: any) => {
      const { attackerId, direction } = e.detail;
      setAttackingUnitId(attackerId);
      setAttackDirection({ x: -direction.x, y: -direction.y }); // recuo

      // Dash após 150ms
      setTimeout(() => {
        setAttackDirection(direction); // dash para frente
      }, 150);

      // Reset após mais 150ms
      setTimeout(() => {
        setAttackingUnitId(null);
        setAttackDirection({ x: 0, y: 0 });
      }, 300);
    };

    window.addEventListener("unit-attack", handler);
    return () => window.removeEventListener("unit-attack", handler);
  }, []);

  const canSelect = (unit: Unit) => {
    if (!battle) return false;
    const player = battle.players.find((p) =>
      p.units.some((u) => u.id === unit.id)
    );

    const marks = unit.actionMarks ?? 0;
    const maxMarks = unit.type === "troop" ? 1 : unit.type === "hero" ? 2 : 3;

    return (
      player?.id === currentPlayerId &&
      !turnState.actedUnitIds.includes(unit.id) &&
      marks < maxMarks
    );
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      {units?.map((unit) => {
        const maxHP = unit.attributes.vitality;
        const currentHp = unit.currentHp ?? maxHP;
        const percentHP = Math.max(0, Math.min(100, (currentHp / maxHP) * 100));
        let hpColor = "bg-green-400";
        if (percentHP <= 60) hpColor = "bg-yellow-400";
        if (percentHP <= 30) hpColor = "bg-red-500";
        const isAttacking = unit.id === attackingUnitId;
        const phase = isAttacking ? "attack" : "idle";
        const offsetX =
          phase === "attack"
            ? -attackDirection.x * 15 // primeiro recuo
            : 0;
        const offsetY = phase === "attack" ? -attackDirection.y * 15 : 0;

        const owner = battle?.players.find((p) =>
          p.units.some((u) => u.id === unit.id)
        );
        const isOwner = owner?.id === user?.id;

        return (
          <div
            key={unit.id}
            className="absolute"
            style={{
              left: unit.x * tileSize,
              top: unit.y * tileSize,
              width: tileSize,
              height: tileSize,
              zIndex: 10,
              transition:
                "transform 0.15s ease-in, top 0.1s ease, left 0.1s ease",
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${
                isAttacking ? 1.05 : 1
              })`,
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={unit.image}
                alt={unit.name}
                onClick={() => {
                  if (!canSelect(unit)) return;
                  setSelectedUnit(unit);
                }}
                className={`w-[calc(100%-10px)] h-[calc(100%-10px)] object-cover rounded-full border-2 shadow-md transition duration-150 cursor-pointer
  ${isOwner ? "border-green-400" : "border-red-500"}
  ${
    selectedUnit?.id === unit.id
      ? "ring-2 ring-yellow-400"
      : "hover:scale-105 hover:ring-2 hover:ring-yellow-400"
  }`}
              />
              <div className="absolute bottom-[10px] w-[95%] h-[6px] left-1/2 -translate-x-1/2 border ">
                <div className="w-full h-full bg-red-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${hpColor} transition-all`}
                    style={{ width: `${percentHP}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
