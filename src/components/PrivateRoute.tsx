import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const [isAuth, setIsAuth] = useState<null | boolean>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          credentials: "include",
        });

        setIsAuth(res.ok);
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return <p className="text-center mt-10">Verificando sessão...</p>;
  }

  if (!isAuth) {
    return <Navigate to="/" />;
  }

  return children;
}
