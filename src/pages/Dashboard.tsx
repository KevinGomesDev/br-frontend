import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";
import MapGrid, { type TileType } from "../components/MapGrid";
import Feedback from "../components/Feedback";
import InfoCard from "../components/InfoCard";
import ResourceBar, { type Resources } from "../components/ResourceBar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "Reino" | "Mapa" | "Regente" | "Heróis" | "Tropas" | "Configurações"
  >("Mapa");
  const [selectedTile, setSelectedTile] = useState<{
    x: number;
    y: number;
    type: TileType;
  } | null>(null);
  const [resources, setResources] = useState<Resources>({
    minério: 0,
    arcana: 0,
    suprimento: 0,
    experiência: 0,
    devoção: 0,
    fortaleza: 0,
  });

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
      <ResourceBar resources={resources} />

      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap w-full mb-6 border-b pb-2">
          {[
            "Reino",
            "Mapa",
            "Regente",
            "Heróis",
            "Tropas",
            "Configurações",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as typeof selectedTab)}
              className={`px-4 py-2 rounded-t text-sm sm:text-base flex-1 text-center ${
                selectedTab === tab
                  ? "bg-white text-blue-600 font-semibold border border-b-0"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {selectedTab === "Mapa" && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <MapGrid
              selectedTile={selectedTile}
              setSelectedTile={setSelectedTile}
            />
          </div>
          <InfoCard
            selectedTile={selectedTile}
            onClear={() => setSelectedTile(null)}
          />
        </div>
      )}

      {selectedTab === "Reino" && (
        <p className="text-gray-600">Seção do Reino em construção.</p>
      )}
      {selectedTab === "Regente" && (
        <p className="text-gray-600">Seção do Regente em construção.</p>
      )}
      {selectedTab === "Heróis" && (
        <p className="text-gray-600">Seção dos Heróis em construção.</p>
      )}
      {selectedTab === "Tropas" && (
        <p className="text-gray-600">Seção das Tropas em construção.</p>
      )}
      {selectedTab === "Configurações" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Configurações da conta e preferências.
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
