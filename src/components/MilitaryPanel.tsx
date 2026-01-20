import React, { useState } from 'react';
import { GameState, FactionId, MilitaryUnitState } from '../types/game';
import {
  UNIT_SPECS,
  OPERATION_SPECS,
  OperationType,
  UnitType,
} from '../game/military';
import { FACTIONS } from '../data/factions';

interface MilitaryPanelProps {
  gameState: GameState;
  selectedZone: string | null;
  onStartOperation: (
    operation: OperationType,
    units: string[],
    targetZone: string,
    targetFaction?: FactionId
  ) => void;
  onBuildUnit: (unitType: UnitType, location: string) => void;
}

export const MilitaryPanel: React.FC<MilitaryPanelProps> = ({
  gameState,
  selectedZone,
  onStartOperation,
  onBuildUnit,
}) => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<OperationType | null>(null);
  const [targetFaction, setTargetFaction] = useState<FactionId | null>(null);
  const [showBuildMenu, setShowBuildMenu] = useState(false);

  const playerUnits = gameState.militaryUnits.filter(
    u => u.owner === gameState.playerFaction && u.status !== 'destroyed'
  );

  const unitsInZone = selectedZone
    ? playerUnits.filter(u => u.location === selectedZone)
    : [];

  const selectedUnitObjects = playerUnits.filter(u => selectedUnits.includes(u.id));

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const canExecuteOperation = (): boolean => {
    if (!selectedOperation || !selectedZone) return false;
    if (selectedUnits.length === 0) return false;

    const spec = OPERATION_SPECS[selectedOperation];
    if (selectedUnits.length < spec.minUnits) return false;

    // Check if we have required unit types
    const hasRequiredType = selectedUnitObjects.some(
      u => spec.requiredUnits.includes(u.type as UnitType)
    );
    if (!hasRequiredType) return false;

    // Check legitimacy
    const faction = gameState.factions[gameState.playerFaction];
    if (faction.resources.legitimacy < spec.legitimacyCost) return false;

    return true;
  };

  const handleExecute = () => {
    if (!selectedOperation || !selectedZone || !canExecuteOperation()) return;

    onStartOperation(
      selectedOperation,
      selectedUnits,
      selectedZone,
      targetFaction || undefined
    );

    // Reset selection
    setSelectedUnits([]);
    setSelectedOperation(null);
    setTargetFaction(null);
  };

  const handleBuildUnit = (unitType: UnitType) => {
    if (!selectedZone) return;

    const zone = gameState.zones[selectedZone];
    if (zone?.controller !== gameState.playerFaction) return;

    onBuildUnit(unitType, selectedZone);
    setShowBuildMenu(false);
  };

  const otherFactions: FactionId[] = ['usa', 'russia', 'china'].filter(
    f => f !== gameState.playerFaction
  ) as FactionId[];

  const operations: OperationType[] = [
    'patrol', 'blockade', 'strike', 'defense', 'intercept'
  ];

  return (
    <div className="military-panel">
      <div className="panel-header">
        <h3>Military Operations</h3>
        <span className="unit-count">{playerUnits.length} units</span>
      </div>

      {/* Units List */}
      <div className="units-section">
        <div className="section-header">
          <h4>Your Forces</h4>
          {selectedZone && gameState.zones[selectedZone]?.controller === gameState.playerFaction && (
            <button
              className="build-btn"
              onClick={() => setShowBuildMenu(!showBuildMenu)}
            >
              + Build
            </button>
          )}
        </div>

        {showBuildMenu && (
          <div className="build-menu">
            {Object.entries(UNIT_SPECS).map(([type, spec]) => {
              const faction = gameState.factions[gameState.playerFaction];
              const canAfford = faction.resources.economicOutput >= spec.costEO;

              return (
                <div
                  key={type}
                  className={`build-option ${canAfford ? '' : 'disabled'}`}
                  onClick={() => canAfford && handleBuildUnit(type as UnitType)}
                >
                  <span className="unit-icon">{spec.icon}</span>
                  <div className="build-info">
                    <span className="build-name">{spec.name}</span>
                    <span className="build-cost">EO: {spec.costEO}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedZone ? (
          <div className="zone-units">
            <div className="zone-label">
              Units in {gameState.zones[selectedZone]?.name || selectedZone}:
            </div>
            {unitsInZone.length === 0 ? (
              <div className="no-units">No units in this zone</div>
            ) : (
              unitsInZone.map(unit => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  selected={selectedUnits.includes(unit.id)}
                  onClick={() => toggleUnitSelection(unit.id)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="all-units">
            {playerUnits.slice(0, 6).map(unit => (
              <UnitCard
                key={unit.id}
                unit={unit}
                selected={selectedUnits.includes(unit.id)}
                onClick={() => toggleUnitSelection(unit.id)}
                showLocation
                zones={gameState.zones}
              />
            ))}
            {playerUnits.length > 6 && (
              <div className="more-units">+{playerUnits.length - 6} more units</div>
            )}
          </div>
        )}
      </div>

      {/* Operations */}
      {selectedUnits.length > 0 && (
        <div className="operations-section">
          <h4>Select Operation</h4>
          <div className="operation-grid">
            {operations.map(op => {
              const spec = OPERATION_SPECS[op];
              return (
                <div
                  key={op}
                  className={`operation-type ${selectedOperation === op ? 'selected' : ''}`}
                  onClick={() => setSelectedOperation(op)}
                >
                  <div className="op-name">{spec.name}</div>
                  <div className={`risk-indicator ${spec.riskLevel}`}>
                    {spec.riskLevel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Selection */}
      {selectedOperation && OPERATION_SPECS[selectedOperation].tensionCost > 10 && (
        <div className="target-section">
          <h4>Target Faction</h4>
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

      {/* Execute Button */}
      {selectedOperation && (
        <div className="execute-section">
          <div className="operation-summary">
            <div className="summary-row">
              <span>Operation:</span>
              <span>{OPERATION_SPECS[selectedOperation].name}</span>
            </div>
            <div className="summary-row">
              <span>Units:</span>
              <span>{selectedUnits.length}</span>
            </div>
            <div className="summary-row">
              <span>Tension Cost:</span>
              <span className="tension-cost">+{OPERATION_SPECS[selectedOperation].tensionCost}</span>
            </div>
            {OPERATION_SPECS[selectedOperation].legitimacyCost > 0 && (
              <div className="summary-row">
                <span>Legitimacy Cost:</span>
                <span className="legitimacy-cost">-{OPERATION_SPECS[selectedOperation].legitimacyCost}</span>
              </div>
            )}
          </div>

          <button
            className="execute-operation-btn"
            disabled={!canExecuteOperation()}
            onClick={handleExecute}
          >
            Launch Operation
          </button>
        </div>
      )}
    </div>
  );
};

// Unit Card Component
interface UnitCardProps {
  unit: MilitaryUnitState;
  selected: boolean;
  onClick: () => void;
  showLocation?: boolean;
  zones?: Record<string, { name: string }>;
}

const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  selected,
  onClick,
  showLocation,
  zones,
}) => {
  const spec = UNIT_SPECS[unit.type as UnitType];
  const strengthClass = unit.strength > 60 ? '' : unit.strength > 30 ? 'low' : 'critical';

  return (
    <div
      className={`unit-card ${selected ? 'selected' : ''} ${unit.status === 'damaged' ? 'damaged' : ''}`}
      onClick={onClick}
    >
      <span className="unit-icon">{spec?.icon || '?'}</span>
      <div className="unit-info">
        <div className="unit-name">{spec?.name || unit.type}</div>
        <div className="unit-stats">
          {showLocation && zones && (
            <span className="unit-location">{zones[unit.location]?.name || unit.location}</span>
          )}
          <span>STR: {unit.strength}%</span>
        </div>
      </div>
      <div className="unit-strength">
        <div
          className={`unit-strength-bar ${strengthClass}`}
          style={{ width: `${unit.strength}%` }}
        />
      </div>
    </div>
  );
};

// Combat Result Modal
interface CombatResultModalProps {
  result: {
    success: boolean;
    attackerFaction: FactionId;
    defenderFaction: FactionId;
    zoneName: string;
    casualties: { unitId: string; unitName: string; damage: number }[];
    description: string;
    worldReaction: string;
  };
  onClose: () => void;
}

export const CombatResultModal: React.FC<CombatResultModalProps> = ({
  result,
  onClose,
}) => {
  return (
    <div className="combat-modal-overlay">
      <div className={`combat-result ${result.success ? 'victory' : 'defeat'}`}>
        <h3>{result.success ? 'OPERATION SUCCESS' : 'OPERATION FAILED'}</h3>

        <div className="combat-zone">{result.zoneName}</div>

        <p className="combat-description">{result.description}</p>

        {result.casualties.length > 0 && (
          <div className="casualties-list">
            <h4>Casualties</h4>
            {result.casualties.map((c, i) => (
              <div key={i} className="casualty-item">
                <span>{c.unitName}</span>
                <span className="casualty-damage">-{c.damage}%</span>
              </div>
            ))}
          </div>
        )}

        {result.worldReaction !== 'ignored' && (
          <div className={`world-reaction reaction-${result.worldReaction}`}>
            World Reaction: {result.worldReaction.toUpperCase()}
          </div>
        )}

        <button className="dismiss-btn" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default MilitaryPanel;
