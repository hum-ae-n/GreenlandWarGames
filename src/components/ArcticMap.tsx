import { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, MapZone, FactionId } from '../types/game';
import { hexToScreen, hexCorners, screenToHex, createProjectionConfig, ProjectionConfig, HEX_SIZE } from '../utils/polar';
import { FACTIONS } from '../data/factions';

interface ArcticMapProps {
  gameState: GameState;
  selectedZone: string | null;
  onZoneSelect: (zoneId: string | null) => void;
  width: number;
  height: number;
}

export const ArcticMap: React.FC<ArcticMapProps> = ({
  gameState,
  selectedZone,
  onZoneSelect,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [config, setConfig] = useState<ProjectionConfig>(() => createProjectionConfig(width, height));

  useEffect(() => {
    setConfig(createProjectionConfig(width, height));
  }, [width, height]);

  const getZoneAtPoint = useCallback((x: number, y: number): string | null => {
    const hex = screenToHex({ x, y }, config);

    for (const zone of Object.values(gameState.zones)) {
      if (zone.hex.q === hex.q && zone.hex.r === hex.r) {
        return zone.id;
      }
    }
    return null;
  }, [gameState.zones, config]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const zoneId = getZoneAtPoint(x, y);
    setHoveredZone(zoneId);
  }, [getZoneAtPoint]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const zoneId = getZoneAtPoint(x, y);
    onZoneSelect(zoneId === selectedZone ? null : zoneId);
  }, [getZoneAtPoint, onZoneSelect, selectedZone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark blue ocean
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

    // Draw polar grid circles (latitude lines)
    ctx.strokeStyle = '#1a3a5c';
    ctx.lineWidth = 1;
    for (let lat = 90; lat >= 60; lat -= 5) {
      const radius = (90 - lat) * config.scale;
      ctx.beginPath();
      ctx.arc(config.centerX, config.centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const angle = (lon - 90) * Math.PI / 180;
      const outerRadius = 30 * config.scale;
      ctx.beginPath();
      ctx.moveTo(config.centerX, config.centerY);
      ctx.lineTo(
        config.centerX + outerRadius * Math.cos(angle),
        config.centerY + outerRadius * Math.sin(angle)
      );
      ctx.stroke();
    }

    // Draw landmasses (simplified Arctic coastlines for context)
    // Uses polar azimuthal projection: angle = longitude, radius = 90 - latitude
    const drawLandmass = (coords: { lat: number; lon: number }[], fillColor: string, label?: string) => {
      ctx.beginPath();
      coords.forEach((coord, i) => {
        const radius = (90 - coord.lat) * config.scale;
        const angle = (coord.lon - 90) * Math.PI / 180;
        const x = config.centerX + radius * Math.cos(angle);
        const y = config.centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = '#3a5a3c';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Add label
      if (label && coords.length > 0) {
        const midIdx = Math.floor(coords.length / 2);
        const mid = coords[midIdx];
        const radius = (90 - mid.lat) * config.scale;
        const angle = (mid.lon - 90) * Math.PI / 180;
        ctx.fillStyle = '#ffffff80';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, config.centerX + radius * Math.cos(angle), config.centerY + radius * Math.sin(angle));
      }
    };

    // Russia (northern coastline)
    drawLandmass([
      { lat: 70, lon: 30 }, { lat: 72, lon: 50 }, { lat: 75, lon: 60 }, { lat: 77, lon: 70 },
      { lat: 76, lon: 90 }, { lat: 73, lon: 110 }, { lat: 71, lon: 130 }, { lat: 70, lon: 150 },
      { lat: 68, lon: 170 }, { lat: 66, lon: 175 }, { lat: 65, lon: 180 }, { lat: 65, lon: 170 },
      { lat: 60, lon: 150 }, { lat: 60, lon: 120 }, { lat: 60, lon: 90 }, { lat: 60, lon: 60 },
      { lat: 60, lon: 30 },
    ], '#2a3a2a', 'RUSSIA');

    // Alaska
    drawLandmass([
      { lat: 71, lon: -165 }, { lat: 70, lon: -160 }, { lat: 68, lon: -150 }, { lat: 66, lon: -145 },
      { lat: 64, lon: -142 }, { lat: 60, lon: -140 }, { lat: 60, lon: -165 }, { lat: 65, lon: -168 },
    ], '#2a3528', 'ALASKA');

    // Canada (northern territories)
    drawLandmass([
      { lat: 70, lon: -130 }, { lat: 72, lon: -120 }, { lat: 75, lon: -100 }, { lat: 76, lon: -90 },
      { lat: 75, lon: -80 }, { lat: 72, lon: -70 }, { lat: 68, lon: -65 }, { lat: 60, lon: -65 },
      { lat: 60, lon: -130 }, { lat: 65, lon: -135 },
    ], '#2a3025', 'CANADA');

    // Greenland
    drawLandmass([
      { lat: 84, lon: -30 }, { lat: 82, lon: -20 }, { lat: 78, lon: -18 }, { lat: 72, lon: -22 },
      { lat: 68, lon: -30 }, { lat: 65, lon: -40 }, { lat: 60, lon: -45 }, { lat: 60, lon: -52 },
      { lat: 65, lon: -55 }, { lat: 70, lon: -55 }, { lat: 76, lon: -60 }, { lat: 80, lon: -55 },
      { lat: 83, lon: -40 },
    ], '#35403a', 'GREENLAND');

    // Norway/Scandinavia
    drawLandmass([
      { lat: 71, lon: 25 }, { lat: 70, lon: 20 }, { lat: 68, lon: 15 }, { lat: 65, lon: 12 },
      { lat: 60, lon: 5 }, { lat: 60, lon: 25 }, { lat: 65, lon: 25 },
    ], '#2a3528', 'NORWAY');

    // Svalbard
    drawLandmass([
      { lat: 80, lon: 10 }, { lat: 79, lon: 15 }, { lat: 77, lon: 20 }, { lat: 76, lon: 15 },
      { lat: 77, lon: 10 }, { lat: 79, lon: 8 },
    ], '#353530', 'SVALBARD');

    // Iceland (partial, at edge)
    drawLandmass([
      { lat: 66, lon: -18 }, { lat: 64, lon: -14 }, { lat: 64, lon: -22 }, { lat: 66, lon: -24 },
    ], '#303030', 'ICELAND');

    // Draw ice extent circle
    const iceRadius = (90 - 60 - (100 - gameState.globalIceExtent) * 0.3) * config.scale;
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(config.centerX, config.centerY, iceRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw zones
    Object.values(gameState.zones).forEach((zone: MapZone) => {
      const center = hexToScreen(zone.hex, config);
      const corners = hexCorners(center);

      // Determine fill color based on controller
      let fillColor = '#1a3a5c'; // Unclaimed
      if (zone.controller) {
        const faction = FACTIONS[zone.controller];
        fillColor = faction ? faction.color + '80' : '#1a3a5c';
      }

      // Highlight selected/hovered zones
      if (zone.id === selectedZone) {
        fillColor = '#ffffff40';
      } else if (zone.id === hoveredZone) {
        fillColor = zone.controller
          ? FACTIONS[zone.controller].color + 'c0'
          : '#2a5a8c';
      }

      // Draw hex fill
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Draw hex border
      ctx.strokeStyle = zone.type === 'chokepoint' ? '#ffcc00' : '#3a6a9c';
      ctx.lineWidth = zone.type === 'chokepoint' ? 2 : 1;
      ctx.stroke();

      // Draw zone name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Truncate long names
      let displayName = zone.name;
      if (displayName.length > 12) {
        displayName = displayName.substring(0, 10) + '..';
      }
      ctx.fillText(displayName, center.x, center.y - 8);

      // Draw resource indicators
      const totalResources = zone.resources.oil + zone.resources.gas + zone.resources.shipping;
      if (totalResources > 15) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = '8px monospace';
        ctx.fillText('★★★', center.x, center.y + 8);
      } else if (totalResources > 10) {
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('★★', center.x, center.y + 8);
      } else if (totalResources > 5) {
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('★', center.x, center.y + 8);
      }

      // Draw military presence indicator
      const playerPresence = zone.militaryPresence[gameState.playerFaction] || 0;
      if (playerPresence > 0) {
        ctx.fillStyle = FACTIONS[gameState.playerFaction].color;
        ctx.beginPath();
        ctx.arc(center.x + HEX_SIZE * 0.6, center.y - HEX_SIZE * 0.4, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw North Pole marker
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(config.centerX, config.centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('90°N', config.centerX, config.centerY - 15);

    // Draw compass labels
    ctx.font = '14px monospace';
    ctx.fillStyle = '#8ab4f8';
    const labelRadius = 28 * config.scale;
    const labels = [
      { text: 'RUSSIA', angle: 90 },
      { text: 'CANADA', angle: -90 },
      { text: 'GREENLAND', angle: -30 },
      { text: 'NORWAY', angle: 30 },
    ];
    labels.forEach(({ text, angle }) => {
      const rad = (angle - 90) * Math.PI / 180;
      ctx.fillText(
        text,
        config.centerX + labelRadius * Math.cos(rad),
        config.centerY + labelRadius * Math.sin(rad)
      );
    });

  }, [gameState, selectedZone, hoveredZone, width, height, config]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ cursor: hoveredZone ? 'pointer' : 'default' }}
    />
  );
};

// Zone detail panel component
interface ZoneDetailProps {
  zone: MapZone;
  gameState: GameState;
}

export const ZoneDetail: React.FC<ZoneDetailProps> = ({ zone, gameState: _gameState }) => {
  void _gameState; // Available for future use
  const controller = zone.controller ? FACTIONS[zone.controller] : null;

  return (
    <div className="zone-detail">
      <h3>{zone.name}</h3>
      <div className="zone-type">{zone.type.replace('_', ' ').toUpperCase()}</div>

      {controller && (
        <div className="zone-controller" style={{ color: controller.color }}>
          Controlled by: {controller.shortName}
        </div>
      )}

      <div className="zone-resources">
        <h4>Resources</h4>
        <div className="resource-bar">
          <span>Oil</span>
          <div className="bar" style={{ width: `${zone.resources.oil * 10}%` }} />
          <span>{zone.resources.oil}/10</span>
        </div>
        <div className="resource-bar">
          <span>Gas</span>
          <div className="bar" style={{ width: `${zone.resources.gas * 10}%` }} />
          <span>{zone.resources.gas}/10</span>
        </div>
        <div className="resource-bar">
          <span>Minerals</span>
          <div className="bar" style={{ width: `${zone.resources.minerals * 10}%` }} />
          <span>{zone.resources.minerals}/10</span>
        </div>
        <div className="resource-bar">
          <span>Shipping</span>
          <div className="bar shipping" style={{ width: `${zone.resources.shipping * 10}%` }} />
          <span>{zone.resources.shipping}/10</span>
        </div>
      </div>

      <div className="zone-ice">
        Ice Coverage: {zone.iceMonths} months/year
      </div>

      {Object.keys(zone.militaryPresence).length > 0 && (
        <div className="zone-military">
          <h4>Military Presence</h4>
          {Object.entries(zone.militaryPresence).map(([factionId, strength]) => (
            <div key={factionId} style={{ color: FACTIONS[factionId as FactionId].color }}>
              {FACTIONS[factionId as FactionId].shortName}: {strength}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
