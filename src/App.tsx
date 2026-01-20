import { useState, useCallback, useEffect } from 'react';
import { GameState, FactionId, GameAction, CombatResultState } from './types/game';
import { createInitialGameState, updateTension } from './game/state';
import { executeAction } from './game/actions';
import { advanceTurn, applyCrisisChoice, unlockAchievement } from './game/turns';
import { resolveCombat, UNIT_SPECS, OPERATION_SPECS, OperationType, UnitType } from './game/military';
import { getLeaderForFaction } from './game/leaders';
import { ACHIEVEMENTS, CrisisChoice } from './game/drama';
import { ArcticMap, ZoneDetail } from './components/ArcticMap';
import { Dashboard, EventLog } from './components/Dashboard';
import { ActionPanel } from './components/ActionPanel';
import { FactionSelect } from './components/FactionSelect';
import { GameOver } from './components/GameOver';
import { MilitaryPanel, CombatResultModal } from './components/MilitaryPanel';
import { LeaderDialog } from './components/LeaderDialog';
import { AudioControls } from './components/AudioControls';
import {
  CrisisModal,
  AchievementPopup,
  DiscoveryPopup,
  EnvironmentalEventPopup,
  NuclearModal,
} from './components/CrisisModal';
import { Tutorial, HelpButton } from './components/Tutorial';
import { PopupManager } from './components/LeaderPopup';
import { LeaderId } from './components/PixelArt';
import { getChiptuneEngine } from './audio/ChiptuneEngine';
import './App.css';

type GameScreen = 'faction_select' | 'playing' | 'game_over';
type RightPanelMode = 'actions' | 'military';

function App() {
  const [screen, setScreen] = useState<GameScreen>('faction_select');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState({ width: 600, height: 600 });
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('actions');
  const [showLeaderDialog, setShowLeaderDialog] = useState<{
    leaderId: LeaderId;
    context: string;
  } | null>(null);

  // Drama system state
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showEnvironmentalEvent, setShowEnvironmentalEvent] = useState(false);
  const [showNuclearModal, setShowNuclearModal] = useState(false);
  const [seenAchievements, setSeenAchievements] = useState<Set<string>>(new Set());

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(true);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('arctic_dominion_tutorial_seen') === 'true';
  });

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

  // Update music mood based on highest tension
  useEffect(() => {
    if (!gameState) return;

    const engine = getChiptuneEngine();
    const playerRelations = gameState.relations.filter(
      r => r.factions.includes(gameState.playerFaction)
    );

    // Find highest tension level
    const tensionOrder = ['cooperation', 'competition', 'confrontation', 'crisis', 'conflict'];
    let maxTension = 'cooperation';
    for (const rel of playerRelations) {
      if (tensionOrder.indexOf(rel.tensionLevel) > tensionOrder.indexOf(maxTension)) {
        maxTension = rel.tensionLevel;
      }
    }

    engine.setMood(
      maxTension === 'conflict' ? 'combat' :
      maxTension === 'crisis' ? 'crisis' :
      maxTension === 'confrontation' ? 'tense' : 'peaceful'
    );
  }, [gameState?.relations]);

  // Check for new achievements to display
  useEffect(() => {
    if (!gameState) return;

    // Find first unseen achievement
    for (const achId of gameState.unlockedAchievements) {
      if (!seenAchievements.has(achId)) {
        setShowAchievement(achId);
        getChiptuneEngine().playSfx('success');
        break;
      }
    }
  }, [gameState?.unlockedAchievements, seenAchievements]);

  // Show discovery popup when one is pending
  useEffect(() => {
    if (gameState?.pendingDiscovery && !showDiscovery) {
      setShowDiscovery(true);
      getChiptuneEngine().playSfx('success');
    }
  }, [gameState?.pendingDiscovery]);

  // Show environmental event popup
  useEffect(() => {
    if (gameState?.pendingEnvironmentalEvent && !showEnvironmentalEvent) {
      setShowEnvironmentalEvent(true);
      getChiptuneEngine().playSfx('warning');
    }
  }, [gameState?.pendingEnvironmentalEvent]);

  // Show nuclear modal when at high readiness
  useEffect(() => {
    if (gameState && (gameState.nuclearReadiness === 'defcon2' || gameState.nuclearReadiness === 'defcon1')) {
      setShowNuclearModal(true);
      getChiptuneEngine().playSfx('warning');
    }
  }, [gameState?.nuclearReadiness]);

  const handleFactionSelect = useCallback((factionId: FactionId) => {
    const state = createInitialGameState(factionId);
    setGameState(state);
    setScreen('playing');

    // Show tutorial for new players, then show greeting
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    } else {
      // Show greeting from a rival leader
      const rivalLeader = factionId === 'usa' ? 'putin' :
                          factionId === 'russia' ? 'trump' : 'putin';
      setShowLeaderDialog({ leaderId: rivalLeader as LeaderId, context: 'greeting' });
    }
  }, [hasSeenTutorial]);

  const handleExecuteAction = useCallback((
    action: GameAction,
    targetFaction?: FactionId,
    targetZone?: string
  ) => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState));
    executeAction(newState, action, targetFaction, targetZone);
    setGameState(newState);

    // Play sound effect
    getChiptuneEngine().playSfx('action');

    // Maybe trigger leader reaction for high-tension actions
    if (targetFaction && action.effects.tensionChange && action.effects.tensionChange > 15) {
      const leaderId = getLeaderForFaction(targetFaction);
      if (leaderId) {
        setTimeout(() => {
          setShowLeaderDialog({ leaderId, context: 'threat' });
        }, 500);
      }
    }
  }, [gameState]);

  const handleStartOperation = useCallback((
    operation: OperationType,
    unitIds: string[],
    targetZone: string,
    targetFaction?: FactionId
  ) => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    const zone = newState.zones[targetZone];

    // Get attacker units
    const attackerUnits = newState.militaryUnits.filter(u => unitIds.includes(u.id));

    // Determine defender
    const defenderFactionId = targetFaction || zone.controller;
    if (!defenderFactionId || defenderFactionId === gameState.playerFaction) {
      // Non-combat operation (patrol, defense, etc.)
      const spec = OPERATION_SPECS[operation];

      // Apply tension and legitimacy costs
      if (targetFaction) {
        updateTension(newState, newState.playerFaction, targetFaction, spec.tensionCost);
      }
      newState.factions[newState.playerFaction].resources.legitimacy -= spec.legitimacyCost;

      // Update unit status
      attackerUnits.forEach(u => {
        const unit = newState.militaryUnits.find(mu => mu.id === u.id);
        if (unit) {
          unit.status = 'deployed';
          unit.location = targetZone;
        }
      });

      getChiptuneEngine().playSfx('action');
      setGameState(newState);
      return;
    }

    // Get defender units in zone
    const defenderUnits = newState.militaryUnits.filter(
      u => u.owner === defenderFactionId && u.location === targetZone && u.status !== 'destroyed'
    );

    // Resolve combat
    const result = resolveCombat(
      attackerUnits.map(u => ({
        id: u.id,
        type: u.type as UnitType,
        owner: u.owner,
        location: u.location,
        strength: u.strength,
        experience: u.experience,
        morale: u.morale,
        status: u.status as 'ready' | 'deployed' | 'damaged' | 'destroyed',
      })),
      defenderUnits.map(u => ({
        id: u.id,
        type: u.type as UnitType,
        owner: u.owner,
        location: u.location,
        strength: u.strength,
        experience: u.experience,
        morale: u.morale,
        status: u.status as 'ready' | 'deployed' | 'damaged' | 'destroyed',
      })),
      newState.playerFaction,
      defenderFactionId,
      zone,
      operation
    );

    // Apply casualties
    result.casualties.forEach(({ unitId, damage }) => {
      const unit = newState.militaryUnits.find(u => u.id === unitId);
      if (unit) {
        unit.strength = Math.max(0, unit.strength - damage);
        if (unit.strength <= 0) {
          unit.status = 'destroyed';
        } else if (unit.strength < 50) {
          unit.status = 'damaged';
        }
      }
    });

    // Apply zone control change
    if (result.zoneControlChange) {
      newState.zones[targetZone].controller = result.zoneControlChange;
    }

    // Apply tension
    updateTension(newState, newState.playerFaction, defenderFactionId, result.tensionIncrease);

    // Create combat result for display
    const combatResult: CombatResultState = {
      success: result.success,
      attackerFaction: newState.playerFaction,
      defenderFaction: defenderFactionId,
      zoneName: zone.name,
      casualties: result.casualties.map(c => {
        const unit = newState.militaryUnits.find(u => u.id === c.unitId);
        return {
          unitId: c.unitId,
          unitName: unit ? UNIT_SPECS[unit.type as UnitType]?.name || unit.type : 'Unknown',
          damage: c.damage,
        };
      }),
      description: result.description,
      worldReaction: result.worldReaction,
    };

    newState.combatResult = combatResult;

    // Store combat surprise if any
    if (result.combatSurprise) {
      newState.combatSurprise = result.combatSurprise;
    }

    // Play combat sound
    getChiptuneEngine().playSfx(result.success ? 'success' : 'warning');

    setGameState(newState);
  }, [gameState]);

  const handleBuildUnit = useCallback((unitType: UnitType, location: string) => {
    if (!gameState) return;

    const spec = UNIT_SPECS[unitType];
    const faction = gameState.factions[gameState.playerFaction];

    if (faction.resources.economicOutput < spec.costEO) return;

    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;

    // Deduct cost
    newState.factions[newState.playerFaction].resources.economicOutput -= spec.costEO;
    newState.factions[newState.playerFaction].resources.influencePoints -= spec.costIP;

    // Create new unit
    const newUnit = {
      id: `${newState.playerFaction}_unit_${Date.now()}`,
      type: unitType,
      owner: newState.playerFaction,
      location,
      strength: 100,
      experience: 10,
      morale: 80,
      status: 'ready' as const,
      stealthed: unitType === 'submarine',
    };

    newState.militaryUnits.push(newUnit);

    getChiptuneEngine().playSfx('success');
    setGameState(newState);
  }, [gameState]);

  const handleCloseCombatResult = useCallback(() => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    const result = newState.combatResult;

    // Unlock first blood achievement on first combat win
    if (result?.success && !newState.unlockedAchievements.includes('first_blood')) {
      unlockAchievement(newState, 'first_blood');
    }

    // Show leader reaction after combat
    if (result) {
      const leaderId = getLeaderForFaction(result.defenderFaction);
      if (leaderId) {
        setShowLeaderDialog({
          leaderId,
          context: result.success ? 'defeat' : 'victory',
        });
      }
    }

    newState.combatResult = null;
    newState.combatSurprise = null;
    setGameState(newState);
  }, [gameState]);

  // Handle crisis resolution
  const handleCrisisResolve = useCallback((choice: CrisisChoice, success: boolean) => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    applyCrisisChoice(newState, choice.id, success);

    // Handle leader reaction if specified
    const consequences = success ? choice.consequences : (choice.failureConsequences || choice.consequences);
    if (consequences.leaderReaction) {
      const reaction = consequences.leaderReaction as { leader: LeaderId; context: string };
      setTimeout(() => {
        setShowLeaderDialog({
          leaderId: reaction.leader,
          context: reaction.context,
        });
      }, 1000);
    }

    getChiptuneEngine().playSfx(success ? 'success' : 'warning');
    setGameState(newState);
  }, [gameState]);

  // Handle achievement dismissal
  const handleDismissAchievement = useCallback(() => {
    if (showAchievement) {
      setSeenAchievements(prev => new Set([...prev, showAchievement]));
      setShowAchievement(null);
    }
  }, [showAchievement]);

  // Handle discovery dismissal
  const handleDismissDiscovery = useCallback(() => {
    if (!gameState) return;
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    newState.pendingDiscovery = null;
    setGameState(newState);
    setShowDiscovery(false);
  }, [gameState]);

  // Handle environmental event dismissal
  const handleDismissEnvironmentalEvent = useCallback(() => {
    if (!gameState) return;
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    newState.pendingEnvironmentalEvent = null;
    setGameState(newState);
    setShowEnvironmentalEvent(false);
  }, [gameState]);

  // Handle nuclear modal resolution
  const handleNuclearResolve = useCallback((effect: 'escalate' | 'maintain' | 'deescalate') => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;

    if (effect === 'escalate') {
      // Game over - nuclear war
      newState.gameOver = true;
      newState.winner = null; // No winner in nuclear war
      setScreen('game_over');
    } else if (effect === 'deescalate') {
      // Attempt de-escalation
      if (Math.random() > 0.3) {
        // Success - reduce all tensions
        newState.relations.forEach(rel => {
          if (rel.factions.includes(newState.playerFaction)) {
            rel.tensionValue = Math.max(0, rel.tensionValue - 50);
            if (rel.tensionValue === 0 && rel.tensionLevel !== 'cooperation') {
              const levels = ['cooperation', 'competition', 'confrontation', 'crisis', 'conflict'];
              const idx = levels.indexOf(rel.tensionLevel);
              if (idx > 0) rel.tensionLevel = levels[idx - 1] as typeof rel.tensionLevel;
            }
          }
        });
        newState.nuclearReadiness = 'elevated';
        getChiptuneEngine().playSfx('success');
      } else {
        // Failed - tension stays
        getChiptuneEngine().playSfx('warning');
      }
    }
    // maintain - just close modal

    setShowNuclearModal(false);
    setGameState(newState);
  }, [gameState]);

  const handleEndTurn = useCallback(() => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState));
    advanceTurn(newState);
    setGameState(newState);

    getChiptuneEngine().playSfx('click');

    if (newState.gameOver) {
      setScreen('game_over');
    }
  }, [gameState]);

  const handleRestart = useCallback(() => {
    setGameState(null);
    setSelectedZone(null);
    setScreen('faction_select');
    getChiptuneEngine().stop();
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

  // Get max tension for audio
  const maxTension = gameState.relations
    .filter(r => r.factions.includes(gameState.playerFaction))
    .reduce((max, r) => {
      const order = ['cooperation', 'competition', 'confrontation', 'crisis', 'conflict'];
      return order.indexOf(r.tensionLevel) > order.indexOf(max) ? r.tensionLevel : max;
    }, 'cooperation' as string);

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>ARCTIC DOMINION</h1>
        <div className="header-status">
          <span className="year">{gameState.year}</span>
          <span className="season">{gameState.season}</span>
          <span className="turn">Turn {gameState.turn}/20</span>
        </div>
        <AudioControls maxTension={maxTension as any} />
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
          <div className="panel-tabs">
            <button
              className={`panel-tab ${rightPanelMode === 'actions' ? 'active' : ''}`}
              onClick={() => setRightPanelMode('actions')}
            >
              Actions
            </button>
            <button
              className={`panel-tab ${rightPanelMode === 'military' ? 'active' : ''}`}
              onClick={() => setRightPanelMode('military')}
            >
              Military
            </button>
          </div>

          {rightPanelMode === 'actions' ? (
            <>
              <ActionPanel
                gameState={gameState}
                selectedZone={selectedZone}
                onExecuteAction={handleExecuteAction}
                onEndTurn={handleEndTurn}
              />
              <EventLog gameState={gameState} />
            </>
          ) : (
            <MilitaryPanel
              gameState={gameState}
              selectedZone={selectedZone}
              onStartOperation={handleStartOperation}
              onBuildUnit={handleBuildUnit}
            />
          )}
        </aside>
      </main>

      {/* Combat Result Modal */}
      {gameState.combatResult && (
        <CombatResultModal
          result={gameState.combatResult}
          onClose={handleCloseCombatResult}
        />
      )}

      {/* Leader Dialog */}
      {showLeaderDialog && (
        <LeaderDialog
          leaderId={showLeaderDialog.leaderId}
          context={showLeaderDialog.context}
          onDismiss={() => setShowLeaderDialog(null)}
        />
      )}

      {/* Crisis Modal */}
      {gameState.activeCrisis && (
        <CrisisModal
          crisis={{
            id: gameState.activeCrisis.id,
            type: gameState.activeCrisis.type as any,
            title: gameState.activeCrisis.title,
            description: gameState.activeCrisis.description,
            instigator: gameState.activeCrisis.instigator,
            targetZone: gameState.activeCrisis.targetZone,
            urgency: gameState.activeCrisis.urgency,
            turnsToRespond: gameState.activeCrisis.turnsToRespond,
            choices: gameState.activeCrisis.choices.map(c => ({
              id: c.id,
              label: c.label,
              description: c.description,
              consequences: c.consequences as any,
              successChance: c.successChance,
              failureConsequences: c.failureConsequences as any,
            })),
          }}
          onResolve={handleCrisisResolve}
        />
      )}

      {/* Achievement Popup */}
      {showAchievement && ACHIEVEMENTS[showAchievement] && (
        <AchievementPopup
          achievement={ACHIEVEMENTS[showAchievement]}
          onClose={handleDismissAchievement}
        />
      )}

      {/* Discovery Popup */}
      {showDiscovery && gameState.pendingDiscovery && (
        <DiscoveryPopup
          discovery={gameState.pendingDiscovery}
          zoneName={gameState.zones[gameState.pendingDiscovery.zoneId]?.name || 'Unknown'}
          onClose={handleDismissDiscovery}
        />
      )}

      {/* Environmental Event Popup */}
      {showEnvironmentalEvent && gameState.pendingEnvironmentalEvent && (
        <EnvironmentalEventPopup
          event={gameState.pendingEnvironmentalEvent}
          onClose={handleDismissEnvironmentalEvent}
        />
      )}

      {/* Nuclear Escalation Modal */}
      {showNuclearModal && (
        <NuclearModal
          event={{
            id: `nuclear_${Date.now()}`,
            title: gameState.nuclearReadiness === 'defcon1' ? 'NUCLEAR WAR IMMINENT' : 'DEFCON 2',
            description: gameState.nuclearReadiness === 'defcon1'
              ? 'Strategic nuclear forces are at maximum readiness. One mistake could trigger Armageddon.'
              : 'Nuclear tensions are dangerously high. Bombers are armed and ready.',
            newReadiness: gameState.nuclearReadiness,
            choices: [
              { label: 'First Strike Option', effect: 'escalate' as const, consequences: 'GAME OVER - Mutual destruction.' },
              { label: 'Back Channel Diplomacy', effect: 'deescalate' as const, consequences: 'Attempt to find off-ramp.' },
              { label: 'Maintain Readiness', effect: 'maintain' as const, consequences: 'Stand firm but don\'t escalate.' },
            ],
          }}
          onResolve={handleNuclearResolve}
        />
      )}

      {/* Tutorial */}
      {showTutorial && (
        <Tutorial onComplete={() => {
          setShowTutorial(false);
          if (!hasSeenTutorial) {
            setHasSeenTutorial(true);
            localStorage.setItem('arctic_dominion_tutorial_seen', 'true');
            // Show greeting after tutorial
            const rivalLeader = gameState.playerFaction === 'usa' ? 'putin' :
                                gameState.playerFaction === 'russia' ? 'trump' : 'putin';
            setShowLeaderDialog({ leaderId: rivalLeader as LeaderId, context: 'greeting' });
          }
        }} />
      )}

      {/* Help Button */}
      <HelpButton onClick={() => setShowTutorial(true)} />

      {/* Random Leader Popups (Civ V Style) */}
      <PopupManager
        context={{
          playerFaction: gameState.playerFaction,
          turn: gameState.turn,
          playerVP: gameState.factions[gameState.playerFaction].victoryPoints,
          globalTension: gameState.relations
            .filter(r => r.factions.includes(gameState.playerFaction))
            .reduce((sum, r) => sum + r.tensionValue, 0),
        }}
        enabled={!showTutorial && !showLeaderDialog && !gameState.activeCrisis && !gameState.combatResult}
        excludeLeaders={[getLeaderForFaction(gameState.playerFaction) as LeaderId].filter(Boolean)}
      />
    </div>
  );
}

export default App;
