// Drama & Excitement System
// Crises, surprises, achievements, and narrative moments

import { FactionId, GameState } from '../types/game';
import { LeaderId } from '../components/PixelArt';

// =====================
// CRISIS EVENTS
// =====================

export type CrisisType =
  | 'submarine_detected'      // Enemy sub near your waters
  | 'aircraft_intercept'      // Hostile aircraft approaching
  | 'diplomatic_incident'     // Embassy crisis, captured spy
  | 'resource_sabotage'       // Pipeline attack, mining incident
  | 'indigenous_blockade'     // Protesters blocking operations
  | 'allied_request'          // Ally needs urgent help
  | 'defector_intel'          // Enemy defector with secrets
  | 'nuclear_accident'        // Reactor leak, missile test
  | 'territorial_incursion'   // Enemy forces in your zone
  | 'cyber_attack'            // Infrastructure under attack
  | 'hostage_situation'       // Civilians detained
  | 'greenland_unrest';       // Independence movement erupts

export interface CrisisEvent {
  id: string;
  type: CrisisType;
  title: string;
  description: string;
  instigator?: FactionId;
  targetZone?: string;
  urgency: 'immediate' | 'urgent' | 'developing';
  choices: CrisisChoice[];
  turnsToRespond: number;
}

export interface CrisisChoice {
  id: string;
  label: string;
  description: string;
  consequences: {
    tensionChange?: { faction: FactionId; amount: number }[];
    legitimacyChange?: number;
    economicChange?: number;
    influenceChange?: number;
    militaryReadinessChange?: number;
    unitLoss?: string;       // Unit ID to lose
    zoneControlChange?: { zone: string; newController: FactionId };
    triggerCombat?: { zone: string; attacker: FactionId };
    achievementUnlock?: string;
    leaderReaction?: { leader: LeaderId; context: string };
  };
  successChance?: number;    // If < 100, can fail
  failureConsequences?: CrisisChoice['consequences'];
}

// Crisis generators
export const generateCrisis = (state: GameState): CrisisEvent | null => {
  const roll = Math.random();

  // 30% chance of crisis per turn after turn 3
  if (state.turn < 3 || roll > 0.30) return null;

  const crisisPool: (() => CrisisEvent)[] = [
    () => createSubmarineDetectedCrisis(state),
    () => createAircraftInterceptCrisis(state),
    () => createDiplomaticIncidentCrisis(state),
    () => createTerritorialIncursionCrisis(state),
    () => createDefectorIntelCrisis(state),
    () => createGreenlandUnrestCrisis(state),
    () => createIndigenousBlockadeCrisis(state),
    () => createCyberAttackCrisis(state),
  ];

  const crisis = crisisPool[Math.floor(Math.random() * crisisPool.length)]();
  return crisis;
};

const createSubmarineDetectedCrisis = (state: GameState): CrisisEvent => {
  const enemyFaction: FactionId = state.playerFaction === 'russia' ? 'usa' : 'russia';
  const playerZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction);
  const targetZone = playerZones[Math.floor(Math.random() * playerZones.length)]?.id || 'beaufort_us';

  return {
    id: `crisis_sub_${Date.now()}`,
    type: 'submarine_detected',
    title: '⚠️ SUBMARINE CONTACT',
    description: `Sonar arrays have detected an unidentified submarine in ${state.zones[targetZone]?.name || 'your waters'}. Signature analysis suggests it's ${enemyFaction.toUpperCase()}. The vessel is operating in stealth mode near sensitive installations.`,
    instigator: enemyFaction,
    targetZone,
    urgency: 'immediate',
    turnsToRespond: 1,
    choices: [
      {
        id: 'depth_charge',
        label: 'Depth Charge Warning',
        description: 'Drop warning depth charges to force it to surface or leave.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 25 }],
          legitimacyChange: -5,
          leaderReaction: { leader: enemyFaction === 'russia' ? 'putin' : 'trump', context: 'threat' },
        },
        successChance: 80,
        failureConsequences: {
          tensionChange: [{ faction: enemyFaction, amount: 40 }],
          legitimacyChange: -15,
        },
      },
      {
        id: 'track_silently',
        label: 'Track Silently',
        description: 'Shadow the submarine to gather intelligence on their patrol patterns.',
        consequences: {
          influenceChange: 15,
          achievementUnlock: 'shadow_hunter',
        },
        successChance: 60,
        failureConsequences: {
          tensionChange: [{ faction: enemyFaction, amount: 15 }],
        },
      },
      {
        id: 'diplomatic_protest',
        label: 'Lodge Protest',
        description: 'File formal diplomatic complaint through back channels.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 10 }],
          legitimacyChange: 5,
        },
      },
      {
        id: 'ignore',
        label: 'Do Nothing',
        description: 'Pretend you didn\'t detect it. Avoid escalation.',
        consequences: {
          legitimacyChange: -10,
          militaryReadinessChange: -5,
        },
      },
    ],
  };
};

const createAircraftInterceptCrisis = (state: GameState): CrisisEvent => {
  const enemyFaction: FactionId = state.playerFaction === 'russia' ? 'usa' : 'russia';

  return {
    id: `crisis_aircraft_${Date.now()}`,
    type: 'aircraft_intercept',
    title: '🛩️ AIRCRAFT APPROACHING',
    description: `Two ${enemyFaction.toUpperCase()} military aircraft are approaching your airspace at high speed. They have not responded to radio contact. You have minutes to decide.`,
    instigator: enemyFaction,
    urgency: 'immediate',
    turnsToRespond: 0,
    choices: [
      {
        id: 'scramble_intercept',
        label: 'Scramble Fighters',
        description: 'Launch interceptors to escort them out.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 20 }],
          economicChange: -10,
        },
      },
      {
        id: 'weapons_lock',
        label: 'Lock Weapons',
        description: 'Paint them with targeting radar. A serious warning.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 35 }],
          leaderReaction: { leader: enemyFaction === 'russia' ? 'putin' : 'trump', context: 'threat' },
        },
        successChance: 90,
        failureConsequences: {
          tensionChange: [{ faction: enemyFaction, amount: 60 }],
          triggerCombat: { zone: 'high_arctic_east', attacker: enemyFaction },
        },
      },
      {
        id: 'observe_only',
        label: 'Monitor Only',
        description: 'Track their flight path and report through channels.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 5 }],
        },
      },
    ],
  };
};

const createDiplomaticIncidentCrisis = (state: GameState): CrisisEvent => {
  const enemyFaction: FactionId = state.playerFaction === 'china' ? 'usa' : 'china';

  return {
    id: `crisis_diplo_${Date.now()}`,
    type: 'diplomatic_incident',
    title: '🕵️ SPY CAPTURED',
    description: `${enemyFaction.toUpperCase()} intelligence services have detained one of your operatives in their Arctic research station. They're threatening prosecution for espionage.`,
    instigator: enemyFaction,
    urgency: 'urgent',
    turnsToRespond: 2,
    choices: [
      {
        id: 'deny_everything',
        label: 'Deny All Knowledge',
        description: '"This person has no connection to our government."',
        consequences: {
          legitimacyChange: -15,
          tensionChange: [{ faction: enemyFaction, amount: 10 }],
        },
      },
      {
        id: 'negotiate_release',
        label: 'Negotiate Release',
        description: 'Offer a quiet exchange - we have some of theirs too.',
        consequences: {
          influenceChange: -20,
          achievementUnlock: 'cold_war_veteran',
        },
        successChance: 70,
        failureConsequences: {
          legitimacyChange: -20,
          influenceChange: -30,
        },
      },
      {
        id: 'public_demand',
        label: 'Public Demand',
        description: 'Publicly demand their release. Make it a human rights issue.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 20 }],
          legitimacyChange: 10,
          leaderReaction: { leader: enemyFaction === 'china' ? 'xi' : 'trump', context: 'threat' },
        },
      },
    ],
  };
};

const createTerritorialIncursionCrisis = (state: GameState): CrisisEvent => {
  const enemyFaction: FactionId = state.playerFaction === 'russia' ? 'usa' : 'russia';
  const playerZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction);
  const targetZone = playerZones[Math.floor(Math.random() * playerZones.length)]?.id || 'alaska';

  return {
    id: `crisis_incursion_${Date.now()}`,
    type: 'territorial_incursion',
    title: '⚔️ TERRITORIAL VIOLATION',
    description: `${enemyFaction.toUpperCase()} naval vessels have entered ${state.zones[targetZone]?.name || 'your territorial waters'} without permission. They claim "freedom of navigation" but this is a clear provocation.`,
    instigator: enemyFaction,
    targetZone,
    urgency: 'immediate',
    turnsToRespond: 1,
    choices: [
      {
        id: 'naval_intercept',
        label: 'Naval Intercept',
        description: 'Send warships to shadow and harass them.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 30 }],
          economicChange: -15,
        },
      },
      {
        id: 'warning_shots',
        label: 'Fire Warning Shots',
        description: 'A dangerous but clear message.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 50 }],
          legitimacyChange: -20,
          leaderReaction: { leader: enemyFaction === 'russia' ? 'putin' : 'trump', context: 'threat' },
        },
        successChance: 75,
        failureConsequences: {
          tensionChange: [{ faction: enemyFaction, amount: 80 }],
          triggerCombat: { zone: targetZone, attacker: enemyFaction },
        },
      },
      {
        id: 'diplomatic_channel',
        label: 'Hotline Call',
        description: 'Use the direct line to demand they leave.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 15 }],
          influenceChange: -10,
        },
      },
    ],
  };
};

const createDefectorIntelCrisis = (state: GameState): CrisisEvent => {
  const enemyFaction: FactionId = state.playerFaction === 'russia' ? 'china' : 'russia';

  return {
    id: `crisis_defector_${Date.now()}`,
    type: 'defector_intel',
    title: '📋 DEFECTOR OPPORTUNITY',
    description: `A high-ranking ${enemyFaction.toUpperCase()} Arctic military official wants to defect. They're offering detailed intelligence on enemy submarine patrol routes and missile positions. But it could be a trap.`,
    instigator: enemyFaction,
    urgency: 'urgent',
    turnsToRespond: 1,
    choices: [
      {
        id: 'accept_defector',
        label: 'Accept Defector',
        description: 'Extract them immediately. The intel could be game-changing.',
        consequences: {
          influenceChange: 30,
          achievementUnlock: 'intelligence_coup',
        },
        successChance: 50,
        failureConsequences: {
          tensionChange: [{ faction: enemyFaction, amount: 40 }],
          unitLoss: 'random_aircraft',
          legitimacyChange: -20,
        },
      },
      {
        id: 'demand_proof',
        label: 'Demand Proof First',
        description: 'Ask for sample intel before committing.',
        consequences: {
          influenceChange: 10,
        },
        successChance: 70,
      },
      {
        id: 'reject_trap',
        label: 'Assume It\'s a Trap',
        description: 'Too risky. Decline the offer.',
        consequences: {
          legitimacyChange: 5,
        },
      },
    ],
  };
};

const createGreenlandUnrestCrisis = (_state: GameState): CrisisEvent => {
  return {
    id: `crisis_greenland_${Date.now()}`,
    type: 'greenland_unrest',
    title: '🇬🇱 GREENLAND INDEPENDENCE SURGE',
    description: `Massive protests in Nuuk demanding independence referendum. Denmark is struggling to maintain control. Both USA and China are courting the independence movement with investment promises.`,
    urgency: 'developing',
    turnsToRespond: 2,
    choices: [
      {
        id: 'support_independence',
        label: 'Support Independence',
        description: 'Publicly back Greenlandic self-determination.',
        consequences: {
          tensionChange: [{ faction: 'denmark', amount: 30 }],
          influenceChange: 20,
          legitimacyChange: 10,
          leaderReaction: { leader: 'frederiksen', context: 'threat' },
        },
      },
      {
        id: 'offer_investment',
        label: 'Offer Investment',
        description: 'Promise massive infrastructure investment to Greenland.',
        consequences: {
          economicChange: -40,
          influenceChange: 25,
          achievementUnlock: 'arctic_investor',
        },
      },
      {
        id: 'support_denmark',
        label: 'Back Denmark',
        description: 'Support the status quo and Danish sovereignty.',
        consequences: {
          tensionChange: [{ faction: 'denmark', amount: -20 }],
          legitimacyChange: -5,
        },
      },
      {
        id: 'stay_neutral',
        label: 'Stay Neutral',
        description: 'This is an internal matter.',
        consequences: {},
      },
    ],
  };
};

const createIndigenousBlockadeCrisis = (state: GameState): CrisisEvent => {
  const playerZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction);
  const targetZone = playerZones[Math.floor(Math.random() * playerZones.length)]?.id || 'alaska';

  return {
    id: `crisis_indigenous_${Date.now()}`,
    type: 'indigenous_blockade',
    title: '✊ INDIGENOUS PROTEST',
    description: `Inuit communities are blockading your resource extraction operations in ${state.zones[targetZone]?.name}. International media is watching. They're demanding consultation rights and environmental protections.`,
    targetZone,
    urgency: 'urgent',
    turnsToRespond: 2,
    choices: [
      {
        id: 'negotiate_rights',
        label: 'Negotiate in Good Faith',
        description: 'Meet their leaders and offer genuine partnership.',
        consequences: {
          economicChange: -20,
          legitimacyChange: 20,
          achievementUnlock: 'indigenous_ally',
          leaderReaction: { leader: 'indigenous_elder', context: 'victory' },
        },
      },
      {
        id: 'token_concessions',
        label: 'Token Concessions',
        description: 'Offer minor adjustments to quiet them down.',
        consequences: {
          economicChange: -5,
          legitimacyChange: -5,
        },
        successChance: 60,
        failureConsequences: {
          legitimacyChange: -20,
          economicChange: -30,
        },
      },
      {
        id: 'forceful_removal',
        label: 'Clear the Blockade',
        description: 'Use security forces to remove protesters.',
        consequences: {
          legitimacyChange: -30,
          tensionChange: [{ faction: 'indigenous', amount: 50 }],
          leaderReaction: { leader: 'indigenous_elder', context: 'threat' },
        },
      },
    ],
  };
};

const createCyberAttackCrisis = (state: GameState): CrisisEvent => {
  const enemyFaction: FactionId = state.playerFaction === 'china' ? 'russia' : 'china';

  return {
    id: `crisis_cyber_${Date.now()}`,
    type: 'cyber_attack',
    title: '💻 CYBER ATTACK',
    description: `Your Arctic military command networks are under sophisticated cyber attack. Attribution points to ${enemyFaction.toUpperCase()} state actors. Communications are degraded and you're temporarily blind in some sectors.`,
    instigator: enemyFaction,
    urgency: 'immediate',
    turnsToRespond: 1,
    choices: [
      {
        id: 'counter_hack',
        label: 'Counter-Attack',
        description: 'Launch retaliatory cyber operations against their systems.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 25 }],
          economicChange: -15,
        },
        successChance: 60,
        failureConsequences: {
          militaryReadinessChange: -20,
          economicChange: -30,
        },
      },
      {
        id: 'isolate_systems',
        label: 'Defensive Lockdown',
        description: 'Isolate affected systems and restore from backups.',
        consequences: {
          militaryReadinessChange: -10,
          economicChange: -10,
        },
      },
      {
        id: 'public_attribution',
        label: 'Public Attribution',
        description: 'Publicly blame them with evidence. International pressure.',
        consequences: {
          tensionChange: [{ faction: enemyFaction, amount: 15 }],
          legitimacyChange: 10,
          leaderReaction: { leader: enemyFaction === 'china' ? 'xi' : 'putin', context: 'negotiation' },
        },
      },
    ],
  };
};

// =====================
// COMBAT SURPRISES
// =====================

export interface CombatSurprise {
  type: 'critical_hit' | 'critical_miss' | 'ambush' | 'reinforcements' | 'weather_chaos' | 'equipment_failure' | 'heroic_stand';
  title: string;
  description: string;
  damageMultiplier?: number;
  bonusEffect?: string;
}

export const rollCombatSurprise = (isAttacker: boolean): CombatSurprise | null => {
  const roll = Math.random();

  // 20% chance of something dramatic
  if (roll > 0.20) return null;

  const surprises: CombatSurprise[] = isAttacker ? [
    {
      type: 'critical_hit',
      title: '💥 CRITICAL HIT!',
      description: 'Your forces achieved tactical surprise! Enemy command structure disrupted.',
      damageMultiplier: 2.0,
    },
    {
      type: 'critical_miss',
      title: '😱 FRIENDLY FIRE!',
      description: 'Coordination failure led to friendly fire incident!',
      damageMultiplier: 0.5,
      bonusEffect: 'self_damage',
    },
    {
      type: 'ambush',
      title: '🎯 PERFECT AMBUSH!',
      description: 'Your forces caught the enemy completely off guard!',
      damageMultiplier: 1.8,
    },
    {
      type: 'weather_chaos',
      title: '🌨️ ARCTIC STORM!',
      description: 'Sudden blizzard obscures the battlefield! Both sides take losses.',
      damageMultiplier: 1.2,
      bonusEffect: 'mutual_damage',
    },
  ] : [
    {
      type: 'heroic_stand',
      title: '🛡️ HEROIC STAND!',
      description: 'Defenders held the line against overwhelming odds!',
      damageMultiplier: 0.5,
    },
    {
      type: 'reinforcements',
      title: '🚁 REINFORCEMENTS ARRIVE!',
      description: 'Allied forces arrived unexpectedly to bolster defense!',
      damageMultiplier: 0.6,
      bonusEffect: 'defender_boost',
    },
    {
      type: 'equipment_failure',
      title: '⚠️ EQUIPMENT MALFUNCTION!',
      description: 'Critical systems failed in the Arctic cold!',
      damageMultiplier: 1.5,
    },
  ];

  return surprises[Math.floor(Math.random() * surprises.length)];
};

// =====================
// ACHIEVEMENTS
// =====================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    influencePoints?: number;
    economicOutput?: number;
    legitimacy?: number;
    specialAbility?: string;
  };
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  shadow_hunter: {
    id: 'shadow_hunter',
    name: 'Shadow Hunter',
    description: 'Successfully tracked an enemy submarine without detection',
    icon: '🦈',
    rarity: 'rare',
    reward: { influencePoints: 25 },
  },
  cold_war_veteran: {
    id: 'cold_war_veteran',
    name: 'Cold War Veteran',
    description: 'Completed a successful spy exchange',
    icon: '🕵️',
    rarity: 'rare',
    reward: { influencePoints: 20, legitimacy: 5 },
  },
  intelligence_coup: {
    id: 'intelligence_coup',
    name: 'Intelligence Coup',
    description: 'Successfully extracted a high-value defector',
    icon: '📋',
    rarity: 'epic',
    reward: { influencePoints: 40 },
  },
  arctic_investor: {
    id: 'arctic_investor',
    name: 'Arctic Investor',
    description: 'Secured major investment deal in the Arctic',
    icon: '💰',
    rarity: 'common',
    reward: { economicOutput: 30 },
  },
  indigenous_ally: {
    id: 'indigenous_ally',
    name: 'Indigenous Ally',
    description: 'Built genuine partnership with Arctic indigenous peoples',
    icon: '🤝',
    rarity: 'rare',
    reward: { legitimacy: 15, influencePoints: 15 },
  },
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Won your first military engagement',
    icon: '⚔️',
    rarity: 'common',
    reward: { influencePoints: 10 },
  },
  zone_conqueror: {
    id: 'zone_conqueror',
    name: 'Zone Conqueror',
    description: 'Captured 3 zones from enemy factions',
    icon: '🏴',
    rarity: 'rare',
    reward: { influencePoints: 30, economicOutput: 20 },
  },
  nuclear_brinksman: {
    id: 'nuclear_brinksman',
    name: 'Nuclear Brinksman',
    description: 'Reached Crisis tension level and de-escalated',
    icon: '☢️',
    rarity: 'epic',
    reward: { legitimacy: 20, influencePoints: 25 },
  },
  arctic_hegemon: {
    id: 'arctic_hegemon',
    name: 'Arctic Hegemon',
    description: 'Control more than 50% of Arctic zones',
    icon: '👑',
    rarity: 'legendary',
    reward: { influencePoints: 50, economicOutput: 50, legitimacy: 20 },
  },
  peacemaker: {
    id: 'peacemaker',
    name: 'Peacemaker',
    description: 'Maintained Cooperation with all factions for 5 turns',
    icon: '🕊️',
    rarity: 'epic',
    reward: { legitimacy: 30 },
  },
};

// =====================
// RESOURCE DISCOVERIES
// =====================

export interface ResourceDiscovery {
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

export const generateResourceDiscovery = (state: GameState): ResourceDiscovery | null => {
  // 15% chance per turn
  if (Math.random() > 0.15) return null;

  const discoveries = [
    {
      name: 'Massive Oil Reserves',
      description: 'Geological survey reveals vast untapped oil reserves!',
      bonus: { oil: 4 },
      economicBonus: 25,
    },
    {
      name: 'Natural Gas Deposit',
      description: 'Major natural gas field discovered!',
      bonus: { gas: 5 },
      economicBonus: 20,
    },
    {
      name: 'Rare Earth Minerals',
      description: 'Significant rare earth mineral deposits found!',
      bonus: { minerals: 6 },
      economicBonus: 30,
    },
    {
      name: 'Ice-Free Passage',
      description: 'Climate shift has opened new shipping lanes!',
      bonus: { shipping: 3 },
      economicBonus: 15,
    },
  ];

  const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
  const playerZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction);

  if (playerZones.length === 0) return null;

  const zone = playerZones[Math.floor(Math.random() * playerZones.length)];

  return {
    id: `discovery_${Date.now()}`,
    ...discovery,
    zoneId: zone.id,
    description: `${discovery.description} Location: ${zone.name}`,
  };
};

// =====================
// ENVIRONMENTAL EVENTS
// =====================

export interface EnvironmentalEvent {
  id: string;
  name: string;
  description: string;
  effects: {
    globalIceMelt?: number;
    zoneEffects?: { zoneId: string; blocked: boolean; turns: number }[];
    unitEffects?: { factionId: FactionId; damagePercent: number }[];
  };
}

export const generateEnvironmentalEvent = (_state: GameState): EnvironmentalEvent | null => {
  // 20% chance
  if (Math.random() > 0.20) return null;

  const events: EnvironmentalEvent[] = [
    {
      id: `env_storm_${Date.now()}`,
      name: '🌪️ POLAR VORTEX',
      description: 'Extreme cold snap sweeps across the Arctic. All military operations hampered.',
      effects: {
        unitEffects: [
          { factionId: 'usa', damagePercent: 5 },
          { factionId: 'russia', damagePercent: 3 }, // Russia better equipped
          { factionId: 'china', damagePercent: 8 },  // China least prepared
        ],
      },
    },
    {
      id: `env_melt_${Date.now()}`,
      name: '🌡️ RECORD ICE MELT',
      description: 'Arctic ice hits record low extent. New areas becoming accessible.',
      effects: {
        globalIceMelt: 5,
      },
    },
    {
      id: `env_storm_${Date.now()}`,
      name: '⛈️ ARCTIC SUPERSTORM',
      description: 'Massive storm system blocks all operations in the High Arctic.',
      effects: {
        zoneEffects: [
          { zoneId: 'north_pole', blocked: true, turns: 2 },
          { zoneId: 'high_arctic_west', blocked: true, turns: 2 },
          { zoneId: 'high_arctic_east', blocked: true, turns: 2 },
        ],
      },
    },
    {
      id: `env_calving_${Date.now()}`,
      name: '🧊 MASSIVE ICEBERG CALVING',
      description: 'Giant icebergs break off Greenland. Shipping hazards increase.',
      effects: {
        zoneEffects: [
          { zoneId: 'greenland_east', blocked: true, turns: 1 },
        ],
      },
    },
  ];

  return events[Math.floor(Math.random() * events.length)];
};

// =====================
// NUCLEAR ESCALATION
// =====================

export type NuclearReadiness = 'peacetime' | 'elevated' | 'defcon3' | 'defcon2' | 'defcon1';

export const NUCLEAR_READINESS_THRESHOLDS: Record<NuclearReadiness, number> = {
  peacetime: 0,
  elevated: 50,
  defcon3: 100,
  defcon2: 150,
  defcon1: 200,
};

export interface NuclearEscalationEvent {
  id: string;
  title: string;
  description: string;
  newReadiness: NuclearReadiness;
  choices: {
    label: string;
    effect: 'escalate' | 'maintain' | 'deescalate';
    consequences: string;
  }[];
}

export const checkNuclearEscalation = (state: GameState): NuclearEscalationEvent | null => {
  // Calculate cumulative tension with nuclear powers
  let totalTension = 0;
  const nuclearPowers: FactionId[] = ['usa', 'russia', 'china'];

  state.relations.forEach(rel => {
    if (rel.factions.includes(state.playerFaction)) {
      const other = rel.factions.find(f => f !== state.playerFaction);
      if (other && nuclearPowers.includes(other)) {
        const tensionMultiplier =
          rel.tensionLevel === 'conflict' ? 3 :
          rel.tensionLevel === 'crisis' ? 2 :
          rel.tensionLevel === 'confrontation' ? 1.5 : 1;
        totalTension += rel.tensionValue * tensionMultiplier;
      }
    }
  });

  // Check if we've crossed a threshold
  for (const [level, threshold] of Object.entries(NUCLEAR_READINESS_THRESHOLDS)) {
    if (totalTension >= threshold && totalTension < threshold + 50) {
      if (level === 'defcon2' || level === 'defcon1') {
        return {
          id: `nuclear_${Date.now()}`,
          title: level === 'defcon1' ? '☢️ NUCLEAR WAR IMMINENT' : '⚠️ DEFCON 2',
          description: level === 'defcon1'
            ? 'Strategic nuclear forces are at maximum readiness. One mistake could trigger Armageddon. The world holds its breath.'
            : 'Nuclear tensions are dangerously high. Bombers are armed and ready. Submarine crews await orders.',
          newReadiness: level as NuclearReadiness,
          choices: [
            {
              label: 'First Strike Option',
              effect: 'escalate',
              consequences: 'GAME OVER - Mutual destruction. No winners.',
            },
            {
              label: 'Back Channel Diplomacy',
              effect: 'deescalate',
              consequences: 'Attempt to find off-ramp. -50 tension if successful.',
            },
            {
              label: 'Maintain Readiness',
              effect: 'maintain',
              consequences: 'Stand firm but don\'t escalate further.',
            },
          ],
        };
      }
    }
  }

  return null;
};
