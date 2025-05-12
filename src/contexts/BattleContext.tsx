import { createContext, useContext, useState } from "react";
import type { TileType } from "./MapContext";
import type { Unit } from "./UnitContext";

type BattleData = {
  terrainType: TileType;
  terrainCoords: { x: number; y: number };
  players: {
    id: number;
    name: string;
    units: Unit[];
  }[];
  mapSize: number;
};

type TurnState = {
  declaredSupplies: Record<number, number>;
  actionOrder: number[];
  currentTurn: number;
  actedUnitIds: string[];
  unitMovementLeft: Record<string, number>;
  usedUnitId: string | null;
  unitActionUsed: Record<string, boolean>;
};

const BattleContext = createContext<{
  battle: BattleData | null;
  turnState: TurnState;
  selectedUnit: Unit | null;
  setSelectedUnit: (unit: Unit | null) => void;
  startBattle: (data: BattleData) => void;
  endBattle: () => void;
  declareSupply: (playerId: number, amount: number) => void;
  nextTurn: () => void;
  applyDamageToUnit: (unitId: string, damage: number) => void;
  updateUnitPosition: (unitId: string, x: number, y: number) => void;
  markUnitActedThisTurn: (unitId: string) => void;
}>({
  battle: null,
  turnState: {
    declaredSupplies: {},
    actionOrder: [],
    currentTurn: 0,
    actedUnitIds: [],
    unitMovementLeft: {},
    usedUnitId: null,
    unitActionUsed: {},
  },
  selectedUnit: null,
  setSelectedUnit: () => {},
  startBattle: () => {},
  endBattle: () => {},
  declareSupply: () => {},
  nextTurn: () => {},
  updateUnitPosition: () => {},
  applyDamageToUnit: () => {},
  markUnitActedThisTurn: () => {},
});

export const BattleProvider = ({ children }: { children: React.ReactNode }) => {
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [turnState, setTurnState] = useState<TurnState>({
    declaredSupplies: {},
    actionOrder: [],
    currentTurn: 0,
    actedUnitIds: [],
    unitMovementLeft: {},
    usedUnitId: null,
    unitActionUsed: {},
  });
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const startBattle = (data: BattleData) => {
    const mapWidth = data.mapSize ?? 10;
    const mapHeight = data.mapSize ?? 10;
    const maxTries = 1000;

    const occupied = new Set<string>();

    const getRandomPosition = (): { x: number; y: number } => {
      let tries = 0;
      while (tries < maxTries) {
        const x = Math.floor(Math.random() * mapWidth);
        const y = Math.floor(Math.random() * mapHeight);
        const key = `${x},${y}`;
        if (!occupied.has(key)) {
          occupied.add(key);
          return { x, y };
        }
        tries++;
      }
      throw new Error("Não foi possível encontrar uma posição livre.");
    };

    const spacedPlayers = data.players.map((player) => {
      const spacedUnits = player.units.map((unit) => {
        const { x, y } = getRandomPosition();
        return {
          ...unit,
          x,
          y,
          actionMarks: 0,
        };
      });

      return {
        ...player,
        units: spacedUnits,
      };
    });

    setBattle({
      ...data,
      players: spacedPlayers,
    });

    const playerIds = spacedPlayers.map((p) => p.id);

    const movementMap: Record<string, number> = {};
    spacedPlayers.forEach((player) =>
      player.units.forEach((unit) => {
        movementMap[unit.id] = unit.attributes.accuracy;
      })
    );

    setTurnState({
      declaredSupplies: {},
      actionOrder: playerIds,
      currentTurn: 0,
      actedUnitIds: [],
      unitMovementLeft: movementMap,
      usedUnitId: null,
      unitActionUsed: {},
    });

    setSelectedUnit(null);
  };

  const applyDamageToUnit = (unitId: string, damage: number) => {
    if (!battle) return;

    const updatedPlayers = battle.players.map((player) => ({
      ...player,
      units: player.units.map((unit) =>
        unit.id === unitId
          ? { ...unit, currentHp: Math.max(0, unit.currentHp - damage) }
          : unit
      ),
    }));

    setBattle({ ...battle, players: updatedPlayers });
  };

  const markUnitActedThisTurn = (unitId: string) => {
    setTurnState((prev) => ({
      ...prev,
      unitActionUsed: {
        ...prev.unitActionUsed,
        [unitId]: true,
      },
      usedUnitId: prev.usedUnitId ?? unitId,
    }));
  };

  const endBattle = () => {
    if (!battle) return;

    const resetPlayers = battle.players.map((player) => ({
      ...player,
      units: player.units.map((unit) => ({ ...unit, actionMarks: 0 })),
    }));

    setBattle({
      ...battle,
      players: resetPlayers,
    });

    setTurnState({
      declaredSupplies: {},
      actionOrder: [],
      currentTurn: 0,
      actedUnitIds: [],
      unitMovementLeft: {},
      usedUnitId: null,
      unitActionUsed: {},
    });

    setSelectedUnit(null);
  };

  const declareSupply = (playerId: number, amount: number) => {
    setTurnState((prev) => {
      const previous = prev.declaredSupplies[playerId] || 0;
      if (amount <= previous) return prev;
      const updatedSupplies = { ...prev.declaredSupplies, [playerId]: amount };

      const allPlayersDeclared =
        battle && Object.keys(updatedSupplies).length === battle.players.length;

      const sortedOrder = allPlayersDeclared
        ? Object.entries(updatedSupplies)
            .sort(([, a], [, b]) => b - a)
            .map(([id]) => Number(id))
        : prev.actionOrder;

      return {
        ...prev,
        declaredSupplies: updatedSupplies,
        actionOrder: sortedOrder,
      };
    });
  };

  const nextTurn = () => {
    if (!battle) return;

    const movementMap: Record<string, number> = {};
    battle.players.forEach((player) =>
      player.units.forEach((unit) => {
        movementMap[unit.id] = unit.attributes.accuracy;
      })
    );

    setTurnState((prev) => ({
      ...prev,
      currentTurn: (prev.currentTurn + 1) % prev.actionOrder.length,
      actedUnitIds: [],
      unitMovementLeft: movementMap,
      usedUnitId: null,
      unitActionUsed: {},
    }));
  };

  const updateUnitPosition = (unitId: string, x: number, y: number) => {
    if (!battle) return;

    // Impede usar mais de uma unidade por turno
    const { usedUnitId } = turnState;
    if (usedUnitId && usedUnitId !== unitId) return;

    const unit = battle.players
      .flatMap((p) => p.units)
      .find((u) => u.id === unitId);
    if (!unit) return;

    const dx = Math.abs(x - unit.x);
    const dy = Math.abs(y - unit.y);
    const cost = dx + dy;

    const remaining = turnState.unitMovementLeft[unitId] ?? 0;
    if (cost > remaining) return;

    const currentMarks = unit.actionMarks ?? 0;
    const maxMarks = unit.type === "troop" ? 1 : unit.type === "hero" ? 2 : 3;
    const hasAlreadyMarkedThisTurn = turnState.actedUnitIds.includes(unitId);

    if (currentMarks >= maxMarks) return;

    const newMark = hasAlreadyMarkedThisTurn ? currentMarks : currentMarks + 1;

    const updatedPlayers = battle.players.map((player) => {
      const updatedUnits = player.units.map((u) =>
        u.id === unitId ? { ...u, x, y, actionMarks: newMark } : u
      );
      return { ...player, units: updatedUnits };
    });

    const updatedUnit = updatedPlayers
      .flatMap((p) => p.units)
      .find((u) => u.id === unitId);

    setBattle({ ...battle, players: updatedPlayers });

    setSelectedUnit(updatedUnit ?? null);

    setTurnState((prev) => ({
      ...prev,
      unitMovementLeft: {
        ...prev.unitMovementLeft,
        [unitId]: remaining - cost,
      },
      actedUnitIds: hasAlreadyMarkedThisTurn
        ? prev.actedUnitIds
        : [...prev.actedUnitIds, unitId],
      usedUnitId: usedUnitId ?? unitId,
    }));
  };

  return (
    <BattleContext.Provider
      value={{
        battle,
        turnState,
        selectedUnit,
        setSelectedUnit,
        startBattle,
        endBattle,
        declareSupply,
        nextTurn,
        updateUnitPosition,
        applyDamageToUnit,
        markUnitActedThisTurn,
      }}
    >
      {children}
    </BattleContext.Provider>
  );
};

export const useBattle = () => useContext(BattleContext)!;
