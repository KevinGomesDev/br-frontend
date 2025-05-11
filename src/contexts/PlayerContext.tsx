import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { nanoid } from "nanoid";

export type ConstructionType =
  | "PM"
  | "PA"
  | "PS"
  | "PE"
  | "PD"
  | "F"
  | "capital";

export type Construction = {
  type: ConstructionType;
  position: { x: number; y: number };
};

export type Territory = {
  id: number | string;
  playerId: number;
  x: number;
  y: number;
  construction?: Construction;
};

interface PlayerContextType {
  territories: Territory[];
  addConstruction: (
    territoryId: number | string,
    tile: { x: number; y: number },
    type: ConstructionType
  ) => boolean;
  hasAdjacentConstruction: (tile: { x: number; y: number }) => boolean;
  addTerritory: (
    playerId: number,
    tiles: { x: number; y: number; construction?: Construction }[]
  ) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [territories, setTerritories] = useState<Territory[]>([]);

  useEffect(() => {
    if (!user) return;
    // Carregamento inicial desabilitado
  }, [user]);

  const addTerritory = (
    playerId: number,
    tiles: { x: number; y: number; construction?: Construction }[]
  ) => {
    setTerritories((prev) => [
      ...prev,
      ...tiles.map((tile) => ({
        id: nanoid(),
        playerId,
        x: tile.x,
        y: tile.y,
        construction: tile.construction,
      })),
    ]);
  };

  const addConstruction = (
    territoryId: number | string,
    tile: { x: number; y: number },
    type: ConstructionType
  ): boolean => {
    const territory = territories.find((t) => t.id === territoryId);
    if (!territory || territory.construction) return false;

    const updatedTerritories = territories.map((t) =>
      t.id === territoryId
        ? {
            ...t,
            construction: { type, position: tile },
          }
        : t
    );

    setTerritories(updatedTerritories);
    return true;
  };

  const hasAdjacentConstruction = (tile: { x: number; y: number }): boolean => {
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    return territories.some(
      (territory) =>
        territory.construction &&
        directions.some(
          ([dx, dy]) =>
            territory.construction!.position.x === tile.x + dx &&
            territory.construction!.position.y === tile.y + dy
        )
    );
  };

  return (
    <PlayerContext.Provider
      value={{
        territories,
        addConstruction,
        hasAdjacentConstruction,
        addTerritory,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context)
    throw new Error("usePlayer deve ser usado dentro de PlayerProvider");
  return context;
}
