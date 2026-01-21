import { GameState, FactionId, BilateralRelation, TensionLevel, MilitaryUnitState } from '../types/game';
import { FACTIONS } from '../data/factions';
import { ZONES } from '../data/zones';
import { generateStartingUnits } from './military';

const TENSION_LEVELS: TensionLevel[] = ['cooperation', 'competition', 'confrontation', 'crisis', 'conflict'];

// Initial bilateral relations (2030 starting conditions)
const createInitialRelations = (): BilateralRelation[] => {
  const relations: BilateralRelation[] = [];
  const factionIds = Object.keys(FACTIONS) as FactionId[];

  // Create all bilateral pairs with default competition
  for (let i = 0; i < factionIds.length; i++) {
    for (let j = i + 1; j < factionIds.length; j++) {
      const f1 = factionIds[i];
      const f2 = factionIds[j];

      let tensionLevel: TensionLevel = 'competition';
      let tensionValue = 50;
      const treaties: string[] = [];

      // Set specific starting relationships
      if ((f1 === 'usa' && f2 === 'russia') || (f1 === 'russia' && f2 === 'usa')) {
        tensionLevel = 'confrontation';
        tensionValue = 60;
      } else if ((f1 === 'usa' && f2 === 'china') || (f1 === 'china' && f2 === 'usa')) {
        tensionLevel = 'confrontation';
        tensionValue = 55;
      } else if ((f1 === 'russia' && f2 === 'china') || (f1 === 'china' && f2 === 'russia')) {
        tensionLevel = 'cooperation';
        tensionValue = 30;
        treaties.push('Strategic Partnership');
      } else if ((f1 === 'usa' && f2 === 'canada') || (f1 === 'canada' && f2 === 'usa')) {
        tensionLevel = 'cooperation';
        tensionValue = 20;
        treaties.push('NORAD', 'NATO Ally');
      } else if ((f1 === 'usa' && f2 === 'norway') || (f1 === 'norway' && f2 === 'usa')) {
        tensionLevel = 'cooperation';
        tensionValue = 15;
        treaties.push('NATO Ally');
      } else if ((f1 === 'usa' && f2 === 'denmark') || (f1 === 'denmark' && f2 === 'usa')) {
        tensionLevel = 'cooperation';
        tensionValue = 25;
        treaties.push('NATO Ally', 'Thule Agreement');
      } else if (f2 === 'indigenous' || f1 === 'indigenous') {
        tensionLevel = 'cooperation';
        tensionValue = 40;
      } else if ((f1 === 'eu' && f2 === 'usa') || (f1 === 'usa' && f2 === 'eu')) {
        tensionLevel = 'cooperation';
        tensionValue = 30;
        treaties.push('NATO Partner', 'Transatlantic Accord');
      } else if ((f1 === 'eu' && f2 === 'russia') || (f1 === 'russia' && f2 === 'eu')) {
        tensionLevel = 'confrontation';
        tensionValue = 65;
      } else if ((f1 === 'eu' && f2 === 'china') || (f1 === 'china' && f2 === 'eu')) {
        tensionLevel = 'competition';
        tensionValue = 45;
      } else if ((f1 === 'eu' && f2 === 'norway') || (f1 === 'norway' && f2 === 'eu')) {
        tensionLevel = 'cooperation';
        tensionValue = 20;
        treaties.push('EEA Agreement');
      } else if ((f1 === 'eu' && f2 === 'denmark') || (f1 === 'denmark' && f2 === 'eu')) {
        tensionLevel = 'cooperation';
        tensionValue = 15;
        treaties.push('EU Member');
      }

      relations.push({
        factions: [f1, f2],
        tensionLevel,
        tensionValue,
        treaties,
        incidents: [],
      });
    }
  }

  return relations;
};

// Convert military units to state format
const convertUnitsToState = (factionId: FactionId): MilitaryUnitState[] => {
  const units = generateStartingUnits(factionId);
  return units.map(u => ({
    id: u.id,
    type: u.type,
    owner: u.owner,
    location: u.location,
    strength: u.strength,
    experience: u.experience,
    morale: u.morale,
    status: u.status,
    stealthed: u.stealthed,
  }));
};

export const createInitialGameState = (playerFaction: FactionId): GameState => {
  // Generate military units for all major factions
  const allUnits: MilitaryUnitState[] = [
    ...convertUnitsToState('usa'),
    ...convertUnitsToState('russia'),
    ...convertUnitsToState('china'),
    ...convertUnitsToState('eu'),
    ...convertUnitsToState('canada'),
    ...convertUnitsToState('norway'),
    ...convertUnitsToState('denmark'),
  ];

  return {
    turn: 1,
    year: 2030,
    season: 'summer',
    phase: 'planning',
    playerFaction,
    factions: JSON.parse(JSON.stringify(FACTIONS)),
    zones: JSON.parse(JSON.stringify(ZONES)),
    relations: createInitialRelations(),
    globalIceExtent: 75,  // Starting ice extent (will decrease)
    history: [],
    pendingEvents: [],
    availableActions: [],
    selectedAction: null,
    gameOver: false,
    winner: null,
    // Military state
    militaryUnits: allUnits,
    activeOperation: null,
    combatResult: null,
    leaderDialog: null,
    // Drama system state
    unlockedAchievements: [],
    activeCrisis: null,
    pendingDiscovery: null,
    pendingEnvironmentalEvent: null,
    nuclearReadiness: 'peacetime',
    combatSurprise: null,
    notifications: [],
  };
};

export const getTensionBetween = (
  state: GameState,
  f1: FactionId,
  f2: FactionId
): BilateralRelation | undefined => {
  return state.relations.find(
    r => (r.factions[0] === f1 && r.factions[1] === f2) ||
         (r.factions[0] === f2 && r.factions[1] === f1)
  );
};

export const updateTension = (
  state: GameState,
  f1: FactionId,
  f2: FactionId,
  change: number
): void => {
  const relation = getTensionBetween(state, f1, f2);
  if (!relation) return;

  relation.tensionValue += change;

  // Handle level transitions
  if (relation.tensionValue >= 100) {
    const currentIndex = TENSION_LEVELS.indexOf(relation.tensionLevel);
    if (currentIndex < TENSION_LEVELS.length - 1) {
      relation.tensionLevel = TENSION_LEVELS[currentIndex + 1];
      relation.tensionValue = 50;
    } else {
      relation.tensionValue = 100;
    }
  } else if (relation.tensionValue <= 0) {
    const currentIndex = TENSION_LEVELS.indexOf(relation.tensionLevel);
    if (currentIndex > 0) {
      relation.tensionLevel = TENSION_LEVELS[currentIndex - 1];
      relation.tensionValue = 50;
    } else {
      relation.tensionValue = 0;
    }
  }
};

export const getZoneControl = (state: GameState): Record<FactionId, number> => {
  const control: Record<FactionId, number> = {} as Record<FactionId, number>;
  const factionIds = Object.keys(FACTIONS) as FactionId[];

  factionIds.forEach(f => { control[f] = 0; });

  Object.values(state.zones).forEach(zone => {
    if (zone.controller) {
      control[zone.controller]++;
    }
  });

  return control;
};

export const calculateVictoryPoints = (state: GameState, faction: FactionId): number => {
  let points = 0;
  const factionData = state.factions[faction];

  // Zone control points
  Object.values(state.zones).forEach(zone => {
    if (zone.controller === faction) {
      points += 10;
      points += zone.resources.shipping * 2;
      points += (zone.resources.oil + zone.resources.gas) * 1.5;
      if (zone.type === 'chokepoint') points += 20;
    }
  });

  // Resource bonuses
  points += factionData.resources.influencePoints * 0.5;
  points += factionData.resources.legitimacy * 0.3;

  return Math.round(points);
};
