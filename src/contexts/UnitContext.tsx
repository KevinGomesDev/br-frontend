import { createContext, useContext, useState } from "react";
import type { BASE_ATTRIBUTES } from "../data/attributes";
import { useArmy } from "./ArmyContext";

export type AttributeKey = keyof typeof BASE_ATTRIBUTES;
export type Attributes = Record<AttributeKey, number>;

export type UnitType = "regent" | "hero" | "troop";

export interface BaseUnit {
  id: string;
  name: string;
  type: UnitType;
  description: string;
  image: string;
  attributes: Attributes;
  baseAttributes: Attributes;
  currentHp: number;
  level: number;
  xp: number;
  conditions: string[];
  spells: string[];
  actionMarks: number;
  protection?: number;
  damageReduction?: number;
  x: number;
  y: number;
}

export interface HeroUnit extends BaseUnit {
  type: "hero";
  classes: string[];
  features: { name: string; level: number }[];
}

export interface RegentUnit extends BaseUnit {
  type: "regent";
  classes: string[];
  features: { name: string; level: number }[];
}

export interface TroopUnit extends BaseUnit {
  type: "troop";
  category: string;
  feature: { name: string; description: string };
  cr: number;
  cost: number;
}

export type Unit = HeroUnit | RegentUnit | TroopUnit;

interface UnitContextType {
  selectedUnit: Unit | null;
  setSelectedUnit: React.Dispatch<React.SetStateAction<Unit | null>>;
  addXp: (amount: number) => void;
  attributesFinalized: boolean;
  setAttributesFinalized: (val: boolean) => void;
  tempAttributes: Attributes | null;
  setTempAttributes: React.Dispatch<React.SetStateAction<Attributes | null>>;
  finalizeAttributes: () => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [selectedUnit, internalSetSelectedUnit] = useState<Unit | null>(null);
  const [attributesFinalized, setAttributesFinalized] = useState(false);
  const [tempAttributes, setTempAttributes] = useState<Attributes | null>(null);
  const { updateUnit } = useArmy();

  const setSelectedUnit: React.Dispatch<React.SetStateAction<Unit | null>> = (
    value
  ) => {
    internalSetSelectedUnit((prev) => {
      const next =
        typeof value === "function"
          ? (value as (prev: Unit | null) => Unit | null)(prev)
          : value;
      if (next) updateUnit(next);
      return next;
    });
  };

  const addXp = (amount: number) => {
    setSelectedUnit((prev) => {
      if (!prev) return prev;

      let xp = prev.xp + amount;
      let level = prev.level;

      while (xp >= 10 + (level - 1) * 10) {
        xp -= 10 + (level - 1) * 10;
        level++;
        setAttributesFinalized(false);
      }

      return {
        ...prev,
        xp,
        level,
        baseAttributes: { ...prev.attributes },
      };
    });
  };

  const finalizeAttributes = () => {
    if (!selectedUnit || !tempAttributes) return;
    const updated = {
      ...selectedUnit,
      attributes: tempAttributes,
      baseAttributes: tempAttributes,
    };
    internalSetSelectedUnit(updated);
    updateUnit(updated);
    setTempAttributes(null);
    setAttributesFinalized(true);
  };

  return (
    <UnitContext.Provider
      value={{
        selectedUnit,
        setSelectedUnit,
        addXp,
        attributesFinalized,
        setAttributesFinalized,
        tempAttributes,
        setTempAttributes,
        finalizeAttributes,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit(): UnitContextType {
  const context = useContext(UnitContext);
  if (!context) throw new Error("useUnit must be used inside UnitProvider");
  return context;
}
