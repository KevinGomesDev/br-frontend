import { createContext, useContext, useState } from "react";
import type { BASE_ATTRIBUTES } from "../data/attributes";

export type AttributeKey = keyof typeof BASE_ATTRIBUTES;
export type Attributes = Record<AttributeKey, number>;

export interface Regent {
  name: string;
  classes: string[];
  description: string;
  image: string;
  attributes: Attributes;
  baseAttributes: Attributes;
  level: number;
  features: { name: string; level: number }[];
  xp: number;
}

interface RegentContextType {
  regent: Regent | null;
  setRegent: React.Dispatch<React.SetStateAction<Regent | null>>;
  addXp: (amount: number) => void;
  attributesFinalized: boolean;
  setAttributesFinalized: (newState: boolean) => void;
}

const RegentContext = createContext<RegentContextType | undefined>(undefined);

export function RegentProvider({ children }: { children: React.ReactNode }) {
  const [regent, setRegent] = useState<Regent | null>(null);
  const [attributesFinalized, setAttributesFinalized] = useState(false);
  const addXp = (amount: number) => {
    setRegent((prev) => {
      if (!prev) return prev;

      let xp = prev.xp + amount;
      let level = prev.level;
      let leveledUp = false;

      // Loop para múltiplos níveis
      while (xp >= 10 + (level - 1) * 10) {
        xp -= 10 + (level - 1) * 10;
        level++;
        leveledUp = true;
      }

      if (leveledUp) {
        // reset flag here
        setAttributesFinalized(false);
        return {
          ...prev,
          xp,
          level,
          baseAttributes: { ...prev.attributes },
        };
      }

      return { ...prev, xp };
    });
  };

  return (
    <RegentContext.Provider
      value={{
        regent,
        setRegent,
        addXp,
        attributesFinalized,
        setAttributesFinalized,
      }}
    >
      {children}
    </RegentContext.Provider>
  );
}

export function useRegent(): RegentContextType {
  const context = useContext(RegentContext);
  if (!context) {
    throw new Error("useRegent must be used inside RegentProvider");
  }
  return context;
}
