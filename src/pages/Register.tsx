import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import Feedback from "../components/Feedback";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password: senha }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFeedback({
          message: data.message || "Erro ao registrar",
          type: "error",
        });
        return;
      }

      setFeedback({
        message: "Registro realizado com sucesso!",
        type: "success",
      });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro inesperado ao tentar se registrar.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
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
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text-highlight)]">
          Criar Conta
        </h2>

        <label className="block mb-2">
          Nome
          <input
            className="mt-1 w-full px-3 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-text rounded"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="block mb-2">
          Email
          <input
            className="mt-1 w-full px-3 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-text rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          Senha
          <input
            className="mt-1 w-full px-3 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-text rounded"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-[var(--button-primary)] text-[var(--button-primary-text)] py-2 rounded hover:bg-[var(--button-primary-hover)] transition"
        >
          Registrar
        </button>
        <p className="mt-4 text-sm text-center">
          Já tem conta?{" "}
          <Link to="/" className="text-[var(--text-highlight)] hover:underline">
            Entre agora
          </Link>
        </p>
      </form>
    </div>
  );
}
