import { useEffect, useState } from 'react';
import { FactionId } from '../types/game';
import { getPlayableFactions } from '../data/factions';
import { getChiptuneEngine } from '../audio/ChiptuneEngine';
import { PixelPortrait, LeaderId, LEADER_NAMES } from './PixelArt';
import './FactionSelect.css';

interface FactionSelectProps {
  onSelect: (faction: FactionId) => void;
}

// All world leaders for the showcase
const ALL_LEADERS: { id: LeaderId; faction: string; color: string }[] = [
  { id: 'trump', faction: 'USA', color: '#3b5998' },
  { id: 'putin', faction: 'Russia', color: '#cc0000' },
  { id: 'xi', faction: 'China', color: '#de2910' },
  { id: 'trudeau', faction: 'Canada', color: '#ff0000' },
  { id: 'frederiksen', faction: 'Denmark', color: '#c8102e' },
  { id: 'store', faction: 'Norway', color: '#ba0c2f' },
  { id: 'nato_chief', faction: 'NATO', color: '#004990' },
  { id: 'kim', faction: 'DPRK', color: '#024fa2' },
  { id: 'macron', faction: 'France', color: '#0055a4' },
  { id: 'scholz', faction: 'Germany', color: '#ffcc00' },
  { id: 'starmer', faction: 'UK', color: '#c8102e' },
  { id: 'eu_president', faction: 'EU', color: '#003399' },
  { id: 'stubb', faction: 'Finland', color: '#003580' },
  { id: 'modi', faction: 'India', color: '#ff9933' },
  { id: 'erdogan', faction: 'Turkey', color: '#e30a17' },
  { id: 'indigenous_elder', faction: 'Arctic Council', color: '#2e8b57' },
];

// Map faction to leader
const FACTION_LEADERS: Record<FactionId, LeaderId> = {
  usa: 'trump',
  russia: 'putin',
  china: 'xi',
  eu: 'eu_president',
  canada: 'trudeau',
  denmark: 'frederiksen',
  norway: 'store',
  nato: 'nato_chief',
  indigenous: 'indigenous_elder',
};

export const FactionSelect: React.FC<FactionSelectProps> = ({ onSelect }) => {
  const playableFactions = getPlayableFactions();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [hoveredFaction, setHoveredFaction] = useState<FactionId | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<LeaderId | null>(null);

  // Start menu music
  useEffect(() => {
    const engine = getChiptuneEngine();
    engine.setMood('menu');
    if (musicEnabled) {
      engine.start();
      engine.setVolume(volume / 100);
    } else {
      engine.stop();
    }

    return () => {
      // Don't stop - let it continue into gameplay
    };
  }, [musicEnabled, volume]);

  const toggleMusic = () => {
    const engine = getChiptuneEngine();
    if (musicEnabled) {
      engine.stop();
    } else {
      engine.start();
    }
    setMusicEnabled(!musicEnabled);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    getChiptuneEngine().setVolume(newVolume / 100);
  };

  return (
    <div className="faction-select-screen">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="ice-particle"></div>
        <div className="ice-particle"></div>
        <div className="ice-particle"></div>
        <div className="ice-particle"></div>
        <div className="ice-particle"></div>
      </div>

      {/* Audio Controls */}
      <div className="audio-controls-menu">
        <button className="audio-toggle" onClick={toggleMusic}>
          {musicEnabled ? '🔊' : '🔇'}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>

      {/* Title Section */}
      <div className="title-container">
        <div className="title-glow">
          <h1>
            <span className="title-arctic">ARCTIC</span>
            <span className="title-dominion">DOMINION</span>
          </h1>
        </div>
        <h2>War Games Simulator 2030-2050</h2>
        <p className="tagline">The ice is melting. The great powers are converging.</p>
      </div>

      {/* World Leaders Showcase */}
      <div className="leaders-showcase">
        <h3>🌍 World Leaders</h3>
        <div className="leaders-carousel">
          {ALL_LEADERS.map((leader) => (
            <div
              key={leader.id}
              className={`leader-preview ${selectedLeader === leader.id ? 'selected' : ''}`}
              style={{ borderColor: leader.color }}
              onClick={() => setSelectedLeader(selectedLeader === leader.id ? null : leader.id)}
            >
              <PixelPortrait leader={leader.id} size={48} />
              <span className="leader-faction" style={{ color: leader.color }}>
                {leader.faction}
              </span>
            </div>
          ))}
        </div>
        {selectedLeader && (
          <div className="leader-spotlight">
            <PixelPortrait leader={selectedLeader} size={96} />
            <div className="spotlight-info">
              <span className="spotlight-name">{LEADER_NAMES[selectedLeader]}</span>
              <span className="spotlight-faction">
                {ALL_LEADERS.find(l => l.id === selectedLeader)?.faction}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Faction Selection */}
      <div className="faction-selection">
        <h3>⚔️ Choose Your Faction</h3>
        <div className="faction-cards">
          {playableFactions.map(faction => {
            const leaderId = FACTION_LEADERS[faction.id];
            const isHovered = hoveredFaction === faction.id;

            return (
              <div
                key={faction.id}
                className={`faction-card ${isHovered ? 'hovered' : ''}`}
                style={{
                  borderColor: faction.color,
                  boxShadow: isHovered ? `0 0 30px ${faction.color}60` : 'none'
                }}
                onClick={() => onSelect(faction.id)}
                onMouseEnter={() => setHoveredFaction(faction.id)}
                onMouseLeave={() => setHoveredFaction(null)}
              >
                <div className="faction-header" style={{ backgroundColor: faction.color }}>
                  <div className="faction-leader-portrait">
                    <PixelPortrait leader={leaderId} size={64} />
                  </div>
                  <div className="faction-title">
                    <h4>{faction.name}</h4>
                    <span className="leader-name">{LEADER_NAMES[leaderId]}</span>
                  </div>
                </div>
                <div className="faction-body">
                  <p className="faction-desc">{faction.description}</p>
                  <div className="faction-stats">
                    <div className="stat">
                      <span className="stat-icon">🌐</span>
                      <span className="stat-value">{faction.resources.influencePoints}</span>
                      <span className="stat-label">Influence</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">💰</span>
                      <span className="stat-value">{faction.resources.economicOutput}</span>
                      <span className="stat-label">Economy</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">🚢</span>
                      <span className="stat-value">{faction.resources.icebreakerCapacity}</span>
                      <span className="stat-label">Ships</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">⚔️</span>
                      <span className="stat-value">{faction.resources.militaryReadiness}%</span>
                      <span className="stat-label">Military</span>
                    </div>
                  </div>
                  <div className="special-mechanic">
                    <span className="special-icon">⭐</span>
                    <span>{faction.specialMechanic}</span>
                  </div>
                </div>
                <button
                  className="select-btn"
                  style={{ backgroundColor: faction.color }}
                >
                  Play as {faction.shortName}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Win */}
      <div className="how-to-win">
        <h3>🏆 How to Win</h3>
        <div className="victory-conditions">
          <div className="victory-card">
            <span className="victory-icon">👑</span>
            <h4>Hegemonic Victory</h4>
            <p>Control 60% or more of all Arctic zones</p>
          </div>
          <div className="victory-card">
            <span className="victory-icon">💎</span>
            <h4>Economic Victory</h4>
            <p>Accumulate 500+ economic output</p>
          </div>
          <div className="victory-card">
            <span className="victory-icon">🎯</span>
            <h4>Points Victory</h4>
            <p>Highest victory points after 20 turns</p>
          </div>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="quick-guide">
        <h3>📖 Quick Guide</h3>
        <div className="guide-steps">
          <div className="guide-step">
            <span className="step-number">1</span>
            <span className="step-text">Select zones on the map to claim territory</span>
          </div>
          <div className="guide-step">
            <span className="step-number">2</span>
            <span className="step-text">Use Actions tab for diplomacy & economics</span>
          </div>
          <div className="guide-step">
            <span className="step-number">3</span>
            <span className="step-text">Build military units in the Military tab</span>
          </div>
          <div className="guide-step">
            <span className="step-number">4</span>
            <span className="step-text">Watch tension levels - avoid nuclear war!</span>
          </div>
          <div className="guide-step">
            <span className="step-number">5</span>
            <span className="step-text">End turn to advance time and trigger events</span>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="credits">
        <div className="credits-content">
          <span className="credits-label">Created by</span>
          <span className="credits-names">
            <span className="credit-claude">Claude</span>
            <span className="credit-and">&</span>
            <span className="credit-kaipability">Kaipability</span>
          </span>
        </div>
        <div className="version">v0.10</div>
      </div>
    </div>
  );
};
