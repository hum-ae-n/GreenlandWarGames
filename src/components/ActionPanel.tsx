import { useState } from 'react';
import { GameState, GameAction, FactionId, ActionCategory } from '../types/game';
import { getAvailableActions } from '../game/actions';
import { FACTIONS } from '../data/factions';

interface ActionPanelProps {
  gameState: GameState;
  selectedZone: string | null;
  onExecuteAction: (action: GameAction, targetFaction?: FactionId, targetZone?: string) => void;
  onEndTurn: () => void;
}

const CATEGORY_ICONS: Record<ActionCategory, string> = {
  diplomatic: '🏛',
  economic: '📈',
  military: '⚔',
  covert: '🕵',
};

const CATEGORY_COLORS: Record<ActionCategory, string> = {
  diplomatic: '#60a5fa',
  economic: '#34d399',
  military: '#f87171',
  covert: '#a78bfa',
};

export const ActionPanel: React.FC<ActionPanelProps> = ({
  gameState,
  selectedZone,
  onExecuteAction,
  onEndTurn,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | null>(null);
  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null);
  const [targetFaction, setTargetFaction] = useState<FactionId | null>(null);

  const availableActions = getAvailableActions(gameState);
  const playerFaction = gameState.factions[gameState.playerFaction];

  const categories: ActionCategory[] = ['diplomatic', 'economic', 'military', 'covert'];

  const handleActionSelect = (action: GameAction) => {
    setSelectedAction(action);
    // Auto-select target for tension-affecting actions
    if (action.effects.tensionChange) {
      setTargetFaction(null); // Require manual selection
    } else {
      setTargetFaction(null);
    }
  };

  const handleExecute = () => {
    if (selectedAction) {
      onExecuteAction(
        selectedAction,
        targetFaction || undefined,
        selectedZone || undefined
      );
      setSelectedAction(null);
      setTargetFaction(null);
    }
  };

  const canExecute = () => {
    if (!selectedAction) return false;
    // If action affects tension, need a target faction
    if (selectedAction.effects.tensionChange && !targetFaction) return false;
    // If action requires zone control, need a selected zone we control
    if (selectedAction.requirements.controlsZone === 'any') {
      if (!selectedZone) return false;
      if (gameState.zones[selectedZone]?.controller !== gameState.playerFaction) return false;
    }
    return true;
  };

  const otherFactions: FactionId[] = ['usa', 'russia', 'china'].filter(
    f => f !== gameState.playerFaction
  ) as FactionId[];

  return (
    <div className="action-panel">
      <div className="action-header">
        <h3>Actions</h3>
        <div className="action-budget">
          <span>IP: {Math.round(playerFaction.resources.influencePoints)}</span>
          <span>EO: {Math.round(playerFaction.resources.economicOutput)}</span>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            style={{
              borderColor: selectedCategory === cat ? CATEGORY_COLORS[cat] : 'transparent',
              color: selectedCategory === cat ? CATEGORY_COLORS[cat] : '#888',
            }}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            <span className="icon">{CATEGORY_ICONS[cat]}</span>
            <span className="label">{cat}</span>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="action-list">
          {availableActions
            .filter(a => a.category === selectedCategory)
            .map(action => (
              <div
                key={action.id}
                className={`action-item ${selectedAction?.id === action.id ? 'selected' : ''}`}
                onClick={() => handleActionSelect(action)}
              >
                <div className="action-name">{action.name}</div>
                <div className="action-cost">
                  {action.cost.influencePoints && <span>IP: {action.cost.influencePoints}</span>}
                  {action.cost.economicOutput && <span>EO: {action.cost.economicOutput}</span>}
                </div>
                <div className="action-desc">{action.description}</div>
              </div>
            ))}
          {availableActions.filter(a => a.category === selectedCategory).length === 0 && (
            <div className="no-actions">No available actions in this category</div>
          )}
        </div>
      )}

      {selectedAction && (
        <div className="action-config">
          <h4>Configure: {selectedAction.name}</h4>

          {selectedAction.effects.tensionChange && (
            <div className="target-select">
              <label>Target Faction:</label>
              <div className="faction-buttons">
                {otherFactions.map(fid => (
                  <button
                    key={fid}
                    className={`faction-btn ${targetFaction === fid ? 'selected' : ''}`}
                    style={{
                      borderColor: targetFaction === fid ? FACTIONS[fid].color : '#444',
                      color: FACTIONS[fid].color,
                    }}
                    onClick={() => setTargetFaction(fid)}
                  >
                    {FACTIONS[fid].shortName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedAction.requirements.controlsZone && (
            <div className="zone-requirement">
              {selectedZone ? (
                <span>Target Zone: {gameState.zones[selectedZone]?.name || selectedZone}</span>
              ) : (
                <span className="warning">Select a zone you control on the map</span>
              )}
            </div>
          )}

          <div className="action-effects">
            <h5>Effects:</h5>
            {selectedAction.effects.tensionChange && (
              <div className={selectedAction.effects.tensionChange > 0 ? 'negative' : 'positive'}>
                Tension: {selectedAction.effects.tensionChange > 0 ? '+' : ''}{selectedAction.effects.tensionChange}
              </div>
            )}
            {selectedAction.effects.resourceChanges && Object.entries(selectedAction.effects.resourceChanges).map(([key, val]) => (
              <div key={key} className={val > 0 ? 'positive' : 'negative'}>
                {key}: {val > 0 ? '+' : ''}{val}
              </div>
            ))}
          </div>

          <button
            className="execute-btn"
            disabled={!canExecute()}
            onClick={handleExecute}
          >
            Execute Action
          </button>
        </div>
      )}

      <button className="end-turn-btn" onClick={onEndTurn}>
        End Turn →
      </button>
    </div>
  );
};
