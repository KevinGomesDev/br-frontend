import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";
import MapGrid from "../components/MapGrid";
import Feedback from "../components/Feedback";
import InfoCard from "../components/InfoCard";
import ResourceBar from "../components/ResourceBar";
import RegenteView from "../components/units/regent/RegentView";
import { useFeedback } from "../contexts/AlertContext";
import type { TileType } from "../contexts/MapContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { feedback, setFeedback } = useFeedback();

  const [selectedTab, setSelectedTab] = useState<
    "Reino" | "Mapa" | "Regente" | "Heróis" | "Tropas" | "Configurações"
  >("Mapa");

  const [selectedTile, setSelectedTile] = useState<{
    x: number;
    y: number;
    type: TileType;
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
    <div className="font-base min-h-screen bg-bg text-text p-6">
      {feedback && (
        <Feedback
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      <ResourceBar />

      {/* Tabs */}
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
                  ? "bg-card text-[var(--text-highlight)] font-semibold border border-b-0"
                  : "bg-[var(--tab-bg)] text-[var(--tab-text)] hover:bg-[var(--tab-hover)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo + InfoCard */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Conteúdo principal */}
        <div className="flex-1">
          {selectedTab === "Mapa" && (
            <MapGrid
              selectedTile={selectedTile}
              setSelectedTile={setSelectedTile}
            />
          )}

          {selectedTab === "Reino" && (
            <p className="text-[var(--subtle-text)]">
              Seção do Reino em construção.
            </p>
          )}
          {selectedTab === "Regente" && <RegenteView />}
          {selectedTab === "Heróis" && (
            <p className="text-[var(--subtle-text)]">
              Seção dos Heróis em construção.
            </p>
          )}
          {selectedTab === "Tropas" && (
            <p className="text-[var(--subtle-text)]">
              Seção das Tropas em construção.
            </p>
          )}
          {selectedTab === "Configurações" && (
            <div className="space-y-4">
              <p className="text-[var(--subtle-text)]">
                Configurações da conta e preferências.
              </p>
              <button
                onClick={handleLogout}
                className="bg-[var(--button-danger)] text-[var(--button-danger-text)] px-4 py-2 rounded hover:bg-[var(--button-danger-hover)] transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>

        {/* InfoCard à direita */}
        <div className="w-full lg:w-1/3">
          <InfoCard
            selectedTile={selectedTile}
            onClear={() => setSelectedTile(null)}
          />
        </div>
      </div>
    </div>
  );
}
