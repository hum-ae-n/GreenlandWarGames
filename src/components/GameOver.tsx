import { useState, useEffect } from 'react';
import { GameState, FactionId } from '../types/game';
import { FACTIONS } from '../data/factions';
import { PixelPortrait, LeaderId, LEADER_NAMES } from './PixelArt';
import { getLeaderReaction, getLeaderForFaction, LEADERS } from '../game/leaders';
import { getChiptuneEngine } from '../audio/ChiptuneEngine';
import {
  getGameEndState,
  VICTORY_CONDITIONS,
  DEFEAT_CONDITIONS,
  VictoryType,
  DefeatType,
} from '../game/victory';
import './GameOver.css';

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
}

// All leaders for the celebration
const ALL_LEADERS: LeaderId[] = [
  'trump', 'putin', 'xi', 'kim',
  'starmer', 'macron', 'scholz', 'carney',
  'nato_chief', 'eu_president', 'frederiksen', 'store',
  'stubb', 'modi', 'erdogan', 'indigenous_elder'
];

// Victory-specific imagery
const VICTORY_IMAGERY: Record<VictoryType, { icon: string; title: string; subtitle: string }> = {
  hegemonic: { icon: '👑', title: 'ARCTIC HEGEMON', subtitle: 'Total Dominance Achieved' },
  economic: { icon: '💰', title: 'ECONOMIC SUPERPOWER', subtitle: 'Wealth Beyond Measure' },
  nobel_peace: { icon: '🕊️', title: 'NOBEL PEACE PRIZE', subtitle: 'Bringer of Peace' },
  scientific: { icon: '🔬', title: 'CLIMATE SAVIOR', subtitle: 'Hero of Science' },
  diplomatic: { icon: '🤝', title: 'GRAND ALLIANCE', subtitle: 'Master Diplomat' },
  military: { icon: '⚔️', title: 'SUPREME COMMANDER', subtitle: 'Unchallenged Military Might' },
  survival: { icon: '🏆', title: 'SURVIVOR', subtitle: 'Last One Standing' },
};

// Defeat-specific imagery
const DEFEAT_IMAGERY: Record<DefeatType, { icon: string; title: string; subtitle: string }> = {
  nuclear_apocalypse: { icon: '☢️', title: 'NUCLEAR ANNIHILATION', subtitle: 'There are no winners.' },
  climate_catastrophe: { icon: '🌊', title: 'CLIMATE CATASTROPHE', subtitle: 'The ice is gone forever.' },
  regime_collapse: { icon: '💀', title: 'REGIME COLLAPSE', subtitle: 'The people have spoken.' },
  total_defeat: { icon: '🏳️', title: 'TOTAL DEFEAT', subtitle: 'All is lost.' },
  assassination: { icon: '🎯', title: 'ASSASSINATION', subtitle: 'The leader has fallen.' },
};

export const GameOver: React.FC<GameOverProps> = ({ gameState, onRestart }) => {
  const endState = getGameEndState(gameState);
  const winner = gameState.winner ? FACTIONS[gameState.winner] : null;
  const isPlayerWinner = gameState.winner === gameState.playerFaction;
  const isVictory = endState.victory !== null;
  const isDefeat = endState.defeat !== null;

  const [currentSpeaker, setCurrentSpeaker] = useState<LeaderId | null>(null);
  const [speakerMessage, setSpeakerMessage] = useState('');
  const [showConfetti] = useState(isPlayerWinner);

  const winnerLeader = gameState.winner ? getLeaderForFaction(gameState.winner) : null;

  // Get victory/defeat info
  const victoryInfo = endState.victory ? VICTORY_IMAGERY[endState.victory] : null;
  const defeatInfo = endState.defeat ? DEFEAT_IMAGERY[endState.defeat] : null;
  const victoryCondition = endState.victory ? VICTORY_CONDITIONS.find(v => v.id === endState.victory) : null;
  // Defeat condition info available in defeatInfo from DEFEAT_IMAGERY
  void DEFEAT_CONDITIONS; // Reference to prevent unused import warning

  // Play appropriate music
  useEffect(() => {
    const engine = getChiptuneEngine();
    if (endState.defeat === 'nuclear_apocalypse' || endState.defeat === 'climate_catastrophe') {
      engine.stop();
    } else if (isVictory) {
      engine.setMood('victory');
      engine.start();
    } else {
      engine.setMood('defeat');
      engine.start();
    }
  }, [isVictory, endState.defeat]);

  // Cycle through leader reactions
  useEffect(() => {
    if (endState.defeat === 'nuclear_apocalypse') return;

    const speakingOrder: LeaderId[] = [];

    if (winnerLeader) speakingOrder.push(winnerLeader);

    const majorFactions: FactionId[] = ['usa', 'russia', 'china', 'eu'];
    majorFactions.forEach(f => {
      const leader = getLeaderForFaction(f);
      if (leader && !speakingOrder.includes(leader)) speakingOrder.push(leader);
    });

    const otherLeaders: LeaderId[] = ['nato_chief', 'carney', 'frederiksen', 'indigenous_elder'];
    otherLeaders.forEach(l => {
      if (!speakingOrder.includes(l)) speakingOrder.push(l);
    });

    let index = 0;
    const cycle = () => {
      if (index < speakingOrder.length) {
        const leader = speakingOrder[index];
        setCurrentSpeaker(leader);
        const context = leader === winnerLeader ? 'victory' : 'defeat';
        setSpeakerMessage(getLeaderReaction(leader, context));
        index++;
      } else {
        const randomLeader = speakingOrder[Math.floor(Math.random() * speakingOrder.length)];
        setCurrentSpeaker(randomLeader);
        const context = randomLeader === winnerLeader ? 'victory' : 'defeat';
        setSpeakerMessage(getLeaderReaction(randomLeader, context));
      }
    };

    cycle();
    const interval = setInterval(cycle, 5000);
    return () => clearInterval(interval);
  }, [winnerLeader, endState.defeat]);

  const sortedFactions = Object.values(gameState.factions)
    .filter(f => ['usa', 'russia', 'china', 'eu'].includes(f.id))
    .sort((a, b) => b.victoryPoints - a.victoryPoints);

  // Catastrophic endings (no winner)
  if (endState.defeat === 'nuclear_apocalypse') {
    return (
      <div className="game-over-screen nuclear-ending">
        <div className="nuclear-flash" />
        <div className="game-over-content">
          <div className="ending-icon">{defeatInfo?.icon}</div>
          <h1>{defeatInfo?.title}</h1>
          <p className="ending-subtitle">{defeatInfo?.subtitle}</p>

          <div className="devastation-report">
            <p>{endState.description}</p>
          </div>

          <div className="epilogue-box">
            <p>{endState.epilogue}</p>
          </div>

          <div className="leader-reactions-grid nuclear">
            {['trump', 'putin', 'xi', 'eu_president'].map(leaderId => (
              <div key={leaderId} className="leader-reaction deceased">
                <PixelPortrait leader={leaderId as LeaderId} size={64} />
                <span className="leader-status">☠️</span>
              </div>
            ))}
          </div>

          <button className="restart-btn" onClick={onRestart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (endState.defeat === 'climate_catastrophe') {
    return (
      <div className="game-over-screen climate-ending">
        <div className="waves-animation" />
        <div className="game-over-content">
          <div className="ending-icon">{defeatInfo?.icon}</div>
          <h1>{defeatInfo?.title}</h1>
          <p className="ending-subtitle">{defeatInfo?.subtitle}</p>

          <div className="devastation-report">
            <p>{endState.description}</p>
            <div className="ice-stats">
              <span>Arctic Ice: 0%</span>
              <span>Sea Level Rise: Catastrophic</span>
              <span>Climate Refugees: Billions</span>
            </div>
          </div>

          <div className="epilogue-box">
            <p>{endState.epilogue}</p>
          </div>

          <button className="restart-btn" onClick={onRestart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Player defeat (regime collapse, total defeat, assassination)
  if (isDefeat && !isVictory) {
    return (
      <div className="game-over-screen defeat-ending">
        <div className="game-over-content">
          <div className="ending-icon">{defeatInfo?.icon}</div>
          <h1>{defeatInfo?.title}</h1>
          <p className="ending-subtitle">{defeatInfo?.subtitle}</p>

          <div className="defeat-report">
            <p>{endState.description}</p>
          </div>

          <div className="epilogue-box defeat">
            <p>{endState.epilogue}</p>
          </div>

          {/* Show who won instead */}
          <div className="who-won">
            <h3>The world moves on without you...</h3>
            <div className="standings-list">
              {sortedFactions.slice(0, 3).map((faction, index) => {
                const factionLeader = getLeaderForFaction(faction.id);
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                return (
                  <div key={faction.id} className="standing-row">
                    <span className="rank">{medal}</span>
                    {factionLeader && <PixelPortrait leader={factionLeader} size={40} />}
                    <span className="faction-name" style={{ color: FACTIONS[faction.id].color }}>
                      {faction.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="restart-btn" onClick={onRestart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Victory screen
  return (
    <div className={`game-over-screen ${isPlayerWinner ? 'victory' : 'defeat'} victory-${endState.victory}`}>
      {showConfetti && <Confetti />}

      <div className="game-over-content">
        {/* Victory Type Banner */}
        <div className="victory-banner">
          <div className="victory-type-icon">{victoryInfo?.icon || '🏆'}</div>
          <h1>{victoryInfo?.title || 'VICTORY'}</h1>
          <p className="victory-subtitle">{victoryInfo?.subtitle}</p>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="winner-announcement" style={{ borderColor: winner.color }}>
            <h2 style={{ color: winner.color }}>{winner.name}</h2>
            <p>{isPlayerWinner ? 'Your triumph is complete!' : 'has emerged victorious!'}</p>
          </div>
        )}

        {/* Winner's Leader Portrait */}
        {winnerLeader && (
          <div className="winner-leader">
            <PixelPortrait leader={winnerLeader} size={128} />
            <div className="winner-leader-info">
              <span className="leader-name">{LEADER_NAMES[winnerLeader]}</span>
              <span className="leader-title">{LEADERS[winnerLeader]?.title}</span>
            </div>
          </div>
        )}

        {/* Victory Description */}
        <div className="victory-description">
          <p>{endState.description}</p>
        </div>

        {/* How They Won */}
        {victoryCondition && (
          <div className="how-won-box">
            <span className="how-won-label">Victory Condition:</span>
            <span className="how-won-value">{victoryCondition.howToWin}</span>
          </div>
        )}

        {/* Epilogue */}
        <div className="epilogue-box victory">
          <h3>The Future</h3>
          <p>{endState.epilogue}</p>
        </div>

        {/* Current Speaker Bubble */}
        {currentSpeaker && (
          <div className="speaker-bubble">
            <div className="speaker-portrait">
              <PixelPortrait leader={currentSpeaker} size={64} />
            </div>
            <div className="speaker-content">
              <span className="speaker-name">{LEADER_NAMES[currentSpeaker]}</span>
              <p className="speaker-message">"{speakerMessage}"</p>
            </div>
          </div>
        )}

        {/* All Leaders Reaction Row */}
        <div className="all-leaders-row">
          <h3>World Leaders React</h3>
          <div className="leaders-grid">
            {ALL_LEADERS.slice(0, 12).map(leaderId => {
              const isWinner = leaderId === winnerLeader;
              const isLoser = ['trump', 'putin', 'xi', 'eu_president'].includes(leaderId) &&
                              getLeaderForFaction(gameState.winner || 'usa') !== leaderId;

              return (
                <div
                  key={leaderId}
                  className={`leader-cell ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''} ${currentSpeaker === leaderId ? 'speaking' : ''}`}
                  onClick={() => {
                    setCurrentSpeaker(leaderId);
                    setSpeakerMessage(getLeaderReaction(leaderId, isWinner ? 'victory' : 'defeat'));
                  }}
                >
                  <PixelPortrait leader={leaderId} size={48} />
                  <span className="reaction-emoji">
                    {isWinner ? '😎' : isLoser ? '😤' : '🤔'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Standings */}
        <div className="final-stats">
          <h3>Final Standings - Year {gameState.year}</h3>
          <div className="standings-list">
            {sortedFactions.map((faction, index) => {
              const zonesControlled = Object.values(gameState.zones).filter(
                z => z.controller === faction.id
              ).length;
              const factionLeader = getLeaderForFaction(faction.id);
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

              return (
                <div
                  key={faction.id}
                  className={`standing-row ${faction.id === gameState.playerFaction ? 'player-row' : ''}`}
                >
                  <span className="rank">{medal}</span>
                  {factionLeader && <PixelPortrait leader={factionLeader} size={40} />}
                  <div className="faction-info">
                    <span className="faction-name" style={{ color: FACTIONS[faction.id].color }}>
                      {faction.name}
                      {faction.id === gameState.playerFaction && ' (You)'}
                    </span>
                    <span className="faction-stats">
                      {faction.victoryPoints} VP • {zonesControlled} zones
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Summary */}
        <div className="game-summary">
          <div className="summary-stat">
            <span className="stat-label">Ice Extent</span>
            <span className="stat-value">{gameState.globalIceExtent}%</span>
            <span className="stat-change">(-{75 - gameState.globalIceExtent}% from start)</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Turns Played</span>
            <span className="stat-value">{gameState.turn - 1}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Victory Type</span>
            <span className="stat-value">{victoryCondition?.name || 'Standard'}</span>
          </div>
        </div>

        <button className="restart-btn" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
};

// Confetti animation component
const Confetti = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];

  return (
    <div className="confetti-container">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          }}
        />
      ))}
    </div>
  );
};

export default GameOver;
