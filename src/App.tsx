import { useState, useCallback, useEffect } from 'react';
import { GameState, FactionId, GameAction } from './types/game';
import { createInitialGameState } from './game/state';
import { executeAction } from './game/actions';
import { advanceTurn } from './game/turns';
import { ArcticMap, ZoneDetail } from './components/ArcticMap';
import { Dashboard, EventLog } from './components/Dashboard';
import { ActionPanel } from './components/ActionPanel';
import { FactionSelect } from './components/FactionSelect';
import { GameOver } from './components/GameOver';
import './App.css';

type GameScreen = 'faction_select' | 'playing' | 'game_over';

function App() {
  const [screen, setScreen] = useState<GameScreen>('faction_select');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState({ width: 600, height: 600 });

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.map-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setMapSize({
          width: Math.min(rect.width, 700),
          height: Math.min(rect.height, 700),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [screen]);

  const handleFactionSelect = useCallback((factionId: FactionId) => {
    const state = createInitialGameState(factionId);
    setGameState(state);
    setScreen('playing');
  }, []);

  const handleExecuteAction = useCallback((
    action: GameAction,
    targetFaction?: FactionId,
    targetZone?: string
  ) => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState));
    executeAction(newState, action, targetFaction, targetZone);
    setGameState(newState);
  }, [gameState]);

  const handleEndTurn = useCallback(() => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState));
    advanceTurn(newState);
    setGameState(newState);

    if (newState.gameOver) {
      setScreen('game_over');
    }
  }, [gameState]);

  const handleRestart = useCallback(() => {
    setGameState(null);
    setSelectedZone(null);
    setScreen('faction_select');
  }, []);

  if (screen === 'faction_select') {
    return <FactionSelect onSelect={handleFactionSelect} />;
  }

  if (screen === 'game_over' && gameState) {
    return <GameOver gameState={gameState} onRestart={handleRestart} />;
  }

  if (!gameState) {
    return <div className="loading">Loading...</div>;
  }

  const selectedZoneData = selectedZone ? gameState.zones[selectedZone] : null;

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>ARCTIC DOMINION</h1>
        <div className="header-status">
          <span className="year">{gameState.year}</span>
          <span className="season">{gameState.season}</span>
          <span className="turn">Turn {gameState.turn}/20</span>
        </div>
      </header>

      <main className="game-main">
        <aside className="left-panel">
          <Dashboard gameState={gameState} />
        </aside>

        <section className="center-panel">
          <div className="map-container">
            <ArcticMap
              gameState={gameState}
              selectedZone={selectedZone}
              onZoneSelect={setSelectedZone}
              width={mapSize.width}
              height={mapSize.height}
            />
          </div>
          {selectedZoneData && (
            <ZoneDetail zone={selectedZoneData} gameState={gameState} />
          )}
        </section>

        <aside className="right-panel">
          <ActionPanel
            gameState={gameState}
            selectedZone={selectedZone}
            onExecuteAction={handleExecuteAction}
            onEndTurn={handleEndTurn}
          />
          <EventLog gameState={gameState} />
        </aside>
      </main>
    </div>
  );
}

export default App;
