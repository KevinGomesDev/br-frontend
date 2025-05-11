import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { UserProvider } from "./contexts/UserContext";
import { RegentProvider } from "./contexts/RegentContext";
import { ResourceProvider } from "./contexts/ResourceContext";
import { FeedbackProvider } from "./contexts/AlertContext";
import { MapProvider } from "./contexts/MapContext";
import { GameProvider } from "./contexts/GameContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { TokenProvider } from "./contexts/TokenContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <RegentProvider>
          <ResourceProvider>
            <FeedbackProvider>
              <MapProvider>
                <GameProvider>
                  <PlayerProvider>
                    <TokenProvider>
                      <App />
                    </TokenProvider>
                  </PlayerProvider>
                </GameProvider>
              </MapProvider>
            </FeedbackProvider>
          </ResourceProvider>
        </RegentProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
