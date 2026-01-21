// Economics System - Trade deals, sanctions, and supply chains
import { GameState, FactionId } from '../types/game';
import { getTensionBetween, updateTension } from './state';

// Trade deal types
export type TradeDealType =
  | 'resource_exchange'      // Exchange oil/gas for economic output
  | 'shipping_rights'        // Access to shipping lanes
  | 'technology_sharing'     // Icebreaker tech, military tech
  | 'joint_development'      // Shared zone resource extraction
  | 'military_access'        // Base access agreement
  | 'energy_contract';       // Long-term energy supply

// Sanction types
export type SanctionType =
  | 'trade_embargo'          // Block all trade
  | 'sector_sanctions'       // Target specific sectors
  | 'financial_sanctions'    // Block financial transactions
  | 'technology_ban'         // No tech exports
  | 'shipping_ban';          // Block from shipping lanes

// Supply chain vulnerability
export type SupplyChainType =
  | 'energy_import'          // Dependent on energy imports
  | 'rare_earth_minerals'    // Electronics/military components
  | 'food_supplies'          // Arctic fishing
  | 'shipping_services'      // Need icebreakers/ports
  | 'military_equipment';    // Foreign military hardware

// Trade deal structure
export interface TradeDeal {
  id: string;
  type: TradeDealType;
  factions: [FactionId, FactionId];
  name: string;
  description: string;
  turnsRemaining: number;        // -1 for permanent
  effects: {
    faction1Gains: TradeEffect;
    faction2Gains: TradeEffect;
  };
  isActive: boolean;
  signedOnTurn: number;
}

export interface TradeEffect {
  economicOutput?: number;       // Per turn
  influencePoints?: number;      // Per turn
  icebreakerAccess?: boolean;    // Can use other's icebreakers
  zoneAccess?: string[];         // Access to zones
  militarySupport?: number;      // +readiness from ally
  tensionReduction?: number;     // Auto tension decrease
}

// Sanction structure
export interface Sanction {
  id: string;
  type: SanctionType;
  imposedBy: FactionId[];
  targetFaction: FactionId;
  name: string;
  description: string;
  turnsActive: number;
  effects: {
    economicPenalty: number;     // % reduction
    influencePenalty: number;    // Per turn loss
    tradeBanned: FactionId[];    // Can't trade with these
    techAccess: boolean;         // Can receive tech?
    legitimacyEffect: number;    // Per turn change
  };
  worldReaction: 'supported' | 'controversial' | 'opposed';
}

// Supply chain dependency
export interface SupplyChainDependency {
  type: SupplyChainType;
  faction: FactionId;
  dependsOn: FactionId[];
  vulnerabilityLevel: number;    // 0-100
  disrupted: boolean;
  economicImpact: number;        // Penalty when disrupted
}

// Economic state extension for GameState
export interface EconomicState {
  tradeDeals: TradeDeal[];
  activeSanctions: Sanction[];
  supplyChains: SupplyChainDependency[];
  marketPrices: {
    oil: number;                 // Price multiplier (1.0 = normal)
    gas: number;
    minerals: number;
    shipping: number;
  };
  globalTradeIndex: number;      // 0-100, affects all economies
}

// Initialize economic state
export const createInitialEconomicState = (): EconomicState => ({
  tradeDeals: createStartingTradeDeals(),
  activeSanctions: [],
  supplyChains: createStartingSupplyChains(),
  marketPrices: {
    oil: 1.0,
    gas: 1.0,
    minerals: 1.0,
    shipping: 1.0,
  },
  globalTradeIndex: 75,
});

// Starting trade deals (2030 baseline)
const createStartingTradeDeals = (): TradeDeal[] => [
  {
    id: 'nato_defense_sharing',
    type: 'military_access',
    factions: ['usa', 'norway'],
    name: 'NATO Nordic Defense Agreement',
    description: 'US bases in Norway, joint Arctic exercises',
    turnsRemaining: -1,
    effects: {
      faction1Gains: { zoneAccess: ['barents_north', 'norwegian_sea'], militarySupport: 10 },
      faction2Gains: { militarySupport: 25, economicOutput: 5 },
    },
    isActive: true,
    signedOnTurn: 0,
  },
  {
    id: 'china_russia_energy',
    type: 'energy_contract',
    factions: ['russia', 'china'],
    name: 'Power of Siberia II',
    description: 'Russian gas to China, long-term contract',
    turnsRemaining: -1,
    effects: {
      faction1Gains: { economicOutput: 15, influencePoints: 5 },
      faction2Gains: { economicOutput: 5, tensionReduction: 5 },
    },
    isActive: true,
    signedOnTurn: 0,
  },
  {
    id: 'eu_norway_energy',
    type: 'energy_contract',
    factions: ['norway', 'eu'],
    name: 'North Sea Gas Supply',
    description: 'Norwegian energy exports to EU',
    turnsRemaining: -1,
    effects: {
      faction1Gains: { economicOutput: 20, influencePoints: 3 },
      faction2Gains: { economicOutput: 5, tensionReduction: 3 },
    },
    isActive: true,
    signedOnTurn: 0,
  },
  {
    id: 'us_canada_norad',
    type: 'military_access',
    factions: ['usa', 'canada'],
    name: 'NORAD Arctic Defense',
    description: 'Joint air defense and monitoring',
    turnsRemaining: -1,
    effects: {
      faction1Gains: { zoneAccess: ['beaufort_ca', 'northwest_passage'], militarySupport: 15 },
      faction2Gains: { militarySupport: 30, influencePoints: 5 },
    },
    isActive: true,
    signedOnTurn: 0,
  },
  {
    id: 'denmark_greenland_dev',
    type: 'joint_development',
    factions: ['denmark', 'eu'],
    name: 'Greenland Development Fund',
    description: 'EU investment in Greenland infrastructure',
    turnsRemaining: -1,
    effects: {
      faction1Gains: { economicOutput: 10, influencePoints: 5 },
      faction2Gains: { zoneAccess: ['greenland_east', 'greenland_north'], economicOutput: 3 },
    },
    isActive: true,
    signedOnTurn: 0,
  },
];

// Starting supply chain dependencies
const createStartingSupplyChains = (): SupplyChainDependency[] => [
  {
    type: 'energy_import',
    faction: 'eu',
    dependsOn: ['norway', 'russia'],
    vulnerabilityLevel: 65,
    disrupted: false,
    economicImpact: 25,
  },
  {
    type: 'energy_import',
    faction: 'china',
    dependsOn: ['russia'],
    vulnerabilityLevel: 40,
    disrupted: false,
    economicImpact: 15,
  },
  {
    type: 'rare_earth_minerals',
    faction: 'usa',
    dependsOn: ['china'],
    vulnerabilityLevel: 70,
    disrupted: false,
    economicImpact: 20,
  },
  {
    type: 'rare_earth_minerals',
    faction: 'eu',
    dependsOn: ['china'],
    vulnerabilityLevel: 75,
    disrupted: false,
    economicImpact: 25,
  },
  {
    type: 'shipping_services',
    faction: 'china',
    dependsOn: ['russia'],
    vulnerabilityLevel: 50,
    disrupted: false,
    economicImpact: 10,
  },
  {
    type: 'food_supplies',
    faction: 'russia',
    dependsOn: ['canada', 'usa'],
    vulnerabilityLevel: 30,
    disrupted: false,
    economicImpact: 10,
  },
  {
    type: 'military_equipment',
    faction: 'norway',
    dependsOn: ['usa', 'eu'],
    vulnerabilityLevel: 45,
    disrupted: false,
    economicImpact: 15,
  },
  {
    type: 'shipping_services',
    faction: 'eu',
    dependsOn: ['norway', 'denmark'],
    vulnerabilityLevel: 35,
    disrupted: false,
    economicImpact: 10,
  },
];

// Trade deal templates
export const TRADE_DEAL_TEMPLATES: Record<TradeDealType, {
  name: string;
  description: string;
  defaultDuration: number;
  baseCost: number;
  legitimacyRequired: number;
  tensionRequirement: 'cooperation' | 'competition' | 'any';
}> = {
  resource_exchange: {
    name: 'Resource Exchange Agreement',
    description: 'Mutual exchange of natural resources',
    defaultDuration: 8,
    baseCost: 25,
    legitimacyRequired: 40,
    tensionRequirement: 'competition',
  },
  shipping_rights: {
    name: 'Shipping Rights Agreement',
    description: 'Access to shipping lanes and ports',
    defaultDuration: 12,
    baseCost: 35,
    legitimacyRequired: 50,
    tensionRequirement: 'competition',
  },
  technology_sharing: {
    name: 'Technology Cooperation Pact',
    description: 'Sharing of Arctic technology and expertise',
    defaultDuration: 10,
    baseCost: 40,
    legitimacyRequired: 55,
    tensionRequirement: 'cooperation',
  },
  joint_development: {
    name: 'Joint Development Zone',
    description: 'Shared resource extraction in contested area',
    defaultDuration: -1,
    baseCost: 50,
    legitimacyRequired: 60,
    tensionRequirement: 'cooperation',
  },
  military_access: {
    name: 'Military Access Agreement',
    description: 'Base access and military cooperation',
    defaultDuration: -1,
    baseCost: 60,
    legitimacyRequired: 65,
    tensionRequirement: 'cooperation',
  },
  energy_contract: {
    name: 'Long-term Energy Contract',
    description: 'Guaranteed energy supply agreement',
    defaultDuration: 16,
    baseCost: 45,
    legitimacyRequired: 45,
    tensionRequirement: 'any',
  },
};

// Sanction templates
export const SANCTION_TEMPLATES: Record<SanctionType, {
  name: string;
  description: string;
  effects: Sanction['effects'];
  legitimacyCost: number;
  tensionIncrease: number;
}> = {
  trade_embargo: {
    name: 'Full Trade Embargo',
    description: 'Complete ban on trade with target',
    effects: {
      economicPenalty: 40,
      influencePenalty: 5,
      tradeBanned: [],
      techAccess: false,
      legitimacyEffect: -3,
    },
    legitimacyCost: 20,
    tensionIncrease: 35,
  },
  sector_sanctions: {
    name: 'Sector Sanctions',
    description: 'Targeted restrictions on key industries',
    effects: {
      economicPenalty: 20,
      influencePenalty: 3,
      tradeBanned: [],
      techAccess: true,
      legitimacyEffect: -1,
    },
    legitimacyCost: 10,
    tensionIncrease: 20,
  },
  financial_sanctions: {
    name: 'Financial Sanctions',
    description: 'Restrictions on banking and finance',
    effects: {
      economicPenalty: 30,
      influencePenalty: 4,
      tradeBanned: [],
      techAccess: true,
      legitimacyEffect: -2,
    },
    legitimacyCost: 15,
    tensionIncrease: 25,
  },
  technology_ban: {
    name: 'Technology Export Ban',
    description: 'Block high-tech and military exports',
    effects: {
      economicPenalty: 15,
      influencePenalty: 2,
      tradeBanned: [],
      techAccess: false,
      legitimacyEffect: 0,
    },
    legitimacyCost: 8,
    tensionIncrease: 15,
  },
  shipping_ban: {
    name: 'Shipping Lane Exclusion',
    description: 'Ban from international shipping routes',
    effects: {
      economicPenalty: 25,
      influencePenalty: 3,
      tradeBanned: [],
      techAccess: true,
      legitimacyEffect: -2,
    },
    legitimacyCost: 12,
    tensionIncrease: 30,
  },
};

// Create a new trade deal
export const createTradeDeal = (
  state: GameState,
  economics: EconomicState,
  type: TradeDealType,
  partner: FactionId
): { success: boolean; deal?: TradeDeal; reason?: string } => {
  const template = TRADE_DEAL_TEMPLATES[type];
  const playerFaction = state.playerFaction;
  const relation = getTensionBetween(state, playerFaction, partner);

  if (!relation) {
    return { success: false, reason: 'No diplomatic relations exist' };
  }

  // Check legitimacy
  if (state.factions[playerFaction].resources.legitimacy < template.legitimacyRequired) {
    return { success: false, reason: `Requires ${template.legitimacyRequired} legitimacy` };
  }

  // Check influence cost
  if (state.factions[playerFaction].resources.influencePoints < template.baseCost) {
    return { success: false, reason: `Requires ${template.baseCost} influence points` };
  }

  // Check tension requirements
  const tensionOk = template.tensionRequirement === 'any' ||
    (template.tensionRequirement === 'cooperation' && relation.tensionLevel === 'cooperation') ||
    (template.tensionRequirement === 'competition' &&
      (relation.tensionLevel === 'cooperation' || relation.tensionLevel === 'competition'));

  if (!tensionOk) {
    return { success: false, reason: `Relations too hostile for this deal type` };
  }

  // Check for sanctions blocking trade
  const sanctionBlock = economics.activeSanctions.find(
    s => (s.targetFaction === playerFaction || s.targetFaction === partner) &&
         s.effects.tradeBanned.includes(playerFaction === s.targetFaction ? partner : playerFaction)
  );

  if (sanctionBlock) {
    return { success: false, reason: `Sanctions prevent this trade` };
  }

  // Create the deal
  const deal: TradeDeal = {
    id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    factions: [playerFaction, partner],
    name: `${template.name} with ${state.factions[partner].shortName}`,
    description: template.description,
    turnsRemaining: template.defaultDuration,
    effects: calculateDealEffects(type, playerFaction, partner),
    isActive: true,
    signedOnTurn: state.turn,
  };

  return { success: true, deal };
};

// Calculate deal effects based on type and factions
const calculateDealEffects = (
  type: TradeDealType,
  faction1: FactionId,
  _faction2: FactionId
): TradeDeal['effects'] => {
  // Base effects vary by deal type
  switch (type) {
    case 'resource_exchange':
      return {
        faction1Gains: { economicOutput: 8, tensionReduction: 2 },
        faction2Gains: { economicOutput: 8, tensionReduction: 2 },
      };
    case 'shipping_rights':
      return {
        faction1Gains: { economicOutput: 5, zoneAccess: [] }, // Populated based on partner's zones
        faction2Gains: { economicOutput: 10, influencePoints: 2 },
      };
    case 'technology_sharing':
      return {
        faction1Gains: { icebreakerAccess: true, economicOutput: 3 },
        faction2Gains: { icebreakerAccess: true, economicOutput: 3 },
      };
    case 'joint_development':
      return {
        faction1Gains: { economicOutput: 12, tensionReduction: 5 },
        faction2Gains: { economicOutput: 12, tensionReduction: 5 },
      };
    case 'military_access':
      return {
        faction1Gains: { militarySupport: 15, zoneAccess: [] },
        faction2Gains: { militarySupport: 10, influencePoints: 5 },
      };
    case 'energy_contract':
      // Energy exporter vs importer
      const exporters: FactionId[] = ['russia', 'norway', 'canada', 'usa'];
      const isExporter = exporters.includes(faction1);
      return {
        faction1Gains: isExporter
          ? { economicOutput: 15, influencePoints: 3 }
          : { economicOutput: 5, tensionReduction: 3 },
        faction2Gains: isExporter
          ? { economicOutput: 5, tensionReduction: 3 }
          : { economicOutput: 15, influencePoints: 3 },
      };
    default:
      return {
        faction1Gains: { economicOutput: 5 },
        faction2Gains: { economicOutput: 5 },
      };
  }
};

// Impose sanctions
export const imposeSanction = (
  state: GameState,
  _economics: EconomicState,
  type: SanctionType,
  target: FactionId
): { success: boolean; sanction?: Sanction; reason?: string } => {
  const template = SANCTION_TEMPLATES[type];
  const playerFaction = state.playerFaction;

  // Can't sanction allies in cooperation
  const relation = getTensionBetween(state, playerFaction, target);
  if (relation?.tensionLevel === 'cooperation') {
    return { success: false, reason: 'Cannot sanction nations in cooperation' };
  }

  // Check legitimacy cost
  if (state.factions[playerFaction].resources.legitimacy < template.legitimacyCost) {
    return { success: false, reason: `Requires ${template.legitimacyCost} legitimacy` };
  }

  // Calculate world reaction based on target's standing
  const targetRep = state.factions[target].resources.legitimacy;
  let worldReaction: Sanction['worldReaction'];
  if (targetRep < 40) {
    worldReaction = 'supported';
  } else if (targetRep < 60) {
    worldReaction = 'controversial';
  } else {
    worldReaction = 'opposed';
  }

  // Create sanction
  const sanction: Sanction = {
    id: `sanction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    imposedBy: [playerFaction],
    targetFaction: target,
    name: `${template.name} against ${state.factions[target].shortName}`,
    description: template.description,
    turnsActive: 0,
    effects: {
      ...template.effects,
      tradeBanned: [playerFaction], // Target can't trade with imposer
    },
    worldReaction,
  };

  return { success: true, sanction };
};

// Apply economic effects each turn
export const applyEconomicEffects = (
  state: GameState,
  economics: EconomicState
): void => {
  const factionIds = Object.keys(state.factions) as FactionId[];

  // Apply trade deal benefits
  economics.tradeDeals.forEach(deal => {
    if (!deal.isActive) return;

    const [f1, f2] = deal.factions;

    // Apply gains to faction 1
    if (deal.effects.faction1Gains.economicOutput) {
      state.factions[f1].resources.economicOutput += deal.effects.faction1Gains.economicOutput;
    }
    if (deal.effects.faction1Gains.influencePoints) {
      state.factions[f1].resources.influencePoints += deal.effects.faction1Gains.influencePoints;
    }
    if (deal.effects.faction1Gains.militarySupport) {
      state.factions[f1].resources.militaryReadiness = Math.min(100,
        state.factions[f1].resources.militaryReadiness + deal.effects.faction1Gains.militarySupport * 0.1
      );
    }
    if (deal.effects.faction1Gains.tensionReduction) {
      updateTension(state, f1, f2, -deal.effects.faction1Gains.tensionReduction);
    }

    // Apply gains to faction 2
    if (deal.effects.faction2Gains.economicOutput) {
      state.factions[f2].resources.economicOutput += deal.effects.faction2Gains.economicOutput;
    }
    if (deal.effects.faction2Gains.influencePoints) {
      state.factions[f2].resources.influencePoints += deal.effects.faction2Gains.influencePoints;
    }
    if (deal.effects.faction2Gains.militarySupport) {
      state.factions[f2].resources.militaryReadiness = Math.min(100,
        state.factions[f2].resources.militaryReadiness + deal.effects.faction2Gains.militarySupport * 0.1
      );
    }

    // Decrement duration for temporary deals
    if (deal.turnsRemaining > 0) {
      deal.turnsRemaining--;
      if (deal.turnsRemaining === 0) {
        deal.isActive = false;
      }
    }
  });

  // Apply sanction penalties
  economics.activeSanctions.forEach(sanction => {
    const target = sanction.targetFaction;
    const targetFaction = state.factions[target];

    // Economic penalty (percentage of output)
    const economicLoss = Math.round(
      targetFaction.resources.economicOutput * (sanction.effects.economicPenalty / 100)
    );
    targetFaction.resources.economicOutput = Math.max(10,
      targetFaction.resources.economicOutput - economicLoss
    );

    // Influence penalty
    targetFaction.resources.influencePoints = Math.max(0,
      targetFaction.resources.influencePoints - sanction.effects.influencePenalty
    );

    // Legitimacy effect
    targetFaction.resources.legitimacy = Math.max(0, Math.min(100,
      targetFaction.resources.legitimacy + sanction.effects.legitimacyEffect
    ));

    // Counter-effect: Opposed sanctions hurt imposer's legitimacy
    if (sanction.worldReaction === 'opposed') {
      sanction.imposedBy.forEach(imposer => {
        state.factions[imposer].resources.legitimacy = Math.max(0,
          state.factions[imposer].resources.legitimacy - 2
        );
      });
    }

    sanction.turnsActive++;
  });

  // Check supply chain disruptions
  economics.supplyChains.forEach(chain => {
    // Check if any dependency is hostile or sanctioned
    const isDisrupted = chain.dependsOn.some(dep => {
      const relation = getTensionBetween(state, chain.faction, dep);
      if (relation?.tensionLevel === 'conflict' || relation?.tensionLevel === 'crisis') {
        return true;
      }
      // Check for sanctions blocking this supply chain
      return economics.activeSanctions.some(
        s => (s.targetFaction === chain.faction || s.targetFaction === dep) &&
             s.effects.tradeBanned.includes(chain.faction === s.targetFaction ? dep : chain.faction)
      );
    });

    chain.disrupted = isDisrupted;

    if (isDisrupted) {
      // Apply economic impact
      const penalty = Math.round(
        state.factions[chain.faction].resources.economicOutput *
        (chain.economicImpact / 100) *
        (chain.vulnerabilityLevel / 100)
      );
      state.factions[chain.faction].resources.economicOutput = Math.max(10,
        state.factions[chain.faction].resources.economicOutput - penalty
      );
    }
  });

  // Update market prices based on events and control
  updateMarketPrices(state, economics);

  // Apply market price effects to zone income
  factionIds.forEach(factionId => {
    const faction = state.factions[factionId];
    let resourceBonus = 0;

    Object.values(state.zones).forEach(zone => {
      if (zone.controller === factionId) {
        resourceBonus += zone.resources.oil * economics.marketPrices.oil * 0.5;
        resourceBonus += zone.resources.gas * economics.marketPrices.gas * 0.5;
        resourceBonus += zone.resources.minerals * economics.marketPrices.minerals * 0.3;
        resourceBonus += zone.resources.shipping * economics.marketPrices.shipping * 0.4;
      }
    });

    faction.resources.economicOutput += Math.round(resourceBonus);
  });
};

// Update market prices based on game state
const updateMarketPrices = (state: GameState, economics: EconomicState): void => {
  // Base price is 1.0, varies based on supply/demand

  // Oil price affected by conflict and sanctions
  let oilPriceChange = 0;
  state.relations.forEach(rel => {
    if (rel.tensionLevel === 'conflict') oilPriceChange += 0.1;
    if (rel.tensionLevel === 'crisis') oilPriceChange += 0.05;
  });
  economics.activeSanctions.forEach(s => {
    if (['russia', 'usa', 'norway'].includes(s.targetFaction)) {
      oilPriceChange += 0.15;
    }
  });
  economics.marketPrices.oil = Math.max(0.5, Math.min(2.0, 1.0 + oilPriceChange));

  // Gas price follows oil but more volatile
  economics.marketPrices.gas = Math.max(0.4, Math.min(2.5,
    economics.marketPrices.oil * (0.9 + Math.random() * 0.2)
  ));

  // Minerals price based on China's situation
  const chinaSanctioned = economics.activeSanctions.some(
    s => s.targetFaction === 'china'
  );
  economics.marketPrices.minerals = chinaSanctioned ? 1.5 : 1.0;

  // Shipping price based on ice extent and conflicts
  const iceModifier = (100 - state.globalIceExtent) / 100 * 0.3;
  const conflictModifier = state.relations.filter(
    r => r.tensionLevel === 'conflict' || r.tensionLevel === 'crisis'
  ).length * 0.1;
  economics.marketPrices.shipping = Math.max(0.5, Math.min(2.0,
    1.0 + iceModifier - conflictModifier
  ));
};

// Cancel a trade deal
export const cancelTradeDeal = (
  state: GameState,
  economics: EconomicState,
  dealId: string
): { success: boolean; reason?: string; tensionIncrease?: number } => {
  const deal = economics.tradeDeals.find(d => d.id === dealId);
  if (!deal) {
    return { success: false, reason: 'Deal not found' };
  }

  if (!deal.factions.includes(state.playerFaction)) {
    return { success: false, reason: 'Not party to this deal' };
  }

  deal.isActive = false;

  // Calculate tension increase
  const [f1, f2] = deal.factions;
  const otherFaction = f1 === state.playerFaction ? f2 : f1;
  const tensionIncrease = deal.type === 'military_access' ? 25 : 15;

  updateTension(state, state.playerFaction, otherFaction, tensionIncrease);

  return { success: true, tensionIncrease };
};

// Lift sanctions
export const liftSanction = (
  state: GameState,
  economics: EconomicState,
  sanctionId: string
): { success: boolean; reason?: string } => {
  const sanctionIndex = economics.activeSanctions.findIndex(s => s.id === sanctionId);
  if (sanctionIndex === -1) {
    return { success: false, reason: 'Sanction not found' };
  }

  const sanction = economics.activeSanctions[sanctionIndex];
  if (!sanction.imposedBy.includes(state.playerFaction)) {
    return { success: false, reason: 'You did not impose this sanction' };
  }

  // Remove player from imposers
  sanction.imposedBy = sanction.imposedBy.filter(f => f !== state.playerFaction);

  // If no imposers left, remove sanction entirely
  if (sanction.imposedBy.length === 0) {
    economics.activeSanctions.splice(sanctionIndex, 1);
  }

  // Improve relations with target
  updateTension(state, state.playerFaction, sanction.targetFaction, -15);

  return { success: true };
};

// Get economic summary for a faction
export const getEconomicSummary = (
  state: GameState,
  economics: EconomicState,
  faction: FactionId
): {
  activeDeals: TradeDeal[];
  affectingSanctions: Sanction[];
  supplyChainRisks: SupplyChainDependency[];
  tradePartners: FactionId[];
  economicPower: number;
  vulnerabilityScore: number;
} => {
  const activeDeals = economics.tradeDeals.filter(
    d => d.isActive && d.factions.includes(faction)
  );

  const affectingSanctions = economics.activeSanctions.filter(
    s => s.targetFaction === faction || s.imposedBy.includes(faction)
  );

  const supplyChainRisks = economics.supplyChains.filter(
    sc => sc.faction === faction && sc.vulnerabilityLevel > 50
  );

  const tradePartners = [...new Set(
    activeDeals.flatMap(d => d.factions).filter(f => f !== faction)
  )];

  // Calculate economic power (0-100)
  const baseEconomy = state.factions[faction].resources.economicOutput;
  const dealBonus = activeDeals.length * 5;
  const sanctionPenalty = affectingSanctions.filter(s => s.targetFaction === faction).length * 15;
  const economicPower = Math.max(0, Math.min(100,
    (baseEconomy / 150) * 100 + dealBonus - sanctionPenalty
  ));

  // Calculate vulnerability (0-100)
  const chainVulnerability = supplyChainRisks.reduce(
    (sum, sc) => sum + sc.vulnerabilityLevel, 0
  ) / Math.max(1, supplyChainRisks.length);
  const dealDependency = activeDeals.length > 5 ? 20 : 0;
  const vulnerabilityScore = Math.min(100, chainVulnerability + dealDependency);

  return {
    activeDeals,
    affectingSanctions,
    supplyChainRisks,
    tradePartners,
    economicPower,
    vulnerabilityScore,
  };
};

// AI decision helper: Should faction accept trade deal?
export const aiWouldAcceptDeal = (
  state: GameState,
  economics: EconomicState,
  proposer: FactionId,
  target: FactionId,
  dealType: TradeDealType
): { accept: boolean; reason: string } => {
  const relation = getTensionBetween(state, proposer, target);
  if (!relation) {
    return { accept: false, reason: 'No relations' };
  }

  // Base acceptance on relation level
  let baseChance = 0;
  switch (relation.tensionLevel) {
    case 'cooperation': baseChance = 80; break;
    case 'competition': baseChance = 50; break;
    case 'confrontation': baseChance = 20; break;
    case 'crisis': baseChance = 5; break;
    case 'conflict': baseChance = 0; break;
  }

  // Modify based on deal type
  if (dealType === 'military_access' && baseChance < 70) {
    baseChance -= 30; // Very sensitive
  }
  if (dealType === 'resource_exchange' || dealType === 'energy_contract') {
    baseChance += 15; // Economic deals are easier
  }

  // Check for existing sanctions
  const hasSanctions = economics.activeSanctions.some(
    s => s.targetFaction === target && s.imposedBy.includes(proposer)
  );
  if (hasSanctions) {
    return { accept: false, reason: 'Cannot negotiate while under sanctions' };
  }

  // Random factor
  const roll = Math.random() * 100;
  if (roll < baseChance) {
    return { accept: true, reason: 'Terms acceptable' };
  } else {
    if (relation.tensionLevel === 'confrontation' || relation.tensionLevel === 'crisis') {
      return { accept: false, reason: 'Relations too hostile' };
    }
    return { accept: false, reason: 'Not in our interests at this time' };
  }
};

// Get available economic actions for player
export const getAvailableEconomicActions = (
  state: GameState,
  economics: EconomicState
): {
  possibleDeals: { faction: FactionId; types: TradeDealType[] }[];
  possibleSanctions: { faction: FactionId; types: SanctionType[] }[];
  liftableSanctions: Sanction[];
  cancelableDeals: TradeDeal[];
} => {
  const playerFaction = state.playerFaction;
  const playerResources = state.factions[playerFaction].resources;

  const possibleDeals: { faction: FactionId; types: TradeDealType[] }[] = [];
  const possibleSanctions: { faction: FactionId; types: SanctionType[] }[] = [];

  const otherFactions = (Object.keys(state.factions) as FactionId[])
    .filter(f => f !== playerFaction && f !== 'indigenous');

  otherFactions.forEach(faction => {
    const relation = getTensionBetween(state, playerFaction, faction);
    if (!relation) return;

    // Check possible deals
    const availableDeals: TradeDealType[] = [];
    (Object.keys(TRADE_DEAL_TEMPLATES) as TradeDealType[]).forEach(dealType => {
      const template = TRADE_DEAL_TEMPLATES[dealType];
      if (playerResources.legitimacy >= template.legitimacyRequired &&
          playerResources.influencePoints >= template.baseCost) {
        const tensionOk = template.tensionRequirement === 'any' ||
          (template.tensionRequirement === 'cooperation' && relation.tensionLevel === 'cooperation') ||
          (template.tensionRequirement === 'competition' &&
            ['cooperation', 'competition'].includes(relation.tensionLevel));
        if (tensionOk) {
          availableDeals.push(dealType);
        }
      }
    });
    if (availableDeals.length > 0) {
      possibleDeals.push({ faction, types: availableDeals });
    }

    // Check possible sanctions
    if (relation.tensionLevel !== 'cooperation') {
      const availableSanctions: SanctionType[] = [];
      (Object.keys(SANCTION_TEMPLATES) as SanctionType[]).forEach(sanctionType => {
        const template = SANCTION_TEMPLATES[sanctionType];
        if (playerResources.legitimacy >= template.legitimacyCost) {
          // Check not already sanctioned with this type
          const alreadySanctioned = economics.activeSanctions.some(
            s => s.targetFaction === faction && s.type === sanctionType && s.imposedBy.includes(playerFaction)
          );
          if (!alreadySanctioned) {
            availableSanctions.push(sanctionType);
          }
        }
      });
      if (availableSanctions.length > 0) {
        possibleSanctions.push({ faction, types: availableSanctions });
      }
    }
  });

  // Get liftable sanctions (ones player imposed)
  const liftableSanctions = economics.activeSanctions.filter(
    s => s.imposedBy.includes(playerFaction)
  );

  // Get cancelable deals (ones player is party to)
  const cancelableDeals = economics.tradeDeals.filter(
    d => d.isActive && d.factions.includes(playerFaction)
  );

  return {
    possibleDeals,
    possibleSanctions,
    liftableSanctions,
    cancelableDeals,
  };
};
