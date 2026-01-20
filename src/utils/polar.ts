import { HexCoord, ScreenCoord } from '../types/game';

// Polar Azimuthal Equidistant projection utilities
// This projection shows the Arctic with North Pole at center

const DEG_TO_RAD = Math.PI / 180;

export interface ProjectionConfig {
  centerX: number;      // Screen center X
  centerY: number;      // Screen center Y
  scale: number;        // Pixels per degree of latitude
  minLatitude: number;  // Southern bound (typically 60-65°N)
}

// Convert lat/lon to screen coordinates using polar azimuthal equidistant projection
export const polarToScreen = (
  latitude: number,
  longitude: number,
  config: ProjectionConfig
): ScreenCoord => {
  // Distance from pole (in degrees)
  const r = (90 - latitude) * config.scale;

  // Angle (longitude, with 0° pointing up)
  const theta = (longitude - 90) * DEG_TO_RAD;

  return {
    x: config.centerX + r * Math.cos(theta),
    y: config.centerY + r * Math.sin(theta),
  };
};

// Convert screen coordinates back to lat/lon
export const screenToPolar = (
  x: number,
  y: number,
  config: ProjectionConfig
): { latitude: number; longitude: number } => {
  const dx = x - config.centerX;
  const dy = y - config.centerY;

  const r = Math.sqrt(dx * dx + dy * dy);
  const latitude = 90 - r / config.scale;

  let longitude = Math.atan2(dy, dx) / DEG_TO_RAD + 90;
  if (longitude > 180) longitude -= 360;
  if (longitude < -180) longitude += 360;

  return { latitude, longitude };
};

// Hexagonal grid utilities (flat-top hexagons)
export const HEX_SIZE = 45; // Radius of hex

// Convert hex coordinates to screen position (for hex center)
export const hexToScreen = (hex: HexCoord, config: ProjectionConfig): ScreenCoord => {
  // Flat-top hex layout
  const x = HEX_SIZE * (3 / 2 * hex.q);
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);

  return {
    x: config.centerX + x,
    y: config.centerY + y,
  };
};

// Convert screen position to hex coordinates
export const screenToHex = (screen: ScreenCoord, config: ProjectionConfig): HexCoord => {
  const x = screen.x - config.centerX;
  const y = screen.y - config.centerY;

  const q = (2 / 3 * x) / HEX_SIZE;
  const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / HEX_SIZE;

  return hexRound({ q, r });
};

// Round fractional hex to nearest hex
export const hexRound = (hex: HexCoord): HexCoord => {
  const s = -hex.q - hex.r;

  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  const sRound = Math.round(s);

  const qDiff = Math.abs(q - hex.q);
  const rDiff = Math.abs(r - hex.r);
  const sDiff = Math.abs(sRound - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - sRound;
  } else if (rDiff > sDiff) {
    r = -q - sRound;
  }

  return { q, r };
};

// Get hex corner positions for drawing
export const hexCorners = (center: ScreenCoord): ScreenCoord[] => {
  const corners: ScreenCoord[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i) * DEG_TO_RAD;
    corners.push({
      x: center.x + HEX_SIZE * Math.cos(angle),
      y: center.y + HEX_SIZE * Math.sin(angle),
    });
  }
  return corners;
};

// Get hex neighbors
export const hexNeighbors = (hex: HexCoord): HexCoord[] => {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
  ];
  return directions.map(d => ({ q: hex.q + d.q, r: hex.r + d.r }));
};

// Calculate distance between two hexes
export const hexDistance = (a: HexCoord, b: HexCoord): number => {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

// Create default projection config for a given canvas size
export const createProjectionConfig = (width: number, height: number): ProjectionConfig => {
  const minDim = Math.min(width, height);
  return {
    centerX: width / 2,
    centerY: height / 2,
    scale: minDim / 60, // Show 60°N to 90°N
    minLatitude: 60,
  };
};
