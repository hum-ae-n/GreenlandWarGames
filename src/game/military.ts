// Military System - Unit Types, Operations, and Combat Resolution
import { FactionId, GameState, MapZone, CombatSurpriseState } from '../types/game';
import { rollCombatSurprise } from './drama';

export type UnitType = 'surface_fleet' | 'submarine' | 'aircraft' | 'ground_forces' | 'icebreaker_combat' | 'missile_battery';

export type OperationType =
  | 'patrol'           // Show presence, gather intel
  | 'blockade'         // Block shipping, economic pressure
  | 'strike'           // Targeted attack on assets
  | 'invasion'         // Attempt to take control of zone
  | 'defense'          // Fortify position
  | 'intercept'        // Counter enemy operations
  | 'evacuation'       // Withdraw forces
  | 'nuclear_alert';   // Last resort escalation

export interface MilitaryUnit {
  id: string;
  type: UnitType;
  owner: FactionId;
  location: string;      // Zone ID
  strength: number;      // 1-100
  experience: number;    // 0-100, affects combat
  morale: number;        // 0-100
  status: 'ready' | 'deployed' | 'damaged' | 'destroyed';
  stealthed?: boolean;   // For submarines
}

export interface MilitaryOperation {
  id: string;
  type: OperationType;
  executor: FactionId;
  targetZone: string;
  targetFaction?: FactionId;
  units: string[];       // Unit IDs involved
  turn: number;
  status: 'planned' | 'in_progress' | 'completed' | 'failed' | 'aborted';
  outcome?: OperationOutcome;
}

export interface OperationOutcome {
  success: boolean;
  casualties: { unitId: string; damage: number }[];
  zoneControlChange?: FactionId;
  tensionIncrease: number;
  worldReaction: 'ignored' | 'condemned' | 'sanctions' | 'intervention';
  description: string;
  combatSurprise?: CombatSurpriseState;
}

// Unit specifications
export const UNIT_SPECS: Record<UnitType, {
  name: string;
  icon: string;
  attack: number;
  defense: number;
  mobility: number;
  costEO: number;
  costIP: number;
  buildTurns: number;
  specialAbility?: string;
}> = {
  surface_fleet: {
    name: 'Surface Fleet',
    icon: '🚢',
    attack: 70,
    defense: 60,
    mobility: 3,
    costEO: 80,
    costIP: 20,
    buildTurns: 2,
    specialAbility: 'Blockade capability',
  },
  submarine: {
    name: 'Submarine',
    icon: '🦈',
    attack: 80,
    defense: 40,
    mobility: 4,
    costEO: 100,
    costIP: 30,
    buildTurns: 3,
    specialAbility: 'Stealth operations',
  },
  aircraft: {
    name: 'Air Wing',
    icon: '✈️',
    attack: 85,
    defense: 30,
    mobility: 6,
    costEO: 60,
    costIP: 15,
    buildTurns: 1,
    specialAbility: 'Rapid response',
  },
  ground_forces: {
    name: 'Ground Forces',
    icon: '🎖️',
    attack: 60,
    defense: 80,
    mobility: 1,
    costEO: 40,
    costIP: 10,
    buildTurns: 1,
    specialAbility: 'Zone control',
  },
  icebreaker_combat: {
    name: 'Armed Icebreaker',
    icon: '⛵',
    attack: 40,
    defense: 50,
    mobility: 2,
    costEO: 70,
    costIP: 15,
    buildTurns: 2,
    specialAbility: 'Ice navigation',
  },
  missile_battery: {
    name: 'Missile Battery',
    icon: '🚀',
    attack: 95,
    defense: 20,
    mobility: 0,
    costEO: 120,
    costIP: 40,
    buildTurns: 3,
    specialAbility: 'Strategic strike',
  },
};

// Operation definitions
export const OPERATION_SPECS: Record<OperationType, {
  name: string;
  description: string;
  tensionCost: number;
  legitimacyCost: number;
  requiredUnits: UnitType[];
  minUnits: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}> = {
  patrol: {
    name: 'Naval Patrol',
    description: 'Show presence and gather intelligence',
    tensionCost: 5,
    legitimacyCost: 0,
    requiredUnits: ['surface_fleet', 'submarine', 'aircraft'],
    minUnits: 1,
    riskLevel: 'low',
  },
  blockade: {
    name: 'Maritime Blockade',
    description: 'Block shipping lanes, apply economic pressure',
    tensionCost: 25,
    legitimacyCost: 10,
    requiredUnits: ['surface_fleet', 'submarine'],
    minUnits: 2,
    riskLevel: 'medium',
  },
  strike: {
    name: 'Precision Strike',
    description: 'Targeted attack on military assets',
    tensionCost: 50,
    legitimacyCost: 20,
    requiredUnits: ['aircraft', 'submarine', 'missile_battery'],
    minUnits: 1,
    riskLevel: 'high',
  },
  invasion: {
    name: 'Amphibious Invasion',
    description: 'Seize control of contested zone',
    tensionCost: 80,
    legitimacyCost: 40,
    requiredUnits: ['ground_forces', 'surface_fleet'],
    minUnits: 3,
    riskLevel: 'extreme',
  },
  defense: {
    name: 'Defensive Posture',
    description: 'Fortify position against attack',
    tensionCost: 5,
    legitimacyCost: 0,
    requiredUnits: ['ground_forces', 'surface_fleet', 'aircraft', 'missile_battery'],
    minUnits: 1,
    riskLevel: 'low',
  },
  intercept: {
    name: 'Intercept Operation',
    description: 'Counter enemy forces',
    tensionCost: 15,
    legitimacyCost: 5,
    requiredUnits: ['aircraft', 'submarine', 'surface_fleet'],
    minUnits: 1,
    riskLevel: 'medium',
  },
  evacuation: {
    name: 'Strategic Withdrawal',
    description: 'Withdraw forces to safer position',
    tensionCost: -5,
    legitimacyCost: 0,
    requiredUnits: ['surface_fleet', 'aircraft'],
    minUnits: 1,
    riskLevel: 'low',
  },
  nuclear_alert: {
    name: 'Nuclear Alert',
    description: 'Raise nuclear readiness - extreme escalation',
    tensionCost: 100,
    legitimacyCost: 50,
    requiredUnits: ['missile_battery', 'submarine'],
    minUnits: 1,
    riskLevel: 'extreme',
  },
};

// Combat resolution
export const resolveCombat = (
  attacker: MilitaryUnit[],
  defender: MilitaryUnit[],
  attackerFaction: FactionId,
  defenderFaction: FactionId,
  zone: MapZone,
  operation: OperationType
): OperationOutcome => {
  // Roll for combat surprises!
  const attackerSurprise = rollCombatSurprise(true);
  const defenderSurprise = rollCombatSurprise(false);

  // Use the most dramatic surprise
  const activeSurprise = attackerSurprise || defenderSurprise;

  // Calculate combat power
  let attackerPower = attacker.reduce((sum, unit) => {
    const spec = UNIT_SPECS[unit.type];
    const effectiveness = (unit.strength / 100) * (unit.morale / 100) * (1 + unit.experience / 200);
    return sum + spec.attack * effectiveness;
  }, 0);

  let defenderPower = defender.reduce((sum, unit) => {
    const spec = UNIT_SPECS[unit.type];
    const effectiveness = (unit.strength / 100) * (unit.morale / 100) * (1 + unit.experience / 200);
    // Defender gets terrain bonus
    const terrainBonus = zone.type === 'territorial' ? 1.5 : 1.2;
    return sum + spec.defense * effectiveness * terrainBonus;
  }, 0);

  // Apply combat surprise modifiers
  if (attackerSurprise) {
    const multiplier = attackerSurprise.damageMultiplier || 1;
    attackerPower *= multiplier;
    if (attackerSurprise.bonusEffect === 'self_damage') {
      // Friendly fire hurts attacker
      attackerPower *= 0.7;
    }
    if (attackerSurprise.bonusEffect === 'mutual_damage') {
      // Both sides hurt
      defenderPower *= 0.8;
    }
  }
  if (defenderSurprise) {
    const multiplier = defenderSurprise.damageMultiplier || 1;
    defenderPower *= (2 - multiplier); // Invert for defender advantage
    if (defenderSurprise.bonusEffect === 'defender_boost') {
      defenderPower *= 1.3;
    }
  }

  // Add randomness (fog of war)
  const attackRoll = attackerPower * (0.8 + Math.random() * 0.4);
  const defenseRoll = defenderPower * (0.8 + Math.random() * 0.4);

  const success = attackRoll > defenseRoll;
  const ratio = success ? attackRoll / defenseRoll : defenseRoll / attackRoll;

  // Calculate casualties with surprise modifiers
  const casualties: { unitId: string; damage: number }[] = [];
  const damageMultiplier = activeSurprise?.damageMultiplier || 1;

  // Attacker casualties (more if failed)
  attacker.forEach(unit => {
    let baseDamage = success ? 10 + Math.random() * 20 : 20 + Math.random() * 40;
    // Self damage from friendly fire
    if (attackerSurprise?.bonusEffect === 'self_damage') {
      baseDamage *= 1.5;
    }
    const damage = Math.min(unit.strength, Math.round(baseDamage / ratio * damageMultiplier));
    if (damage > 0) {
      casualties.push({ unitId: unit.id, damage });
    }
  });

  // Defender casualties (more if attack succeeded)
  defender.forEach(unit => {
    let baseDamage = success ? 20 + Math.random() * 30 : 10 + Math.random() * 15;
    // Defender surprises reduce damage taken
    if (defenderSurprise) {
      baseDamage *= (2 - (defenderSurprise.damageMultiplier || 1));
    }
    const damage = Math.min(unit.strength, Math.round(baseDamage * (success ? ratio : 1)));
    if (damage > 0) {
      casualties.push({ unitId: unit.id, damage });
    }
  });

  // Tension increase based on operation type and outcome
  let tensionIncrease = OPERATION_SPECS[operation].tensionCost;
  if (casualties.length > 0) tensionIncrease += 20;
  if (success && operation === 'invasion') tensionIncrease += 30;

  // World reaction
  let worldReaction: OperationOutcome['worldReaction'] = 'ignored';
  if (operation === 'strike' || operation === 'invasion') {
    if (tensionIncrease > 60) worldReaction = 'condemned';
    if (tensionIncrease > 80) worldReaction = 'sanctions';
  }
  if (operation === 'nuclear_alert') worldReaction = 'intervention';

  // Generate description with surprise
  let description: string;
  if (activeSurprise) {
    description = `${activeSurprise.title} ${activeSurprise.description}`;
  } else {
    const descriptions = success
      ? [
          `${attackerFaction.toUpperCase()} forces achieved their objective in ${zone.name}.`,
          `Successful ${OPERATION_SPECS[operation].name} in the ${zone.name} region.`,
          `${defenderFaction.toUpperCase()} defenses overwhelmed in ${zone.name}.`,
        ]
      : [
          `${attackerFaction.toUpperCase()} operation failed in ${zone.name}.`,
          `${defenderFaction.toUpperCase()} repelled the attack in ${zone.name}.`,
          `Heavy resistance stopped ${attackerFaction.toUpperCase()} forces.`,
        ];
    description = descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  // Create surprise state for UI
  const combatSurpriseState: CombatSurpriseState | undefined = activeSurprise ? {
    type: activeSurprise.type,
    title: activeSurprise.title,
    description: activeSurprise.description,
    damageMultiplier: activeSurprise.damageMultiplier,
    bonusEffect: activeSurprise.bonusEffect,
    isPositive: attackerSurprise !== null && (attackerSurprise.type === 'critical_hit' || attackerSurprise.type === 'ambush'),
  } : undefined;

  return {
    success,
    casualties,
    zoneControlChange: success && operation === 'invasion' ? attackerFaction : undefined,
    tensionIncrease,
    worldReaction,
    description,
    combatSurprise: combatSurpriseState,
  };
};

// Generate starting military units for a faction
export const generateStartingUnits = (faction: FactionId): MilitaryUnit[] => {
  const units: MilitaryUnit[] = [];
  let idCounter = 0;

  const createUnit = (type: UnitType, location: string, strength: number = 100): MilitaryUnit => ({
    id: `${faction}_unit_${idCounter++}`,
    type,
    owner: faction,
    location,
    strength,
    experience: 20 + Math.random() * 30,
    morale: 70 + Math.random() * 30,
    status: 'ready',
    stealthed: type === 'submarine',
  });

  switch (faction) {
    case 'usa':
      units.push(createUnit('surface_fleet', 'alaska'));
      units.push(createUnit('surface_fleet', 'bering_us'));
      units.push(createUnit('submarine', 'beaufort_us'));
      units.push(createUnit('aircraft', 'alaska'));
      units.push(createUnit('ground_forces', 'alaska'));
      break;

    case 'russia':
      units.push(createUnit('surface_fleet', 'murmansk'));
      units.push(createUnit('surface_fleet', 'nsr_west'));
      units.push(createUnit('submarine', 'kara'));
      units.push(createUnit('submarine', 'laptev'));
      units.push(createUnit('icebreaker_combat', 'nsr_east'));
      units.push(createUnit('icebreaker_combat', 'east_siberian'));
      units.push(createUnit('aircraft', 'murmansk'));
      units.push(createUnit('ground_forces', 'murmansk'));
      units.push(createUnit('missile_battery', 'kara'));
      break;

    case 'china':
      units.push(createUnit('surface_fleet', 'high_arctic_east')); // Expeditionary
      units.push(createUnit('icebreaker_combat', 'lomonosov_ridge'));
      break;

    case 'canada':
      units.push(createUnit('surface_fleet', 'nwp_west'));
      units.push(createUnit('icebreaker_combat', 'canadian_archipelago'));
      units.push(createUnit('aircraft', 'nwp_east'));
      break;

    case 'norway':
      units.push(createUnit('surface_fleet', 'barents_no'));
      units.push(createUnit('submarine', 'norwegian_sea'));
      units.push(createUnit('aircraft', 'svalbard'));
      break;

    case 'denmark':
      units.push(createUnit('surface_fleet', 'greenland_south'));
      units.push(createUnit('aircraft', 'greenland_north'));
      break;
  }

  return units;
};

// Check if an operation is valid
export const canExecuteOperation = (
  state: GameState,
  operation: OperationType,
  units: MilitaryUnit[],
  _targetZone: string
): { valid: boolean; reason?: string } => {
  const spec = OPERATION_SPECS[operation];

  // Check minimum units
  if (units.length < spec.minUnits) {
    return { valid: false, reason: `Requires at least ${spec.minUnits} units` };
  }

  // Check unit types
  const hasRequiredType = units.some(u => spec.requiredUnits.includes(u.type));
  if (!hasRequiredType) {
    return { valid: false, reason: `Requires one of: ${spec.requiredUnits.join(', ')}` };
  }

  // Check unit readiness
  const allReady = units.every(u => u.status === 'ready' || u.status === 'deployed');
  if (!allReady) {
    return { valid: false, reason: 'Some units are not ready' };
  }

  // Check legitimacy
  const faction = state.factions[state.playerFaction];
  if (faction.resources.legitimacy < spec.legitimacyCost) {
    return { valid: false, reason: 'Insufficient legitimacy' };
  }

  // Nuclear operations require crisis or conflict state
  if (operation === 'nuclear_alert') {
    const hasConflict = state.relations.some(
      r => r.factions.includes(state.playerFaction) && r.tensionLevel === 'conflict'
    );
    if (!hasConflict) {
      return { valid: false, reason: 'Nuclear alert only available during active conflict' };
    }
  }

  return { valid: true };
};

// Get available operations for a zone
export const getAvailableOperations = (
  state: GameState,
  units: MilitaryUnit[],
  zoneId: string
): OperationType[] => {
  const zone = state.zones[zoneId];
  if (!zone) return [];

  const operations: OperationType[] = [];

  Object.entries(OPERATION_SPECS).forEach(([opType, _spec]) => {
    const result = canExecuteOperation(state, opType as OperationType, units, zoneId);
    if (result.valid) {
      operations.push(opType as OperationType);
    }
  });

  return operations;
};
