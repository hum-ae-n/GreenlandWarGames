import { useState, useEffect } from 'react';
import { GameState, FactionId } from '../types/game';
import { FACTIONS } from '../data/factions';
import { PixelPortrait, LeaderId, LEADER_NAMES } from './PixelArt';
import { getLeaderReaction, getLeaderForFaction, LEADERS } from '../game/leaders';
import { getChiptuneEngine } from '../audio/ChiptuneEngine';
import './GameOver.css';

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
}

// All leaders for the celebration
const ALL_LEADERS: LeaderId[] = [
  'trump', 'putin', 'xi', 'kim',
  'starmer', 'macron', 'scholz', 'trudeau',
  'nato_chief', 'eu_president', 'frederiksen', 'store',
  'stubb', 'modi', 'erdogan', 'indigenous_elder'
];

export const GameOver: React.FC<GameOverProps> = ({ gameState, onRestart }) => {
  const winner = gameState.winner ? FACTIONS[gameState.winner] : null;
  const isPlayerWinner = gameState.winner === gameState.playerFaction;
  const isNuclearWar = gameState.gameOver && gameState.winner === null;

  const [currentSpeaker, setCurrentSpeaker] = useState<LeaderId | null>(null);
  const [speakerMessage, setSpeakerMessage] = useState('');
  const [showConfetti] = useState(isPlayerWinner);

  // Get the winning leader
  const winnerLeader = gameState.winner ? getLeaderForFaction(gameState.winner) : null;

  // Play victory or defeat music
  useEffect(() => {
    const engine = getChiptuneEngine();
    if (isNuclearWar) {
      engine.stop(); // Silence for nuclear ending
    } else if (isPlayerWinner) {
      engine.setMood('victory');
      engine.start();
    } else {
      engine.setMood('defeat');
      engine.start();
    }
  }, [isPlayerWinner, isNuclearWar]);

  // Cycle through leader reactions
  useEffect(() => {
    if (isNuclearWar) return;

    const speakingOrder: LeaderId[] = [];

    // Winner speaks first
    if (winnerLeader) {
      speakingOrder.push(winnerLeader);
    }

    // Then losers react
    const loserFactions: FactionId[] = ['usa', 'russia', 'china'].filter(
      f => f !== gameState.winner
    ) as FactionId[];

    loserFactions.forEach(f => {
      const leader = getLeaderForFaction(f);
      if (leader) speakingOrder.push(leader);
    });

    // Add some other world leaders
    const otherLeaders: LeaderId[] = ['nato_chief', 'trudeau', 'frederiksen', 'xi', 'indigenous_elder'];
    otherLeaders.forEach(l => {
      if (!speakingOrder.includes(l)) {
        speakingOrder.push(l);
      }
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
        // Cycle back through randomly
        const randomLeader = speakingOrder[Math.floor(Math.random() * speakingOrder.length)];
        setCurrentSpeaker(randomLeader);
        const context = randomLeader === winnerLeader ? 'victory' : 'defeat';
        setSpeakerMessage(getLeaderReaction(randomLeader, context));
      }
    };

    cycle();
    const interval = setInterval(cycle, 5000);
    return () => clearInterval(interval);
  }, [winnerLeader, gameState.winner, isNuclearWar]);

  const sortedFactions = Object.values(gameState.factions)
    .filter(f => ['usa', 'russia', 'china'].includes(f.id))
    .sort((a, b) => b.victoryPoints - a.victoryPoints);

  // Nuclear war ending
  if (isNuclearWar) {
    return (
      <div className="game-over-screen nuclear-ending">
        <div className="nuclear-flash" />
        <div className="game-over-content">
          <div className="nuclear-icon">☢️</div>
          <h1>NUCLEAR ANNIHILATION</h1>
          <p className="nuclear-subtitle">There are no winners in nuclear war.</p>

          <div className="devastation-report">
            <p>The Arctic lies in radioactive ruin.</p>
            <p>Billions perished. Civilization collapsed.</p>
            <p>The ice that remained has turned to ash.</p>
          </div>

          <div className="leader-reactions-grid nuclear">
            {['trump', 'putin', 'xi'].map(leaderId => (
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

  return (
    <div className={`game-over-screen ${isPlayerWinner ? 'victory' : 'defeat'}`}>
      {showConfetti && <Confetti />}

      <div className="game-over-content">
        {/* Main Announcement */}
        <div className="victory-banner">
          <h1>{isPlayerWinner ? '🏆 VICTORY! 🏆' : 'DEFEAT'}</h1>
          {winner && (
            <div className="winner-announcement" style={{ color: winner.color }}>
              <h2>{winner.name}</h2>
              <p>dominates the Arctic!</p>
            </div>
          )}
        </div>

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
              const isLoser = ['trump', 'putin', 'xi'].includes(leaderId) &&
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
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

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
            <span className="stat-label">Achievements</span>
            <span className="stat-value">{gameState.unlockedAchievements.length}</span>
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
