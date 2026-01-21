// Victory Conditions & End Game System
// Multiple paths to victory (and defeat)

import { GameState, FactionId } from '../types/game';

export type VictoryType =
  | 'hegemonic'      // Control 60%+ of Arctic
  | 'economic'       // Economic domination
  | 'nobel_peace'    // Achieve lasting peace
  | 'scientific'     // Climate/research victory
  | 'diplomatic'     // Grand alliance
  | 'military'       // Total military supremacy
  | 'survival';      // Survive with dignity

export type DefeatType =
  | 'nuclear_apocalypse'  // Nuclear war - everyone loses
  | 'climate_catastrophe' // Ice melts completely
  | 'regime_collapse'     // Your legitimacy hits 0
  | 'total_defeat'        // All territory lost, military destroyed
  | 'assassination';      // Leader killed (random event)

export interface VictoryCondition {
  id: VictoryType;
  name: string;
  icon: string;
  description: string;
  howToWin: string;
  threshold: number;      // Target progress percentage
  priority: number;       // Display order
}

export interface DefeatCondition {
  id: DefeatType;
  name: string;
  icon: string;
  description: string;
  warningThreshold: number;  // When to warn player
}

export interface VictoryProgress {
  type: VictoryType;
  progress: number;        // 0-100
  details: string;
  isAchievable: boolean;
}

export interface GameEndState {
  isGameOver: boolean;
  victory: VictoryType | null;
  defeat: DefeatType | null;
  winner: FactionId | null;
  description: string;
  epilogue: string;
}

// Define all victory conditions
export const VICTORY_CONDITIONS: VictoryCondition[] = [
  {
    id: 'hegemonic',
    name: 'Arctic Hegemon',
    icon: '👑',
    description: 'Dominate the Arctic through territorial control',
    howToWin: 'Control 60% or more of all Arctic zones',
    threshold: 60,
    priority: 1,
  },
  {
    id: 'economic',
    name: 'Economic Superpower',
    icon: '💰',
    description: 'Achieve overwhelming economic dominance',
    howToWin: 'Accumulate 500+ economic output',
    threshold: 500,
    priority: 2,
  },
  {
    id: 'nobel_peace',
    name: 'Nobel Peace Prize',
    icon: '🕊️',
    description: 'Achieve lasting peace in the Arctic',
    howToWin: 'Maintain cooperation with ALL factions for 5+ turns',
    threshold: 100,
    priority: 3,
  },
  {
    id: 'scientific',
    name: 'Climate Savior',
    icon: '🔬',
    description: 'Lead global climate research efforts',
    howToWin: 'High legitimacy (90+) and slow ice melt through cooperation',
    threshold: 90,
    priority: 4,
  },
  {
    id: 'diplomatic',
    name: 'Grand Alliance',
    icon: '🤝',
    description: 'Form a coalition that dominates Arctic policy',
    howToWin: 'Achieve alliance treaties with 4+ factions',
    threshold: 4,
    priority: 5,
  },
  {
    id: 'military',
    name: 'Supreme Commander',
    icon: '⚔️',
    description: 'Achieve total military supremacy',
    howToWin: 'Destroy or neutralize all opposing military forces',
    threshold: 80,
    priority: 6,
  },
  {
    id: 'survival',
    name: 'Survivor',
    icon: '🏆',
    description: 'Outlast all competitors',
    howToWin: 'Highest victory points after 20 turns',
    threshold: 20,
    priority: 7,
  },
];

// Define defeat conditions
export const DEFEAT_CONDITIONS: DefeatCondition[] = [
  {
    id: 'nuclear_apocalypse',
    name: 'Nuclear Apocalypse',
    icon: '☢️',
    description: 'Global nuclear war destroys civilization',
    warningThreshold: 80,
  },
  {
    id: 'climate_catastrophe',
    name: 'Climate Catastrophe',
    icon: '🌊',
    description: 'Arctic ice melts completely, triggering global disaster',
    warningThreshold: 20,
  },
  {
    id: 'regime_collapse',
    name: 'Regime Collapse',
    icon: '💀',
    description: 'Your government falls due to loss of legitimacy',
    warningThreshold: 15,
  },
  {
    id: 'total_defeat',
    name: 'Total Defeat',
    icon: '🏳️',
    description: 'Your nation is completely defeated',
    warningThreshold: 10,
  },
  {
    id: 'assassination',
    name: 'Assassination',
    icon: '🎯',
    description: 'Your leader is assassinated (rare event)',
    warningThreshold: 0,
  },
];

// Calculate progress toward each victory
export const calculateVictoryProgress = (state: GameState): VictoryProgress[] => {
  const player = state.factions[state.playerFaction];
  const totalZones = Object.keys(state.zones).length;
  const playerZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction).length;
  const playerRelations = state.relations.filter(r => r.factions.includes(state.playerFaction));

  return VICTORY_CONDITIONS.map(vc => {
    let progress = 0;
    let details = '';
    let isAchievable = true;

    switch (vc.id) {
      case 'hegemonic': {
        const controlPercent = (playerZones / totalZones) * 100;
        progress = Math.min(100, (controlPercent / 60) * 100);
        details = `Control ${playerZones}/${totalZones} zones (${controlPercent.toFixed(0)}%)`;
        break;
      }

      case 'economic': {
        progress = Math.min(100, (player.resources.economicOutput / 500) * 100);
        details = `Economy: ${player.resources.economicOutput}/500`;
        break;
      }

      case 'nobel_peace': {
        const cooperativeRelations = playerRelations.filter(r => r.tensionLevel === 'cooperation').length;
        const totalRelations = playerRelations.length;
        const allCooperative = cooperativeRelations === totalRelations;
        // Track turns of peace (simplified - would need state tracking)
        const peaceTurns = allCooperative ? Math.min(5, state.turn) : 0;
        progress = (peaceTurns / 5) * 100;
        details = `${cooperativeRelations}/${totalRelations} peaceful relations`;
        if (!allCooperative) {
          details += ' (need ALL cooperative)';
          isAchievable = cooperativeRelations > totalRelations / 2;
        }
        break;
      }

      case 'scientific': {
        const legitimacyScore = player.resources.legitimacy;
        const iceStability = state.globalIceExtent;
        const combined = (legitimacyScore + iceStability) / 2;
        progress = Math.min(100, (combined / 90) * 100);
        details = `Legitimacy: ${legitimacyScore}%, Ice: ${iceStability}%`;
        break;
      }

      case 'diplomatic': {
        const alliances = playerRelations.filter(r =>
          r.tensionLevel === 'cooperation' && r.treaties.length > 0
        ).length;
        progress = (alliances / 4) * 100;
        details = `${alliances}/4 allied factions`;
        break;
      }

      case 'military': {
        const playerUnits = state.militaryUnits.filter(
          u => u.owner === state.playerFaction && u.status !== 'destroyed'
        );
        const enemyUnits = state.militaryUnits.filter(
          u => u.owner !== state.playerFaction && u.status !== 'destroyed'
        );
        const totalStrength = (units: typeof playerUnits) =>
          units.reduce((sum, u) => sum + u.strength, 0);

        const playerStrength = totalStrength(playerUnits);
        const enemyStrength = totalStrength(enemyUnits);
        const ratio = enemyStrength > 0 ? playerStrength / (playerStrength + enemyStrength) : 1;
        progress = ratio * 100;
        details = `Military strength: ${playerStrength} vs ${enemyStrength}`;
        break;
      }

      case 'survival': {
        progress = (state.turn / 20) * 100;
        details = `Turn ${state.turn}/20 - VP: ${player.victoryPoints}`;
        break;
      }
    }

    return { type: vc.id, progress: Math.round(progress), details, isAchievable };
  });
};

// Check for victory
export const checkVictory = (state: GameState): VictoryType | null => {
  const progress = calculateVictoryProgress(state);

  // Check hegemonic (60% control)
  const hegemonic = progress.find(p => p.type === 'hegemonic');
  if (hegemonic && hegemonic.progress >= 100) return 'hegemonic';

  // Check economic (500+ output)
  const player = state.factions[state.playerFaction];
  if (player.resources.economicOutput >= 500) return 'economic';

  // Check military (80%+ strength ratio)
  const military = progress.find(p => p.type === 'military');
  if (military && military.progress >= 80) return 'military';

  // Check diplomatic (4+ alliances)
  const diplomatic = progress.find(p => p.type === 'diplomatic');
  if (diplomatic && diplomatic.progress >= 100) return 'diplomatic';

  // Check survival (turn 20)
  if (state.turn >= 20) return 'survival';

  // Nobel Peace requires special tracking - simplified check
  const playerRelations = state.relations.filter(r => r.factions.includes(state.playerFaction));
  const allCooperative = playerRelations.every(r => r.tensionLevel === 'cooperation');
  if (allCooperative && state.turn >= 5) return 'nobel_peace';

  // Scientific victory
  if (player.resources.legitimacy >= 95 && state.globalIceExtent >= 50) return 'scientific';

  return null;
};

// Check for defeat
export const checkDefeat = (state: GameState): DefeatType | null => {
  const player = state.factions[state.playerFaction];

  // Nuclear apocalypse - any conflict with nuclear powers at defcon1
  if (state.nuclearReadiness === 'defcon1') {
    const hasConflict = state.relations.some(r =>
      r.factions.includes(state.playerFaction) && r.tensionLevel === 'conflict'
    );
    if (hasConflict) return 'nuclear_apocalypse';
  }

  // Climate catastrophe - ice extent drops to 0
  if (state.globalIceExtent <= 0) return 'climate_catastrophe';

  // Regime collapse - legitimacy drops to 0
  if (player.resources.legitimacy <= 0) return 'regime_collapse';

  // Total defeat - no zones, no military
  const playerZones = Object.values(state.zones).filter(z => z.controller === state.playerFaction);
  const playerUnits = state.militaryUnits.filter(
    u => u.owner === state.playerFaction && u.status !== 'destroyed'
  );
  if (playerZones.length === 0 && playerUnits.length === 0) return 'total_defeat';

  return null;
};

// Get game end state
export const getGameEndState = (state: GameState): GameEndState => {
  const victory = checkVictory(state);
  const defeat = checkDefeat(state);

  if (victory) {
    return {
      isGameOver: true,
      victory,
      defeat: null,
      winner: state.playerFaction,
      description: getVictoryDescription(victory, state),
      epilogue: getVictoryEpilogue(victory, state),
    };
  }

  if (defeat) {
    return {
      isGameOver: true,
      victory: null,
      defeat,
      winner: null,
      description: getDefeatDescription(defeat, state),
      epilogue: getDefeatEpilogue(defeat, state),
    };
  }

  return {
    isGameOver: false,
    victory: null,
    defeat: null,
    winner: null,
    description: '',
    epilogue: '',
  };
};

// Victory descriptions
const getVictoryDescription = (victory: VictoryType, state: GameState): string => {
  const faction = state.factions[state.playerFaction];

  switch (victory) {
    case 'hegemonic':
      return `${faction.name} has achieved Arctic dominance! With control over the majority of Arctic territories, you have secured your nation's future.`;
    case 'economic':
      return `${faction.name} has become the economic superpower of the Arctic! Your investments and trade routes have paid off spectacularly.`;
    case 'nobel_peace':
      return `The Nobel Peace Prize goes to ${faction.name}! Your diplomatic efforts have brought lasting peace to the Arctic.`;
    case 'scientific':
      return `${faction.name} leads the world in climate science! Your research has shown the path to saving the Arctic.`;
    case 'diplomatic':
      return `${faction.name} has forged an unbreakable Arctic alliance! Through diplomacy, you've united the world.`;
    case 'military':
      return `${faction.name} has achieved total military supremacy! None dare challenge your Arctic dominance.`;
    case 'survival':
      return `${faction.name} has survived the Arctic wars! With ${faction.victoryPoints} victory points, you've outlasted all competitors.`;
    default:
      return 'Victory achieved!';
  }
};

const getVictoryEpilogue = (victory: VictoryType, state: GameState): string => {
  const year = state.year;

  switch (victory) {
    case 'hegemonic':
      return `By ${year}, the Arctic had become a new frontier under your control. The shipping routes, resources, and strategic positions are all yours. History will remember this as the dawn of a new era.`;
    case 'economic':
      return `The Arctic economy thrives under your leadership. By ${year}, your investments have created unprecedented prosperity. The Polar Silk Road carries your goods to every corner of the globe.`;
    case 'nobel_peace':
      return `In ${year}, Oslo erupts in celebration as you receive the Nobel Peace Prize. Your achievement of Arctic peace stands as a beacon of hope for humanity. The world has learned to cooperate.`;
    case 'scientific':
      return `Your climate research has changed the world. By ${year}, new technologies developed under your leadership have begun reversing Arctic ice loss. You've given the planet a second chance.`;
    case 'diplomatic':
      return `The Arctic Council, reformed under your leadership, has become the model for international cooperation. By ${year}, conflicts are resolved through dialogue, not force.`;
    case 'military':
      return `By ${year}, your military dominance is absolute. Other nations speak of peace because they have no choice. The Arctic is yours, won through strength and determination.`;
    case 'survival':
      return `Through 20 turns of strategy, diplomacy, and occasional conflict, you've proven yourself the master of Arctic politics. In ${year}, the world recognizes your achievement.`;
    default:
      return 'The future is yours to shape.';
  }
};

// Defeat descriptions
const getDefeatDescription = (defeat: DefeatType, state: GameState): string => {
  const faction = state.factions[state.playerFaction];

  switch (defeat) {
    case 'nuclear_apocalypse':
      return `The unthinkable has happened. Nuclear war has ended civilization as we know it. There are no winners.`;
    case 'climate_catastrophe':
      return `The Arctic ice has melted completely. Rising seas and climate chaos have rendered the game meaningless. Humanity faces extinction.`;
    case 'regime_collapse':
      return `${faction.name}'s government has collapsed! Your legitimacy reached zero, and your people have risen up.`;
    case 'total_defeat':
      return `${faction.name} has been completely defeated. With no territory and no military, your nation's Arctic ambitions are over.`;
    case 'assassination':
      return `Your leader has been assassinated! Without leadership, your government falls into chaos.`;
    default:
      return 'Defeat.';
  }
};

const getDefeatEpilogue = (defeat: DefeatType, state: GameState): string => {
  const year = state.year;

  switch (defeat) {
    case 'nuclear_apocalypse':
      return `The year ${year} marked the end of human civilization. In the ashes of nuclear winter, no nation survives. The Arctic ice, ironically, begins to regrow - but there is no one left to see it.`;
    case 'climate_catastrophe':
      return `By ${year}, the last Arctic ice has melted. Coastal cities flood. Climate refugees number in the billions. The game you played for Arctic dominance now seems tragically pointless.`;
    case 'regime_collapse':
      return `In ${year}, protests turned to revolution. Your government fell, your leaders fled. History will remember you as a cautionary tale about the price of losing the people's trust.`;
    case 'total_defeat':
      return `By ${year}, your nation's Arctic presence was erased. Territories lost, military destroyed. Other powers divide what was once your sphere of influence.`;
    case 'assassination':
      return `The assassination in ${year} changed everything. Without your leader, the government fractured. Some say it was a foreign plot. Others blame internal enemies. The truth may never be known.`;
    default:
      return 'Your Arctic ambitions have ended in failure.';
  }
};

// Get advisor tips for current victory progress
export const getVictoryAdvisorTips = (state: GameState): string[] => {
  const progress = calculateVictoryProgress(state);
  const tips: string[] = [];

  // Find closest victory paths
  const achievable = progress
    .filter(p => p.isAchievable)
    .sort((a, b) => b.progress - a.progress);

  if (achievable.length > 0) {
    const closest = achievable[0];
    const condition = VICTORY_CONDITIONS.find(v => v.id === closest.type)!;

    if (closest.progress >= 75) {
      tips.push(`You're close to ${condition.name}! ${closest.details}`);
    } else if (closest.progress >= 50) {
      tips.push(`${condition.name} is within reach. ${condition.howToWin}`);
    }
  }

  // Warn about defeat conditions
  const player = state.factions[state.playerFaction];

  if (state.nuclearReadiness === 'defcon2' || state.nuclearReadiness === 'defcon1') {
    tips.push('⚠️ Nuclear war is imminent! De-escalate or face annihilation!');
  }

  if (state.globalIceExtent <= 30) {
    tips.push('🌊 Climate catastrophe approaching! Ice is melting fast!');
  }

  if (player.resources.legitimacy <= 20) {
    tips.push('💀 Your legitimacy is dangerously low! Risk of regime collapse!');
  }

  return tips;
};
