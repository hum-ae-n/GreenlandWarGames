import { useState } from 'react';
import { GameState } from '../types/game';
import {
  VICTORY_CONDITIONS,
  DEFEAT_CONDITIONS,
  calculateVictoryProgress,
  VictoryProgress,
} from '../game/victory';
import './ObjectivesPanel.css';

interface ObjectivesPanelProps {
  gameState: GameState;
  onClose?: () => void;
}

export const ObjectivesPanel: React.FC<ObjectivesPanelProps> = ({ gameState, onClose }) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const progress = calculateVictoryProgress(gameState);

  const getProgressColor = (pct: number): string => {
    if (pct >= 75) return '#4caf50';
    if (pct >= 50) return '#ff9800';
    if (pct >= 25) return '#2196f3';
    return '#666';
  };

  const player = gameState.factions[gameState.playerFaction];

  // Calculate danger levels
  const nuclearDanger = gameState.nuclearReadiness === 'defcon1' ? 100 :
                        gameState.nuclearReadiness === 'defcon2' ? 75 :
                        gameState.nuclearReadiness === 'defcon3' ? 50 :
                        gameState.nuclearReadiness === 'elevated' ? 25 : 0;
  const climateDanger = 100 - gameState.globalIceExtent;
  const legitimacyDanger = 100 - player.resources.legitimacy;

  return (
    <div className="objectives-panel">
      <div className="objectives-header">
        <h2>🎯 Victory Objectives</h2>
        {onClose && <button className="close-btn" onClick={onClose}>×</button>}
      </div>

      <div className="objectives-intro">
        <p>Choose your path to victory. Your advisor will help guide you.</p>
      </div>

      <div className="victory-paths">
        <h3>🏆 Ways to Win</h3>
        {VICTORY_CONDITIONS.map(vc => {
          const prog = progress.find(p => p.type === vc.id) as VictoryProgress;
          const isExpanded = showDetails === vc.id;

          return (
            <div
              key={vc.id}
              className={`objective-card ${prog.isAchievable ? '' : 'unlikely'} ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setShowDetails(isExpanded ? null : vc.id)}
            >
              <div className="objective-main">
                <span className="objective-icon">{vc.icon}</span>
                <div className="objective-info">
                  <h4>{vc.name}</h4>
                  <p className="objective-desc">{vc.description}</p>
                </div>
                <div className="progress-circle">
                  <svg viewBox="0 0 36 36">
                    <path
                      className="progress-bg"
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="progress-fill"
                      strokeDasharray={`${prog.progress}, 100`}
                      style={{ stroke: getProgressColor(prog.progress) }}
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.5" className="progress-text">{prog.progress}%</text>
                  </svg>
                </div>
              </div>
              {isExpanded && (
                <div className="objective-details">
                  <div className="how-to-win">
                    <strong>How to win:</strong> {vc.howToWin}
                  </div>
                  <div className="current-progress">
                    <strong>Current:</strong> {prog.details}
                  </div>
                  {!prog.isAchievable && (
                    <div className="unlikely-warning">
                      ⚠️ This victory path may be difficult given current conditions
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="danger-section">
        <h3>☠️ Ways to Lose</h3>
        <div className="danger-grid">
          {DEFEAT_CONDITIONS.slice(0, 4).map(dc => {
            let danger = 0;
            let current = '';

            switch (dc.id) {
              case 'nuclear_apocalypse':
                danger = nuclearDanger;
                current = `DEFCON: ${gameState.nuclearReadiness}`;
                break;
              case 'climate_catastrophe':
                danger = climateDanger;
                current = `Ice: ${gameState.globalIceExtent}%`;
                break;
              case 'regime_collapse':
                danger = legitimacyDanger;
                current = `Legitimacy: ${player.resources.legitimacy}%`;
                break;
              case 'total_defeat': {
                const zones = Object.values(gameState.zones).filter(z => z.controller === gameState.playerFaction).length;
                const units = gameState.militaryUnits.filter(u => u.owner === gameState.playerFaction && u.status !== 'destroyed').length;
                danger = zones === 0 ? 50 : 0;
                danger += units === 0 ? 50 : 0;
                current = `Zones: ${zones}, Units: ${units}`;
                break;
              }
            }

            const isDanger = danger >= 50;
            const isWarning = danger >= 25 && danger < 50;

            return (
              <div key={dc.id} className={`danger-card ${isDanger ? 'danger' : ''} ${isWarning ? 'warning' : ''}`}>
                <span className="danger-icon">{dc.icon}</span>
                <div className="danger-info">
                  <h4>{dc.name}</h4>
                  <p>{current}</p>
                </div>
                <div className="danger-bar">
                  <div
                    className="danger-fill"
                    style={{
                      width: `${danger}%`,
                      background: danger >= 75 ? '#f44336' : danger >= 50 ? '#ff9800' : '#4caf50'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="objectives-tips">
        <h3>💡 Strategy Tips</h3>
        <ul>
          <li><strong>Nobel Peace:</strong> Focus on treaties and cooperation. Avoid military action.</li>
          <li><strong>Economic:</strong> Claim resource-rich zones. Invest in infrastructure.</li>
          <li><strong>Military:</strong> Build forces. Engage enemies strategically.</li>
          <li><strong>Hegemonic:</strong> Expand territory through claims and conquest.</li>
        </ul>
      </div>
    </div>
  );
};

// Compact version for sidebar
export const ObjectivesMini: React.FC<{ gameState: GameState; onClick?: () => void }> = ({
  gameState,
  onClick
}) => {
  const progress = calculateVictoryProgress(gameState);
  const bestPath = progress
    .filter(p => p.isAchievable)
    .sort((a, b) => b.progress - a.progress)[0];

  const condition = VICTORY_CONDITIONS.find(v => v.id === bestPath?.type);
  const player = gameState.factions[gameState.playerFaction];

  // Check for danger
  const inDanger = gameState.nuclearReadiness === 'defcon2' ||
                   gameState.nuclearReadiness === 'defcon1' ||
                   player.resources.legitimacy < 20 ||
                   gameState.globalIceExtent < 20;

  return (
    <div className="objectives-mini" onClick={onClick}>
      <div className="mini-header">
        <span>🎯 Objective</span>
        {inDanger && <span className="danger-indicator">⚠️</span>}
      </div>
      {bestPath && condition && (
        <div className="mini-content">
          <span className="mini-icon">{condition.icon}</span>
          <div className="mini-info">
            <span className="mini-name">{condition.name}</span>
            <div className="mini-progress">
              <div className="mini-bar">
                <div
                  className="mini-fill"
                  style={{ width: `${bestPath.progress}%` }}
                />
              </div>
              <span className="mini-pct">{bestPath.progress}%</span>
            </div>
          </div>
        </div>
      )}
      <div className="mini-hint">Click for details</div>
    </div>
  );
};
