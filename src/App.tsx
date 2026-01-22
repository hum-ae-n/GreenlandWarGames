import { useState, useCallback, useEffect, lazy, Suspense, Component, ReactNode, ErrorInfo } from 'react';
import { GameState, FactionId, GameAction, CombatResultState } from './types/game';
import { createInitialGameState, updateTension } from './game/state';
import { executeAction } from './game/actions';
import { advanceTurn, applyCrisisChoice, unlockAchievement } from './game/turns';
import { resolveCombat, UNIT_SPECS, OPERATION_SPECS, OperationType, UnitType } from './game/military';
import { getLeaderForFaction } from './game/leaders';
import { ACHIEVEMENTS, CrisisChoice } from './game/drama';
import { ArcticMap, ZoneDetail } from './components/ArcticMap';
import { ArcticMap3D } from './components/ArcticMap3D';

// Lazy load Leaflet to isolate any initialization errors
const ArcticMapLeaflet = lazy(() => import('./components/ArcticMapLeaflet'));

// Error boundary for map components
interface MapErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  MapErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback: ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map component error:', error, errorInfo);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
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
import { Advisor, DiplomacyPanel } from './components/Advisor';
import { LeaderId, PixelPortrait, LEADER_NAMES } from './components/PixelArt';
import { ReputationMini, ReputationPanel } from './components/ReputationPanel';
import { ObjectivesMini, ObjectivesPanel } from './components/ObjectivesPanel';
import { EconomicsMini, EconomicsPanel } from './components/EconomicsPanel';
import { TechMini, TechPanel } from './components/TechPanel';
import { AIGuide } from './components/AIGuide';
import { FACTIONS } from './data/factions';
import { getChiptuneEngine } from './audio/ChiptuneEngine';
import { DECISION_TEMPLATES, DecisionType } from './game/reputation';
import {
  createInitialEconomicState,
  EconomicState,
  TradeDeal,
  Sanction
} from './game/economics';
import {
  createInitialTechState,
  TechState,
  startResearch,
  processResearch,
  cancelResearch,
  applyTechEffects,
} from './game/technology';
import './App.css';

type GameScreen = 'faction_select' | 'playing' | 'game_over';
type RightPanelMode = 'actions' | 'military';
type MapMode = '2d' | '3d' | 'world';

function App() {
  const [screen, setScreen] = useState<GameScreen>('faction_select');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState({ width: 600, height: 600 });
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('actions');
  const [mapMode, setMapMode] = useState<MapMode>('2d');
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

  // Panel display state
  const [showReputationPanel, setShowReputationPanel] = useState(false);
  const [showObjectivesPanel, setShowObjectivesPanel] = useState(false);
  const [showEconomicsPanel, setShowEconomicsPanel] = useState(false);
  const [showTechPanel, setShowTechPanel] = useState(false);
  const [showAIGuide, setShowAIGuide] = useState(false);

  // Economic state
  const [economicState, setEconomicState] = useState<EconomicState | null>(null);

  // Tech state
  const [techState, setTechState] = useState<TechState | null>(null);

  // Handle window resize - fill available space
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.map-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setMapSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    // Also update on slight delay to catch layout changes
    const timeout = setTimeout(updateSize, 100);
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeout);
    };
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
    setEconomicState(createInitialEconomicState());
    setTechState(createInitialTechState());
    setScreen('playing');

    // Set faction-specific music style
    getChiptuneEngine().setFaction(factionId);

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

  // Helper to update reputation based on action
  const updateReputationForAction = useCallback((state: GameState, action: GameAction, _targetFaction?: FactionId) => {
    if (!state.playerReputation) return;

    // Map action types to reputation decisions
    let decisionType: DecisionType | null = null;

    if (action.category === 'military') {
      if (action.id.includes('exercise') || action.id.includes('patrol') || action.id.includes('force')) {
        decisionType = 'military_aggression';
      } else if (action.id.includes('defense')) {
        decisionType = 'military_defense';
      }
    } else if (action.category === 'diplomatic') {
      if (action.id.includes('treaty') || action.id.includes('council')) {
        decisionType = 'treaty_signed';
      } else if (action.id.includes('protest')) {
        decisionType = 'diplomatic_failure';
      }
    } else if (action.category === 'economic') {
      if (action.id.includes('extraction')) {
        decisionType = 'environmental_exploitation';
      } else {
        decisionType = 'economic_cooperation';
      }
    } else if (action.category === 'covert') {
      decisionType = 'military_aggression'; // Covert ops are seen as aggressive
    }

    if (decisionType && DECISION_TEMPLATES[decisionType] && state.playerReputation) {
      const template = DECISION_TEMPLATES[decisionType];
      const effects = template.effects;
      const rep = state.playerReputation;

      // Apply effects
      if (effects.militarism) rep.militarism = Math.max(0, Math.min(100, rep.militarism + effects.militarism));
      if (effects.reliability) rep.reliability = Math.max(0, Math.min(100, rep.reliability + effects.reliability));
      if (effects.diplomacy) rep.diplomacy = Math.max(0, Math.min(100, rep.diplomacy + effects.diplomacy));
      if (effects.environmentalism) rep.environmentalism = Math.max(0, Math.min(100, rep.environmentalism + effects.environmentalism));
      if (effects.humanRights) rep.humanRights = Math.max(0, Math.min(100, rep.humanRights + effects.humanRights));
      if (effects.economicFairness) rep.economicFairness = Math.max(0, Math.min(100, rep.economicFairness + effects.economicFairness));

      // Update counters
      if (decisionType === 'treaty_signed') rep.treatiesHonored++;
      if (decisionType === 'military_aggression') rep.warsDeclared++;

      // Recalculate overall
      const militarismScore = 100 - rep.militarism;
      rep.overallReputation = Math.round(
        militarismScore * 0.1 +
        rep.reliability * 0.25 +
        rep.diplomacy * 0.2 +
        rep.environmentalism * 0.15 +
        rep.humanRights * 0.15 +
        rep.economicFairness * 0.15
      );
    }
  }, []);

  const handleExecuteAction = useCallback((
    action: GameAction,
    targetFaction?: FactionId,
    targetZone?: string
  ) => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState));
    executeAction(newState, action, targetFaction, targetZone);

    // Update reputation based on action
    updateReputationForAction(newState, action, targetFaction);

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
  }, [gameState, updateReputationForAction]);

  // Handle zone-specific actions from ZoneDetail panel
  const handleZoneAction = useCallback((actionId: string, zoneId: string) => {
    if (!gameState) return;

    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    const zone = newState.zones[zoneId];
    const playerFaction = newState.factions[newState.playerFaction];

    const notify = (type: 'achievement' | 'discovery' | 'crisis' | 'combat' | 'environmental', title: string, description: string) => {
      newState.notifications.push({
        id: `notif_${actionId}_${Date.now()}`,
        type,
        title,
        description,
        timestamp: Date.now(),
      });
    };

    switch (actionId) {
      case 'claim': {
        // Claim unclaimed territory - costs influence
        const cost = 25;
        if (playerFaction.resources.influencePoints < cost) {
          notify('environmental', 'Insufficient Influence', `Need ${cost} influence to claim ${zone.name}.`);
          break;
        }
        playerFaction.resources.influencePoints -= cost;
        zone.controller = newState.playerFaction;
        playerFaction.controlledZones.push(zoneId);
        notify('achievement', 'Territory Claimed', `${playerFaction.name} has claimed ${zone.name}!`);
        // Increase tension with nearby factions
        Object.values(newState.zones).forEach(z => {
          if (z.controller && z.controller !== newState.playerFaction) {
            updateTension(newState, newState.playerFaction, z.controller, 5);
          }
        });
        break;
      }
      case 'explore': {
        // Resource survey - costs economy, may reveal resources
        const cost = 20;
        if (playerFaction.resources.economicOutput < cost) {
          notify('environmental', 'Insufficient Funds', `Need ${cost} economic output for resource survey.`);
          break;
        }
        playerFaction.resources.economicOutput -= cost;
        const discoveryRoll = Math.random();
        if (discoveryRoll > 0.4) {
          const resourceType = Math.random() > 0.5 ? 'oil' : 'gas';
          const amount = Math.floor(Math.random() * 3) + 1;
          zone.resources[resourceType] += amount;
          notify('discovery', 'Resources Discovered!', `Survey found +${amount} ${resourceType} in ${zone.name}!`);
        } else {
          notify('environmental', 'Survey Complete', `Survey of ${zone.name} found no significant resources.`);
        }
        break;
      }
      case 'fortify': {
        // Fortify position - costs economy, increases military presence
        const cost = 30;
        if (playerFaction.resources.economicOutput < cost) {
          notify('environmental', 'Insufficient Funds', `Need ${cost} economic output to fortify.`);
          break;
        }
        playerFaction.resources.economicOutput -= cost;
        zone.militaryPresence[newState.playerFaction] = (zone.militaryPresence[newState.playerFaction] || 0) + 2;
        playerFaction.resources.militaryReadiness += 5;
        notify('combat', 'Position Fortified', `Strengthened defenses in ${zone.name}.`);
        break;
      }
      case 'extract': {
        // Extract resources - generates income from controlled zone
        const income = zone.resources.oil * 2 + zone.resources.gas * 1.5 + zone.resources.minerals;
        playerFaction.resources.economicOutput += Math.floor(income);
        notify('discovery', 'Resources Extracted', `Gained +${Math.floor(income)} economic value from ${zone.name}.`);
        break;
      }
      case 'toll': {
        // Control shipping at chokepoint - generates income
        const income = zone.resources.shipping * 3;
        playerFaction.resources.economicOutput += income;
        notify('discovery', 'Tolls Collected', `Collected ${income} in shipping tolls at ${zone.name}.`);
        break;
      }
      case 'negotiate': {
        // Negotiate access - costs influence, reduces tension
        const cost = 15;
        if (playerFaction.resources.influencePoints < cost) {
          notify('environmental', 'Insufficient Influence', `Need ${cost} influence to negotiate.`);
          break;
        }
        playerFaction.resources.influencePoints -= cost;
        if (zone.controller) {
          updateTension(newState, newState.playerFaction, zone.controller, -10);
        }
        notify('achievement', 'Negotiations Opened', `Opened diplomatic talks regarding ${zone.name}.`);
        break;
      }
      case 'invest': {
        // Joint venture - costs economy, may gain shared access
        const cost = 40;
        if (playerFaction.resources.economicOutput < cost) {
          notify('environmental', 'Insufficient Funds', `Need ${cost} economic output for joint venture.`);
          break;
        }
        playerFaction.resources.economicOutput -= cost;
        if (zone.controller) {
          updateTension(newState, newState.playerFaction, zone.controller, -5);
        }
        playerFaction.resources.economicOutput += 15; // Future returns
        notify('achievement', 'Joint Venture Proposed', `Economic partnership proposed in ${zone.name}.`);
        break;
      }
      case 'pressure': {
        // Apply pressure - costs influence, raises tension
        const cost = 20;
        if (playerFaction.resources.influencePoints < cost) {
          notify('environmental', 'Insufficient Influence', `Need ${cost} influence to apply pressure.`);
          break;
        }
        playerFaction.resources.influencePoints -= cost;
        if (zone.controller) {
          updateTension(newState, newState.playerFaction, zone.controller, 15);
        }
        notify('crisis', 'Pressure Applied', `Diplomatic pressure applied regarding ${zone.name}.`);
        break;
      }
      case 'patrol': {
        // Freedom of navigation - military presence, raises tension
        const cost = 15;
        if (playerFaction.resources.economicOutput < cost) {
          notify('environmental', 'Insufficient Funds', `Need ${cost} economic output for patrol.`);
          break;
        }
        playerFaction.resources.economicOutput -= cost;
        zone.militaryPresence[newState.playerFaction] = (zone.militaryPresence[newState.playerFaction] || 0) + 1;
        if (zone.controller) {
          updateTension(newState, newState.playerFaction, zone.controller, 10);
        }
        notify('combat', 'Patrol Conducted', `Freedom of navigation patrol near ${zone.name}.`);
        break;
      }
      case 'blockade': {
        // Naval blockade - high tension, economic damage
        const cost = 35;
        if (playerFaction.resources.economicOutput < cost) {
          notify('environmental', 'Insufficient Funds', `Need ${cost} economic output for blockade.`);
          break;
        }
        playerFaction.resources.economicOutput -= cost;
        if (zone.controller) {
          updateTension(newState, newState.playerFaction, zone.controller, 25);
          newState.factions[zone.controller].resources.economicOutput -= 20;
        }
        playerFaction.resources.legitimacy -= 10;
        notify('crisis', 'Blockade Established', `Naval blockade around ${zone.name}!`);
        break;
      }
      case 'attack': {
        // Military operation - attempt to seize zone
        notify('combat', 'Combat Required', `Use the Military Panel for operations against ${zone.name}.`);
        break;
      }
      case 'intel': {
        // Gather intelligence
        const cost = 10;
        if (playerFaction.resources.influencePoints < cost) {
          notify('environmental', 'Insufficient Influence', `Need ${cost} influence for intelligence op.`);
          break;
        }
        playerFaction.resources.influencePoints -= cost;
        const forces = Object.entries(zone.militaryPresence).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None';
        notify('discovery', 'Intel Gathered', `${zone.name} military presence: ${forces}`);
        break;
      }
    }

    setGameState(newState);
    getChiptuneEngine().playSfx('action');
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

    // Update reputation for military operation
    if (newState.playerReputation) {
      const rep = newState.playerReputation;

      // Military operations affect reputation
      rep.militarism = Math.min(100, rep.militarism + 10);
      rep.reliability = Math.max(0, rep.reliability - 2); // Aggression reduces perceived reliability

      if (operation === 'invasion') {
        rep.warsDeclared++;
        rep.zonesConquered++;
        rep.humanRights = Math.max(0, rep.humanRights - 5);
        rep.diplomacy = Math.max(0, rep.diplomacy - 10);
      } else if (operation === 'strike') {
        rep.humanRights = Math.max(0, rep.humanRights - 3);
        rep.diplomacy = Math.max(0, rep.diplomacy - 5);
      }

      // Recalculate overall
      const militarismScore = 100 - rep.militarism;
      rep.overallReputation = Math.round(
        militarismScore * 0.1 +
        rep.reliability * 0.25 +
        rep.diplomacy * 0.2 +
        rep.environmentalism * 0.15 +
        rep.humanRights * 0.15 +
        rep.economicFairness * 0.15
      );
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
    const newEconomicState = economicState ? JSON.parse(JSON.stringify(economicState)) : null;
    const newTechState = techState ? JSON.parse(JSON.stringify(techState)) as TechState : null;

    advanceTurn(newState, newEconomicState);

    // Process research progress
    if (newTechState) {
      const researchResult = processResearch(newState, newTechState);
      if (researchResult.completed && researchResult.tech) {
        // Research completed - show notification
        newState.notifications.push({
          id: `notif_tech_${Date.now()}`,
          type: 'discovery',
          title: `Research Complete: ${researchResult.tech.name}`,
          description: researchResult.tech.description,
          timestamp: Date.now(),
        });
        getChiptuneEngine().playSfx('success');
      }
      // Apply tech effects each turn
      applyTechEffects(newState, newTechState);
      setTechState(newTechState);
    }

    setGameState(newState);
    if (newEconomicState) {
      setEconomicState(newEconomicState);
    }

    getChiptuneEngine().playSfx('click');

    if (newState.gameOver) {
      setScreen('game_over');
    }
  }, [gameState, economicState, techState]);

  // Economic handlers
  const handleDealCreated = useCallback((deal: TradeDeal) => {
    if (!economicState || !gameState) return;

    const newEconomicState = JSON.parse(JSON.stringify(economicState)) as EconomicState;
    newEconomicState.tradeDeals.push(deal);

    // Deduct influence cost
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    newState.factions[newState.playerFaction].resources.influencePoints -= 25; // Base cost

    // Update reputation for economic cooperation
    if (newState.playerReputation) {
      newState.playerReputation.economicFairness = Math.min(100,
        newState.playerReputation.economicFairness + 5
      );
      newState.playerReputation.diplomacy = Math.min(100,
        newState.playerReputation.diplomacy + 3
      );
    }

    setEconomicState(newEconomicState);
    setGameState(newState);
    getChiptuneEngine().playSfx('success');
  }, [economicState, gameState]);

  const handleSanctionImposed = useCallback((sanction: Sanction) => {
    if (!economicState || !gameState) return;

    const newEconomicState = JSON.parse(JSON.stringify(economicState)) as EconomicState;
    newEconomicState.activeSanctions.push(sanction);

    // Deduct legitimacy cost
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    newState.factions[newState.playerFaction].resources.legitimacy -= 10;

    // Update reputation
    if (newState.playerReputation) {
      newState.playerReputation.economicFairness = Math.max(0,
        newState.playerReputation.economicFairness - 8
      );
      newState.playerReputation.diplomacy = Math.max(0,
        newState.playerReputation.diplomacy - 5
      );
      if (sanction.worldReaction === 'opposed') {
        newState.playerReputation.reliability = Math.max(0,
          newState.playerReputation.reliability - 5
        );
      }
    }

    // Increase tension with target
    updateTension(newState, newState.playerFaction, sanction.targetFaction, 25);

    setEconomicState(newEconomicState);
    setGameState(newState);
    getChiptuneEngine().playSfx('warning');
  }, [economicState, gameState]);

  const handleDealCanceled = useCallback((dealId: string) => {
    if (!economicState || !gameState) return;

    const newEconomicState = JSON.parse(JSON.stringify(economicState)) as EconomicState;
    const deal = newEconomicState.tradeDeals.find(d => d.id === dealId);
    if (deal) {
      deal.isActive = false;
    }

    // Update reputation for breaking deal
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    if (newState.playerReputation) {
      newState.playerReputation.reliability = Math.max(0,
        newState.playerReputation.reliability - 10
      );
      newState.playerReputation.treatiesBroken++;
    }

    setEconomicState(newEconomicState);
    setGameState(newState);
    getChiptuneEngine().playSfx('click');
  }, [economicState, gameState]);

  const handleSanctionLifted = useCallback((sanctionId: string) => {
    if (!economicState || !gameState) return;

    const newEconomicState = JSON.parse(JSON.stringify(economicState)) as EconomicState;
    newEconomicState.activeSanctions = newEconomicState.activeSanctions.filter(
      s => s.id !== sanctionId
    );

    // Improve reputation for lifting sanctions
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    if (newState.playerReputation) {
      newState.playerReputation.economicFairness = Math.min(100,
        newState.playerReputation.economicFairness + 3
      );
      newState.playerReputation.diplomacy = Math.min(100,
        newState.playerReputation.diplomacy + 5
      );
    }

    setEconomicState(newEconomicState);
    setGameState(newState);
    getChiptuneEngine().playSfx('success');
  }, [economicState, gameState]);

  // Tech handlers
  const handleStartResearch = useCallback((techId: string) => {
    if (!techState || !gameState) return;

    const newTechState = JSON.parse(JSON.stringify(techState)) as TechState;
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;

    const result = startResearch(newState, newTechState, techId);
    if (result.success) {
      setTechState(newTechState);
      setGameState(newState);
      getChiptuneEngine().playSfx('action');
    }
  }, [techState, gameState]);

  const handleCancelResearch = useCallback(() => {
    if (!techState || !gameState) return;

    const newTechState = JSON.parse(JSON.stringify(techState)) as TechState;
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;

    const result = cancelResearch(newState, newTechState);
    if (result.success) {
      setTechState(newTechState);
      setGameState(newState);
      getChiptuneEngine().playSfx('click');
    }
  }, [techState, gameState]);

  const handleRestart = useCallback(() => {
    setGameState(null);
    setEconomicState(null);
    setTechState(null);
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

  // Get player's leader
  const playerLeader = getLeaderForFaction(gameState.playerFaction) as LeaderId;
  const playerFactionData = FACTIONS[gameState.playerFaction];

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="header-player">
          <div className="player-portrait">
            <PixelPortrait leader={playerLeader} size={32} />
          </div>
          <div className="player-info">
            <span className="player-faction" style={{ color: playerFactionData.color }}>
              {playerFactionData.shortName}
            </span>
            <span className="player-leader">{LEADER_NAMES[playerLeader]}</span>
          </div>
        </div>
        <div className="header-title">
          <h1>ARCTIC DOMINION</h1>
          <div className="header-status">
            <span className="year">{gameState.year}</span>
            <span className="season">{gameState.season}</span>
            <span className="turn">Turn {gameState.turn}/20</span>
          </div>
        </div>
        <AudioControls maxTension={maxTension as any} />
      </header>

      <main className="game-main">
        <aside className="left-panel">
          <Dashboard gameState={gameState} />
          <ReputationMini
            gameState={gameState}
            onClick={() => setShowReputationPanel(true)}
          />
          <ObjectivesMini
            gameState={gameState}
            onClick={() => setShowObjectivesPanel(true)}
          />
          {economicState && (
            <EconomicsMini
              state={gameState}
              economicState={economicState}
              onClick={() => setShowEconomicsPanel(true)}
            />
          )}
          {techState && (
            <TechMini
              techState={techState}
              onClick={() => setShowTechPanel(true)}
            />
          )}
          <DiplomacyPanel
            gameState={gameState}
            onSelectLeader={(leaderId, _factionId) => {
              setShowLeaderDialog({ leaderId, context: 'diplomatic' });
            }}
          />
        </aside>

        <section className="center-panel">
          {/* Zone Info Bar - shows at top when zone is selected */}
          {selectedZoneData && (
            <div className="top-action-bar">
              <div className="action-bar-header">
                <div className="selected-zone-info">
                  <span className="zone-name">{selectedZoneData.name}</span>
                  <span className="zone-controller">
                    {selectedZoneData.controller?.toUpperCase() || 'UNCLAIMED'}
                  </span>
                </div>
                <button
                  className="close-action-bar"
                  onClick={() => setSelectedZone(null)}
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <div className="action-bar-content">
                <ZoneDetail zone={selectedZoneData} gameState={gameState} onAction={handleZoneAction} />
              </div>
            </div>
          )}

          <div className="map-mode-toggle" style={{ zIndex: 100 }}>
            <button
              className={`map-mode-btn ${mapMode === 'world' ? 'active' : ''}`}
              onClick={() => setMapMode('world')}
              title="World Map (OpenStreetMap)"
            >
              🌍
            </button>
            <button
              className={`map-mode-btn ${mapMode === '2d' ? 'active' : ''}`}
              onClick={() => setMapMode('2d')}
              title="2D Hex Map"
            >
              2D
            </button>
            <button
              className={`map-mode-btn ${mapMode === '3d' ? 'active' : ''}`}
              onClick={() => setMapMode('3d')}
              title="3D View"
            >
              3D
            </button>
          </div>
          <div className={`map-container ${selectedZone ? 'with-action-bar' : ''}`}>
            {mapMode === 'world' && (
              <MapErrorBoundary
                fallback={
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0a1628',
                    color: '#ff6b6b',
                    fontFamily: 'monospace',
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>World Map Failed to Load</div>
                    <button
                      onClick={() => setMapMode('2d')}
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                      }}
                    >
                      Switch to 2D Map
                    </button>
                  </div>
                }
                onError={() => console.error('Leaflet map crashed')}
              >
                <Suspense fallback={
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0a1628',
                    color: '#88ccff',
                    fontFamily: 'monospace',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #1a3a5c',
                      borderTop: '3px solid #88ccff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <div style={{ marginTop: '16px' }}>Loading World Map...</div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  </div>
                }>
                  <ArcticMapLeaflet
                    key="leaflet-map"
                    gameState={gameState}
                    selectedZone={selectedZone}
                    onZoneSelect={setSelectedZone}
                    width={mapSize.width}
                    height={mapSize.height}
                  />
                </Suspense>
              </MapErrorBoundary>
            )}
            {mapMode === '2d' && (
              <ArcticMap
                key="2d-map"
                gameState={gameState}
                selectedZone={selectedZone}
                onZoneSelect={setSelectedZone}
                width={mapSize.width}
                height={mapSize.height}
              />
            )}
            {mapMode === '3d' && (
              <ArcticMap3D
                key="3d-map"
                gameState={gameState}
                selectedZone={selectedZone}
                onZoneSelect={setSelectedZone}
                width={mapSize.width}
                height={mapSize.height}
              />
            )}
          </div>
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

      {/* AI Guide Button */}
      <button
        className="ai-guide-button"
        onClick={() => setShowAIGuide(true)}
        title="AI Player Guide"
      >
        🤖
      </button>

      {/* AI Guide Modal */}
      <AIGuide isOpen={showAIGuide} onClose={() => setShowAIGuide(false)} />

      {/* Strategic Advisor */}
      <Advisor
        gameState={gameState}
        selectedZone={selectedZone}
      />

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

      {/* Reputation Panel Modal */}
      {showReputationPanel && (
        <div className="modal-overlay" onClick={() => setShowReputationPanel(false)}>
          <div className="modal-content panel-modal" onClick={e => e.stopPropagation()}>
            <ReputationPanel
              gameState={gameState}
              onClose={() => setShowReputationPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Objectives Panel Modal */}
      {showObjectivesPanel && (
        <div className="modal-overlay" onClick={() => setShowObjectivesPanel(false)}>
          <div className="modal-content panel-modal" onClick={e => e.stopPropagation()}>
            <ObjectivesPanel
              gameState={gameState}
              onClose={() => setShowObjectivesPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Economics Panel Modal */}
      {showEconomicsPanel && economicState && (
        <div className="modal-overlay" onClick={() => setShowEconomicsPanel(false)}>
          <div className="modal-content panel-modal economics-modal" onClick={e => e.stopPropagation()}>
            <EconomicsPanel
              state={gameState}
              economicState={economicState}
              onDealCreated={handleDealCreated}
              onSanctionImposed={handleSanctionImposed}
              onDealCanceled={handleDealCanceled}
              onSanctionLifted={handleSanctionLifted}
              onClose={() => setShowEconomicsPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Tech Panel Modal */}
      {showTechPanel && techState && (
        <div className="modal-overlay" onClick={() => setShowTechPanel(false)}>
          <div className="modal-content panel-modal tech-modal" onClick={e => e.stopPropagation()}>
            <TechPanel
              state={gameState}
              techState={techState}
              onStartResearch={handleStartResearch}
              onCancelResearch={handleCancelResearch}
              onClose={() => setShowTechPanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
