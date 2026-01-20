import { GameState } from '../types/game';
import { FACTIONS } from '../data/factions';

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ gameState, onRestart }) => {
  const winner = gameState.winner ? FACTIONS[gameState.winner] : null;
  const isPlayerWinner = gameState.winner === gameState.playerFaction;

  const sortedFactions = Object.values(gameState.factions)
    .filter(f => ['usa', 'russia', 'china'].includes(f.id))
    .sort((a, b) => b.victoryPoints - a.victoryPoints);

  return (
    <div className="game-over-screen">
      <div className="game-over-content">
        <h1>{isPlayerWinner ? 'VICTORY' : 'GAME OVER'}</h1>

        {winner && (
          <div className="winner-announcement" style={{ color: winner.color }}>
            <h2>{winner.name}</h2>
            <p>dominates the Arctic</p>
          </div>
        )}

        <div className="final-stats">
          <h3>Final Standings - Year {gameState.year}</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Faction</th>
                <th>Victory Points</th>
                <th>Zones Controlled</th>
              </tr>
            </thead>
            <tbody>
              {sortedFactions.map((faction, index) => {
                const zonesControlled = Object.values(gameState.zones).filter(
                  z => z.controller === faction.id
                ).length;

                return (
                  <tr
                    key={faction.id}
                    className={faction.id === gameState.playerFaction ? 'player-row' : ''}
                  >
                    <td>{index + 1}</td>
                    <td style={{ color: FACTIONS[faction.id].color }}>
                      {faction.name}
                      {faction.id === gameState.playerFaction && ' (You)'}
                    </td>
                    <td>{faction.victoryPoints}</td>
                    <td>{zonesControlled}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="game-summary">
          <h3>Arctic Status</h3>
          <p>Ice Extent: {gameState.globalIceExtent}% (started at 75%)</p>
          <p>Turns Played: {gameState.turn - 1}</p>
        </div>

        <button className="restart-btn" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
};
