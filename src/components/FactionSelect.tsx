import { useEffect } from 'react';
import { FactionId } from '../types/game';
import { getPlayableFactions } from '../data/factions';
import { getChiptuneEngine } from '../audio/ChiptuneEngine';

interface FactionSelectProps {
  onSelect: (faction: FactionId) => void;
}

export const FactionSelect: React.FC<FactionSelectProps> = ({ onSelect }) => {
  const playableFactions = getPlayableFactions();

  // Start menu music
  useEffect(() => {
    const engine = getChiptuneEngine();
    engine.setMood('menu');
    engine.start();

    return () => {
      // Don't stop - let it continue into gameplay
    };
  }, []);

  return (
    <div className="faction-select-screen">
      <div className="title-container">
        <h1>ARCTIC DOMINION</h1>
        <h2>War Games Simulator 2030-2050</h2>
        <p className="tagline">The ice is melting. The great powers are converging.</p>
      </div>

      <div className="faction-selection">
        <h3>Select Your Faction</h3>
        <div className="faction-cards">
          {playableFactions.map(faction => (
            <div
              key={faction.id}
              className="faction-card"
              style={{ borderColor: faction.color }}
              onClick={() => onSelect(faction.id)}
            >
              <div className="faction-header" style={{ backgroundColor: faction.color }}>
                <h4>{faction.name}</h4>
              </div>
              <div className="faction-body">
                <p className="faction-desc">{faction.description}</p>
                <div className="faction-stats">
                  <div className="stat">
                    <span className="label">Influence</span>
                    <span className="value">{faction.resources.influencePoints}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Economy</span>
                    <span className="value">{faction.resources.economicOutput}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Icebreakers</span>
                    <span className="value">{faction.resources.icebreakerCapacity}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Military</span>
                    <span className="value">{faction.resources.militaryReadiness}%</span>
                  </div>
                </div>
                <div className="special-mechanic">
                  <strong>Special:</strong> {faction.specialMechanic}
                </div>
              </div>
              <button
                className="select-btn"
                style={{ backgroundColor: faction.color }}
              >
                Play as {faction.shortName}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="game-info">
        <h3>About the Game</h3>
        <p>
          Arctic Dominion is a turn-based strategic simulator modeling Arctic geopolitics
          from 2030 to 2050. Control major stakeholders competing for territorial control,
          resource extraction, shipping route dominance, and strategic positioning in a
          rapidly transforming Arctic.
        </p>
        <ul>
          <li><strong>20 turns</strong> representing 10 years of Arctic competition</li>
          <li><strong>Manage resources:</strong> Influence, Economy, Icebreakers, Military, Legitimacy</li>
          <li><strong>Take actions:</strong> Diplomatic, Economic, Military, and Covert operations</li>
          <li><strong>Navigate tensions:</strong> Balance cooperation and confrontation</li>
          <li><strong>Win conditions:</strong> Hegemonic control, Economic dominance, or Victory Points</li>
        </ul>
      </div>
    </div>
  );
};
