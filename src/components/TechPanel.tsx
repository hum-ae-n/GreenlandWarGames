import React, { useState } from 'react';
import { GameState } from '../types/game';
import {
  TechState,
  Technology,
  TechCategory,
  TECH_TREE,
  getAvailableTechs,
  getTechsByCategory,
  getResearchSummary,
  getTechBonuses,
  hasTech,
} from '../game/technology';
import './TechPanel.css';

interface TechPanelProps {
  state: GameState;
  techState: TechState;
  onStartResearch: (techId: string) => void;
  onCancelResearch: () => void;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<TechCategory, string> = {
  military: '⚔️',
  economic: '💰',
  diplomatic: '🤝',
  infrastructure: '🏗️',
};

const CATEGORY_COLORS: Record<TechCategory, string> = {
  military: '#da3633',
  economic: '#3fb950',
  diplomatic: '#58a6ff',
  infrastructure: '#f0883e',
};

export const TechPanel: React.FC<TechPanelProps> = ({
  state,
  techState,
  onStartResearch,
  onCancelResearch,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | 'all'>('all');
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);

  const summary = getResearchSummary(techState);
  const bonuses = getTechBonuses(techState);
  const availableTechs = getAvailableTechs(techState);

  const displayTechs = selectedCategory === 'all'
    ? Object.values(TECH_TREE)
    : getTechsByCategory(selectedCategory);

  const canAfford = (tech: Technology): boolean => {
    const faction = state.factions[state.playerFaction];
    return faction.resources.influencePoints >= tech.cost.influencePoints &&
           faction.resources.economicOutput >= tech.cost.economicOutput;
  };

  const isAvailable = (tech: Technology): boolean => {
    return availableTechs.some(t => t.id === tech.id);
  };

  const renderTechCard = (tech: Technology) => {
    const researched = hasTech(techState, tech.id);
    const available = isAvailable(tech);
    const affordable = canAfford(tech);
    const isCurrentResearch = techState.currentResearch === tech.id;

    let statusClass = 'locked';
    if (researched) statusClass = 'researched';
    else if (isCurrentResearch) statusClass = 'researching';
    else if (available && affordable) statusClass = 'available';
    else if (available) statusClass = 'unaffordable';

    return (
      <div
        key={tech.id}
        className={`tech-card ${statusClass} tier-${tech.tier}`}
        onClick={() => setSelectedTech(tech)}
        style={{ borderColor: CATEGORY_COLORS[tech.category] }}
      >
        <div className="tech-card-header">
          <span className="tech-category-icon">{CATEGORY_ICONS[tech.category]}</span>
          <span className="tech-name">{tech.name}</span>
          <span className="tech-tier">T{tech.tier}</span>
        </div>
        <div className="tech-card-status">
          {researched && <span className="status-badge researched">Completed</span>}
          {isCurrentResearch && (
            <span className="status-badge researching">
              {summary.turnsRemaining} turns
            </span>
          )}
          {!researched && !isCurrentResearch && !available && (
            <span className="status-badge locked">Locked</span>
          )}
        </div>
      </div>
    );
  };

  const renderTechDetail = () => {
    if (!selectedTech) return null;

    const researched = hasTech(techState, selectedTech.id);
    const available = isAvailable(selectedTech);
    const affordable = canAfford(selectedTech);
    const isCurrentResearch = techState.currentResearch === selectedTech.id;
    const hasPrereqs = selectedTech.prerequisites.every(p => hasTech(techState, p));

    return (
      <div className="tech-detail">
        <div className="tech-detail-header" style={{ borderColor: CATEGORY_COLORS[selectedTech.category] }}>
          <span className="tech-icon">{CATEGORY_ICONS[selectedTech.category]}</span>
          <div className="tech-title-block">
            <h3>{selectedTech.name}</h3>
            <span className="tech-category">{selectedTech.category} - Tier {selectedTech.tier}</span>
          </div>
        </div>

        <p className="tech-description">{selectedTech.description}</p>
        <p className="tech-flavor">"{selectedTech.flavor}"</p>

        <div className="tech-costs">
          <h4>Research Cost</h4>
          <div className="cost-row">
            <span>Influence: {selectedTech.cost.influencePoints}</span>
            <span>Economic: {selectedTech.cost.economicOutput}</span>
            <span>Time: {selectedTech.cost.turnsToResearch} turns</span>
          </div>
        </div>

        {selectedTech.prerequisites.length > 0 && (
          <div className="tech-prereqs">
            <h4>Prerequisites</h4>
            <div className="prereq-list">
              {selectedTech.prerequisites.map(prereqId => {
                const prereq = TECH_TREE[prereqId];
                const met = hasTech(techState, prereqId);
                return (
                  <span key={prereqId} className={`prereq-item ${met ? 'met' : 'unmet'}`}>
                    {met ? '✓' : '✗'} {prereq?.name || prereqId}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="tech-effects">
          <h4>Effects</h4>
          <div className="effects-list">
            {selectedTech.effects.militaryBonus && (
              <span className="effect-item">+{selectedTech.effects.militaryBonus}% Military</span>
            )}
            {selectedTech.effects.economicBonus && (
              <span className="effect-item">+{selectedTech.effects.economicBonus}% Economy</span>
            )}
            {selectedTech.effects.influenceBonus && (
              <span className="effect-item">+{selectedTech.effects.influenceBonus}% Influence</span>
            )}
            {selectedTech.effects.legitimacyBonus && (
              <span className="effect-item">+{selectedTech.effects.legitimacyBonus} Legitimacy/turn</span>
            )}
            {selectedTech.effects.combatBonus && (
              <span className="effect-item">+{selectedTech.effects.combatBonus}% Combat</span>
            )}
            {selectedTech.effects.defenseBonus && (
              <span className="effect-item">+{selectedTech.effects.defenseBonus}% Defense</span>
            )}
            {selectedTech.effects.stealthBonus && (
              <span className="effect-item">+{selectedTech.effects.stealthBonus}% Stealth</span>
            )}
            {selectedTech.effects.treatyBonus && (
              <span className="effect-item">+{selectedTech.effects.treatyBonus}% Treaty</span>
            )}
            {selectedTech.effects.tensionReduction && (
              <span className="effect-item">-{selectedTech.effects.tensionReduction}% Tension</span>
            )}
            {selectedTech.effects.resourceExtraction && (
              <span className="effect-item">+{selectedTech.effects.resourceExtraction}% Resources</span>
            )}
            {selectedTech.effects.icebreakerBonus && (
              <span className="effect-item">+{selectedTech.effects.icebreakerBonus} Icebreakers</span>
            )}
            {selectedTech.effects.supplyChainResilience && (
              <span className="effect-item">+{selectedTech.effects.supplyChainResilience}% Supply Chain</span>
            )}
            {selectedTech.effects.unitUnlock && (
              <span className="effect-item unlock">Unlocks: {selectedTech.effects.unitUnlock}</span>
            )}
            {selectedTech.effects.actionUnlock && (
              <span className="effect-item unlock">Unlocks: {selectedTech.effects.actionUnlock}</span>
            )}
            {selectedTech.effects.buildingUnlock && (
              <span className="effect-item unlock">Unlocks: {selectedTech.effects.buildingUnlock}</span>
            )}
          </div>
        </div>

        <div className="tech-actions">
          {researched && (
            <div className="tech-status completed">
              <span>✓ Researched</span>
            </div>
          )}
          {isCurrentResearch && (
            <>
              <div className="research-progress">
                <span>Researching... {techState.researchProgress}/{selectedTech.cost.turnsToResearch} turns</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(techState.researchProgress / selectedTech.cost.turnsToResearch) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[selectedTech.category],
                    }}
                  />
                </div>
              </div>
              <button className="cancel-btn" onClick={onCancelResearch}>
                Cancel Research
              </button>
            </>
          )}
          {!researched && !isCurrentResearch && (
            <>
              {!hasPrereqs && (
                <div className="tech-warning">Prerequisites not met</div>
              )}
              {hasPrereqs && !affordable && (
                <div className="tech-warning">Insufficient resources</div>
              )}
              {hasPrereqs && affordable && techState.currentResearch && (
                <div className="tech-warning">Already researching another tech</div>
              )}
              <button
                className="research-btn"
                onClick={() => onStartResearch(selectedTech.id)}
                disabled={!available || !affordable || !!techState.currentResearch}
                style={{
                  backgroundColor: available && affordable && !techState.currentResearch
                    ? CATEGORY_COLORS[selectedTech.category]
                    : undefined
                }}
              >
                Start Research
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tech-panel">
      <div className="tech-header">
        <h3>Technology Research</h3>
        <button className="close-btn" onClick={onClose}>x</button>
      </div>

      <div className="tech-summary">
        <div className="summary-stat">
          <span className="stat-label">Researched</span>
          <span className="stat-value">{summary.totalResearched}/{summary.totalTechs}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Progress</span>
          <span className="stat-value">{summary.percentComplete}%</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Available</span>
          <span className="stat-value">{summary.availableCount}</span>
        </div>
        {summary.currentTech && (
          <div className="summary-stat current">
            <span className="stat-label">Researching</span>
            <span className="stat-value">{summary.currentTech.name}</span>
            <span className="stat-subvalue">{summary.turnsRemaining} turns left</span>
          </div>
        )}
      </div>

      <div className="tech-bonuses">
        <h4>Active Bonuses</h4>
        <div className="bonus-grid">
          {bonuses.combatBonus > 0 && (
            <span className="bonus-item">+{bonuses.combatBonus}% Combat</span>
          )}
          {bonuses.economicBonus > 0 && (
            <span className="bonus-item">+{bonuses.economicBonus}% Economy</span>
          )}
          {bonuses.influenceBonus > 0 && (
            <span className="bonus-item">+{bonuses.influenceBonus}% Influence</span>
          )}
          {bonuses.defenseBonus > 0 && (
            <span className="bonus-item">+{bonuses.defenseBonus}% Defense</span>
          )}
          {bonuses.icebreakerBonus > 0 && (
            <span className="bonus-item">+{bonuses.icebreakerBonus} Icebreakers</span>
          )}
          {bonuses.treatyBonus > 0 && (
            <span className="bonus-item">+{bonuses.treatyBonus}% Treaties</span>
          )}
          {Object.values(bonuses).every(v => v === 0) && (
            <span className="no-bonuses">No active bonuses yet</span>
          )}
        </div>
      </div>

      <div className="tech-categories">
        <button
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {(['military', 'economic', 'diplomatic', 'infrastructure'] as TechCategory[]).map(cat => (
          <button
            key={cat}
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => setSelectedCategory(cat)}
            style={{ borderColor: selectedCategory === cat ? CATEGORY_COLORS[cat] : undefined }}
          >
            {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="tech-content">
        <div className="tech-grid">
          {displayTechs.map(tech => renderTechCard(tech))}
        </div>

        {selectedTech && renderTechDetail()}
      </div>
    </div>
  );
};

// Mini widget for sidebar
export const TechMini: React.FC<{
  techState: TechState;
  onClick: () => void;
}> = ({ techState, onClick }) => {
  const summary = getResearchSummary(techState);

  return (
    <div className="tech-mini" onClick={onClick}>
      <div className="mini-header">
        <span className="mini-title">Technology</span>
        <span className="mini-expand">+</span>
      </div>
      <div className="mini-content">
        <div className="mini-stat">
          <span>Researched</span>
          <span className="stat-value">{summary.totalResearched}</span>
        </div>
        <div className="mini-stat">
          <span>Available</span>
          <span className="stat-value">{summary.availableCount}</span>
        </div>
      </div>
      {summary.currentTech && (
        <div className="mini-research">
          <span className="research-name">{summary.currentTech.name}</span>
          <span className="research-turns">{summary.turnsRemaining}t</span>
        </div>
      )}
    </div>
  );
};
