import { GameState, GameEvent, FactionId } from '../types/game';
import { calculateVictoryPoints } from './state';
import { GAME_ACTIONS, executeAction } from './actions';

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

const runAITurns = (state: GameState): void => {
  const aiFactions: FactionId[] = ['usa', 'russia', 'china'].filter(
    f => f !== state.playerFaction
  ) as FactionId[];

  aiFactions.forEach(factionId => {
    const faction = state.factions[factionId];

    // Simple AI: take random affordable action
    const affordableActions = GAME_ACTIONS.filter(action => {
      if (action.cost.influencePoints && faction.resources.influencePoints < action.cost.influencePoints) {
        return false;
      }
      if (action.cost.economicOutput && faction.resources.economicOutput < action.cost.economicOutput) {
        return false;
      }
      return true;
    });

    if (affordableActions.length > 0) {
      // Weighted selection based on faction personality
      let selectedAction = affordableActions[Math.floor(Math.random() * affordableActions.length)];

      // Russia prefers military actions
      if (factionId === 'russia' && Math.random() > 0.5) {
        const militaryActions = affordableActions.filter(a => a.category === 'military');
        if (militaryActions.length > 0) {
          selectedAction = militaryActions[Math.floor(Math.random() * militaryActions.length)];
        }
      }

      // China prefers economic actions
      if (factionId === 'china' && Math.random() > 0.5) {
        const economicActions = affordableActions.filter(a => a.category === 'economic');
        if (economicActions.length > 0) {
          selectedAction = economicActions[Math.floor(Math.random() * economicActions.length)];
        }
      }

      // USA prefers diplomatic actions
      if (factionId === 'usa' && Math.random() > 0.5) {
        const diplomaticActions = affordableActions.filter(a => a.category === 'diplomatic');
        if (diplomaticActions.length > 0) {
          selectedAction = diplomaticActions[Math.floor(Math.random() * diplomaticActions.length)];
        }
      }

      // Execute AI action (simplified - target player if applicable)
      const originalPlayer = state.playerFaction;
      state.playerFaction = factionId;

      if (selectedAction.effects.tensionChange) {
        executeAction(state, selectedAction, originalPlayer);
      } else {
        executeAction(state, selectedAction);
      }

      state.playerFaction = originalPlayer;
    }
  });
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
