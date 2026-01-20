// Core game types for Arctic Dominion

export type FactionId = 'usa' | 'russia' | 'china' | 'canada' | 'denmark' | 'norway' | 'nato' | 'indigenous';

export type ZoneType = 'territorial' | 'eez' | 'continental_shelf' | 'international' | 'chokepoint';

export type TensionLevel = 'cooperation' | 'competition' | 'confrontation' | 'crisis' | 'conflict';

export type Season = 'winter' | 'summer';

export type ActionCategory = 'diplomatic' | 'economic' | 'military' | 'covert';

export type GamePhase = 'events' | 'planning' | 'action' | 'resolution' | 'assessment';

export interface Resources {
  influencePoints: number;      // Political capital
  economicOutput: number;       // GDP-derived funding
  icebreakerCapacity: number;   // Movement freedom in ice
  militaryReadiness: number;    // Force projection (0-100)
  legitimacy: number;           // International/domestic support (0-100)
}

export interface Faction {
  id: FactionId;
  name: string;
  shortName: string;
  color: string;
  resources: Resources;
  isPlayable: boolean;
  description: string;
  specialMechanic: string;
  controlledZones: string[];    // Zone IDs
  victoryPoints: number;
}

export interface HexCoord {
  q: number;  // Column
  r: number;  // Row
}

export interface MapZone {
  id: string;
  name: string;
  type: ZoneType;
  hex: HexCoord;
  controller: FactionId | null;
  contestedBy: FactionId[];
  resources: {
    oil: number;          // 0-10 richness
    gas: number;
    minerals: number;
    fish: number;
    shipping: number;     // Strategic shipping value
  };
  iceMonths: number;      // Months per year with ice cover (0-12)
  militaryPresence: Partial<Record<FactionId, number>>;
}

export interface BilateralRelation {
  factions: [FactionId, FactionId];
  tensionLevel: TensionLevel;
  tensionValue: number;   // 0-100 within current level
  treaties: string[];
  incidents: string[];
}

export interface GameAction {
  id: string;
  name: string;
  category: ActionCategory;
  cost: Partial<Resources>;
  requirements: {
    minLegitimacy?: number;
    controlsZone?: string;
    tensionMax?: TensionLevel;
  };
  effects: {
    targetZone?: string;
    targetFaction?: FactionId;
    resourceChanges?: Partial<Resources>;
    tensionChange?: number;
    zoneControl?: boolean;
  };
  description: string;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  turn: number | 'random';
  probability?: number;
  effects: {
    globalIceMelt?: number;
    factionEffects?: Partial<Record<FactionId, Partial<Resources>>>;
    zoneEffects?: { zoneId: string; changes: Partial<MapZone> }[];
    tensionEffects?: { factions: [FactionId, FactionId]; change: number }[];
  };
  choices?: {
    text: string;
    effects: GameEvent['effects'];
  }[];
}

export interface TurnRecord {
  turn: number;
  year: number;
  season: Season;
  events: GameEvent[];
  actions: { faction: FactionId; action: GameAction }[];
  stateSnapshot: {
    factions: Record<FactionId, Faction>;
    zones: Record<string, MapZone>;
    relations: BilateralRelation[];
  };
}

export interface GameState {
  turn: number;
  year: number;
  season: Season;
  phase: GamePhase;
  playerFaction: FactionId;
  factions: Record<FactionId, Faction>;
  zones: Record<string, MapZone>;
  relations: BilateralRelation[];
  globalIceExtent: number;      // 0-100, decreases over time
  history: TurnRecord[];
  pendingEvents: GameEvent[];
  availableActions: GameAction[];
  selectedAction: GameAction | null;
  gameOver: boolean;
  winner: FactionId | null;
  // Military additions
  militaryUnits: MilitaryUnitState[];
  activeOperation: ActiveOperation | null;
  combatResult: CombatResultState | null;
  leaderDialog: LeaderDialogState | null;
  // Drama system additions
  unlockedAchievements: string[];
  activeCrisis: CrisisEventState | null;
  pendingDiscovery: ResourceDiscoveryState | null;
  pendingEnvironmentalEvent: EnvironmentalEventState | null;
  nuclearReadiness: NuclearReadinessLevel;
  combatSurprise: CombatSurpriseState | null;
  notifications: GameNotification[];
}

// Drama state types
export type NuclearReadinessLevel = 'peacetime' | 'elevated' | 'defcon3' | 'defcon2' | 'defcon1';

export interface CrisisEventState {
  id: string;
  type: string;
  title: string;
  description: string;
  instigator?: FactionId;
  targetZone?: string;
  urgency: 'immediate' | 'urgent' | 'developing';
  choices: CrisisChoiceState[];
  turnsToRespond: number;
}

export interface CrisisChoiceState {
  id: string;
  label: string;
  description: string;
  consequences: Record<string, unknown>;
  successChance?: number;
  failureConsequences?: Record<string, unknown>;
}

export interface ResourceDiscoveryState {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  bonus: {
    oil?: number;
    gas?: number;
    minerals?: number;
    shipping?: number;
  };
  economicBonus?: number;
}

export interface EnvironmentalEventState {
  id: string;
  name: string;
  description: string;
  effects: {
    globalIceMelt?: number;
    zoneEffects?: { zoneId: string; blocked: boolean; turns: number }[];
    unitEffects?: { factionId: FactionId; damagePercent: number }[];
  };
}

export interface CombatSurpriseState {
  type: string;
  title: string;
  description: string;
  damageMultiplier?: number;
  bonusEffect?: string;
  isPositive: boolean;
}

export interface GameNotification {
  id: string;
  type: 'achievement' | 'discovery' | 'crisis' | 'combat' | 'environmental';
  title: string;
  description: string;
  timestamp: number;
}

// Military state types
export interface MilitaryUnitState {
  id: string;
  type: string;
  owner: FactionId;
  location: string;
  strength: number;
  experience: number;
  morale: number;
  status: 'ready' | 'deployed' | 'damaged' | 'destroyed';
  stealthed?: boolean;
}

export interface ActiveOperation {
  type: string;
  executor: FactionId;
  targetZone: string;
  targetFaction?: FactionId;
  selectedUnits: string[];
}

export interface CombatResultState {
  success: boolean;
  attackerFaction: FactionId;
  defenderFaction: FactionId;
  zoneName: string;
  casualties: { unitId: string; unitName: string; damage: number }[];
  description: string;
  worldReaction: string;
}

export interface LeaderDialogState {
  leaderId: string;
  context: string;
  onComplete?: () => void;
}

export interface VictoryCondition {
  type: 'hegemonic' | 'economic' | 'stability' | 'survival';
  faction: FactionId;
  description: string;
  checkCondition: (state: GameState) => boolean;
  progress: (state: GameState) => number;  // 0-100
}

// Polar projection utilities
export interface PolarCoord {
  latitude: number;   // 60-90 for Arctic
  longitude: number;  // -180 to 180
}

export interface ScreenCoord {
  x: number;
  y: number;
}
