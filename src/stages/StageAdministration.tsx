import { useEffect, useState } from "react";
import { useResources } from "../contexts/ResourceContext";
import { usePlayer } from "../contexts/PlayerContext";
import { StageFinishButton } from "../components/StageFinishButton";
import { useTokens } from "../contexts/TokenContext";
import { useFeedback } from "../contexts/AlertContext";
import { useGame } from "../contexts/GameContext";

type StageAdministrationProps = {
  onFinish: () => void;
  selectedTile: { x: number; y: number; type: string } | null;
};

function getImageForType(type: string) {
  const map: Record<string, string> = {
    PM: "minério.jpg",
    PA: "arcana.jpg",
    PS: "suprimento.jpg",
    PE: "experiência.jpg",
    PD: "devoção.jpg",
    F: "fortaleza.jpg",
  };
  return `/icons/${map[type] || "default-token.png"}`;
}

export default function StageAdministration({
  onFinish,
  selectedTile,
}: StageAdministrationProps) {
  const { gainResource, spendResource, setProduction, production } =
    useResources();
  const { territories, addConstruction, hasAdjacentConstruction } = usePlayer();
  const { tokens, addToken } = useTokens();
  const { setFeedback } = useFeedback();
  const { round } = useGame();

  const [selectedType, setSelectedType] = useState<
    null | "PM" | "PA" | "PS" | "PE" | "PD" | "F"
  >(null);
  const [builtThisTurn, setBuiltThisTurn] = useState<number>(0);
  const [lastCollectedRound, setLastCollectedRound] = useState<number | null>(
    null
  );

  const constructionLabels: Record<
    "PM" | "PA" | "PS" | "PE" | "PD" | "F",
    string
  > = {
    PM: "Produtor de Minério",
    PA: "Produtor de Arcana",
    PS: "Produtor de Suprimento",
    PE: "Produtor de Experiência",
    PD: "Templo da Devoção",
    F: "Fortaleza",
  };

  // Atualiza a produção sempre que os territórios mudarem
  useEffect(() => {
    const producerCounts = { PM: 0, PA: 0, PS: 0, PE: 0, PD: 0 };
    territories.forEach((t) => {
      const type = t.construction?.type;
      if (type && type in producerCounts) {
        producerCounts[type as keyof typeof producerCounts]++;
      }
    });

    const base = 5;

    setProduction({
      minério: base + producerCounts.PM,
      arcana: base + producerCounts.PA,
      suprimento: base + producerCounts.PS,
      experiência: base + producerCounts.PE,
      devoção: base + producerCounts.PD,
    });
  }, [territories]);

  // Coleta os recursos uma vez por rodada
  useEffect(() => {
    if (lastCollectedRound === round || territories.length === 0) return;

    gainResource("minério", production.minério);
    gainResource("arcana", production.arcana);
    gainResource("suprimento", production.suprimento);
    gainResource("experiência", production.experiência);

    setLastCollectedRound(round);
  }, [round, territories.length, production]);

  const handleBuild = () => {
    if (!selectedTile || !selectedType) return;

    const { x, y } = selectedTile;

    if (hasAdjacentConstruction({ x, y })) {
      setFeedback({
        message: "Você não pode construir adjacente a outra construção.",
        type: "error",
      });
      return;
    }

    const territory = territories.find((t) => t.x === x && t.y === y);
    if (!territory) {
      setFeedback({
        message: "Você não possui esse território.",
        type: "error",
      });
      return;
    }

    if (territory.construction) {
      setFeedback({
        message: "Este território já possui uma construção.",
        type: "error",
      });
      return;
    }

    if (tokens.some((token) => token.x === x && token.y === y)) {
      setFeedback({
        message: "Você não pode construir em um território ocupado.",
        type: "error",
      });
      return;
    }

    const totalExistingConstructions = territories.filter(
      (t) => t.construction
    ).length;
    const cost = 2 + totalExistingConstructions;

    if (!spendResource("minério", cost)) {
      setFeedback({
        message: `Minério insuficiente. Custo: ${cost}`,
        type: "error",
      });
      return;
    }

    const success = addConstruction(territory.id, { x, y }, selectedType);

    if (success) {
      const tokenId = `building-${territory.id}-${selectedType}`;
      const tokenImage = getImageForType(selectedType);

      addToken({
        id: tokenId,
        playerId: territory.playerId,
        x,
        y,
        type: "building",
        size: 1,
        image: tokenImage,
      });

      setBuiltThisTurn((prev) => prev + 1);
      setSelectedType(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Administração</h3>
      <p className="text-[var(--subtle-text)]">
        Escolha onde construir e gerencie seus recursos.
      </p>

      <div className="mb-4">
        <label className="block font-bold mb-2">Tile Selecionado:</label>
        {selectedTile ? (
          <p className="text-sm text-text">
            ({selectedTile.x}, {selectedTile.y}) - {selectedTile.type}
          </p>
        ) : (
          <p className="italic text-[var(--muted-text)]">
            Nenhum tile selecionado.
          </p>
        )}
      </div>

      {selectedTile && (
        <div className="border-t pt-4">
          <p className="font-semibold mb-1">Tipo de Construção</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(
              Object.keys(constructionLabels) as Array<
                keyof typeof constructionLabels
              >
            ).map((type) => (
              <button
                key={type}
                className={`px-3 py-1 rounded ${
                  selectedType === type
                    ? "bg-[var(--button-confirm)] text-[var(--button-confirm-text)]"
                    : "bg-[var(--button-secondary)] text-[var(--button-secondary-text)]"
                }`}
                onClick={() => setSelectedType(type)}
              >
                {constructionLabels[type]}
              </button>
            ))}
          </div>

          <button
            onClick={handleBuild}
            disabled={!selectedType}
            className={`px-4 py-2 rounded text-[var(--button-confirm-text)] ${
              selectedType
                ? "bg-[var(--button-confirm)] hover:bg-[var(--button-confirm-hover)]"
                : "bg-[var(--button-disabled)] cursor-not-allowed"
            }`}
          >
            Construir
          </button>

          {builtThisTurn > 0 && (
            <p className="mt-2 text-[var(--resource-positive)]">
              {builtThisTurn} construção{builtThisTurn > 1 ? "s" : ""}{" "}
              realizadas.
            </p>
          )}
        </div>
      )}

      <StageFinishButton onClick={onFinish} />
    </div>
  );
}
