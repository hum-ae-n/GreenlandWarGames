import React, { useEffect, useRef, useState, Component, ErrorInfo, ReactNode } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
// CSS is imported globally in main.tsx to prevent mount/unmount issues
import { GameState, MapZone, FactionId } from '../types/game';

// Error boundary to catch Leaflet initialization failures
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Leaflet Map Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface ArcticMapLeafletProps {
  gameState: GameState;
  selectedZone: string | null;
  onZoneSelect: (zoneId: string | null) => void;
  width: number;
  height: number;
}

// Faction colors
const FACTION_COLORS: Record<FactionId | 'unclaimed', string> = {
  usa: '#3b82f6',
  russia: '#ef4444',
  china: '#eab308',
  eu: '#8b5cf6',
  canada: '#f97316',
  norway: '#06b6d4',
  denmark: '#ec4899',
  nato: '#22c55e',
  indigenous: '#84cc16',
  unclaimed: '#4b5563',
};

// Faction flags
const FACTION_FLAGS: Record<FactionId | 'unclaimed', string> = {
  usa: '🇺🇸',
  russia: '🇷🇺',
  china: '🇨🇳',
  eu: '🇪🇺',
  canada: '🇨🇦',
  norway: '🇳🇴',
  denmark: '🇩🇰',
  nato: '🏛️',
  indigenous: '🏔️',
  unclaimed: '❄️',
};

// Real-world approximate coordinates for each zone (lat, lng)
// These create polygon boundaries for each game zone
const ZONE_COORDINATES: Record<string, [number, number][]> = {
  // North Pole - central Arctic
  north_pole: [
    [88, -30], [88, 30], [88, 90], [88, 150], [88, -150], [88, -90]
  ],

  // Lomonosov Ridge - runs from Russia to Greenland
  lomonosov_ridge: [
    [85, 40], [87, 60], [87, 100], [85, 120], [83, 100], [83, 60]
  ],

  // Russian Sector
  murmansk: [
    [68, 28], [70, 28], [72, 35], [72, 45], [70, 45], [68, 40]
  ],

  kara: [
    [72, 55], [78, 55], [80, 70], [80, 90], [75, 90], [72, 75]
  ],

  laptev: [
    [72, 100], [78, 100], [80, 120], [80, 140], [75, 140], [72, 125]
  ],

  east_siberian: [
    [70, 145], [75, 145], [78, 160], [78, 175], [73, 175], [70, 165]
  ],

  chukchi_ru: [
    [66, 172], [72, 172], [74, -175], [74, -168], [70, -168], [66, -175]
  ],

  nsr_west: [
    [75, 45], [80, 50], [82, 70], [80, 85], [77, 80], [75, 60]
  ],

  nsr_east: [
    [75, 140], [80, 145], [82, 165], [80, 175], [77, 170], [75, 155]
  ],

  // US Sector (Alaska)
  alaska: [
    [64, -168], [68, -168], [70, -155], [70, -145], [66, -145], [64, -155]
  ],

  beaufort_us: [
    [70, -155], [74, -155], [76, -145], [76, -140], [73, -140], [70, -145]
  ],

  bering_us: [
    [64, -172], [66, -172], [66, -168], [66, -165], [64, -165], [64, -168]
  ],

  // Canadian Sector
  beaufort_ca: [
    [70, -140], [76, -140], [78, -125], [76, -115], [72, -115], [70, -125]
  ],

  canadian_archipelago: [
    [74, -115], [80, -100], [82, -85], [80, -70], [76, -75], [74, -95]
  ],

  nwp_west: [
    [68, -125], [72, -120], [74, -110], [72, -100], [68, -105], [66, -115]
  ],

  nwp_east: [
    [72, -85], [76, -80], [78, -65], [76, -55], [72, -60], [70, -75]
  ],

  // Greenland/Denmark Sector
  greenland_north: [
    [80, -55], [83, -45], [83, -25], [80, -20], [78, -30], [78, -50]
  ],

  greenland_south: [
    [72, -55], [78, -55], [78, -35], [75, -25], [70, -35], [70, -50]
  ],

  greenland_east: [
    [70, -25], [76, -20], [78, -5], [76, 5], [72, 0], [70, -15]
  ],

  // Norwegian Sector
  svalbard: [
    [76, 10], [80, 10], [80, 25], [80, 30], [76, 30], [76, 18]
  ],

  barents_no: [
    [70, 15], [75, 20], [76, 30], [74, 40], [70, 35], [69, 25]
  ],

  norwegian_sea: [
    [65, -5], [70, 0], [72, 12], [70, 18], [66, 12], [64, 5]
  ],

  // Strategic Chokepoints
  giuk_gap: [
    [60, -30], [65, -20], [67, -5], [65, 5], [60, 0], [58, -15]
  ],

  fram_strait: [
    [78, -10], [82, -5], [82, 10], [80, 15], [78, 10], [77, 0]
  ],

  // Central contested areas
  high_arctic_west: [
    [82, -90], [86, -60], [86, -30], [84, -20], [82, -40], [80, -70]
  ],

  high_arctic_east: [
    [82, 0], [86, 20], [86, 50], [84, 60], [82, 45], [80, 20]
  ],
};

// Component to handle map resize
const MapResizer: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const map = useMap();
  const prevSize = useRef({ width, height });

  // Force map to recalculate on mount - critical for Netlify
  useEffect(() => {
    if (!map) return;

    // Multiple invalidations to ensure proper rendering
    const timers = [
      setTimeout(() => { try { map.invalidateSize(); } catch (e) { console.warn('Map resize error:', e); } }, 0),
      setTimeout(() => { try { map.invalidateSize(); } catch (e) { console.warn('Map resize error:', e); } }, 100),
      setTimeout(() => { try { map.invalidateSize(); } catch (e) { console.warn('Map resize error:', e); } }, 300),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [map]);

  useEffect(() => {
    if (!map) return;
    if (prevSize.current.width !== width || prevSize.current.height !== height) {
      // Debounce resize to avoid excessive redraws
      const timer = setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {
          console.warn('Map resize error:', e);
        }
        prevSize.current = { width, height };
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map, width, height]);

  return null;
};

// Zone polygon component
const ZonePolygon: React.FC<{
  zone: MapZone;
  isSelected: boolean;
  isPlayerZone: boolean;
  onSelect: () => void;
}> = ({ zone, isSelected, isPlayerZone, onSelect }) => {
  const coordinates = ZONE_COORDINATES[zone.id];
  if (!coordinates) return null;

  const color = zone.controller
    ? FACTION_COLORS[zone.controller as FactionId]
    : FACTION_COLORS.unclaimed;

  const flag = zone.controller
    ? (FACTION_FLAGS[zone.controller as FactionId] || '❄️')
    : '❄️';

  return (
    <Polygon
      positions={coordinates}
      pathOptions={{
        color: isSelected ? '#ffffff' : color,
        fillColor: color,
        fillOpacity: isSelected ? 0.7 : (isPlayerZone ? 0.6 : 0.4),
        weight: isSelected ? 3 : (isPlayerZone ? 2 : 1),
        dashArray: zone.contestedBy.length > 0 ? '5, 5' : undefined,
      }}
      eventHandlers={{
        click: (e) => {
          // Stop propagation using native event (react-leaflet v5 compatible)
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          onSelect();
        },
      }}
    >
      {/* Simple hover tooltip instead of permanent - more compatible with v5 */}
      <Tooltip direction="top" className="zone-tooltip">
        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
          {flag} {zone.name} ({zone.controller?.toUpperCase() || 'UNCLAIMED'})
        </span>
      </Tooltip>
    </Polygon>
  );
};

// Loading spinner component
const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading World Map...' }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a1628',
    color: '#88ccff',
    fontFamily: 'monospace',
    zIndex: 1000,
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #1a3a5c',
      borderTop: '3px solid #88ccff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <div style={{ marginTop: '16px', fontSize: '12px' }}>{message}</div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Error fallback component
const ErrorFallback: React.FC<{ error?: Error | null; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div style={{
    width: '100%',
    height: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a1628',
    color: '#ff6b6b',
    fontFamily: 'monospace',
    padding: '20px',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
      World Map Failed to Load
    </div>
    <div style={{ fontSize: '11px', color: '#888', marginBottom: '16px', maxWidth: '300px' }}>
      {error?.message || 'The map tiles could not be loaded. Try switching to 2D mode.'}
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          background: '#1a3a5c',
          border: '1px solid #3b82f6',
          color: '#88ccff',
          fontFamily: 'monospace',
          fontSize: '11px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    )}
  </div>
);

// Inner map component that handles the actual Leaflet rendering
const LeafletMapInner: React.FC<ArcticMapLeafletProps & { onLoad: () => void; onError: (e: Error) => void }> = ({
  gameState,
  selectedZone,
  onZoneSelect,
  width,
  height,
  onLoad,
  onError,
}) => {
  const arcticCenter: [number, number] = [75, 0];
  const defaultZoom = 2;
  const [mapReady, setMapReady] = useState(false);

  // Check if we're in a browser environment
  useEffect(() => {
    try {
      if (typeof window === 'undefined') {
        onError(new Error('Window is not defined'));
        return;
      }
      // Check if Leaflet loaded correctly
      if (typeof L === 'undefined') {
        onError(new Error('Leaflet library failed to load'));
      }
    } catch (e) {
      onError(e instanceof Error ? e : new Error('Unknown error checking environment'));
    }
  }, [onError]);

  const handleMapReady = () => {
    setMapReady(true);
    onLoad();
  };

  // Defensive check for zones
  const zones = gameState?.zones || {};

  return (
    <MapContainer
      center={arcticCenter}
      zoom={defaultZoom}
      style={{ width: '100%', height: '100%' }}
      minZoom={1}
      maxZoom={6}
      maxBounds={[[50, -180], [90, 180]]}
      maxBoundsViscosity={0.8}
      whenReady={handleMapReady}
    >
      <MapResizer width={width} height={height} />

      {/* Dark themed tile layer - CartoDB Dark Matter */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Zone polygons - only render when map is ready */}
      {mapReady && Object.entries(zones).map(([zoneId, zone]) => (
        <ZonePolygon
          key={zoneId}
          zone={zone}
          isSelected={selectedZone === zoneId}
          isPlayerZone={zone.controller === gameState.playerFaction}
          onSelect={() => onZoneSelect(selectedZone === zoneId ? null : zoneId)}
        />
      ))}
    </MapContainer>
  );
};

export const ArcticMapLeaflet: React.FC<ArcticMapLeafletProps> = ({
  gameState,
  selectedZone,
  onZoneSelect,
  width,
  height,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use explicit pixel dimensions to ensure Leaflet initializes correctly
  const containerHeight = height > 0 ? height : 500;
  const containerWidth = width > 0 ? width : '100%';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (error: Error) => {
    setErrorInfo(error);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setErrorInfo(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  // Auto-hide loading after timeout (fallback)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isLoading, retryCount]);

  return (
    <div style={{
      width: containerWidth,
      height: containerHeight,
      minHeight: '400px',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#0a1628',
      position: 'relative',
    }}>
      <MapErrorBoundary
        fallback={<ErrorFallback error={errorInfo} onRetry={handleRetry} />}
        onError={handleError}
        key={retryCount}
      >
        <LeafletMapInner
          gameState={gameState}
          selectedZone={selectedZone}
          onZoneSelect={onZoneSelect}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
        />
      </MapErrorBoundary>

      {isLoading && <LoadingOverlay />}

      {/* Custom styles for tooltips */}
      <style>{`
        .zone-tooltip {
          background: rgba(10, 22, 40, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 4px !important;
          padding: 4px 6px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
        }
        .zone-tooltip::before {
          display: none !important;
        }
        .leaflet-container {
          background: #0a1628 !important;
          font-family: 'Press Start 2P', monospace !important;
        }
        .leaflet-control-attribution {
          background: rgba(10, 22, 40, 0.8) !important;
          color: #666 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #888 !important;
        }
        .leaflet-control-zoom a {
          background: rgba(10, 22, 40, 0.9) !important;
          color: #fff !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(30, 50, 80, 0.9) !important;
        }
      `}</style>
    </div>
  );
};

export default ArcticMapLeaflet;
