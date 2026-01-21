// Technology Tree System - Unlockable capabilities and progression
import { GameState } from '../types/game';

// Technology categories
export type TechCategory = 'military' | 'economic' | 'diplomatic' | 'infrastructure';

// Technology tiers
export type TechTier = 1 | 2 | 3;

// Individual technology definition
export interface Technology {
  id: string;
  name: string;
  description: string;
  category: TechCategory;
  tier: TechTier;
  cost: {
    influencePoints: number;
    economicOutput: number;
    turnsToResearch: number;
  };
  prerequisites: string[];  // Tech IDs that must be researched first
  effects: {
    // Direct stat bonuses
    militaryBonus?: number;         // +% military effectiveness
    economicBonus?: number;         // +% economic output
    influenceBonus?: number;        // +% influence gain
    legitimacyBonus?: number;       // + legitimacy per turn

    // Special unlocks
    unitUnlock?: string;            // New unit type available
    actionUnlock?: string;          // New action available
    buildingUnlock?: string;        // New building type

    // Modifier effects
    icebreakerBonus?: number;       // +icebreaker capacity
    resourceExtraction?: number;    // +% zone resource yield
    tensionReduction?: number;      // Reduces tension increase amounts
    combatBonus?: number;           // +% combat effectiveness
    supplyChainResilience?: number; // Reduce supply chain vulnerability
    treatyBonus?: number;           // +% treaty acceptance chance
    stealthBonus?: number;          // +% stealth detection/evasion
    defenseBonus?: number;          // +% defense effectiveness
  };
  flavor: string;  // Flavor text for immersion
}

// Player's technology state
export interface TechState {
  researched: string[];           // IDs of completed techs
  currentResearch: string | null; // Tech currently being researched
  researchProgress: number;       // Turns spent on current research
  techPoints: number;             // Accumulated research points
}

// Full technology tree
export const TECH_TREE: Record<string, Technology> = {
  // === TIER 1 - Foundational Technologies ===

  // Military Tier 1
  arctic_warfare_doctrine: {
    id: 'arctic_warfare_doctrine',
    name: 'Arctic Warfare Doctrine',
    description: 'Specialized military tactics for Arctic operations',
    category: 'military',
    tier: 1,
    cost: { influencePoints: 20, economicOutput: 30, turnsToResearch: 2 },
    prerequisites: [],
    effects: {
      militaryBonus: 10,
      combatBonus: 15,
    },
    flavor: 'Cold weather training and polar combat protocols for all branches.',
  },

  naval_modernization: {
    id: 'naval_modernization',
    name: 'Naval Modernization',
    description: 'Upgrade naval forces for Arctic operations',
    category: 'military',
    tier: 1,
    cost: { influencePoints: 25, economicOutput: 40, turnsToResearch: 2 },
    prerequisites: [],
    effects: {
      combatBonus: 10,
      icebreakerBonus: 1,
    },
    flavor: 'New hull designs and propulsion systems for ice-capable vessels.',
  },

  // Economic Tier 1
  offshore_drilling: {
    id: 'offshore_drilling',
    name: 'Offshore Drilling Tech',
    description: 'Improved oil and gas extraction in harsh conditions',
    category: 'economic',
    tier: 1,
    cost: { influencePoints: 15, economicOutput: 35, turnsToResearch: 2 },
    prerequisites: [],
    effects: {
      resourceExtraction: 20,
      economicBonus: 10,
    },
    flavor: 'Floating platforms and subsea systems designed for Arctic conditions.',
  },

  arctic_shipping_routes: {
    id: 'arctic_shipping_routes',
    name: 'Arctic Shipping Expertise',
    description: 'Efficient use of Northern Sea Route and Northwest Passage',
    category: 'economic',
    tier: 1,
    cost: { influencePoints: 20, economicOutput: 25, turnsToResearch: 2 },
    prerequisites: [],
    effects: {
      economicBonus: 15,
      icebreakerBonus: 1,
    },
    flavor: 'Navigation charts, ice forecasting, and convoy management systems.',
  },

  // Diplomatic Tier 1
  arctic_council_influence: {
    id: 'arctic_council_influence',
    name: 'Arctic Council Influence',
    description: 'Build institutional influence in Arctic governance',
    category: 'diplomatic',
    tier: 1,
    cost: { influencePoints: 30, economicOutput: 15, turnsToResearch: 2 },
    prerequisites: [],
    effects: {
      influenceBonus: 20,
      legitimacyBonus: 2,
      treatyBonus: 15,
    },
    flavor: 'Diplomatic corps specialized in Arctic multilateral institutions.',
  },

  indigenous_partnerships: {
    id: 'indigenous_partnerships',
    name: 'Indigenous Partnerships',
    description: 'Build relationships with Arctic indigenous peoples',
    category: 'diplomatic',
    tier: 1,
    cost: { influencePoints: 25, economicOutput: 20, turnsToResearch: 2 },
    prerequisites: [],
    effects: {
      legitimacyBonus: 5,
      tensionReduction: 10,
    },
    flavor: 'Respect traditional knowledge and land rights for mutual benefit.',
  },

  // Infrastructure Tier 1
  polar_research_stations: {
    id: 'polar_research_stations',
    name: 'Polar Research Stations',
    description: 'Establish scientific presence in the Arctic',
    category: 'infrastructure',
    tier: 1,
    cost: { influencePoints: 20, economicOutput: 30, turnsToResearch: 2 },
    prerequisites: [],
    effects: {
      legitimacyBonus: 3,
      influenceBonus: 10,
    },
    flavor: 'Multi-purpose facilities supporting science and sovereignty claims.',
  },

  arctic_ports: {
    id: 'arctic_ports',
    name: 'Arctic Port Development',
    description: 'Deep-water ports for Arctic shipping',
    category: 'infrastructure',
    tier: 1,
    cost: { influencePoints: 15, economicOutput: 45, turnsToResearch: 3 },
    prerequisites: [],
    effects: {
      economicBonus: 20,
      supplyChainResilience: 15,
    },
    flavor: 'Year-round operational ports with ice-resistant infrastructure.',
  },

  // === TIER 2 - Advanced Technologies ===

  // Military Tier 2
  submarine_fleet: {
    id: 'submarine_fleet',
    name: 'Advanced Submarine Fleet',
    description: 'Next-generation nuclear submarines for Arctic patrol',
    category: 'military',
    tier: 2,
    cost: { influencePoints: 40, economicOutput: 60, turnsToResearch: 3 },
    prerequisites: ['naval_modernization'],
    effects: {
      unitUnlock: 'advanced_submarine',
      combatBonus: 20,
      stealthBonus: 25,
    },
    flavor: 'Silent running under the ice cap with extended deployment capability.',
  },

  missile_defense: {
    id: 'missile_defense',
    name: 'Arctic Missile Defense',
    description: 'Integrated air and missile defense for Arctic airspace',
    category: 'military',
    tier: 2,
    cost: { influencePoints: 35, economicOutput: 55, turnsToResearch: 3 },
    prerequisites: ['arctic_warfare_doctrine'],
    effects: {
      defenseBonus: 30,
      militaryBonus: 15,
    },
    flavor: 'Early warning radars and interceptor systems guarding polar approaches.',
  },

  special_operations: {
    id: 'special_operations',
    name: 'Arctic Special Operations',
    description: 'Elite forces for Arctic covert missions',
    category: 'military',
    tier: 2,
    cost: { influencePoints: 30, economicOutput: 40, turnsToResearch: 2 },
    prerequisites: ['arctic_warfare_doctrine'],
    effects: {
      actionUnlock: 'covert_insertion',
      stealthBonus: 20,
      combatBonus: 15,
    },
    flavor: 'Ski troops, cold weather SEALS, and Arctic recon specialists.',
  },

  // Economic Tier 2
  deep_sea_mining: {
    id: 'deep_sea_mining',
    name: 'Deep Sea Mining',
    description: 'Extract minerals from the Arctic seabed',
    category: 'economic',
    tier: 2,
    cost: { influencePoints: 25, economicOutput: 50, turnsToResearch: 3 },
    prerequisites: ['offshore_drilling'],
    effects: {
      resourceExtraction: 30,
      economicBonus: 25,
    },
    flavor: 'Remotely operated vehicles harvesting nodules from the ocean floor.',
  },

  lng_infrastructure: {
    id: 'lng_infrastructure',
    name: 'LNG Export Terminals',
    description: 'Liquefied natural gas processing and export',
    category: 'economic',
    tier: 2,
    cost: { influencePoints: 20, economicOutput: 55, turnsToResearch: 3 },
    prerequisites: ['offshore_drilling', 'arctic_ports'],
    effects: {
      economicBonus: 35,
      supplyChainResilience: 20,
    },
    flavor: 'Turn Arctic gas reserves into exportable global commodity.',
  },

  nuclear_icebreakers: {
    id: 'nuclear_icebreakers',
    name: 'Nuclear Icebreaker Fleet',
    description: 'Powerful nuclear-powered icebreakers',
    category: 'economic',
    tier: 2,
    cost: { influencePoints: 35, economicOutput: 70, turnsToResearch: 4 },
    prerequisites: ['arctic_shipping_routes', 'naval_modernization'],
    effects: {
      icebreakerBonus: 5,
      economicBonus: 15,
      militaryBonus: 10,
    },
    flavor: 'Unsurpassed ice-breaking capability for year-round Arctic access.',
  },

  // Diplomatic Tier 2
  intelligence_network: {
    id: 'intelligence_network',
    name: 'Arctic Intelligence Network',
    description: 'Comprehensive surveillance and intelligence gathering',
    category: 'diplomatic',
    tier: 2,
    cost: { influencePoints: 45, economicOutput: 35, turnsToResearch: 3 },
    prerequisites: ['arctic_council_influence'],
    effects: {
      stealthBonus: 15,
      actionUnlock: 'deep_intelligence',
      influenceBonus: 15,
    },
    flavor: 'SIGINT, HUMINT, and OSINT networks tracking Arctic activities.',
  },

  diplomatic_corps: {
    id: 'diplomatic_corps',
    name: 'Elite Diplomatic Corps',
    description: 'Highly trained Arctic specialists for negotiations',
    category: 'diplomatic',
    tier: 2,
    cost: { influencePoints: 40, economicOutput: 25, turnsToResearch: 2 },
    prerequisites: ['arctic_council_influence', 'indigenous_partnerships'],
    effects: {
      treatyBonus: 30,
      tensionReduction: 20,
      legitimacyBonus: 3,
    },
    flavor: 'Expert negotiators who understand Arctic geopolitics.',
  },

  // Infrastructure Tier 2
  arctic_bases: {
    id: 'arctic_bases',
    name: 'Forward Operating Bases',
    description: 'Military bases in remote Arctic locations',
    category: 'infrastructure',
    tier: 2,
    cost: { influencePoints: 30, economicOutput: 60, turnsToResearch: 3 },
    prerequisites: ['polar_research_stations'],
    effects: {
      buildingUnlock: 'arctic_base',
      militaryBonus: 20,
      defenseBonus: 25,
    },
    flavor: 'Permanent military presence projecting power into the High Arctic.',
  },

  satellite_network: {
    id: 'satellite_network',
    name: 'Arctic Satellite Network',
    description: 'Dedicated polar orbit communications and surveillance',
    category: 'infrastructure',
    tier: 2,
    cost: { influencePoints: 35, economicOutput: 50, turnsToResearch: 3 },
    prerequisites: ['polar_research_stations'],
    effects: {
      stealthBonus: 10,
      influenceBonus: 10,
      combatBonus: 10,
    },
    flavor: 'Real-time coverage of the entire Arctic region.',
  },

  // === TIER 3 - Advanced Technologies ===

  // Military Tier 3
  hypersonic_missiles: {
    id: 'hypersonic_missiles',
    name: 'Hypersonic Weapons',
    description: 'Next-generation strike capability',
    category: 'military',
    tier: 3,
    cost: { influencePoints: 60, economicOutput: 80, turnsToResearch: 4 },
    prerequisites: ['missile_defense', 'submarine_fleet'],
    effects: {
      combatBonus: 40,
      militaryBonus: 25,
    },
    flavor: 'Unstoppable projectiles that change the Arctic strategic balance.',
  },

  autonomous_drones: {
    id: 'autonomous_drones',
    name: 'Autonomous Drone Swarms',
    description: 'AI-controlled unmanned systems for Arctic operations',
    category: 'military',
    tier: 3,
    cost: { influencePoints: 50, economicOutput: 70, turnsToResearch: 4 },
    prerequisites: ['special_operations', 'satellite_network'],
    effects: {
      unitUnlock: 'drone_swarm',
      combatBonus: 30,
      stealthBonus: 20,
    },
    flavor: 'Expendable, intelligent systems operating in hostile environments.',
  },

  // Economic Tier 3
  arctic_renewables: {
    id: 'arctic_renewables',
    name: 'Arctic Renewable Energy',
    description: 'Wind, tidal, and geothermal power in the Arctic',
    category: 'economic',
    tier: 3,
    cost: { influencePoints: 35, economicOutput: 65, turnsToResearch: 4 },
    prerequisites: ['deep_sea_mining', 'lng_infrastructure'],
    effects: {
      economicBonus: 30,
      legitimacyBonus: 5,
      supplyChainResilience: 25,
    },
    flavor: 'Clean energy independence in the world\'s harshest environment.',
  },

  rare_earth_processing: {
    id: 'rare_earth_processing',
    name: 'Rare Earth Processing',
    description: 'Refine Arctic rare earth minerals domestically',
    category: 'economic',
    tier: 3,
    cost: { influencePoints: 40, economicOutput: 75, turnsToResearch: 4 },
    prerequisites: ['deep_sea_mining'],
    effects: {
      economicBonus: 40,
      supplyChainResilience: 35,
      resourceExtraction: 25,
    },
    flavor: 'Break dependence on foreign rare earth supply chains.',
  },

  // Diplomatic Tier 3
  arctic_treaty_system: {
    id: 'arctic_treaty_system',
    name: 'Arctic Treaty Framework',
    description: 'Lead creation of binding Arctic governance',
    category: 'diplomatic',
    tier: 3,
    cost: { influencePoints: 70, economicOutput: 40, turnsToResearch: 4 },
    prerequisites: ['diplomatic_corps', 'intelligence_network'],
    effects: {
      treatyBonus: 50,
      legitimacyBonus: 10,
      tensionReduction: 30,
      influenceBonus: 25,
    },
    flavor: 'Shape the rules of the Arctic game itself.',
  },

  soft_power_projection: {
    id: 'soft_power_projection',
    name: 'Arctic Soft Power',
    description: 'Cultural and media influence in the Arctic',
    category: 'diplomatic',
    tier: 3,
    cost: { influencePoints: 55, economicOutput: 45, turnsToResearch: 3 },
    prerequisites: ['diplomatic_corps'],
    effects: {
      legitimacyBonus: 8,
      influenceBonus: 35,
      tensionReduction: 15,
    },
    flavor: 'Win hearts and minds in the contest for Arctic narrative.',
  },

  // Infrastructure Tier 3
  ice_resistant_megastructures: {
    id: 'ice_resistant_megastructures',
    name: 'Arctic Megastructures',
    description: 'Massive floating platforms and structures',
    category: 'infrastructure',
    tier: 3,
    cost: { influencePoints: 45, economicOutput: 90, turnsToResearch: 5 },
    prerequisites: ['arctic_bases', 'nuclear_icebreakers'],
    effects: {
      buildingUnlock: 'floating_platform',
      economicBonus: 30,
      militaryBonus: 20,
      defenseBonus: 20,
    },
    flavor: 'Mobile cities on ice - the ultimate Arctic sovereignty statement.',
  },

  quantum_communications: {
    id: 'quantum_communications',
    name: 'Quantum Secure Network',
    description: 'Unhackable communications across the Arctic',
    category: 'infrastructure',
    tier: 3,
    cost: { influencePoints: 50, economicOutput: 60, turnsToResearch: 4 },
    prerequisites: ['satellite_network', 'intelligence_network'],
    effects: {
      stealthBonus: 30,
      defenseBonus: 15,
      influenceBonus: 20,
    },
    flavor: 'Command and control that adversaries cannot intercept.',
  },
};

// Initialize tech state for a faction
export const createInitialTechState = (): TechState => ({
  researched: [],
  currentResearch: null,
  researchProgress: 0,
  techPoints: 0,
});

// Get available technologies (those with all prerequisites met)
export const getAvailableTechs = (techState: TechState): Technology[] => {
  return Object.values(TECH_TREE).filter(tech => {
    // Already researched?
    if (techState.researched.includes(tech.id)) return false;

    // Currently researching?
    if (techState.currentResearch === tech.id) return false;

    // All prerequisites met?
    return tech.prerequisites.every(prereq => techState.researched.includes(prereq));
  });
};

// Get technologies by category
export const getTechsByCategory = (category: TechCategory): Technology[] => {
  return Object.values(TECH_TREE).filter(tech => tech.category === category);
};

// Get technologies by tier
export const getTechsByTier = (tier: TechTier): Technology[] => {
  return Object.values(TECH_TREE).filter(tech => tech.tier === tier);
};

// Start researching a technology
export const startResearch = (
  state: GameState,
  techState: TechState,
  techId: string
): { success: boolean; reason?: string } => {
  const tech = TECH_TREE[techId];
  if (!tech) {
    return { success: false, reason: 'Technology not found' };
  }

  // Check if already researched
  if (techState.researched.includes(techId)) {
    return { success: false, reason: 'Already researched' };
  }

  // Check prerequisites
  const prereqsMet = tech.prerequisites.every(p => techState.researched.includes(p));
  if (!prereqsMet) {
    return { success: false, reason: 'Prerequisites not met' };
  }

  // Check costs
  const faction = state.factions[state.playerFaction];
  if (faction.resources.influencePoints < tech.cost.influencePoints) {
    return { success: false, reason: 'Insufficient influence points' };
  }
  if (faction.resources.economicOutput < tech.cost.economicOutput) {
    return { success: false, reason: 'Insufficient economic output' };
  }

  // Deduct costs
  faction.resources.influencePoints -= tech.cost.influencePoints;
  faction.resources.economicOutput -= tech.cost.economicOutput;

  // Start research
  techState.currentResearch = techId;
  techState.researchProgress = 0;

  return { success: true };
};

// Process research progress each turn
export const processResearch = (
  _state: GameState,
  techState: TechState
): { completed: boolean; tech?: Technology } => {
  if (!techState.currentResearch) {
    return { completed: false };
  }

  const tech = TECH_TREE[techState.currentResearch];
  if (!tech) {
    techState.currentResearch = null;
    return { completed: false };
  }

  // Advance progress
  techState.researchProgress++;

  // Check if complete
  if (techState.researchProgress >= tech.cost.turnsToResearch) {
    techState.researched.push(tech.id);
    techState.currentResearch = null;
    techState.researchProgress = 0;
    return { completed: true, tech };
  }

  return { completed: false };
};

// Apply technology effects to game state
export const applyTechEffects = (
  state: GameState,
  techState: TechState
): void => {
  const playerFaction = state.factions[state.playerFaction];

  // Calculate cumulative bonuses
  let militaryBonus = 0;
  let economicBonus = 0;
  let influenceBonus = 0;
  let legitimacyBonus = 0;

  techState.researched.forEach(techId => {
    const tech = TECH_TREE[techId];
    if (!tech) return;

    if (tech.effects.militaryBonus) militaryBonus += tech.effects.militaryBonus;
    if (tech.effects.economicBonus) economicBonus += tech.effects.economicBonus;
    if (tech.effects.influenceBonus) influenceBonus += tech.effects.influenceBonus;
    if (tech.effects.legitimacyBonus) legitimacyBonus += tech.effects.legitimacyBonus;
  });

  // Apply periodic bonuses
  const ecoGain = Math.round(10 * (1 + economicBonus / 100));
  const infGain = Math.round(15 * (1 + influenceBonus / 100));

  playerFaction.resources.economicOutput += ecoGain - 10; // Net bonus
  playerFaction.resources.influencePoints += infGain - 15; // Net bonus
  playerFaction.resources.legitimacy = Math.min(100,
    playerFaction.resources.legitimacy + legitimacyBonus
  );
  playerFaction.resources.militaryReadiness = Math.min(100,
    playerFaction.resources.militaryReadiness + Math.round(militaryBonus * 0.1)
  );
};

// Get total bonuses from researched technologies
export const getTechBonuses = (techState: TechState): {
  militaryBonus: number;
  economicBonus: number;
  influenceBonus: number;
  legitimacyBonus: number;
  combatBonus: number;
  defenseBonus: number;
  stealthBonus: number;
  treatyBonus: number;
  tensionReduction: number;
  resourceExtraction: number;
  icebreakerBonus: number;
  supplyChainResilience: number;
} => {
  const bonuses = {
    militaryBonus: 0,
    economicBonus: 0,
    influenceBonus: 0,
    legitimacyBonus: 0,
    combatBonus: 0,
    defenseBonus: 0,
    stealthBonus: 0,
    treatyBonus: 0,
    tensionReduction: 0,
    resourceExtraction: 0,
    icebreakerBonus: 0,
    supplyChainResilience: 0,
  };

  techState.researched.forEach(techId => {
    const tech = TECH_TREE[techId];
    if (!tech) return;

    if (tech.effects.militaryBonus) bonuses.militaryBonus += tech.effects.militaryBonus;
    if (tech.effects.economicBonus) bonuses.economicBonus += tech.effects.economicBonus;
    if (tech.effects.influenceBonus) bonuses.influenceBonus += tech.effects.influenceBonus;
    if (tech.effects.legitimacyBonus) bonuses.legitimacyBonus += tech.effects.legitimacyBonus;
    if (tech.effects.combatBonus) bonuses.combatBonus += tech.effects.combatBonus;
    if (tech.effects.defenseBonus) bonuses.defenseBonus += tech.effects.defenseBonus;
    if (tech.effects.stealthBonus) bonuses.stealthBonus += tech.effects.stealthBonus;
    if (tech.effects.treatyBonus) bonuses.treatyBonus += tech.effects.treatyBonus;
    if (tech.effects.tensionReduction) bonuses.tensionReduction += tech.effects.tensionReduction;
    if (tech.effects.resourceExtraction) bonuses.resourceExtraction += tech.effects.resourceExtraction;
    if (tech.effects.icebreakerBonus) bonuses.icebreakerBonus += tech.effects.icebreakerBonus;
    if (tech.effects.supplyChainResilience) bonuses.supplyChainResilience += tech.effects.supplyChainResilience;
  });

  return bonuses;
};

// Get research status summary
export const getResearchSummary = (techState: TechState): {
  totalResearched: number;
  totalTechs: number;
  percentComplete: number;
  currentTech: Technology | null;
  turnsRemaining: number;
  availableCount: number;
} => {
  const totalTechs = Object.keys(TECH_TREE).length;
  const totalResearched = techState.researched.length;
  const currentTech = techState.currentResearch ? TECH_TREE[techState.currentResearch] : null;
  const turnsRemaining = currentTech
    ? currentTech.cost.turnsToResearch - techState.researchProgress
    : 0;
  const availableCount = getAvailableTechs(techState).length;

  return {
    totalResearched,
    totalTechs,
    percentComplete: Math.round((totalResearched / totalTechs) * 100),
    currentTech,
    turnsRemaining,
    availableCount,
  };
};

// Check if a technology has been researched
export const hasTech = (techState: TechState, techId: string): boolean => {
  return techState.researched.includes(techId);
};

// Cancel current research (refunds partial cost)
export const cancelResearch = (
  state: GameState,
  techState: TechState
): { success: boolean; refund?: { ip: number; eo: number } } => {
  if (!techState.currentResearch) {
    return { success: false };
  }

  const tech = TECH_TREE[techState.currentResearch];
  if (!tech) {
    techState.currentResearch = null;
    return { success: false };
  }

  // Calculate refund (50% of remaining turns proportion)
  const remainingProportion = 1 - (techState.researchProgress / tech.cost.turnsToResearch);
  const ipRefund = Math.round(tech.cost.influencePoints * remainingProportion * 0.5);
  const eoRefund = Math.round(tech.cost.economicOutput * remainingProportion * 0.5);

  // Apply refund
  const faction = state.factions[state.playerFaction];
  faction.resources.influencePoints += ipRefund;
  faction.resources.economicOutput += eoRefund;

  // Clear research
  techState.currentResearch = null;
  techState.researchProgress = 0;

  return { success: true, refund: { ip: ipRefund, eo: eoRefund } };
};
