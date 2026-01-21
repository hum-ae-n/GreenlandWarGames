// AI Engine - Active opponents that compete, expand, and react
import { GameState, FactionId } from '../types/game';
import { GAME_ACTIONS, executeAction } from './actions';
import { updateTension, getTensionBetween } from './state';
import { UNIT_SPECS, UnitType, MilitaryUnit, resolveCombat, OperationType } from './military';

// AI Personality Types
export type AIPersonality = 'aggressive' | 'diplomatic' | 'economic' | 'expansionist' | 'defensive';

// AI Strategy profiles for each faction
export interface AIProfile {
  personality: AIPersonality;
  priorities: {
    military: number;      // 0-100 weight
    economic: number;
    diplomatic: number;
    territorial: number;
  };
  riskTolerance: number;   // 0-100 (higher = more aggressive)
  expansionTargets: string[];  // Preferred zones
  rivals: FactionId[];     // Factions they compete with
  allies: FactionId[];     // Factions they cooperate with
}

// Faction AI profiles - distinct strategies
export const AI_PROFILES: Record<FactionId, AIProfile> = {
  usa: {
    personality: 'diplomatic',
    priorities: { military: 70, economic: 60, diplomatic: 80, territorial: 50 },
    riskTolerance: 55,
    expansionTargets: ['beaufort_us', 'bering_us', 'high_arctic_west', 'greenland_north'],
    rivals: ['russia', 'china'],
    allies: ['canada', 'norway', 'denmark', 'nato', 'eu'],
  },
  russia: {
    personality: 'aggressive',
    priorities: { military: 90, economic: 50, diplomatic: 30, territorial: 85 },
    riskTolerance: 75,
    expansionTargets: ['nsr_west', 'nsr_east', 'lomonosov_ridge', 'kara', 'laptev', 'barents_ru'],
    rivals: ['usa', 'nato', 'eu'],
    allies: ['china'],
  },
  china: {
    personality: 'economic',
    priorities: { military: 50, economic: 90, diplomatic: 60, territorial: 70 },
    riskTolerance: 45,
    expansionTargets: ['lomonosov_ridge', 'high_arctic_east', 'greenland_south', 'nsr_east'],
    rivals: ['usa'],
    allies: ['russia'],
  },
  eu: {
    personality: 'diplomatic',
    priorities: { military: 40, economic: 75, diplomatic: 90, territorial: 40 },
    riskTolerance: 30,
    expansionTargets: ['norwegian_sea', 'barents_no', 'svalbard', 'greenland_south'],
    rivals: ['russia'],
    allies: ['usa', 'canada', 'norway', 'denmark', 'nato'],
  },
  canada: {
    personality: 'defensive',
    priorities: { military: 50, economic: 60, diplomatic: 70, territorial: 60 },
    riskTolerance: 35,
    expansionTargets: ['nwp_west', 'nwp_east', 'canadian_archipelago', 'beaufort_ca'],
    rivals: [],
    allies: ['usa', 'nato', 'eu'],
  },
  denmark: {
    personality: 'diplomatic',
    priorities: { military: 30, economic: 60, diplomatic: 80, territorial: 50 },
    riskTolerance: 25,
    expansionTargets: ['greenland_north', 'greenland_south', 'greenland_east'],
    rivals: [],
    allies: ['usa', 'nato', 'eu', 'norway'],
  },
  norway: {
    personality: 'defensive',
    priorities: { military: 55, economic: 70, diplomatic: 75, territorial: 50 },
    riskTolerance: 40,
    expansionTargets: ['barents_no', 'svalbard', 'norwegian_sea'],
    rivals: ['russia'],
    allies: ['usa', 'nato', 'eu', 'denmark'],
  },
  nato: {
    personality: 'defensive',
    priorities: { military: 80, economic: 40, diplomatic: 70, territorial: 30 },
    riskTolerance: 50,
    expansionTargets: [],
    rivals: ['russia', 'china'],
    allies: ['usa', 'canada', 'norway', 'denmark', 'eu'],
  },
  indigenous: {
    personality: 'diplomatic',
    priorities: { military: 10, economic: 40, diplomatic: 90, territorial: 20 },
    riskTolerance: 10,
    expansionTargets: [],
    rivals: [],
    allies: ['canada', 'norway', 'denmark'],
  },
};

// AI Decision context
interface AIContext {
  faction: FactionId;
  profile: AIProfile;
  state: GameState;
  threats: ThreatAssessment[];
  opportunities: OpportunityAssessment[];
}

interface ThreatAssessment {
  source: FactionId;
  type: 'military' | 'economic' | 'territorial' | 'diplomatic';
  severity: number; // 0-100
  targetZone?: string;
}

interface OpportunityAssessment {
  type: 'claim' | 'build' | 'alliance' | 'attack' | 'economic';
  target?: string | FactionId;
  value: number; // Priority score
  description: string;
}

// Main AI turn function
export const runAITurn = (state: GameState, factionId: FactionId): AIAction[] => {
  const profile = AI_PROFILES[factionId];
  if (!profile) return [];

  const context: AIContext = {
    faction: factionId,
    profile,
    state,
    threats: assessThreats(state, factionId, profile),
    opportunities: assessOpportunities(state, factionId, profile),
  };

  const actions: AIAction[] = [];

  // 1. Respond to immediate threats
  const threatResponse = handleThreats(context);
  if (threatResponse) actions.push(threatResponse);

  // 2. Pursue opportunities
  const opportunityAction = pursueOpportunities(context);
  if (opportunityAction) actions.push(opportunityAction);

  // 3. Build military if needed
  const buildAction = decideMilitaryBuild(context);
  if (buildAction) actions.push(buildAction);

  // 4. Territorial expansion
  const expansionAction = planExpansion(context);
  if (expansionAction) actions.push(expansionAction);

  // 5. Diplomatic moves
  const diplomacyAction = manageDiplomacy(context);
  if (diplomacyAction) actions.push(diplomacyAction);

  return actions;
};

// Threat assessment
const assessThreats = (state: GameState, factionId: FactionId, profile: AIProfile): ThreatAssessment[] => {
  const threats: ThreatAssessment[] = [];

  // Check military threats
  profile.rivals.forEach(rival => {
    const relation = getTensionBetween(state, factionId, rival);
    if (!relation) return;

    // High tension = threat
    if (relation.tensionLevel === 'crisis' || relation.tensionLevel === 'conflict') {
      threats.push({
        source: rival,
        type: 'military',
        severity: relation.tensionLevel === 'conflict' ? 90 : 70,
      });
    }

    // Enemy units near our zones
    const ourZones = Object.values(state.zones).filter(z => z.controller === factionId);
    const enemyUnits = state.militaryUnits.filter(u => u.owner === rival && u.status !== 'destroyed');

    ourZones.forEach(zone => {
      const nearbyEnemies = enemyUnits.filter(u => u.location === zone.id || isAdjacentZone(u.location, zone.id));
      if (nearbyEnemies.length > 0) {
        threats.push({
          source: rival,
          type: 'territorial',
          severity: 50 + nearbyEnemies.length * 15,
          targetZone: zone.id,
        });
      }
    });
  });

  // Check economic threats (losing ground)
  const playerFaction = state.playerFaction;
  const playerEconomy = state.factions[playerFaction].resources.economicOutput;
  const ourEconomy = state.factions[factionId].resources.economicOutput;

  if (playerEconomy > ourEconomy * 1.3) {
    threats.push({
      source: playerFaction,
      type: 'economic',
      severity: Math.min(80, (playerEconomy / ourEconomy - 1) * 100),
    });
  }

  return threats.sort((a, b) => b.severity - a.severity);
};

// Opportunity assessment
const assessOpportunities = (state: GameState, factionId: FactionId, profile: AIProfile): OpportunityAssessment[] => {
  const opportunities: OpportunityAssessment[] = [];
  const faction = state.factions[factionId];

  // Unclaimed zones - high priority targets
  const unclaimedZones = Object.values(state.zones).filter(z => z.controller === null);
  unclaimedZones.forEach(zone => {
    const isPreferred = profile.expansionTargets.includes(zone.id);
    const resourceValue = zone.resources.oil + zone.resources.gas + zone.resources.minerals + zone.resources.shipping;

    opportunities.push({
      type: 'claim',
      target: zone.id,
      value: (isPreferred ? 80 : 40) + resourceValue * 2,
      description: `Claim unclaimed zone: ${zone.name}`,
    });
  });

  // Weakly defended enemy zones
  const enemyZones = Object.values(state.zones).filter(z =>
    z.controller && z.controller !== factionId && profile.rivals.includes(z.controller)
  );

  enemyZones.forEach(zone => {
    const defenderUnits = state.militaryUnits.filter(u =>
      u.owner === zone.controller && u.location === zone.id && u.status !== 'destroyed'
    ).length;

    const ourUnitsNearby = state.militaryUnits.filter(u =>
      u.owner === factionId && (u.location === zone.id || isAdjacentZone(u.location, zone.id)) && u.status !== 'destroyed'
    ).length;

    if (ourUnitsNearby > defenderUnits && profile.riskTolerance > 50) {
      opportunities.push({
        type: 'attack',
        target: zone.id,
        value: 60 + (ourUnitsNearby - defenderUnits) * 15,
        description: `Attack weakly defended: ${zone.name}`,
      });
    }
  });

  // Alliance opportunities
  const neutralFactions = Object.keys(state.factions).filter(f =>
    f !== factionId &&
    !profile.rivals.includes(f as FactionId) &&
    !profile.allies.includes(f as FactionId)
  ) as FactionId[];

  neutralFactions.forEach(neutral => {
    const relation = getTensionBetween(state, factionId, neutral);
    if (relation && (relation.tensionLevel === 'cooperation' || relation.tensionLevel === 'competition')) {
      opportunities.push({
        type: 'alliance',
        target: neutral,
        value: 50 + (100 - relation.tensionValue) * 0.3,
        description: `Improve relations with ${neutral}`,
      });
    }
  });

  // Economic opportunities
  if (faction.resources.economicOutput > 50) {
    opportunities.push({
      type: 'economic',
      value: 40 + profile.priorities.economic * 0.3,
      description: 'Invest in economic development',
    });
  }

  // Military build opportunities
  const ourUnits = state.militaryUnits.filter(u => u.owner === factionId && u.status !== 'destroyed').length;
  const rivalUnits = profile.rivals.reduce((sum, rival) =>
    sum + state.militaryUnits.filter(u => u.owner === rival && u.status !== 'destroyed').length, 0
  );

  if (ourUnits < rivalUnits && faction.resources.economicOutput > 80) {
    opportunities.push({
      type: 'build',
      value: 60 + (rivalUnits - ourUnits) * 10,
      description: 'Build military to counter rivals',
    });
  }

  return opportunities.sort((a, b) => b.value - a.value);
};

// Handle immediate threats
const handleThreats = (context: AIContext): AIAction | null => {
  const { threats, state, faction, profile } = context;

  if (threats.length === 0) return null;

  const topThreat = threats[0];

  // Military threat - build defenses or counterattack
  if (topThreat.type === 'military' && topThreat.severity > 60) {
    // Try defensive positioning
    if (canAffordAction(state, faction, 'military_exercise')) {
      return {
        type: 'action',
        actionId: 'military_exercise',
        target: topThreat.source,
      };
    }
  }

  // Territorial threat - reinforce zone
  if (topThreat.type === 'territorial' && topThreat.targetZone) {
    // Move units to defend
    const availableUnits = state.militaryUnits.filter(u =>
      u.owner === faction && u.status === 'ready' && u.location !== topThreat.targetZone
    );

    if (availableUnits.length > 0) {
      return {
        type: 'move_unit',
        unitId: availableUnits[0].id,
        targetZone: topThreat.targetZone!,
      };
    }
  }

  // Economic threat - counter with investment
  if (topThreat.type === 'economic' && profile.priorities.economic > 50) {
    if (canAffordAction(state, faction, 'resource_extraction')) {
      return {
        type: 'action',
        actionId: 'resource_extraction',
      };
    }
  }

  return null;
};

// Pursue best opportunities
const pursueOpportunities = (context: AIContext): AIAction | null => {
  const { opportunities, state, faction, profile } = context;

  if (opportunities.length === 0) return null;

  // Filter by affordability and risk tolerance
  const viableOpportunities = opportunities.filter(opp => {
    if (opp.type === 'attack' && profile.riskTolerance < 50) return false;
    if (opp.type === 'claim') return true;
    if (opp.type === 'alliance') return true;
    if (opp.type === 'economic') return canAffordAction(state, faction, 'resource_extraction');
    if (opp.type === 'build') return canAffordAction(state, faction, 'base_expansion');
    return true;
  });

  if (viableOpportunities.length === 0) return null;

  const bestOpp = viableOpportunities[0];

  switch (bestOpp.type) {
    case 'claim':
      return {
        type: 'claim_zone',
        targetZone: bestOpp.target as string,
      };

    case 'attack':
      return {
        type: 'military_operation',
        operationType: 'invasion',
        targetZone: bestOpp.target as string,
      };

    case 'alliance':
      if (canAffordAction(state, faction, 'propose_treaty')) {
        return {
          type: 'action',
          actionId: 'propose_treaty',
          target: bestOpp.target as FactionId,
        };
      }
      break;

    case 'economic':
      if (canAffordAction(state, faction, 'resource_extraction')) {
        return {
          type: 'action',
          actionId: 'resource_extraction',
        };
      }
      break;

    case 'build':
      if (canAffordAction(state, faction, 'base_expansion')) {
        return {
          type: 'action',
          actionId: 'base_expansion',
        };
      }
      break;
  }

  return null;
};

// Military build decisions
const decideMilitaryBuild = (context: AIContext): AIAction | null => {
  const { state, faction, profile } = context;
  const factionData = state.factions[faction];

  // Check if we need more military
  const ourUnits = state.militaryUnits.filter(u => u.owner === faction && u.status !== 'destroyed').length;
  const desiredUnits = Math.ceil(profile.priorities.military / 15); // Scale by priority

  if (ourUnits >= desiredUnits) return null;

  // Can we afford to build?
  const affordableUnits: UnitType[] = [];

  Object.entries(UNIT_SPECS).forEach(([unitType, spec]) => {
    if (factionData.resources.economicOutput >= spec.costEO &&
        factionData.resources.influencePoints >= spec.costIP) {
      affordableUnits.push(unitType as UnitType);
    }
  });

  if (affordableUnits.length === 0) return null;

  // Pick unit based on faction preference
  let preferredUnit: UnitType = 'surface_fleet';

  switch (profile.personality) {
    case 'aggressive':
      preferredUnit = affordableUnits.includes('submarine') ? 'submarine' :
                      affordableUnits.includes('aircraft') ? 'aircraft' : affordableUnits[0];
      break;
    case 'defensive':
      preferredUnit = affordableUnits.includes('ground_forces') ? 'ground_forces' :
                      affordableUnits.includes('missile_battery') ? 'missile_battery' : affordableUnits[0];
      break;
    case 'economic':
      preferredUnit = affordableUnits.includes('icebreaker_combat') ? 'icebreaker_combat' :
                      affordableUnits.includes('surface_fleet') ? 'surface_fleet' : affordableUnits[0];
      break;
    default:
      preferredUnit = affordableUnits[0];
  }

  // Find deployment location
  const controlledZones = Object.values(state.zones).filter(z => z.controller === faction);
  const deploymentZone = controlledZones.length > 0 ? controlledZones[0].id : profile.expansionTargets[0];

  return {
    type: 'build_unit',
    unitType: preferredUnit,
    location: deploymentZone,
  };
};

// Territorial expansion planning
const planExpansion = (context: AIContext): AIAction | null => {
  const { state, faction, profile } = context;

  if (profile.priorities.territorial < 40) return null;

  // Find unclaimed target zones
  const targetZones = profile.expansionTargets.filter(zoneId => {
    const zone = state.zones[zoneId];
    return zone && zone.controller === null;
  });

  if (targetZones.length === 0) return null;

  // Check if we have units nearby to claim
  const ourUnits = state.militaryUnits.filter(u =>
    u.owner === faction && u.status !== 'destroyed'
  );

  for (const zoneId of targetZones) {
    const nearbyUnit = ourUnits.find(u =>
      u.location === zoneId || isAdjacentZone(u.location, zoneId)
    );

    if (nearbyUnit) {
      return {
        type: 'claim_zone',
        targetZone: zoneId,
      };
    }
  }

  // Move a unit toward target zone
  if (ourUnits.length > 0 && targetZones.length > 0) {
    return {
      type: 'move_unit',
      unitId: ourUnits[0].id,
      targetZone: targetZones[0],
    };
  }

  return null;
};

// Diplomacy management
const manageDiplomacy = (context: AIContext): AIAction | null => {
  const { state, faction, profile } = context;

  if (profile.priorities.diplomatic < 50) return null;

  // Check if tensions are too high with anyone
  const dangerousRelations = state.relations.filter(r =>
    r.factions.includes(faction) &&
    (r.tensionLevel === 'crisis' || r.tensionLevel === 'conflict')
  );

  if (dangerousRelations.length > 0 && profile.personality !== 'aggressive') {
    const relation = dangerousRelations[0];
    const otherFaction = relation.factions[0] === faction ? relation.factions[1] : relation.factions[0];

    // Try to de-escalate
    if (canAffordAction(state, faction, 'propose_treaty')) {
      return {
        type: 'action',
        actionId: 'propose_treaty',
        target: otherFaction,
      };
    }

    if (canAffordAction(state, faction, 'arctic_council_motion')) {
      return {
        type: 'action',
        actionId: 'arctic_council_motion',
      };
    }
  }

  // Strengthen ally relationships
  const allyRelations = state.relations.filter(r =>
    r.factions.includes(faction) &&
    profile.allies.includes(r.factions[0] === faction ? r.factions[1] : r.factions[0])
  );

  for (const relation of allyRelations) {
    if (relation.tensionValue > 30) {
      const ally = relation.factions[0] === faction ? relation.factions[1] : relation.factions[0];
      if (canAffordAction(state, faction, 'propose_treaty')) {
        return {
          type: 'action',
          actionId: 'propose_treaty',
          target: ally,
        };
      }
    }
  }

  return null;
};

// AI Action type
export interface AIAction {
  type: 'action' | 'claim_zone' | 'build_unit' | 'move_unit' | 'military_operation';
  actionId?: string;
  target?: FactionId;
  targetZone?: string;
  unitId?: string;
  unitType?: UnitType;
  location?: string;
  operationType?: OperationType;
}

// Execute AI actions
export const executeAIActions = (state: GameState, factionId: FactionId, actions: AIAction[]): void => {
  const faction = state.factions[factionId];

  // Execute up to 2 actions per turn (prevent AI from being too powerful)
  const actionsToExecute = actions.slice(0, 2);

  for (const action of actionsToExecute) {
    switch (action.type) {
      case 'action': {
        const gameAction = GAME_ACTIONS.find(a => a.id === action.actionId);
        if (gameAction && canAffordAction(state, factionId, action.actionId!)) {
          // Temporarily switch player faction for action execution
          const originalPlayer = state.playerFaction;
          state.playerFaction = factionId;

          if (action.target) {
            executeAction(state, gameAction, action.target);
          } else {
            executeAction(state, gameAction);
          }

          state.playerFaction = originalPlayer;
        }
        break;
      }

      case 'claim_zone': {
        if (action.targetZone) {
          const zone = state.zones[action.targetZone];
          if (zone && zone.controller === null) {
            // Check if we have units nearby
            const hasPresence = state.militaryUnits.some(u =>
              u.owner === factionId &&
              u.status !== 'destroyed' &&
              (u.location === zone.id || isAdjacentZone(u.location, zone.id))
            );

            if (hasPresence || faction.resources.influencePoints >= 20) {
              zone.controller = factionId;
              faction.resources.influencePoints -= 15;
              faction.controlledZones.push(zone.id);

              // Add notification
              state.notifications.push({
                id: `notif_claim_${Date.now()}_${Math.random()}`,
                type: 'discovery',
                title: `${faction.name} Claims Territory`,
                description: `${faction.name} has claimed ${zone.name}!`,
                timestamp: Date.now(),
              });
            }
          }
        }
        break;
      }

      case 'build_unit': {
        if (action.unitType && action.location) {
          const spec = UNIT_SPECS[action.unitType];
          if (faction.resources.economicOutput >= spec.costEO &&
              faction.resources.influencePoints >= spec.costIP) {
            // Deduct costs
            faction.resources.economicOutput -= spec.costEO;
            faction.resources.influencePoints -= spec.costIP;

            // Create unit
            const newUnit = {
              id: `${factionId}_ai_unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: action.unitType,
              owner: factionId,
              location: action.location,
              strength: 100,
              experience: 10 + Math.random() * 20,
              morale: 70 + Math.random() * 20,
              status: 'ready' as const,
              stealthed: action.unitType === 'submarine',
            };

            state.militaryUnits.push(newUnit);

            // Add notification
            state.notifications.push({
              id: `notif_build_${Date.now()}_${Math.random()}`,
              type: 'combat',
              title: `${faction.shortName} Military Buildup`,
              description: `${faction.name} has deployed new ${spec.name}`,
              timestamp: Date.now(),
            });
          }
        }
        break;
      }

      case 'move_unit': {
        if (action.unitId && action.targetZone) {
          const unit = state.militaryUnits.find(u => u.id === action.unitId);
          if (unit && unit.owner === factionId && unit.status !== 'destroyed') {
            unit.location = action.targetZone;
          }
        }
        break;
      }

      case 'military_operation': {
        if (action.operationType && action.targetZone) {
          const zone = state.zones[action.targetZone];
          if (!zone) break;

          const attackerUnits = state.militaryUnits.filter(u =>
            u.owner === factionId &&
            u.status !== 'destroyed' &&
            (u.location === zone.id || isAdjacentZone(u.location, zone.id))
          );

          if (attackerUnits.length === 0) break;

          const defenderFaction = zone.controller;
          if (!defenderFaction) break;

          const defenderUnits = state.militaryUnits.filter(u =>
            u.owner === defenderFaction &&
            u.status !== 'destroyed' &&
            u.location === zone.id
          );

          // Convert to MilitaryUnit format for combat
          const attackerMilitary: MilitaryUnit[] = attackerUnits.map(u => ({
            id: u.id,
            type: u.type as UnitType,
            owner: u.owner,
            location: u.location,
            strength: u.strength,
            experience: u.experience,
            morale: u.morale,
            status: u.status,
            stealthed: u.stealthed,
          }));

          const defenderMilitary: MilitaryUnit[] = defenderUnits.map(u => ({
            id: u.id,
            type: u.type as UnitType,
            owner: u.owner,
            location: u.location,
            strength: u.strength,
            experience: u.experience,
            morale: u.morale,
            status: u.status,
            stealthed: u.stealthed,
          }));

          // Resolve combat
          const outcome = resolveCombat(
            attackerMilitary,
            defenderMilitary,
            factionId,
            defenderFaction,
            zone,
            action.operationType
          );

          // Apply casualties
          outcome.casualties.forEach(cas => {
            const unit = state.militaryUnits.find(u => u.id === cas.unitId);
            if (unit) {
              unit.strength -= cas.damage;
              if (unit.strength <= 0) {
                unit.status = 'destroyed';
              } else if (unit.strength < 50) {
                unit.status = 'damaged';
              }
            }
          });

          // Apply zone control change
          if (outcome.zoneControlChange) {
            zone.controller = outcome.zoneControlChange;
            faction.controlledZones.push(zone.id);

            const defender = state.factions[defenderFaction];
            defender.controlledZones = defender.controlledZones.filter(z => z !== zone.id);
          }

          // Apply tension
          updateTension(state, factionId, defenderFaction, outcome.tensionIncrease);

          // Combat notification
          state.notifications.push({
            id: `notif_combat_${Date.now()}_${Math.random()}`,
            type: 'combat',
            title: outcome.success ? `${faction.shortName} Victory!` : `${faction.shortName} Repelled`,
            description: outcome.description,
            timestamp: Date.now(),
          });

          // Store combat result if player is involved
          if (defenderFaction === state.playerFaction || factionId === state.playerFaction) {
            state.combatResult = {
              success: outcome.success,
              attackerFaction: factionId,
              defenderFaction: defenderFaction,
              zoneName: zone.name,
              casualties: outcome.casualties.map(c => {
                const unit = state.militaryUnits.find(u => u.id === c.unitId);
                return {
                  unitId: c.unitId,
                  unitName: unit ? UNIT_SPECS[unit.type as UnitType].name : 'Unit',
                  damage: c.damage,
                };
              }),
              description: outcome.description,
              worldReaction: outcome.worldReaction === 'condemned' ? 'The international community condemns this aggression.' :
                             outcome.worldReaction === 'sanctions' ? 'Economic sanctions may follow this action.' :
                             outcome.worldReaction === 'intervention' ? 'International intervention is being considered!' :
                             'The world watches with concern.',
            };
          }
        }
        break;
      }
    }
  }
};

// Helper: Check if faction can afford an action
const canAffordAction = (state: GameState, factionId: FactionId, actionId: string): boolean => {
  const action = GAME_ACTIONS.find(a => a.id === actionId);
  if (!action) return false;

  const faction = state.factions[factionId];

  if (action.cost.influencePoints && faction.resources.influencePoints < action.cost.influencePoints) {
    return false;
  }
  if (action.cost.economicOutput && faction.resources.economicOutput < action.cost.economicOutput) {
    return false;
  }

  return true;
};

// Helper: Check if zones are adjacent (simplified - considers all zones potentially connected)
const isAdjacentZone = (zone1: string, zone2: string): boolean => {
  // Define adjacency map for key zones
  const adjacencyMap: Record<string, string[]> = {
    // North American sector
    'alaska': ['bering_us', 'beaufort_us', 'beaufort_ca'],
    'bering_us': ['alaska', 'bering_int', 'chukchi'],
    'beaufort_us': ['alaska', 'beaufort_ca', 'high_arctic_west'],
    'beaufort_ca': ['beaufort_us', 'canadian_archipelago', 'nwp_west'],
    'canadian_archipelago': ['beaufort_ca', 'nwp_west', 'nwp_east', 'high_arctic_west'],
    'nwp_west': ['beaufort_ca', 'canadian_archipelago', 'nwp_east'],
    'nwp_east': ['nwp_west', 'canadian_archipelago', 'greenland_north'],

    // Greenland sector
    'greenland_north': ['nwp_east', 'high_arctic_west', 'greenland_east'],
    'greenland_south': ['greenland_east', 'greenland_north'],
    'greenland_east': ['greenland_north', 'greenland_south', 'norwegian_sea'],

    // European/Norwegian sector
    'norwegian_sea': ['greenland_east', 'svalbard', 'barents_no'],
    'svalbard': ['norwegian_sea', 'barents_no', 'high_arctic_west'],
    'barents_no': ['svalbard', 'norwegian_sea', 'barents_ru'],
    'barents_ru': ['barents_no', 'murmansk', 'kara'],

    // Russian sector
    'murmansk': ['barents_ru', 'kara'],
    'kara': ['murmansk', 'barents_ru', 'nsr_west', 'laptev'],
    'nsr_west': ['kara', 'laptev', 'lomonosov_ridge'],
    'laptev': ['kara', 'nsr_west', 'nsr_east'],
    'nsr_east': ['laptev', 'east_siberian', 'lomonosov_ridge'],
    'east_siberian': ['nsr_east', 'chukchi'],
    'chukchi': ['east_siberian', 'bering_us', 'bering_int'],

    // Central Arctic
    'lomonosov_ridge': ['nsr_west', 'nsr_east', 'high_arctic_east', 'high_arctic_west', 'north_pole'],
    'high_arctic_west': ['lomonosov_ridge', 'north_pole', 'canadian_archipelago', 'greenland_north', 'svalbard'],
    'high_arctic_east': ['lomonosov_ridge', 'north_pole', 'nsr_east'],
    'north_pole': ['lomonosov_ridge', 'high_arctic_west', 'high_arctic_east'],

    // International
    'bering_int': ['bering_us', 'chukchi'],
  };

  const adjacent = adjacencyMap[zone1];
  return adjacent ? adjacent.includes(zone2) : false;
};

// Reaction to player actions - called after player takes significant action
export const reactToPlayerAction = (
  state: GameState,
  playerAction: string,
  targetFaction?: FactionId,
  targetZone?: string
): void => {
  const playerFactionId = state.playerFaction;

  // Get AI factions to respond
  const aiFactions = (['usa', 'russia', 'china', 'eu'] as FactionId[]).filter(f => f !== playerFactionId);

  aiFactions.forEach(aiFaction => {
    const profile = AI_PROFILES[aiFaction];
    if (!profile) return;

    // Check if this faction cares about the action
    const isRival = profile.rivals.includes(playerFactionId);
    const affectsUs = targetFaction === aiFaction || (targetZone && state.zones[targetZone]?.controller === aiFaction);

    // Aggressive action against AI - react!
    if (affectsUs && (playerAction.includes('military') || playerAction.includes('strike') || playerAction.includes('invasion'))) {
      // Increase tension
      updateTension(state, playerFactionId, aiFaction, 20 + profile.riskTolerance * 0.3);

      // Potential counter-action
      if (profile.riskTolerance > 60 && Math.random() < 0.5) {
        const actions = runAITurn(state, aiFaction);
        if (actions.length > 0) {
          executeAIActions(state, aiFaction, actions.slice(0, 1)); // Quick response
        }
      }
    }

    // Diplomatic action - adjust relations
    if (playerAction.includes('treaty') || playerAction.includes('diplomatic')) {
      if (targetFaction === aiFaction) {
        updateTension(state, playerFactionId, aiFaction, -10);
      } else if (isRival && targetFaction && profile.rivals.includes(targetFaction)) {
        // Player allied with our rival
        updateTension(state, playerFactionId, aiFaction, 5);
      }
    }

    // Economic competition
    if (playerAction.includes('economic') || playerAction.includes('extraction')) {
      if (isRival && profile.priorities.economic > 60) {
        // Competitor - slight tension increase
        updateTension(state, playerFactionId, aiFaction, 3);
      }
    }
  });
};
