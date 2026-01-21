import { GameState, GameEvent, FactionId } from '../types/game';
import { calculateVictoryPoints, updateTension } from './state';
import { GAME_ACTIONS, executeAction } from './actions';
import {
  generateCrisis,
  generateResourceDiscovery,
  generateEnvironmentalEvent,
  checkNuclearEscalation,
  ACHIEVEMENTS,
} from './drama';
import { runAITurn, executeAIActions, AI_PROFILES } from './ai';

// Random events that can occur
const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'ice_melt_acceleration',
    name: 'Accelerated Ice Melt',
    description: 'Satellite data confirms Arctic ice is melting faster than projected. New shipping lanes opening.',
    turn: 'random',
    probability: 0.3,
    effects: {
      globalIceMelt: 3,
    },
  },
  {
    id: 'oil_discovery',
    name: 'Major Oil Discovery',
    description: 'Geological survey reveals significant new oil reserves in the High Arctic.',
    turn: 'random',
    probability: 0.15,
    effects: {
      zoneEffects: [{
        zoneId: 'lomonosov_ridge',
        changes: { resources: { oil: 10, gas: 8, minerals: 4, fish: 0, shipping: 2 } },
      }],
    },
  },
  {
    id: 'shipping_incident',
    name: 'Shipping Incident',
    description: 'Commercial vessel runs aground in contested waters. Search and rescue operation required.',
    turn: 'random',
    probability: 0.2,
    effects: {
      tensionEffects: [{ factions: ['usa', 'russia'], change: 10 }],
    },
  },
  {
    id: 'indigenous_protest',
    name: 'Indigenous Rights Protest',
    description: 'Indigenous groups protest resource extraction, gaining international attention.',
    turn: 'random',
    probability: 0.25,
    effects: {
      factionEffects: {
        usa: { legitimacy: -5 },
        russia: { legitimacy: -5 },
        indigenous: { influencePoints: 10 },
      },
    },
  },
  {
    id: 'rare_earth_demand',
    name: 'Rare Earth Demand Spike',
    description: 'Global tech boom drives unprecedented demand for rare earth minerals.',
    turn: 'random',
    probability: 0.2,
    effects: {
      factionEffects: {
        denmark: { economicOutput: 20 },
        china: { influencePoints: 15 },
      },
    },
  },
  {
    id: 'military_intercept',
    name: 'Military Aircraft Intercept',
    description: 'Fighter jets scrambled to intercept foreign military aircraft near airspace.',
    turn: 'random',
    probability: 0.25,
    effects: {
      tensionEffects: [
        { factions: ['usa', 'russia'], change: 15 },
        { factions: ['nato', 'russia'], change: 10 },
      ],
    },
  },
  {
    id: 'submarine_detection',
    name: 'Submarine Detection',
    description: 'Sonar arrays detect submarine activity in sensitive waters.',
    turn: 'random',
    probability: 0.15,
    effects: {
      tensionEffects: [{ factions: ['usa', 'russia'], change: 20 }],
    },
  },
];

export const generateTurnEvents = (state: GameState): GameEvent[] => {
  const events: GameEvent[] = [];

  // Always have ice melt in summer
  if (state.season === 'summer') {
    events.push({
      id: 'seasonal_melt',
      name: 'Summer Ice Retreat',
      description: 'Arctic ice retreats to seasonal minimum. Shipping routes more accessible.',
      turn: state.turn,
      effects: { globalIceMelt: 1 },
    });
  }

  // Check for random events
  RANDOM_EVENTS.forEach(event => {
    if (Math.random() < (event.probability || 0.1)) {
      events.push({ ...event, turn: state.turn });
    }
  });

  // Scripted events based on turn
  if (state.turn === 5) {
    events.push({
      id: 'china_investment',
      name: 'Chinese Investment Initiative',
      description: 'China announces major Arctic infrastructure investment fund.',
      turn: 5,
      effects: {
        factionEffects: {
          china: { influencePoints: 30, economicOutput: 20 },
        },
      },
    });
  }

  if (state.turn === 10) {
    events.push({
      id: 'greenland_referendum',
      name: 'Greenland Independence Discussion',
      description: 'Greenland parliament begins formal independence discussions.',
      turn: 10,
      effects: {
        factionEffects: {
          denmark: { influencePoints: -10, legitimacy: 5 },
        },
        tensionEffects: [
          { factions: ['usa', 'denmark'], change: 5 },
          { factions: ['china', 'denmark'], change: -5 },
        ],
      },
    });
  }

  return events;
};

export const applyEvent = (state: GameState, event: GameEvent): void => {
  const effects = event.effects;

  // Global ice melt
  if (effects.globalIceMelt) {
    state.globalIceExtent = Math.max(0, state.globalIceExtent - effects.globalIceMelt);
  }

  // Faction resource effects
  if (effects.factionEffects) {
    Object.entries(effects.factionEffects).forEach(([factionId, changes]) => {
      const faction = state.factions[factionId as FactionId];
      if (faction && changes) {
        if (changes.influencePoints) faction.resources.influencePoints += changes.influencePoints;
        if (changes.economicOutput) faction.resources.economicOutput += changes.economicOutput;
        if (changes.legitimacy) {
          faction.resources.legitimacy = Math.max(0, Math.min(100, faction.resources.legitimacy + changes.legitimacy));
        }
      }
    });
  }

  // Tension effects
  if (effects.tensionEffects) {
    effects.tensionEffects.forEach(({ factions, change }) => {
      const relation = state.relations.find(
        r => (r.factions[0] === factions[0] && r.factions[1] === factions[1]) ||
             (r.factions[0] === factions[1] && r.factions[1] === factions[0])
      );
      if (relation) {
        relation.tensionValue = Math.max(0, Math.min(100, relation.tensionValue + change));
      }
    });
  }

  // Zone effects
  if (effects.zoneEffects) {
    effects.zoneEffects.forEach(({ zoneId, changes }) => {
      const zone = state.zones[zoneId];
      if (zone) {
        Object.assign(zone, changes);
      }
    });
  }
};

export const advanceTurn = (state: GameState): void => {
  // Generate and apply events
  const events = generateTurnEvents(state);
  events.forEach(event => applyEvent(state, event));
  state.pendingEvents = events;

  // AI actions for non-player factions
  runAITurns(state);

  // === DRAMA SYSTEM ===

  // Generate crisis events (if none active)
  if (!state.activeCrisis) {
    const crisis = generateCrisis(state);
    if (crisis) {
      state.activeCrisis = {
        id: crisis.id,
        type: crisis.type,
        title: crisis.title,
        description: crisis.description,
        instigator: crisis.instigator,
        targetZone: crisis.targetZone,
        urgency: crisis.urgency,
        turnsToRespond: crisis.turnsToRespond,
        choices: crisis.choices.map(c => ({
          id: c.id,
          label: c.label,
          description: c.description,
          consequences: c.consequences as Record<string, unknown>,
          successChance: c.successChance,
          failureConsequences: c.failureConsequences as Record<string, unknown>,
        })),
      };
      state.notifications.push({
        id: `notif_crisis_${Date.now()}`,
        type: 'crisis',
        title: crisis.title,
        description: 'A crisis demands your attention!',
        timestamp: Date.now(),
      });
    }
  }

  // Generate resource discoveries
  const discovery = generateResourceDiscovery(state);
  if (discovery) {
    state.pendingDiscovery = {
      id: discovery.id,
      name: discovery.name,
      description: discovery.description,
      zoneId: discovery.zoneId,
      bonus: discovery.bonus,
      economicBonus: discovery.economicBonus,
    };

    // Apply discovery bonuses
    const zone = state.zones[discovery.zoneId];
    if (zone) {
      if (discovery.bonus.oil) zone.resources.oil += discovery.bonus.oil;
      if (discovery.bonus.gas) zone.resources.gas += discovery.bonus.gas;
      if (discovery.bonus.minerals) zone.resources.minerals += discovery.bonus.minerals;
      if (discovery.bonus.shipping) zone.resources.shipping += discovery.bonus.shipping;
    }
    if (discovery.economicBonus) {
      state.factions[state.playerFaction].resources.economicOutput += discovery.economicBonus;
    }
  }

  // Generate environmental events
  const envEvent = generateEnvironmentalEvent(state);
  if (envEvent) {
    state.pendingEnvironmentalEvent = {
      id: envEvent.id,
      name: envEvent.name,
      description: envEvent.description,
      effects: envEvent.effects,
    };

    // Apply environmental effects
    if (envEvent.effects.globalIceMelt) {
      state.globalIceExtent = Math.max(0, state.globalIceExtent - envEvent.effects.globalIceMelt);
    }
    if (envEvent.effects.unitEffects) {
      envEvent.effects.unitEffects.forEach(ue => {
        state.militaryUnits
          .filter(u => u.owner === ue.factionId && u.status !== 'destroyed')
          .forEach(u => {
            u.strength = Math.max(10, u.strength - (u.strength * ue.damagePercent / 100));
          });
      });
    }
  }

  // Check nuclear escalation
  const nuclearEvent = checkNuclearEscalation(state);
  if (nuclearEvent) {
    state.nuclearReadiness = nuclearEvent.newReadiness;
  }

  // Check for achievements
  checkAchievements(state);

  // Resource regeneration
  Object.values(state.factions).forEach(faction => {
    // Base income
    faction.resources.influencePoints += 15;
    faction.resources.economicOutput += 10;

    // Zone income
    Object.values(state.zones).forEach(zone => {
      if (zone.controller === faction.id) {
        faction.resources.economicOutput += (zone.resources.oil + zone.resources.gas) * 0.5;
        faction.resources.economicOutput += zone.resources.shipping * 0.3;
      }
    });

    // Cap resources
    faction.resources.influencePoints = Math.min(200, faction.resources.influencePoints);
    faction.resources.economicOutput = Math.min(300, faction.resources.economicOutput);
  });

  // Calculate victory points
  Object.keys(state.factions).forEach(factionId => {
    state.factions[factionId as FactionId].victoryPoints =
      calculateVictoryPoints(state, factionId as FactionId);
  });

  // Advance time
  state.turn++;
  state.season = state.season === 'summer' ? 'winter' : 'summer';
  if (state.season === 'summer') {
    state.year++;
  }

  // Check victory conditions
  checkVictoryConditions(state);
};

// Achievement checking
const checkAchievements = (state: GameState): void => {
  // First Blood - won first combat
  if (!state.unlockedAchievements.includes('first_blood')) {
    const wonCombat = state.history.some(h =>
      h.events.some(e => e.name.toLowerCase().includes('victory'))
    );
    if (wonCombat || state.combatResult?.success) {
      unlockAchievement(state, 'first_blood');
    }
  }

  // Zone Conqueror - captured 3 zones
  if (!state.unlockedAchievements.includes('zone_conqueror')) {
    const capturedZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction).length;
    const startingZones = state.playerFaction === 'russia' ? 8 :
                          state.playerFaction === 'usa' ? 3 : 2;
    if (capturedZones >= startingZones + 3) {
      unlockAchievement(state, 'zone_conqueror');
    }
  }

  // Arctic Hegemon - control 50% of zones
  if (!state.unlockedAchievements.includes('arctic_hegemon')) {
    const totalZones = Object.keys(state.zones).length;
    const controlledZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction).length;
    if (controlledZones / totalZones >= 0.5) {
      unlockAchievement(state, 'arctic_hegemon');
    }
  }

  // Nuclear Brinksman - reached crisis and de-escalated
  if (!state.unlockedAchievements.includes('nuclear_brinksman')) {
    const hadCrisis = state.relations.some(r =>
      r.factions.includes(state.playerFaction) &&
      (r.tensionLevel === 'crisis' || r.tensionLevel === 'conflict')
    );
    const nowCalm = state.relations.every(r =>
      !r.factions.includes(state.playerFaction) ||
      r.tensionLevel === 'cooperation' || r.tensionLevel === 'competition'
    );
    if (hadCrisis && nowCalm && state.turn > 5) {
      unlockAchievement(state, 'nuclear_brinksman');
    }
  }

  // Peacemaker - cooperation with all for 5 turns
  if (!state.unlockedAchievements.includes('peacemaker')) {
    const allCooperative = state.relations.every(r =>
      !r.factions.includes(state.playerFaction) || r.tensionLevel === 'cooperation'
    );
    if (allCooperative && state.turn >= 5) {
      unlockAchievement(state, 'peacemaker');
    }
  }
};

// Unlock an achievement and apply rewards
export const unlockAchievement = (state: GameState, achievementId: string): void => {
  if (state.unlockedAchievements.includes(achievementId)) return;

  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return;

  state.unlockedAchievements.push(achievementId);

  // Apply rewards
  const faction = state.factions[state.playerFaction];
  if (achievement.reward.influencePoints) {
    faction.resources.influencePoints += achievement.reward.influencePoints;
  }
  if (achievement.reward.economicOutput) {
    faction.resources.economicOutput += achievement.reward.economicOutput;
  }
  if (achievement.reward.legitimacy) {
    faction.resources.legitimacy = Math.min(100, faction.resources.legitimacy + achievement.reward.legitimacy);
  }

  // Add notification
  state.notifications.push({
    id: `notif_ach_${Date.now()}`,
    type: 'achievement',
    title: achievement.name,
    description: achievement.description,
    timestamp: Date.now(),
  });
};

// Apply crisis choice consequences
export const applyCrisisChoice = (
  state: GameState,
  choiceId: string,
  success: boolean
): void => {
  if (!state.activeCrisis) return;

  const choice = state.activeCrisis.choices.find(c => c.id === choiceId);
  if (!choice) return;

  const consequences = success ? choice.consequences : (choice.failureConsequences || choice.consequences);
  const playerFaction = state.factions[state.playerFaction];

  // Apply tension changes
  if (consequences.tensionChange && Array.isArray(consequences.tensionChange)) {
    (consequences.tensionChange as { faction: FactionId; amount: number }[]).forEach(tc => {
      updateTension(state, state.playerFaction, tc.faction, tc.amount);
    });
  }

  // Apply resource changes
  if (consequences.legitimacyChange) {
    playerFaction.resources.legitimacy = Math.max(0, Math.min(100,
      playerFaction.resources.legitimacy + (consequences.legitimacyChange as number)
    ));
  }
  if (consequences.economicChange) {
    playerFaction.resources.economicOutput = Math.max(0,
      playerFaction.resources.economicOutput + (consequences.economicChange as number)
    );
  }
  if (consequences.influenceChange) {
    playerFaction.resources.influencePoints = Math.max(0,
      playerFaction.resources.influencePoints + (consequences.influenceChange as number)
    );
  }
  if (consequences.militaryReadinessChange) {
    playerFaction.resources.militaryReadiness = Math.max(0, Math.min(100,
      playerFaction.resources.militaryReadiness + (consequences.militaryReadinessChange as number)
    ));
  }

  // Unlock achievement if applicable
  if (consequences.achievementUnlock && success) {
    unlockAchievement(state, consequences.achievementUnlock as string);
  }

  // Clear the crisis
  state.activeCrisis = null;
};

const runAITurns = (state: GameState): void => {
  // Get all AI factions (major powers that aren't the player)
  const aiFactions: FactionId[] = ['usa', 'russia', 'china', 'eu'].filter(
    f => f !== state.playerFaction
  ) as FactionId[];

  aiFactions.forEach(factionId => {
    // Use the new AI engine for decision making
    const aiActions = runAITurn(state, factionId);

    if (aiActions.length > 0) {
      // Execute AI decisions
      executeAIActions(state, factionId, aiActions);
    } else {
      // Fallback to simple action if AI engine returns nothing
      fallbackAIAction(state, factionId);
    }
  });

  // Minor factions (Canada, Norway, Denmark) - less aggressive AI
  const minorFactions: FactionId[] = ['canada', 'norway', 'denmark'].filter(
    f => f !== state.playerFaction
  ) as FactionId[];

  minorFactions.forEach(factionId => {
    // Minor factions only act every other turn
    if (state.turn % 2 === 0) {
      const aiActions = runAITurn(state, factionId);
      if (aiActions.length > 0) {
        // Minor factions only take 1 action per turn
        executeAIActions(state, factionId, aiActions.slice(0, 1));
      }
    }
  });
};

// Fallback simple AI for when the advanced AI returns no actions
const fallbackAIAction = (state: GameState, factionId: FactionId): void => {
  const faction = state.factions[factionId];
  const profile = AI_PROFILES[factionId];

  // Simple AI: take random affordable action based on personality
  const affordableActions = GAME_ACTIONS.filter(action => {
    if (action.cost.influencePoints && faction.resources.influencePoints < action.cost.influencePoints) {
      return false;
    }
    if (action.cost.economicOutput && faction.resources.economicOutput < action.cost.economicOutput) {
      return false;
    }
    return true;
  });

  if (affordableActions.length === 0) return;

  // Filter by personality preference
  let preferredActions = affordableActions;

  if (profile) {
    switch (profile.personality) {
      case 'aggressive':
        const militaryActions = affordableActions.filter(a => a.category === 'military');
        if (militaryActions.length > 0) preferredActions = militaryActions;
        break;
      case 'economic':
        const economicActions = affordableActions.filter(a => a.category === 'economic');
        if (economicActions.length > 0) preferredActions = economicActions;
        break;
      case 'diplomatic':
        const diplomaticActions = affordableActions.filter(a => a.category === 'diplomatic');
        if (diplomaticActions.length > 0) preferredActions = diplomaticActions;
        break;
      case 'defensive':
        const defensiveActions = affordableActions.filter(a =>
          a.category === 'military' && (a.id.includes('defense') || a.id.includes('base'))
        );
        if (defensiveActions.length > 0) preferredActions = defensiveActions;
        break;
    }
  }

  const selectedAction = preferredActions[Math.floor(Math.random() * preferredActions.length)];

  // Execute action
  const originalPlayer = state.playerFaction;
  state.playerFaction = factionId;

  if (selectedAction.effects.tensionChange && profile?.rivals.length > 0) {
    // Target a rival if this affects tension
    const targetRival = profile.rivals[Math.floor(Math.random() * profile.rivals.length)];
    executeAction(state, selectedAction, targetRival);
  } else {
    executeAction(state, selectedAction);
  }

  state.playerFaction = originalPlayer;
};

const checkVictoryConditions = (state: GameState): void => {
  // Hegemonic victory: control 60%+ of zones
  const totalZones = Object.keys(state.zones).length;
  Object.values(state.factions).forEach(faction => {
    const controlledCount = Object.values(state.zones).filter(
      z => z.controller === faction.id
    ).length;

    if (controlledCount / totalZones >= 0.6) {
      state.gameOver = true;
      state.winner = faction.id;
    }
  });

  // Turn limit (20 turns = 10 years)
  if (state.turn > 20 && !state.gameOver) {
    state.gameOver = true;
    // Winner is faction with most VP
    let maxVP = 0;
    let winner: FactionId | null = null;
    Object.values(state.factions).forEach(faction => {
      if (faction.victoryPoints > maxVP) {
        maxVP = faction.victoryPoints;
        winner = faction.id;
      }
    });
    state.winner = winner;
  }
};
