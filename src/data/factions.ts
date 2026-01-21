import { Faction, FactionId, Resources } from '../types/game';

const createResources = (
  ip: number,
  eo: number,
  ice: number,
  mil: number,
  leg: number
): Resources => ({
  influencePoints: ip,
  economicOutput: eo,
  icebreakerCapacity: ice,
  militaryReadiness: mil,
  legitimacy: leg,
});

export const FACTIONS: Record<FactionId, Faction> = {
  usa: {
    id: 'usa',
    name: 'United States of America',
    shortName: 'USA',
    color: '#3B5998',
    resources: createResources(100, 150, 3, 85, 70),
    isPlayable: true,
    description: 'The dominant Western power with Alaska as its Arctic foothold. Strong military but limited icebreaker fleet.',
    specialMechanic: 'Carrier Groups: Can project naval power beyond normal range. NORAD Integration: Early warning advantage.',
    controlledZones: ['alaska', 'beaufort_us', 'bering_us'],
    victoryPoints: 0,
  },

  russia: {
    id: 'russia',
    name: 'Russian Federation',
    shortName: 'Russia',
    color: '#CC0000',
    resources: createResources(80, 100, 40, 90, 50),
    isPlayable: true,
    description: 'The Arctic superpower with the longest coastline and largest icebreaker fleet. Controls the Northern Sea Route.',
    specialMechanic: 'Icebreaker Fleet: Unmatched ice navigation. Nuclear Submarines: Stealth presence under ice.',
    controlledZones: ['murmansk', 'kara', 'laptev', 'east_siberian', 'chukchi_ru', 'nsr_west', 'nsr_east'],
    victoryPoints: 0,
  },

  china: {
    id: 'china',
    name: "People's Republic of China",
    shortName: 'China',
    color: '#FFCC00',
    resources: createResources(120, 200, 2, 60, 40),
    isPlayable: true,
    description: 'A "near-Arctic" state with no territory but vast economic resources. Seeks access through investment and diplomacy.',
    specialMechanic: 'Debt Diplomacy: Can invest in other factions\' infrastructure for influence. Polar Silk Road: Shipping bonus.',
    controlledZones: [],
    victoryPoints: 0,
  },

  eu: {
    id: 'eu',
    name: 'European Union',
    shortName: 'EU',
    color: '#003399',
    resources: createResources(90, 180, 4, 50, 85),
    isPlayable: true,
    description: 'A powerful economic bloc with Arctic interests through Nordic members. Focused on climate science and sustainable development.',
    specialMechanic: 'Regulatory Power: Can impose environmental standards. Research Collaboration: Bonus to Arctic science.',
    controlledZones: [],
    victoryPoints: 0,
  },

  canada: {
    id: 'canada',
    name: 'Canada',
    shortName: 'Canada',
    color: '#FF0000',
    resources: createResources(60, 80, 6, 45, 85),
    isPlayable: false,
    description: 'Vast Arctic territory but limited resources to enforce sovereignty. Strong indigenous partnership.',
    specialMechanic: 'Northwest Passage: Controls alternate shipping route. Indigenous Alliance: Legitimacy bonus.',
    controlledZones: ['nwp_east', 'nwp_west', 'canadian_archipelago', 'beaufort_ca'],
    victoryPoints: 0,
  },

  denmark: {
    id: 'denmark',
    name: 'Kingdom of Denmark (Greenland)',
    shortName: 'Greenland',
    color: '#006400',
    resources: createResources(40, 30, 1, 20, 90),
    isPlayable: false,
    description: 'Controls Greenland with its rare earth deposits. Independence movement creates strategic uncertainty.',
    specialMechanic: 'Independence Referendum: May trigger mid-game. Rare Earths: Unique resource leverage.',
    controlledZones: ['greenland_north', 'greenland_south', 'greenland_east'],
    victoryPoints: 0,
  },

  norway: {
    id: 'norway',
    name: 'Kingdom of Norway',
    shortName: 'Norway',
    color: '#00205B',
    resources: createResources(50, 90, 5, 55, 95),
    isPlayable: false,
    description: 'NATO anchor in the Arctic with advanced technology and sovereign wealth. Controls Svalbard.',
    specialMechanic: 'Sovereign Wealth Fund: Economic resilience. Tech Advantage: Better ice forecasting.',
    controlledZones: ['svalbard', 'barents_no', 'norwegian_sea'],
    victoryPoints: 0,
  },

  nato: {
    id: 'nato',
    name: 'NATO Alliance',
    shortName: 'NATO',
    color: '#004990',
    resources: createResources(30, 0, 0, 70, 75),
    isPlayable: false,
    description: 'Collective defense alliance. Cannot control territory directly but can deploy forces to member zones.',
    specialMechanic: 'Article 5: Attack on one triggers collective response. Burden Sharing: Members contribute resources.',
    controlledZones: [],
    victoryPoints: 0,
  },

  indigenous: {
    id: 'indigenous',
    name: 'Arctic Indigenous Peoples',
    shortName: 'Indigenous',
    color: '#8B4513',
    resources: createResources(20, 10, 2, 5, 100),
    isPlayable: false,
    description: 'Inuit, Sámi, and other peoples with cross-border presence. High legitimacy, limited hard power.',
    specialMechanic: 'Legitimacy Modifier: Actions affecting indigenous lands face global scrutiny. UN Voice: Can appeal to international bodies.',
    controlledZones: [],
    victoryPoints: 0,
  },
};

export const PLAYABLE_FACTIONS: FactionId[] = ['usa', 'russia', 'china', 'eu'];

export const getFactionById = (id: FactionId): Faction => FACTIONS[id];

export const getPlayableFactions = (): Faction[] =>
  PLAYABLE_FACTIONS.map(id => FACTIONS[id]);
