import { GameState, TensionLevel } from '../types/game';
import { FACTIONS } from '../data/factions';

interface DashboardProps {
  gameState: GameState;
}

const TENSION_COLORS: Record<TensionLevel, string> = {
  cooperation: '#22c55e',
  competition: '#eab308',
  confrontation: '#f97316',
  crisis: '#ef4444',
  conflict: '#dc2626',
};

export const Dashboard: React.FC<DashboardProps> = ({ gameState }) => {
  const playerFaction = gameState.factions[gameState.playerFaction];
  const playerColor = FACTIONS[gameState.playerFaction].color;

  return (
    <div className="dashboard">
      <div className="game-status">
        <div className="turn-info">
          <span className="year">{gameState.year}</span>
          <span className="season">{gameState.season.toUpperCase()}</span>
          <span className="turn">Turn {gameState.turn}/20</span>
        </div>
        <div className="ice-status">
          <span>Ice Extent</span>
          <div className="ice-bar">
            <div
              className="ice-fill"
              style={{ width: `${gameState.globalIceExtent}%` }}
            />
          </div>
          <span>{gameState.globalIceExtent}%</span>
        </div>
      </div>

      <div className="faction-status" style={{ borderColor: playerColor }}>
        <h3 style={{ color: playerColor }}>{playerFaction.name}</h3>
        <div className="victory-points">
          VP: <span className="vp-value">{playerFaction.victoryPoints}</span>
        </div>

        <div className="resources">
          <div className="resource">
            <span className="label">Influence</span>
            <span className="value">{Math.round(playerFaction.resources.influencePoints)}</span>
          </div>
          <div className="resource">
            <span className="label">Economy</span>
            <span className="value">{Math.round(playerFaction.resources.economicOutput)}</span>
          </div>
          <div className="resource">
            <span className="label">Icebreakers</span>
            <span className="value">{playerFaction.resources.icebreakerCapacity}</span>
          </div>
          <div className="resource">
            <span className="label">Military</span>
            <div className="stat-bar">
              <div
                className="stat-fill military"
                style={{ width: `${playerFaction.resources.militaryReadiness}%` }}
              />
            </div>
            <span className="value">{playerFaction.resources.militaryReadiness}%</span>
          </div>
          <div className="resource">
            <span className="label">Legitimacy</span>
            <div className="stat-bar">
              <div
                className="stat-fill legitimacy"
                style={{ width: `${playerFaction.resources.legitimacy}%` }}
              />
            </div>
            <span className="value">{playerFaction.resources.legitimacy}%</span>
          </div>
        </div>
      </div>

      <div className="relations-panel">
        <h4>Relations</h4>
        {gameState.relations
          .filter(r => r.factions.includes(gameState.playerFaction))
          .map(relation => {
            const otherFactionId = relation.factions.find(f => f !== gameState.playerFaction)!;
            const otherFaction = FACTIONS[otherFactionId];

            return (
              <div key={otherFactionId} className="relation-row">
                <span style={{ color: otherFaction.color }}>{otherFaction.shortName}</span>
                <span
                  className="tension-badge"
                  style={{ backgroundColor: TENSION_COLORS[relation.tensionLevel] }}
                >
                  {relation.tensionLevel}
                </span>
                <div className="tension-bar">
                  <div
                    className="tension-fill"
                    style={{
                      width: `${relation.tensionValue}%`,
                      backgroundColor: TENSION_COLORS[relation.tensionLevel],
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      <div className="leaderboard">
        <h4>Victory Points</h4>
        {Object.values(gameState.factions)
          .filter(f => ['usa', 'russia', 'china'].includes(f.id))
          .sort((a, b) => b.victoryPoints - a.victoryPoints)
          .map((faction, index) => (
            <div
              key={faction.id}
              className={`leaderboard-row ${faction.id === gameState.playerFaction ? 'player' : ''}`}
            >
              <span className="rank">{index + 1}</span>
              <span style={{ color: FACTIONS[faction.id].color }}>{faction.shortName}</span>
              <span className="vp">{faction.victoryPoints}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

interface EventLogProps {
  gameState: GameState;
}

export const EventLog: React.FC<EventLogProps> = ({ gameState }) => {
  return (
    <div className="event-log">
      <h4>Recent Events</h4>
      {gameState.pendingEvents.length === 0 ? (
        <div className="no-events">No events this turn</div>
      ) : (
        gameState.pendingEvents.map((event, index) => (
          <div key={index} className="event-item">
            <div className="event-name">{event.name}</div>
            <div className="event-desc">{event.description}</div>
          </div>
        ))
      )}
    </div>
  );
};
