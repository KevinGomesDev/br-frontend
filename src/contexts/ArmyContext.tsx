import { createContext, useContext, useState } from "react";
import type { Unit } from "./UnitContext";

interface ArmyContextType {
  units: Unit[];
  addUnit: (unit: Unit) => void;
  removeUnit: (id: string) => void;
  updateUnit: (unit: Unit) => void;
  clearArmy: () => void;
}

const ArmyContext = createContext<ArmyContextType | undefined>(undefined);

export function ArmyProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<Unit[]>([]);

  function addUnit(unit: Unit) {
    setUnits((prev) => [...prev, unit]);
  }

  function removeUnit(id: string) {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }

  function updateUnit(updated: Unit) {
    setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function clearArmy() {
    setUnits([]);
  }

  return (
    <ArmyContext.Provider
      value={{ units, addUnit, removeUnit, updateUnit, clearArmy }}
    >
      {children}
    </ArmyContext.Provider>
  );
}

export function useArmy() {
  const context = useContext(ArmyContext);
  if (!context) throw new Error("useArmy must be used inside ArmyProvider");
  return context;
}
