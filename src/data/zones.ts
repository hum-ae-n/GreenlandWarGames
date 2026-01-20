import { MapZone, FactionId } from '../types/game';

// Arctic zones arranged in a rough polar grid
// Hex coordinates use axial system (q, r)
// Center is roughly the North Pole

const createZone = (
  id: string,
  name: string,
  type: MapZone['type'],
  q: number,
  r: number,
  controller: FactionId | null,
  resources: MapZone['resources'],
  iceMonths: number
): MapZone => ({
  id,
  name,
  type,
  hex: { q, r },
  controller,
  contestedBy: [],
  resources,
  iceMonths,
  militaryPresence: controller ? { [controller]: 10 } : {},
});

export const ZONES: Record<string, MapZone> = {
  // Central Arctic (International)
  north_pole: createZone(
    'north_pole', 'North Pole', 'international',
    0, 0, null,
    { oil: 2, gas: 3, minerals: 1, fish: 0, shipping: 3 },
    12
  ),

  lomonosov_ridge: createZone(
    'lomonosov_ridge', 'Lomonosov Ridge', 'continental_shelf',
    1, -1, null,
    { oil: 7, gas: 8, minerals: 4, fish: 0, shipping: 2 },
    11
  ),

  // Russian Sector
  murmansk: createZone(
    'murmansk', 'Murmansk Coast', 'territorial',
    3, 1, 'russia',
    { oil: 5, gas: 6, minerals: 3, fish: 6, shipping: 8 },
    6
  ),

  kara: createZone(
    'kara', 'Kara Sea', 'eez',
    2, 0, 'russia',
    { oil: 8, gas: 9, minerals: 2, fish: 4, shipping: 7 },
    9
  ),

  laptev: createZone(
    'laptev', 'Laptev Sea', 'eez',
    1, 1, 'russia',
    { oil: 6, gas: 7, minerals: 3, fish: 3, shipping: 6 },
    10
  ),

  east_siberian: createZone(
    'east_siberian', 'East Siberian Sea', 'eez',
    0, 2, 'russia',
    { oil: 5, gas: 5, minerals: 4, fish: 2, shipping: 5 },
    11
  ),

  chukchi_ru: createZone(
    'chukchi_ru', 'Chukchi Sea (RU)', 'eez',
    -1, 2, 'russia',
    { oil: 4, gas: 4, minerals: 2, fish: 5, shipping: 6 },
    9
  ),

  nsr_west: createZone(
    'nsr_west', 'Northern Sea Route West', 'chokepoint',
    2, 1, 'russia',
    { oil: 2, gas: 2, minerals: 1, fish: 3, shipping: 10 },
    8
  ),

  nsr_east: createZone(
    'nsr_east', 'Northern Sea Route East', 'chokepoint',
    -1, 1, 'russia',
    { oil: 2, gas: 2, minerals: 1, fish: 4, shipping: 10 },
    9
  ),

  // US Sector (Alaska)
  alaska: createZone(
    'alaska', 'Alaska Coast', 'territorial',
    -2, 2, 'usa',
    { oil: 7, gas: 6, minerals: 5, fish: 8, shipping: 5 },
    4
  ),

  beaufort_us: createZone(
    'beaufort_us', 'Beaufort Sea (US)', 'eez',
    -2, 1, 'usa',
    { oil: 9, gas: 7, minerals: 2, fish: 4, shipping: 4 },
    8
  ),

  bering_us: createZone(
    'bering_us', 'Bering Strait (US)', 'chokepoint',
    -2, 3, 'usa',
    { oil: 3, gas: 3, minerals: 2, fish: 9, shipping: 9 },
    5
  ),

  // Canadian Sector
  beaufort_ca: createZone(
    'beaufort_ca', 'Beaufort Sea (CA)', 'eez',
    -3, 1, 'canada',
    { oil: 8, gas: 6, minerals: 3, fish: 5, shipping: 4 },
    9
  ),

  canadian_archipelago: createZone(
    'canadian_archipelago', 'Canadian Arctic Archipelago', 'territorial',
    -3, 0, 'canada',
    { oil: 4, gas: 5, minerals: 6, fish: 3, shipping: 3 },
    10
  ),

  nwp_west: createZone(
    'nwp_west', 'Northwest Passage West', 'chokepoint',
    -3, 2, 'canada',
    { oil: 2, gas: 2, minerals: 1, fish: 4, shipping: 8 },
    9
  ),

  nwp_east: createZone(
    'nwp_east', 'Northwest Passage East', 'chokepoint',
    -2, -1, 'canada',
    { oil: 2, gas: 2, minerals: 2, fish: 5, shipping: 8 },
    8
  ),

  // Greenland/Denmark Sector
  greenland_north: createZone(
    'greenland_north', 'North Greenland', 'territorial',
    -1, -1, 'denmark',
    { oil: 3, gas: 2, minerals: 9, fish: 2, shipping: 2 },
    11
  ),

  greenland_south: createZone(
    'greenland_south', 'South Greenland', 'territorial',
    -1, -2, 'denmark',
    { oil: 4, gas: 3, minerals: 10, fish: 6, shipping: 4 },
    6
  ),

  greenland_east: createZone(
    'greenland_east', 'East Greenland Sea', 'eez',
    0, -2, 'denmark',
    { oil: 5, gas: 4, minerals: 3, fish: 7, shipping: 5 },
    7
  ),

  // Norwegian Sector
  svalbard: createZone(
    'svalbard', 'Svalbard', 'territorial',
    1, -2, 'norway',
    { oil: 3, gas: 4, minerals: 5, fish: 6, shipping: 4 },
    7
  ),

  barents_no: createZone(
    'barents_no', 'Barents Sea (NO)', 'eez',
    2, -1, 'norway',
    { oil: 7, gas: 8, minerals: 2, fish: 9, shipping: 7 },
    5
  ),

  norwegian_sea: createZone(
    'norwegian_sea', 'Norwegian Sea', 'eez',
    2, -2, 'norway',
    { oil: 6, gas: 7, minerals: 1, fish: 8, shipping: 8 },
    3
  ),

  // Strategic Chokepoints
  giuk_gap: createZone(
    'giuk_gap', 'GIUK Gap', 'chokepoint',
    1, -3, null,
    { oil: 1, gas: 1, minerals: 0, fish: 5, shipping: 10 },
    0
  ),

  fram_strait: createZone(
    'fram_strait', 'Fram Strait', 'chokepoint',
    0, -1, null,
    { oil: 2, gas: 3, minerals: 1, fish: 4, shipping: 9 },
    6
  ),

  // Central contested areas
  high_arctic_west: createZone(
    'high_arctic_west', 'High Arctic West', 'international',
    -1, 0, null,
    { oil: 3, gas: 4, minerals: 2, fish: 1, shipping: 4 },
    12
  ),

  high_arctic_east: createZone(
    'high_arctic_east', 'High Arctic East', 'international',
    1, 0, null,
    { oil: 4, gas: 5, minerals: 3, fish: 1, shipping: 4 },
    11
  ),
};

export const getZoneById = (id: string): MapZone | undefined => ZONES[id];

export const getZonesByController = (controller: FactionId): MapZone[] =>
  Object.values(ZONES).filter(z => z.controller === controller);

export const getContestedZones = (): MapZone[] =>
  Object.values(ZONES).filter(z => z.contestedBy.length > 0);

export const getStrategicZones = (): MapZone[] =>
  Object.values(ZONES).filter(z => z.type === 'chokepoint' || z.resources.shipping >= 8);
