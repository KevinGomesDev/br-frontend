// contexts/GameContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

type Player = {
  id: number;
  name: string;
};

type GameContextType = {
  round: number;
  stage: number;
  stageName: string;
  players: Player[];
  currentTurnOrder: Player[];
  finishedPlayers: number[]; // IDs dos jogadores que já agiram na etapa
  currentPlayer: Player | null;
  markPlayerFinished: (id: number) => void;
  advanceStage: () => void;
};

const STAGES = [
  "Administração",
  "Exércitos",
  "Movimentação",
  "Crise",
  "Ação",
  "Batalha",
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [round, setRound] = useState(1);
  const [stage, setStage] = useState(1);
  const { user } = useUser();

  const [players, setPlayers] = useState<Player[]>([]);
  useEffect(() => {
    if (user && !players.some((p) => p.id === user.id)) {
      setPlayers((prev) => [...prev, { id: user.id, name: user.name }]);
    }
  }, [user, players]);

  const [finishedPlayers, setFinishedPlayers] = useState<number[]>([]);
  const [turnQueue, setTurnQueue] = useState<Player[]>([]);
  const currentStageName = STAGES[stage - 1];

  const isSimultaneousStage = stage <= 2;

  const currentPlayer = isSimultaneousStage ? null : turnQueue[0] || null;

  const markPlayerFinished = (id: number) => {
    if (finishedPlayers.includes(id)) return;

    const newFinished = [...finishedPlayers, id];
    setFinishedPlayers(newFinished);

    // Etapas 1 e 2: só avançam quando todos terminarem
    if (isSimultaneousStage) {
      if (newFinished.length === players.length) {
        advanceStage();
      }
    } else {
      // Etapas ordenadas: próximo da fila
      const updatedQueue = turnQueue.filter((p) => p.id !== id);
      setTurnQueue(updatedQueue);

      if (updatedQueue.length === 0) {
        advanceStage();
      }
    }
  };

  const advanceStage = () => {
    if (stage < STAGES.length) {
      const nextStage = stage + 1;
      setStage(nextStage);
      setFinishedPlayers([]);
      if (nextStage >= 3) {
        setTurnQueue([...finishedPlayersOrder()]);
      }
    } else {
      // Fim da rodada
      setStage(1);
      setRound((prev) => prev + 1);
      setFinishedPlayers([]);
      setTurnQueue([]);
    }
  };

  const finishedPlayersOrder = () => {
    // Ordena pela ordem de finalização das últimas etapas
    return players.filter((p) => finishedPlayers.includes(p.id));
  };

  return (
    <GameContext.Provider
      value={{
        round,
        stage,
        stageName: currentStageName,
        players,
        currentTurnOrder: turnQueue,
        currentPlayer,
        finishedPlayers,
        markPlayerFinished,
        advanceStage,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame precisa estar dentro do GameProvider");
  return ctx;
};
