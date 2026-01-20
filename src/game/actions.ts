import { GameAction, GameState, FactionId } from '../types/game';
import { updateTension } from './state';

// Available actions for the MVP
export const GAME_ACTIONS: GameAction[] = [
  // Diplomatic Actions
  {
    id: 'diplomatic_protest',
    name: 'Diplomatic Protest',
    category: 'diplomatic',
    cost: { influencePoints: 10 },
    requirements: {},
    effects: { tensionChange: 5 },
    description: 'Lodge formal protest against another faction\'s Arctic activities. Increases tension.',
  },
  {
    id: 'propose_treaty',
    name: 'Propose Treaty',
    category: 'diplomatic',
    cost: { influencePoints: 30 },
    requirements: { minLegitimacy: 50 },
    effects: { tensionChange: -15 },
    description: 'Propose bilateral cooperation agreement. Reduces tension if accepted.',
  },
  {
    id: 'arctic_council_motion',
    name: 'Arctic Council Motion',
    category: 'diplomatic',
    cost: { influencePoints: 25 },
    requirements: { minLegitimacy: 60 },
    effects: { tensionChange: -5 },
    description: 'Raise issue at Arctic Council. Multilateral legitimacy boost.',
  },

  // Economic Actions
  {
    id: 'resource_extraction',
    name: 'Begin Resource Extraction',
    category: 'economic',
    cost: { economicOutput: 40, influencePoints: 5 },
    requirements: { controlsZone: 'any' },
    effects: { resourceChanges: { economicOutput: 15 } },
    description: 'Start oil/gas extraction in controlled zone. Long-term economic gain.',
  },
  {
    id: 'shipping_investment',
    name: 'Shipping Infrastructure',
    category: 'economic',
    cost: { economicOutput: 30 },
    requirements: {},
    effects: { resourceChanges: { economicOutput: 10, icebreakerCapacity: 1 } },
    description: 'Invest in port facilities and shipping lanes.',
  },
  {
    id: 'icebreaker_construction',
    name: 'Build Icebreaker',
    category: 'economic',
    cost: { economicOutput: 50, influencePoints: 10 },
    requirements: {},
    effects: { resourceChanges: { icebreakerCapacity: 3 } },
    description: 'Commission new icebreaker vessel. Takes 2 turns to complete.',
  },

  // Military Actions
  {
    id: 'naval_patrol',
    name: 'Naval Patrol',
    category: 'military',
    cost: { economicOutput: 15, influencePoints: 5 },
    requirements: {},
    effects: { tensionChange: 10 },
    description: 'Conduct naval patrol in contested or adjacent zone. Shows presence, raises tension.',
  },
  {
    id: 'military_exercise',
    name: 'Military Exercise',
    category: 'military',
    cost: { economicOutput: 25, influencePoints: 15 },
    requirements: { minLegitimacy: 40 },
    effects: { tensionChange: 20, resourceChanges: { militaryReadiness: 10 } },
    description: 'Conduct military exercise. Demonstrates capability, increases readiness.',
  },
  {
    id: 'base_expansion',
    name: 'Expand Military Base',
    category: 'military',
    cost: { economicOutput: 60, influencePoints: 20 },
    requirements: { controlsZone: 'any' },
    effects: { resourceChanges: { militaryReadiness: 15 } },
    description: 'Expand military infrastructure in controlled zone.',
  },
  {
    id: 'show_of_force',
    name: 'Show of Force',
    category: 'military',
    cost: { economicOutput: 20, influencePoints: 25 },
    requirements: {},
    effects: { tensionChange: 30, resourceChanges: { legitimacy: -5 } },
    description: 'Aggressive military posturing. High tension increase, legitimacy cost.',
  },

  // Covert Actions
  {
    id: 'intelligence_gathering',
    name: 'Intelligence Operation',
    category: 'covert',
    cost: { influencePoints: 20 },
    requirements: {},
    effects: {},
    description: 'Gather intelligence on target faction. Reveals hidden information.',
  },
  {
    id: 'influence_campaign',
    name: 'Influence Campaign',
    category: 'covert',
    cost: { influencePoints: 30 },
    requirements: { minLegitimacy: 30 },
    effects: { tensionChange: 5, resourceChanges: { legitimacy: -10 } },
    description: 'Covert influence operation in target region. Risk of exposure.',
  },
];

export const getAvailableActions = (state: GameState): GameAction[] => {
  const faction = state.factions[state.playerFaction];

  return GAME_ACTIONS.filter(action => {
    // Check resource costs
    if (action.cost.influencePoints && faction.resources.influencePoints < action.cost.influencePoints) {
      return false;
    }
    if (action.cost.economicOutput && faction.resources.economicOutput < action.cost.economicOutput) {
      return false;
    }

    // Check requirements
    if (action.requirements.minLegitimacy && faction.resources.legitimacy < action.requirements.minLegitimacy) {
      return false;
    }
    if (action.requirements.controlsZone === 'any' && faction.controlledZones.length === 0) {
      return false;
    }

    return true;
  });
};

export const executeAction = (
  state: GameState,
  action: GameAction,
  targetFaction?: FactionId,
  targetZone?: string
): void => {
  const faction = state.factions[state.playerFaction];

  // Deduct costs
  if (action.cost.influencePoints) {
    faction.resources.influencePoints -= action.cost.influencePoints;
  }
  if (action.cost.economicOutput) {
    faction.resources.economicOutput -= action.cost.economicOutput;
  }

  // Apply resource changes
  if (action.effects.resourceChanges) {
    const changes = action.effects.resourceChanges;
    if (changes.economicOutput) faction.resources.economicOutput += changes.economicOutput;
    if (changes.influencePoints) faction.resources.influencePoints += changes.influencePoints;
    if (changes.icebreakerCapacity) faction.resources.icebreakerCapacity += changes.icebreakerCapacity;
    if (changes.militaryReadiness) {
      faction.resources.militaryReadiness = Math.min(100, faction.resources.militaryReadiness + changes.militaryReadiness);
    }
    if (changes.legitimacy) {
      faction.resources.legitimacy = Math.max(0, Math.min(100, faction.resources.legitimacy + changes.legitimacy));
    }
  }

  // Apply tension changes
  if (action.effects.tensionChange && targetFaction) {
    updateTension(state, state.playerFaction, targetFaction, action.effects.tensionChange);
  }

  // Handle zone-specific effects
  if (targetZone && state.zones[targetZone]) {
    const zone = state.zones[targetZone];

    // Military presence updates
    if (action.category === 'military') {
      zone.militaryPresence[state.playerFaction] =
        (zone.militaryPresence[state.playerFaction] || 0) + 5;
    }
  }
};

export const getActionsByCategory = (category: GameAction['category']): GameAction[] => {
  return GAME_ACTIONS.filter(a => a.category === category);
};
