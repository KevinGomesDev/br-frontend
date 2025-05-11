import { createContext, useContext, useState } from "react";

export type Resources = {
  minério: number;
  arcana: number;
  suprimento: number;
  experiência: number;
  devoção: number;
};

export type ResourceProduction = {
  minério: number;
  arcana: number;
  suprimento: number;
  experiência: number;
  devoção: number;
};

interface ResourceContextType {
  resources: Resources;
  setResources: React.Dispatch<React.SetStateAction<Resources>>;
  production: ResourceProduction;
  setProduction: React.Dispatch<React.SetStateAction<ResourceProduction>>;
  spendResource: (type: keyof Resources, amount: number) => boolean;
  gainResource: (type: keyof Resources, amount: number) => void;
}

const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined
);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [production, setProduction] = useState<ResourceProduction>({
    minério: 0,
    arcana: 0,
    suprimento: 0,
    experiência: 0,
    devoção: 0,
  });

  const [resources, setResources] = useState<Resources>({
    minério: 20,
    arcana: 20,
    suprimento: 20,
    experiência: 20,
    devoção: 20,
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
      value={{
        resources,
        setResources,
        production,
        setProduction,
        spendResource,
        gainResource,
      }}
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
