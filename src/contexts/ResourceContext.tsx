import { createContext, useContext, useState } from "react";

export type Resources = {
  minério: number;
  arcana: number;
  suprimento: number;
  experiência: number;
  devoção: number;
  fortaleza: number;
};

interface ResourceContextType {
  resources: Resources;
  setResources: React.Dispatch<React.SetStateAction<Resources>>;
  spendResource: (type: keyof Resources, amount: number) => boolean;
  gainResource: (type: keyof Resources, amount: number) => void;
}

const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined
);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resources>({
    minério: 0,
    arcana: 0,
    suprimento: 0,
    experiência: 0,
    devoção: 0,
    fortaleza: 0,
  });

  const spendResource = (type: keyof Resources, amount: number) => {
    if (resources[type] >= amount) {
      setResources((prev) => ({ ...prev, [type]: prev[type] - amount }));
      return true;
    }
    return false;
  };

  const gainResource = (type: keyof Resources, amount: number) => {
    setResources((prev) => ({ ...prev, [type]: prev[type] + amount }));
  };

  return (
    <ResourceContext.Provider
      value={{ resources, setResources, spendResource, gainResource }}
    >
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourceContext);
  if (!context)
    throw new Error("useResources must be used inside ResourceProvider");
  return context;
}
