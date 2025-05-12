import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { UserProvider } from "./contexts/UserContext";
import { ResourceProvider } from "./contexts/ResourceContext";
import { FeedbackProvider } from "./contexts/AlertContext";
import { MapProvider } from "./contexts/MapContext";
import { GameProvider } from "./contexts/GameContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { TokenProvider } from "./contexts/TokenContext";
import { BattleProvider } from "./contexts/BattleContext";
import { UnitProvider } from "./contexts/UnitContext";
import { ArmyProvider } from "./contexts/ArmyContext";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <FeedbackProvider>
          <ResourceProvider>
            <BattleProvider>
              <ArmyProvider>
                <UnitProvider>
                  <MapProvider>
                    <GameProvider>
                      <PlayerProvider>
                        <TokenProvider>
                          <App />
                        </TokenProvider>
                      </PlayerProvider>
                    </GameProvider>
                  </MapProvider>
                </UnitProvider>
              </ArmyProvider>
            </BattleProvider>
          </ResourceProvider>
        </FeedbackProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
