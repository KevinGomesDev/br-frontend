import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";
import MapGrid from "../components/MapGrid";
import Feedback from "../components/Feedback";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      navigate("/");
    } catch (error: any) {
      setFeedback({
        message: error.message || "Erro inesperado ao tentar deslogar.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {feedback && (
        <Feedback
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo, <strong>{user?.name}</strong>!
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Sair
        </button>
      </div>

      <p className="text-gray-600">Bem-vindo ao Battle Realm!</p>
      <MapGrid rows={20} cols={59} />
    </div>
  );
}
