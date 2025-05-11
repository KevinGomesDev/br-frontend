import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status !== 401) {
          console.warn("Erro inesperado ao buscar /auth/me:", res.status);
        }
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.warn("Erro de conexão ao buscar /auth/me");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser deve ser usado dentro de UserProvider");
  return context;
}
