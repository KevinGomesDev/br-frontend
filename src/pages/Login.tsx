import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Feedback from "../components/Feedback";
import { useUser } from "../contexts/UserContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setSenha] = useState("");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFeedback({
          message: data.message || "Erro ao fazer login",
          type: "error",
        });
        return;
      }

      setFeedback({ message: "Login realizado com sucesso!", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro inesperado ao tentar logar.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      {feedback && (
        <Feedback
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-card text-text p-8 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--text-highlight)]">
          Login
        </h1>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border border-[var(--input-border)] bg-[var(--input-bg)] text-text rounded px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--text-highlight)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="senha"
            className="block text-sm font-medium text-text mb-1"
          >
            Senha
          </label>
          <input
            id="senha"
            type="password"
            className="w-full border border-[var(--input-border)] bg-[var(--input-bg)] text-text rounded px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--input-ring)]"
            value={password}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--button-primary)] text-[var(--button-primary-text)] py-2 px-4 rounded hover:bg-[var(--button-primary-hover)] transition"
        >
          Entrar
        </button>
        <p className="mt-4 text-sm text-center">
          Não tem conta?{" "}
          <Link
            to="/register"
            className="text-[var(--text-highlight)] hover:underline"
          >
            Crie uma agora
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
