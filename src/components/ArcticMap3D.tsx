import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, MapZone, FactionId } from '../types/game';

interface ArcticMap3DProps {
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

// Faction flags (emoji)
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

// Faction short names for 3D labels
const FACTION_LABELS: Record<FactionId | 'unclaimed', string> = {
  usa: 'USA',
  russia: 'RUS',
  china: 'CHN',
  eu: 'EU',
  canada: 'CAN',
  norway: 'NOR',
  denmark: 'DEN',
  nato: 'NATO',
  indigenous: 'IND',
  unclaimed: '---',
};

// Geography data - approximate positions for major landmasses
const GEOGRAPHY = {
  // Greenland - center of map
  greenland: {
    position: [0, 0.05, 0] as [number, number, number],
    scale: [1.2, 0.15, 1.5] as [number, number, number],
    color: '#e8e8e8',
  },
  // North America (Alaska/Canada)
  northAmerica: {
    position: [-2.5, 0.03, 1] as [number, number, number],
    scale: [1.5, 0.1, 2] as [number, number, number],
    color: '#d4c4a8',
  },
  // Russia/Siberia
  russia: {
    position: [2, 0.03, -1.5] as [number, number, number],
    scale: [2, 0.08, 1.2] as [number, number, number],
    color: '#c9b896',
  },
  // Scandinavia
  scandinavia: {
    position: [1.5, 0.03, 2] as [number, number, number],
    scale: [0.8, 0.1, 1.2] as [number, number, number],
    color: '#b8d4b8',
  },
  // Svalbard
  svalbard: {
    position: [0.8, 0.08, 1.2] as [number, number, number],
    scale: [0.3, 0.12, 0.25] as [number, number, number],
    color: '#ffffff',
  },
  // Iceland
  iceland: {
    position: [-0.5, 0.06, 2.2] as [number, number, number],
    scale: [0.4, 0.1, 0.3] as [number, number, number],
    color: '#a8c4d8',
  },
};

// Landmass component
const Landmass: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
}> = ({ position, scale, color, name }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={scale}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {/* Snow cap on top */}
      <mesh position={[0, scale[1] / 2 + 0.01, 0]} scale={[scale[0] * 0.8, 0.02, scale[2] * 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {hovered && (
        <Html position={[0, scale[1] + 0.3, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

// Ice Hex component - represents a zone
interface IceHexProps {
  zone: MapZone;
  position: [number, number, number];
  isSelected: boolean;
  isPlayerZone: boolean;
  onClick: () => void;
  iceExtent: number;
}

const IceHex: React.FC<IceHexProps> = ({ zone, position, isSelected, isPlayerZone, onClick, iceExtent }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = zone.controller
    ? FACTION_COLORS[zone.controller as FactionId]
    : FACTION_COLORS.unclaimed;

  // Calculate ice height based on ice extent and zone's iceMonths
  const iceHeight = 0.1 + (zone.iceMonths / 12) * (iceExtent / 100) * 0.3;

  // Animate hover/selection
  useFrame(() => {
    if (meshRef.current) {
      const targetY = position[1] + (hovered ? 0.1 : 0) + (isSelected ? 0.15 : 0);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Ice/Land hex */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.35, 0.38, iceHeight, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected || isPlayerZone ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : (isPlayerZone ? 0.2 : 0)}
          metalness={0.1}
          roughness={0.8}
          transparent
          opacity={hovered ? 1 : 0.9}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, iceHeight + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.45, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Flag/Label always visible - larger and more prominent */}
      <Html position={[0, iceHeight + 0.25, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
        }}>
          <div style={{
            fontSize: '24px',
            textShadow: '0 0 6px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
          }}>
            {FACTION_FLAGS[zone.controller as FactionId] || FACTION_FLAGS.unclaimed}
          </div>
          <div style={{
            fontSize: '9px',
            fontWeight: 'bold',
            color: '#fff',
            background: 'rgba(0,0,0,0.7)',
            padding: '1px 4px',
            borderRadius: '2px',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}>
            {FACTION_LABELS[zone.controller as FactionId] || FACTION_LABELS.unclaimed}
          </div>
        </div>
      </Html>

      {/* Zone label on hover */}
      {hovered && (
        <Html position={[0, 0.6, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: `2px solid ${color}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{zone.name}</div>
            <div style={{ fontSize: '10px', color: '#aaa' }}>
              {zone.controller ? zone.controller.toUpperCase() : 'Unclaimed'}
            </div>
            {zone.resources.oil > 0 && <div style={{ fontSize: '9px', color: '#ffd700' }}>🛢️ Oil: {zone.resources.oil}</div>}
            {zone.resources.gas > 0 && <div style={{ fontSize: '9px', color: '#87ceeb' }}>⛽ Gas: {zone.resources.gas}</div>}
          </div>
        </Html>
      )}

      {/* Military presence indicator */}
      {zone.militaryPresence && Object.values(zone.militaryPresence).some((v: number | undefined) => v && v > 0) && (
        <mesh position={[0, iceHeight + 0.1, 0]}>
          <boxGeometry args={[0.08, 0.15, 0.08]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
};

// Military unit models
interface MilitaryUnitProps {
  type: string;
  position: [number, number, number];
  owner: FactionId;
}

const MilitaryUnit: React.FC<MilitaryUnitProps> = ({ type, position, owner }) => {
  const meshRef = useRef<THREE.Group>(null);
  const color = FACTION_COLORS[owner];

  // Animate the unit
  useFrame(({ clock }) => {
    if (meshRef.current) {
      if (type === 'submarine') {
        // Submarines bob slowly
        meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.02;
      } else if (type === 'aircraft_carrier' || type === 'destroyer' || type === 'patrol_ship') {
        // Ships rock gently
        meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.05;
        meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.3) * 0.01;
      } else if (type === 'fighter_wing' || type === 'bomber_squadron') {
        // Aircraft circle
        const angle = clock.elapsedTime * 0.5;
        meshRef.current.position.x = position[0] + Math.cos(angle) * 0.2;
        meshRef.current.position.z = position[2] + Math.sin(angle) * 0.2;
        meshRef.current.rotation.y = angle + Math.PI / 2;
      }
    }
  });

  // Different models for different unit types
  const renderUnitModel = () => {
    switch (type) {
      case 'submarine':
        return (
          <Float speed={1} floatIntensity={0.5}>
            <mesh>
              <capsuleGeometry args={[0.03, 0.15, 8, 16]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Conning tower */}
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.02, 0.03, 0.04]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          </Float>
        );

      case 'aircraft_carrier':
        return (
          <group>
            {/* Hull */}
            <mesh>
              <boxGeometry args={[0.12, 0.03, 0.25]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Flight deck */}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.1, 0.01, 0.22]} />
              <meshStandardMaterial color="#333" metalness={0.3} roughness={0.6} />
            </mesh>
            {/* Island */}
            <mesh position={[0.04, 0.04, 0]}>
              <boxGeometry args={[0.03, 0.04, 0.05]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        );

      case 'destroyer':
      case 'patrol_ship':
        return (
          <group>
            {/* Hull */}
            <mesh>
              <boxGeometry args={[0.04, 0.02, 0.12]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Superstructure */}
            <mesh position={[0, 0.02, -0.02]}>
              <boxGeometry args={[0.02, 0.02, 0.04]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        );

      case 'icebreaker':
        return (
          <group>
            {/* Hull - thicker */}
            <mesh>
              <boxGeometry args={[0.06, 0.03, 0.15]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Bow - reinforced */}
            <mesh position={[0, 0, 0.08]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.05, 0.04, 0.04]} />
              <meshStandardMaterial color="#ff6600" metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        );

      case 'fighter_wing':
        return (
          <Float speed={2} floatIntensity={1}>
            <mesh rotation={[0, 0, Math.PI / 6]}>
              <coneGeometry args={[0.02, 0.06, 3]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
          </Float>
        );

      case 'bomber_squadron':
        return (
          <Float speed={1.5} floatIntensity={0.8}>
            <mesh>
              <boxGeometry args={[0.08, 0.015, 0.04]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Wings */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.02, 0.01, 0.12]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
          </Float>
        );

      case 'base':
      case 'missile_battery':
        return (
          <group>
            {/* Base platform */}
            <mesh>
              <cylinderGeometry args={[0.05, 0.06, 0.02, 8]} />
              <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Tower/radar */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.01, 0.02, 0.06, 8]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Radar dish */}
            <mesh position={[0, 0.07, 0.02]} rotation={[Math.PI / 4, 0, 0]}>
              <circleGeometry args={[0.02, 8]} />
              <meshStandardMaterial color="#fff" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };

  return (
    <group ref={meshRef} position={position}>
      {renderUnitModel()}
    </group>
  );
};

// Arctic water/ocean with animated waves
const ArcticOcean: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  useFrame(({ clock }) => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position;
      const time = clock.elapsedTime;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        // Create gentle wave motion
        const wave1 = Math.sin(x * 0.5 + time * 0.5) * 0.03;
        const wave2 = Math.sin(y * 0.3 + time * 0.3) * 0.02;
        const wave3 = Math.sin((x + y) * 0.2 + time * 0.7) * 0.015;
        positions.setZ(i, wave1 + wave2 + wave3);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
      <planeGeometry ref={geometryRef} args={[25, 25, 48, 48]} />
      <meshStandardMaterial
        color="#1a4a6c"
        metalness={0.4}
        roughness={0.6}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
};

// Aurora Borealis effect
const Aurora: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [particles] = useState(() => {
    // Create aurora particle positions
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 6 + Math.random() * 2;
      positions.push([
        Math.cos(angle) * radius,
        3 + Math.random() * 2,
        Math.sin(angle) * radius,
      ]);
    }
    return positions;
  });

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.02;
      // Animate children
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const phase = i * 0.3;
          child.position.y = 3 + Math.sin(clock.elapsedTime * 0.5 + phase) * 0.5;
          child.scale.y = 1 + Math.sin(clock.elapsedTime * 0.8 + phase) * 0.3;
          const material = child.material as THREE.MeshBasicMaterial;
          material.opacity = 0.2 + Math.sin(clock.elapsedTime * 0.3 + phase) * 0.15;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <planeGeometry args={[0.3, 2]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#00ffcc' : '#88ffaa'}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Floating ice chunks in the ocean
const IceChunks: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [chunks] = useState(() => {
    const positions: { pos: [number, number, number]; scale: number; speed: number }[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 4;
      positions.push({
        pos: [
          Math.cos(angle) * radius,
          -0.05,
          Math.sin(angle) * radius,
        ],
        scale: 0.05 + Math.random() * 0.1,
        speed: 0.3 + Math.random() * 0.5,
      });
    }
    return positions;
  });

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const chunk = chunks[i];
          // Gentle bobbing motion
          child.position.y = -0.05 + Math.sin(clock.elapsedTime * chunk.speed) * 0.02;
          child.rotation.y = clock.elapsedTime * 0.1 * chunk.speed;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {chunks.map((chunk, i) => (
        <mesh key={i} position={chunk.pos} scale={chunk.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#e0f0ff"
            roughness={0.3}
            metalness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

// Camera controller with smooth movement
const CameraController: React.FC = () => {
  const { camera } = useThree();

  // Initial camera position
  useEffect(() => {
    camera.position.set(3, 4, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={Math.PI / 6}
    />
  );
};

// Main 3D scene
const ArcticScene: React.FC<{
  gameState: GameState;
  selectedZone: string | null;
  onZoneSelect: (zoneId: string | null) => void;
}> = ({ gameState, selectedZone, onZoneSelect }) => {

  // Generate zone positions
  const zonePositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    const zones = Object.entries(gameState.zones);

    // Arrange zones in a spiral/grid pattern
    let index = 0;
    const rings = 3;

    for (let ring = 0; ring <= rings; ring++) {
      if (ring === 0) {
        // Center zone
        if (index < zones.length) {
          positions[zones[index][0]] = [0, 0, 0];
          index++;
        }
      } else {
        // Each ring has 6 * ring hexes
        const hexesInRing = 6 * ring;
        for (let i = 0; i < hexesInRing && index < zones.length; i++) {
          const angle = (i / hexesInRing) * Math.PI * 2;
          const radius = ring * 0.9;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          positions[zones[index][0]] = [x, 0, z];
          index++;
        }
      }
    }

    return positions;
  }, [gameState.zones]);

  // Get military units by zone
  const unitsByZone = useMemo(() => {
    const byZone: Record<string, typeof gameState.militaryUnits> = {};
    for (const unit of gameState.militaryUnits) {
      if (unit.status !== 'destroyed' && unit.location) {
        if (!byZone[unit.location]) {
          byZone[unit.location] = [];
        }
        byZone[unit.location].push(unit);
      }
    }
    return byZone;
  }, [gameState.militaryUnits]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#aaccff" />

      {/* Camera controls */}
      <PerspectiveCamera makeDefault fov={50} position={[3, 4, 5]} />
      <CameraController />

      {/* Arctic ocean */}
      <ArcticOcean />

      {/* Floating ice chunks */}
      <IceChunks />

      {/* Aurora Borealis */}
      <Aurora />

      {/* Geography - major landmasses */}
      <Landmass {...GEOGRAPHY.greenland} name="Greenland" />
      <Landmass {...GEOGRAPHY.northAmerica} name="North America" />
      <Landmass {...GEOGRAPHY.russia} name="Russia" />
      <Landmass {...GEOGRAPHY.scandinavia} name="Scandinavia" />
      <Landmass {...GEOGRAPHY.svalbard} name="Svalbard" />
      <Landmass {...GEOGRAPHY.iceland} name="Iceland" />

      {/* North Pole marker */}
      <group position={[0, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#ff0000" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <Html position={[0, 0.5, 0]} center>
          <div style={{
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#fff',
            background: 'rgba(255,0,0,0.8)',
            padding: '2px 6px',
            borderRadius: '3px',
            whiteSpace: 'nowrap',
          }}>
            NORTH POLE
          </div>
        </Html>
      </group>

      {/* Stars in background */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* Ice hexes for each zone */}
      {Object.entries(gameState.zones).map(([zoneId, zone]) => {
        const position = zonePositions[zoneId] || [0, 0, 0];
        const isSelected = selectedZone === zoneId;
        const isPlayerZone = zone.controller === gameState.playerFaction;

        return (
          <IceHex
            key={zoneId}
            zone={zone}
            position={position}
            isSelected={isSelected}
            isPlayerZone={isPlayerZone}
            onClick={() => onZoneSelect(isSelected ? null : zoneId)}
            iceExtent={gameState.globalIceExtent}
          />
        );
      })}

      {/* Military units */}
      {Object.entries(unitsByZone).map(([zoneId, units]) => {
        const basePosition = zonePositions[zoneId];
        if (!basePosition) return null;

        return units.map((unit, idx) => {
          // Offset units slightly so they don't overlap
          const angle = (idx / units.length) * Math.PI * 2;
          const position: [number, number, number] = [
            basePosition[0] + Math.cos(angle) * 0.2,
            basePosition[1] + 0.15 + (unit.type === 'submarine' ? -0.1 : 0) + ((unit.type && (unit.type.includes('fighter') || unit.type.includes('bomber'))) ? 0.3 : 0),
            basePosition[2] + Math.sin(angle) * 0.2,
          ];

          return (
            <MilitaryUnit
              key={unit.id}
              type={unit.type}
              position={position}
              owner={unit.owner as FactionId}
            />
          );
        });
      })}

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#0a1525', 8, 20]} />
    </>
  );
};

// Main component with Canvas
export const ArcticMap3D: React.FC<ArcticMap3DProps> = ({
  gameState,
  selectedZone,
  onZoneSelect,
  width,
  height,
}) => {
  return (
    <div style={{ width, height, borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas shadows>
        <ArcticScene
          gameState={gameState}
          selectedZone={selectedZone}
          onZoneSelect={onZoneSelect}
        />
      </Canvas>
    </div>
  );
};

export default ArcticMap3D;
