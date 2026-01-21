// Reputation System - Track player decisions and their cascading effects
import { GameState, FactionId } from '../types/game';
import { getTensionBetween } from './state';

// Reputation categories - how the world perceives the player
export interface ReputationProfile {
  // Core reputation metrics (0-100)
  militarism: number;        // Are you aggressive or peaceful?
  reliability: number;       // Do you keep your word?
  diplomacy: number;         // Are you a good negotiator?
  environmentalism: number;  // Do you protect the Arctic?
  humanRights: number;       // Do you respect indigenous rights?
  economicFairness: number;  // Are your trade practices fair?

  // Derived reputation scores
  overallReputation: number; // Calculated from above

  // Historical records
  decisionsHistory: PlayerDecision[];
  treatiesBroken: number;
  treatiesHonored: number;
  warsDeclared: number;
  peaceTreatiesSigned: number;
  zonesConquered: number;
  zonesLiberated: number;
}

// Player decision record
export interface PlayerDecision {
  turn: number;
  type: DecisionType;
  description: string;
  affectedFactions: FactionId[];
  reputationEffects: Partial<Record<keyof Omit<ReputationProfile, 'decisionsHistory' | 'overallReputation'>, number>>;
  timestamp: number;
}

export type DecisionType =
  | 'military_aggression'
  | 'military_defense'
  | 'treaty_signed'
  | 'treaty_broken'
  | 'humanitarian_action'
  | 'economic_sanction'
  | 'economic_cooperation'
  | 'environmental_protection'
  | 'environmental_exploitation'
  | 'indigenous_support'
  | 'indigenous_ignored'
  | 'diplomatic_success'
  | 'diplomatic_failure'
  | 'territorial_claim'
  | 'territorial_liberation'
  | 'crisis_escalation'
  | 'crisis_deescalation'
  | 'nuclear_threat';

// Initialize reputation for a player
export const createInitialReputation = (): ReputationProfile => ({
  militarism: 50,
  reliability: 70,
  diplomacy: 60,
  environmentalism: 50,
  humanRights: 60,
  economicFairness: 60,
  overallReputation: 60,
  decisionsHistory: [],
  treatiesBroken: 0,
  treatiesHonored: 0,
  warsDeclared: 0,
  peaceTreatiesSigned: 0,
  zonesConquered: 0,
  zonesLiberated: 0,
});

// Record a player decision and update reputation
export const recordDecision = (
  reputation: ReputationProfile,
  decision: Omit<PlayerDecision, 'timestamp'>
): void => {
  // Add to history
  reputation.decisionsHistory.push({
    ...decision,
    timestamp: Date.now(),
  });

  // Apply reputation effects
  if (decision.reputationEffects) {
    Object.entries(decision.reputationEffects).forEach(([key, value]) => {
      if (key in reputation && typeof reputation[key as keyof ReputationProfile] === 'number') {
        const currentValue = reputation[key as keyof ReputationProfile] as number;
        (reputation[key as keyof ReputationProfile] as number) = Math.max(0, Math.min(100, currentValue + (value as number)));
      }
    });
  }

  // Update counters based on decision type
  switch (decision.type) {
    case 'treaty_broken':
      reputation.treatiesBroken++;
      break;
    case 'treaty_signed':
      reputation.treatiesHonored++;
      reputation.peaceTreatiesSigned++;
      break;
    case 'military_aggression':
      reputation.warsDeclared++;
      break;
    case 'territorial_claim':
      reputation.zonesConquered++;
      break;
    case 'territorial_liberation':
      reputation.zonesLiberated++;
      break;
  }

  // Recalculate overall reputation
  reputation.overallReputation = calculateOverallReputation(reputation);
};

// Calculate overall reputation from individual metrics
const calculateOverallReputation = (rep: ReputationProfile): number => {
  // Weighted average - reliability and diplomacy matter most
  const weights = {
    militarism: 0.1,  // Neutral - being military can be good or bad
    reliability: 0.25,
    diplomacy: 0.2,
    environmentalism: 0.15,
    humanRights: 0.15,
    economicFairness: 0.15,
  };

  // Militarism is inverted - lower militarism = better reputation (generally)
  const militarismScore = 100 - rep.militarism;

  const weighted =
    militarismScore * weights.militarism +
    rep.reliability * weights.reliability +
    rep.diplomacy * weights.diplomacy +
    rep.environmentalism * weights.environmentalism +
    rep.humanRights * weights.humanRights +
    rep.economicFairness * weights.economicFairness;

  return Math.round(weighted);
};

// Decision templates - standard reputation effects for common actions
export const DECISION_TEMPLATES: Record<DecisionType, {
  description: string;
  effects: Partial<Record<keyof Omit<ReputationProfile, 'decisionsHistory' | 'overallReputation'>, number>>;
}> = {
  military_aggression: {
    description: 'Initiated military action',
    effects: { militarism: 15, reliability: -5, diplomacy: -10 },
  },
  military_defense: {
    description: 'Defended territory',
    effects: { militarism: 5, reliability: 5 },
  },
  treaty_signed: {
    description: 'Signed a treaty',
    effects: { reliability: 10, diplomacy: 10 },
  },
  treaty_broken: {
    description: 'Broke a treaty agreement',
    effects: { reliability: -25, diplomacy: -15 },
  },
  humanitarian_action: {
    description: 'Took humanitarian action',
    effects: { humanRights: 15, diplomacy: 5 },
  },
  economic_sanction: {
    description: 'Imposed economic sanctions',
    effects: { economicFairness: -10, diplomacy: -5, militarism: 5 },
  },
  economic_cooperation: {
    description: 'Engaged in economic cooperation',
    effects: { economicFairness: 10, diplomacy: 5 },
  },
  environmental_protection: {
    description: 'Protected environmental resources',
    effects: { environmentalism: 15, humanRights: 5 },
  },
  environmental_exploitation: {
    description: 'Exploited natural resources aggressively',
    effects: { environmentalism: -15, economicFairness: -5 },
  },
  indigenous_support: {
    description: 'Supported indigenous rights',
    effects: { humanRights: 15, diplomacy: 5 },
  },
  indigenous_ignored: {
    description: 'Ignored indigenous concerns',
    effects: { humanRights: -10, diplomacy: -5 },
  },
  diplomatic_success: {
    description: 'Achieved diplomatic success',
    effects: { diplomacy: 15, reliability: 5 },
  },
  diplomatic_failure: {
    description: 'Diplomatic effort failed',
    effects: { diplomacy: -5 },
  },
  territorial_claim: {
    description: 'Made territorial claim',
    effects: { militarism: 10, diplomacy: -5 },
  },
  territorial_liberation: {
    description: 'Liberated territory',
    effects: { humanRights: 10, diplomacy: 5 },
  },
  crisis_escalation: {
    description: 'Escalated a crisis',
    effects: { militarism: 20, reliability: -10, diplomacy: -15 },
  },
  crisis_deescalation: {
    description: 'De-escalated a crisis',
    effects: { militarism: -10, reliability: 10, diplomacy: 15 },
  },
  nuclear_threat: {
    description: 'Made nuclear threat',
    effects: { militarism: 30, reliability: -20, diplomacy: -25, humanRights: -15 },
  },
};

// Get reputation-based modifiers for faction interactions
export const getReputationModifiers = (reputation: ReputationProfile): {
  treatyAcceptanceBonus: number;  // % bonus to treaty acceptance
  tensionReduction: number;        // Reduction to tension increases
  economicBonus: number;           // Bonus to economic deals
  allianceChance: number;          // Bonus to forming alliances
  aggressionPenalty: number;       // How much others react to aggression
} => {
  const overall = reputation.overallReputation;
  const reliability = reputation.reliability;
  const diplomacy = reputation.diplomacy;

  return {
    // Good reputation = easier treaties
    treatyAcceptanceBonus: Math.round((overall - 50) * 0.5 + (diplomacy - 50) * 0.3),

    // Good reliability = less tension buildup
    tensionReduction: Math.round((reliability - 50) * 0.2),

    // Fair economics = better deals
    economicBonus: Math.round((reputation.economicFairness - 50) * 0.3),

    // High diplomacy = easier alliances
    allianceChance: Math.round((diplomacy - 50) * 0.4 + (reliability - 50) * 0.3),

    // High militarism = stronger reactions to your aggression
    aggressionPenalty: Math.round(reputation.militarism * 0.3),
  };
};

// Apply reputation effects to game state (called each turn)
export const applyReputationEffects = (state: GameState, reputation: ReputationProfile): void => {
  // Modifiers are available for future use in tension calculations
  void getReputationModifiers(reputation);
  const playerFaction = state.playerFaction;

  // Adjust relations based on reputation
  state.relations.forEach(relation => {
    if (!relation.factions.includes(playerFaction)) return;

    const otherFaction = relation.factions[0] === playerFaction ? relation.factions[1] : relation.factions[0];

    // Very bad reputation = automatic tension increase
    if (reputation.overallReputation < 30) {
      relation.tensionValue += 2;
    }

    // Very good reputation = slight tension decrease
    if (reputation.overallReputation > 70) {
      relation.tensionValue -= 1;
    }

    // High militarism makes rivals more hostile
    if (reputation.militarism > 70) {
      const isRival = ['russia', 'china'].includes(otherFaction) ||
                      (otherFaction === 'usa' && playerFaction !== 'usa');
      if (isRival) {
        relation.tensionValue += 3;
      }
    }

    // Low reliability makes treaty-holders nervous
    if (reputation.reliability < 40 && relation.treaties.length > 0) {
      relation.tensionValue += 2;
    }

    // Cap tension
    relation.tensionValue = Math.max(0, Math.min(100, relation.tensionValue));
  });
};

// Get a reputation assessment as text
export const getReputationAssessment = (reputation: ReputationProfile): {
  title: string;
  description: string;
  warnings: string[];
  opportunities: string[];
} => {
  const overall = reputation.overallReputation;
  const warnings: string[] = [];
  const opportunities: string[] = [];

  // Title based on overall reputation
  let title: string;
  if (overall >= 80) {
    title = 'Global Paragon';
  } else if (overall >= 65) {
    title = 'Respected Power';
  } else if (overall >= 50) {
    title = 'Regional Player';
  } else if (overall >= 35) {
    title = 'Controversial Actor';
  } else if (overall >= 20) {
    title = 'International Pariah';
  } else {
    title = 'Rogue State';
  }

  // Description
  let description: string;
  if (overall >= 70) {
    description = 'Your nation is seen as a force for stability and cooperation. Other nations seek your partnership.';
  } else if (overall >= 50) {
    description = 'Your nation maintains a balanced reputation. Some see you as a partner, others with caution.';
  } else if (overall >= 30) {
    description = 'Your nation\'s actions have raised concerns internationally. Trust is limited.';
  } else {
    description = 'Your nation is viewed with deep suspicion. Most powers distrust your intentions.';
  }

  // Warnings
  if (reputation.militarism > 70) {
    warnings.push('High militarism is making other nations nervous');
  }
  if (reputation.reliability < 40) {
    warnings.push('Low reliability is undermining your diplomatic efforts');
  }
  if (reputation.humanRights < 40) {
    warnings.push('Human rights concerns are damaging your legitimacy');
  }
  if (reputation.environmentalism < 30) {
    warnings.push('Environmental record is attracting criticism');
  }
  if (reputation.treatiesBroken >= 2) {
    warnings.push('Your history of broken treaties makes new agreements difficult');
  }

  // Opportunities
  if (reputation.diplomacy > 70) {
    opportunities.push('High diplomatic reputation opens doors for new treaties');
  }
  if (reputation.reliability > 70) {
    opportunities.push('Your reliability makes you a sought-after alliance partner');
  }
  if (reputation.environmentalism > 70) {
    opportunities.push('Environmental leadership provides legitimacy boost');
  }
  if (reputation.humanRights > 70) {
    opportunities.push('Strong human rights record enhances global standing');
  }
  if (reputation.warsDeclared === 0 && reputation.peaceTreatiesSigned > 0) {
    opportunities.push('Your peaceful approach opens paths to Nobel Peace victory');
  }

  return { title, description, warnings, opportunities };
};

// Check if a faction would accept a treaty based on reputation
export const wouldAcceptTreaty = (
  state: GameState,
  reputation: ReputationProfile,
  targetFaction: FactionId
): { accepted: boolean; reason: string; chance: number } => {
  const modifiers = getReputationModifiers(reputation);
  const relation = getTensionBetween(state, state.playerFaction, targetFaction);

  if (!relation) {
    return { accepted: false, reason: 'No diplomatic relations', chance: 0 };
  }

  // Base acceptance chance based on tension level
  let baseChance = 0;
  switch (relation.tensionLevel) {
    case 'cooperation': baseChance = 80; break;
    case 'competition': baseChance = 50; break;
    case 'confrontation': baseChance = 25; break;
    case 'crisis': baseChance = 10; break;
    case 'conflict': baseChance = 5; break;
  }

  // Apply reputation modifiers
  let finalChance = baseChance + modifiers.treatyAcceptanceBonus;

  // Broken treaties severely hurt chances
  if (reputation.treatiesBroken > 0) {
    finalChance -= reputation.treatiesBroken * 15;
  }

  // Low reliability is devastating
  if (reputation.reliability < 30) {
    finalChance -= 30;
  }

  // Cap between 5 and 95
  finalChance = Math.max(5, Math.min(95, finalChance));

  // Roll the dice
  const roll = Math.random() * 100;
  const accepted = roll < finalChance;

  let reason: string;
  if (accepted) {
    if (reputation.reliability > 70) {
      reason = `${targetFaction} values your reliability and accepts.`;
    } else if (relation.tensionLevel === 'cooperation') {
      reason = `Good existing relations facilitate agreement.`;
    } else {
      reason = `${targetFaction} sees potential benefit in cooperation.`;
    }
  } else {
    if (reputation.treatiesBroken > 0) {
      reason = `${targetFaction} remembers your broken treaties.`;
    } else if (reputation.reliability < 40) {
      reason = `${targetFaction} doubts your reliability.`;
    } else if (relation.tensionLevel === 'crisis' || relation.tensionLevel === 'conflict') {
      reason = `Tensions are too high for diplomatic progress.`;
    } else {
      reason = `${targetFaction} declines at this time.`;
    }
  }

  return { accepted, reason, chance: finalChance };
};

// Get reputation-based event modifications
export const getReputationEventModifier = (
  reputation: ReputationProfile,
  eventType: 'crisis' | 'discovery' | 'alliance_offer' | 'sanction'
): number => {
  switch (eventType) {
    case 'crisis':
      // High militarism = more likely to face crises
      return Math.round((reputation.militarism - 50) * 0.2);

    case 'discovery':
      // Good environmental record = more discoveries
      return Math.round((reputation.environmentalism - 50) * 0.15);

    case 'alliance_offer':
      // Good reputation = more alliance offers
      return Math.round((reputation.overallReputation - 50) * 0.3);

    case 'sanction':
      // Bad reputation = more likely to face sanctions
      return Math.round((50 - reputation.overallReputation) * 0.25);

    default:
      return 0;
  }
};
