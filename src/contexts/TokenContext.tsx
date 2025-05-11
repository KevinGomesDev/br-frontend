import { createContext, useContext, useState } from "react";

export type Token = {
  id: string;
  playerId: number;
  x: number;
  y: number;
  type: "unit" | "capital" | "building";
  image?: string;
  size: number;
  moveCredit?: number;
};

interface TokenContextType {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  addToken: (token: Token) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<Token[]>([]);

  const addToken = (token: Token) => {
    setTokens((prev) => [...prev, token]);
  };

  return (
    <TokenContext.Provider value={{ tokens, setTokens, addToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens deve ser usado dentro de TokenProvider");
  }
  return context;
}
