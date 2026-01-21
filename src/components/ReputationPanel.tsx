import { useState } from 'react';
import { GameState } from '../types/game';
import {
  getReputationAssessment,
  getReputationModifiers,
  ReputationProfile,
} from '../game/reputation';
import './ReputationPanel.css';

interface ReputationPanelProps {
  gameState: GameState;
  onClose?: () => void;
}

export const ReputationPanel: React.FC<ReputationPanelProps> = ({ gameState, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);

  const reputation = gameState.playerReputation;
  if (!reputation) return null;

  // Convert to ReputationProfile format for helper functions
  const repProfile: ReputationProfile = {
    ...reputation,
    decisionsHistory: [],
  };

  const assessment = getReputationAssessment(repProfile);
  const modifiers = getReputationModifiers(repProfile);

  const getBarColor = (value: number): string => {
    if (value >= 70) return '#4caf50';
    if (value >= 50) return '#ff9800';
    if (value >= 30) return '#f57c00';
    return '#f44336';
  };

  const getMilitarismLabel = (value: number): string => {
    if (value >= 80) return 'Warmonger';
    if (value >= 60) return 'Aggressive';
    if (value >= 40) return 'Balanced';
    if (value >= 20) return 'Cautious';
    return 'Pacifist';
  };

  return (
    <div className="reputation-panel">
      <div className="reputation-header">
        <h2>🏛️ Reputation</h2>
        {onClose && <button className="close-btn" onClick={onClose}>×</button>}
      </div>

      {/* Overall Assessment */}
      <div className="reputation-assessment">
        <div className="assessment-title">{assessment.title}</div>
        <div className="overall-score">
          <span className="score-value">{reputation.overallReputation}</span>
          <span className="score-label">World Standing</span>
        </div>
        <p className="assessment-desc">{assessment.description}</p>
      </div>

      {/* Reputation Bars */}
      <div className="reputation-metrics">
        <div className="metric">
          <div className="metric-label">
            <span>⚔️ Militarism</span>
            <span className="metric-status">{getMilitarismLabel(reputation.militarism)}</span>
          </div>
          <div className="metric-bar">
            <div
              className="metric-fill"
              style={{
                width: `${reputation.militarism}%`,
                backgroundColor: reputation.militarism > 70 ? '#f44336' : reputation.militarism > 50 ? '#ff9800' : '#4caf50'
              }}
            />
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>🤝 Reliability</span>
            <span className="metric-value">{reputation.reliability}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${reputation.reliability}%`, backgroundColor: getBarColor(reputation.reliability) }} />
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>🗣️ Diplomacy</span>
            <span className="metric-value">{reputation.diplomacy}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${reputation.diplomacy}%`, backgroundColor: getBarColor(reputation.diplomacy) }} />
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>🌿 Environmentalism</span>
            <span className="metric-value">{reputation.environmentalism}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${reputation.environmentalism}%`, backgroundColor: getBarColor(reputation.environmentalism) }} />
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>👥 Human Rights</span>
            <span className="metric-value">{reputation.humanRights}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${reputation.humanRights}%`, backgroundColor: getBarColor(reputation.humanRights) }} />
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">
            <span>💰 Economic Fairness</span>
            <span className="metric-value">{reputation.economicFairness}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${reputation.economicFairness}%`, backgroundColor: getBarColor(reputation.economicFairness) }} />
          </div>
        </div>
      </div>

      {/* Warnings & Opportunities */}
      {assessment.warnings.length > 0 && (
        <div className="reputation-warnings">
          <h4>⚠️ Concerns</h4>
          <ul>
            {assessment.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {assessment.opportunities.length > 0 && (
        <div className="reputation-opportunities">
          <h4>✨ Opportunities</h4>
          <ul>
            {assessment.opportunities.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggle Details */}
      <button
        className="toggle-details-btn"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>

      {/* Detailed Statistics */}
      {showDetails && (
        <div className="reputation-details">
          <h4>📊 Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">📜</span>
              <span className="stat-label">Treaties Honored</span>
              <span className="stat-value good">{reputation.treatiesHonored}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💔</span>
              <span className="stat-label">Treaties Broken</span>
              <span className="stat-value bad">{reputation.treatiesBroken}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🕊️</span>
              <span className="stat-label">Peace Treaties</span>
              <span className="stat-value good">{reputation.peaceTreatiesSigned}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⚔️</span>
              <span className="stat-label">Wars Declared</span>
              <span className="stat-value bad">{reputation.warsDeclared}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏴</span>
              <span className="stat-label">Zones Conquered</span>
              <span className="stat-value">{reputation.zonesConquered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏳️</span>
              <span className="stat-label">Zones Liberated</span>
              <span className="stat-value good">{reputation.zonesLiberated}</span>
            </div>
          </div>

          <h4>🎯 Active Effects</h4>
          <div className="effects-list">
            <div className={`effect-item ${modifiers.treatyAcceptanceBonus >= 0 ? 'positive' : 'negative'}`}>
              <span>Treaty Acceptance</span>
              <span>{modifiers.treatyAcceptanceBonus >= 0 ? '+' : ''}{modifiers.treatyAcceptanceBonus}%</span>
            </div>
            <div className={`effect-item ${modifiers.tensionReduction >= 0 ? 'positive' : 'negative'}`}>
              <span>Tension Modifier</span>
              <span>{modifiers.tensionReduction >= 0 ? '-' : '+'}{Math.abs(modifiers.tensionReduction)}</span>
            </div>
            <div className={`effect-item ${modifiers.economicBonus >= 0 ? 'positive' : 'negative'}`}>
              <span>Economic Bonus</span>
              <span>{modifiers.economicBonus >= 0 ? '+' : ''}{modifiers.economicBonus}%</span>
            </div>
            <div className={`effect-item ${modifiers.allianceChance >= 0 ? 'positive' : 'negative'}`}>
              <span>Alliance Chance</span>
              <span>{modifiers.allianceChance >= 0 ? '+' : ''}{modifiers.allianceChance}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini reputation widget for sidebar
export const ReputationMini: React.FC<{ gameState: GameState; onClick?: () => void }> = ({
  gameState,
  onClick
}) => {
  const reputation = gameState.playerReputation;
  if (!reputation) return null;

  const repProfile: ReputationProfile = { ...reputation, decisionsHistory: [] };
  const assessment = getReputationAssessment(repProfile);

  const getTitleColor = (overall: number): string => {
    if (overall >= 70) return '#4caf50';
    if (overall >= 50) return '#ff9800';
    if (overall >= 30) return '#f57c00';
    return '#f44336';
  };

  return (
    <div className="reputation-mini" onClick={onClick}>
      <div className="mini-header">
        <span>🏛️ Reputation</span>
        <span
          className="mini-title"
          style={{ color: getTitleColor(reputation.overallReputation) }}
        >
          {assessment.title}
        </span>
      </div>
      <div className="mini-score">
        <div className="mini-bar">
          <div
            className="mini-fill"
            style={{
              width: `${reputation.overallReputation}%`,
              backgroundColor: getTitleColor(reputation.overallReputation),
            }}
          />
        </div>
        <span className="mini-value">{reputation.overallReputation}</span>
      </div>
      {assessment.warnings.length > 0 && (
        <div className="mini-warning">⚠️ {assessment.warnings.length} concern{assessment.warnings.length > 1 ? 's' : ''}</div>
      )}
      <div className="mini-hint">Click for details</div>
    </div>
  );
};

export default ReputationPanel;
