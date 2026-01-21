import { useState, useEffect, useMemo } from 'react';
import { GameState, FactionId } from '../types/game';
import { PixelPortrait, LeaderId, LEADER_NAMES } from './PixelArt';
import './Advisor.css';

interface AdvisorProps {
  gameState: GameState;
  selectedZone: string | null;
  onDismissTip?: () => void;
}

interface AdvisorTip {
  id: string;
  priority: number;
  message: string;
  action?: string;
  category: 'urgent' | 'suggestion' | 'info' | 'warning' | 'strategic';
}

// Faction-specific advisors
const FACTION_ADVISORS: Record<FactionId, { leader: LeaderId; title: string; style: string }> = {
  usa: { leader: 'starmer', title: 'UK Special Advisor', style: 'diplomatic' },
  russia: { leader: 'lukashenko', title: 'Belarus Strategic Counsel', style: 'aggressive' },
  china: { leader: 'kim', title: 'DPRK Military Liaison', style: 'militant' },
  canada: { leader: 'trudeau', title: 'Arctic Council Rep', style: 'cooperative' },
  norway: { leader: 'store', title: 'Nordic Coordinator', style: 'balanced' },
  denmark: { leader: 'frederiksen', title: 'Greenland Specialist', style: 'territorial' },
  nato: { leader: 'nato_chief', title: 'Alliance Commander', style: 'defensive' },
  indigenous: { leader: 'indigenous_elder', title: 'Elder Council', style: 'wise' },
};

/* Advisor personality phrases - referenced in advisor style selection
 * diplomatic: cooperative, measured responses
 * aggressive: forceful, confrontational style
 * militant: warlike, nuclear-ready messaging
 * cooperative: friendly, partnership-focused
 * balanced: neutral, analytical approach
 * territorial: sovereignty-focused
 * defensive: alliance-oriented, NATO-style
 * wise: traditional, spiritual perspective
 */

// Get strategic tips based on game state and opponent actions
const getAdvisorTips = (gameState: GameState, selectedZone: string | null, advisorStyle: string): AdvisorTip[] => {
  const tips: AdvisorTip[] = [];
  const player = gameState.factions[gameState.playerFaction];
  const playerRelations = gameState.relations.filter(r => r.factions.includes(gameState.playerFaction));

  // Analyze opponent actions and positions
  const opponents = Object.entries(gameState.factions)
    .filter(([factionId]) => factionId !== gameState.playerFaction)
    .map(([factionId, faction]) => ({ factionId: factionId as FactionId, ...faction }));

  const leadingOpponent = opponents.sort((a, b) => b.victoryPoints - a.victoryPoints)[0];
  const playerRank = opponents.filter(o => o.victoryPoints > player.victoryPoints).length + 1;

  // Opponent military buildup detection
  const opponentUnits = gameState.militaryUnits.filter(u => u.owner !== gameState.playerFaction);
  const playerUnits = gameState.militaryUnits.filter(u => u.owner === gameState.playerFaction && u.status !== 'destroyed');

  // Calculate zone control
  const playerZones = Object.values(gameState.zones).filter(z => z.controller === gameState.playerFaction).length;
  const totalZones = Object.values(gameState.zones).length;
  const controlPercent = Math.round((playerZones / totalZones) * 100);

  // TURN-SPECIFIC STRATEGIC ADVICE

  // Turn 1-3: Early game expansion
  if (gameState.turn <= 3) {
    tips.push({
      id: 'early_expansion',
      priority: 95,
      message: `Early game is critical for expansion. You control ${controlPercent}% of zones. Claim unclaimed territories before rivals do!`,
      action: "Select gray zones and use Sovereignty Claim",
      category: 'strategic',
    });
  }

  // Who's winning analysis
  if (leadingOpponent && leadingOpponent.victoryPoints > player.victoryPoints + 30) {
    const style = advisorStyle === 'aggressive' || advisorStyle === 'militant'
      ? `${leadingOpponent.factionId.toUpperCase()} is dominating! We must strike at their weak points!`
      : `${leadingOpponent.factionId.toUpperCase()} is pulling ahead with ${leadingOpponent.victoryPoints} VP. Consider targeting their interests.`;
    tips.push({
      id: 'opponent_leading',
      priority: 88,
      message: style,
      action: advisorStyle === 'militant' ? "Military action against leader" : "Economic or diplomatic pressure",
      category: 'warning',
    });
  }

  // Player is leading
  if (playerRank === 1 && player.victoryPoints > 50) {
    tips.push({
      id: 'player_leading',
      priority: 75,
      message: `Excellent! You're in the lead with ${player.victoryPoints} VP. Defend your position and maintain momentum.`,
      action: "Consolidate gains, build defenses",
      category: 'info',
    });
  }

  // Military balance advice
  if (opponentUnits.length > playerUnits.length * 1.5) {
    const style = advisorStyle === 'militant'
      ? "Our enemies amass forces! We must build more weapons immediately!"
      : "Opponent military buildup detected. Consider increasing defense spending.";
    tips.push({
      id: 'military_imbalance',
      priority: 85,
      message: style,
      action: "Build military units in Military tab",
      category: 'warning',
    });
  }

  // Tension-based advice
  const crisisFactions = playerRelations.filter(r => r.tensionLevel === 'crisis' || r.tensionLevel === 'conflict');
  const confrontationFactions = playerRelations.filter(r => r.tensionLevel === 'confrontation');

  if (crisisFactions.length > 0) {
    const factionName = crisisFactions[0].factions.find(f => f !== gameState.playerFaction)?.toUpperCase();
    const style = advisorStyle === 'aggressive'
      ? `${factionName} has pushed us to the brink! Prepare for war or force them to back down!`
      : `Crisis with ${factionName}! One wrong move could trigger conflict. Consider de-escalation... or prepare defenses.`;
    tips.push({
      id: 'crisis_faction',
      priority: 92,
      message: style,
      action: advisorStyle === 'cooperative' ? "Try diplomatic resolution" : "Prepare military, but leave door open",
      category: 'urgent',
    });
  }

  if (confrontationFactions.length >= 2) {
    tips.push({
      id: 'multiple_tensions',
      priority: 87,
      message: `You face confrontation with ${confrontationFactions.length} factions. Avoid opening multiple fronts - focus on one rival.`,
      action: "Improve relations with weaker opponents",
      category: 'warning',
    });
  }

  // Resource warnings
  if (player.resources.economicOutput < 25) {
    tips.push({
      id: 'low_economy',
      priority: 90,
      message: "Economic output is critically low! Without funds, you cannot build or project power.",
      action: "Use Economic Investment or Resource Extraction",
      category: 'urgent',
    });
  }

  if (player.resources.legitimacy < 40) {
    const style = advisorStyle === 'militant'
      ? "The world condemns us, but who cares? Power matters more than reputation."
      : "International legitimacy is low. This limits our diplomatic options.";
    tips.push({
      id: 'low_legitimacy',
      priority: 82,
      message: style,
      action: advisorStyle === 'militant' ? "Ignore it, build strength" : "Reduce aggressive actions",
      category: advisorStyle === 'militant' ? 'info' : 'warning',
    });
  }

  // No military units
  if (playerUnits.length === 0 && gameState.turn > 2) {
    tips.push({
      id: 'no_military',
      priority: 89,
      message: "You have no military forces! You're completely vulnerable to aggression.",
      action: "Build units immediately in Military tab",
      category: 'urgent',
    });
  }

  // Selected zone advice
  if (selectedZone) {
    const zone = gameState.zones[selectedZone];
    if (zone) {
      if (!zone.controller) {
        tips.push({
          id: 'unclaimed_selected',
          priority: 78,
          message: `${zone.name} is unclaimed! This is an opportunity to expand our influence.`,
          action: "Use Sovereignty Claim action",
          category: 'suggestion',
        });
      } else if (zone.controller !== gameState.playerFaction) {
        const rel = playerRelations.find(r => r.factions.includes(zone.controller!));
        const tension = rel?.tensionLevel || 'competition';
        if (tension === 'cooperation' || tension === 'competition') {
          tips.push({
            id: 'enemy_zone_low_tension',
            priority: 65,
            message: `${zone.name} belongs to ${zone.controller.toUpperCase()}. Relations are stable - consider economic cooperation.`,
            action: "Negotiate or propose joint venture",
            category: 'info',
          });
        } else {
          tips.push({
            id: 'enemy_zone_high_tension',
            priority: 76,
            message: `${zone.name} is held by ${zone.controller.toUpperCase()} during high tensions. Vulnerable to pressure.`,
            action: advisorStyle === 'aggressive' ? "Consider military options" : "Apply diplomatic pressure",
            category: 'suggestion',
          });
        }
      }
    }
  }

  // Late game
  if (gameState.turn >= 16) {
    tips.push({
      id: 'late_game',
      priority: 70,
      message: `Only ${20 - gameState.turn} turns remain! Focus everything on victory points.`,
      action: "Maximize VP through zone control and economy",
      category: 'strategic',
    });
  }

  // Nuclear warning
  if (gameState.nuclearReadiness === 'defcon2' || gameState.nuclearReadiness === 'defcon1') {
    const style = advisorStyle === 'militant'
      ? "Nuclear forces ready! The ultimate deterrent is in our hands!"
      : "DEFCON elevated. One miscalculation could end everything. Exercise extreme caution.";
    tips.push({
      id: 'nuclear_danger',
      priority: 99,
      message: style,
      action: advisorStyle === 'militant' ? "Maintain readiness" : "Seek immediate de-escalation",
      category: 'urgent',
    });
  }

  // Sort by priority
  return tips.sort((a, b) => b.priority - a.priority);
};

// Advisor personality responses
const ADVISOR_MOODS = {
  calm: { emoji: '🧊', color: '#4a8a5c' },
  concerned: { emoji: '😟', color: '#ff9800' },
  alarmed: { emoji: '😰', color: '#f44336' },
  pleased: { emoji: '😊', color: '#2196f3' },
  strategic: { emoji: '🎯', color: '#9c27b0' },
};

export const Advisor: React.FC<AdvisorProps> = ({ gameState, selectedZone }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  // Get faction-specific advisor
  const advisorInfo = FACTION_ADVISORS[gameState.playerFaction] || FACTION_ADVISORS.usa;
  const advisorStyle = advisorInfo.style;

  const tips = useMemo(() => getAdvisorTips(gameState, selectedZone, advisorStyle), [gameState, selectedZone, advisorStyle]);
  const currentTip = tips[currentTipIndex] || null;

  // Determine advisor mood
  const mood = useMemo(() => {
    if (!currentTip) return ADVISOR_MOODS.calm;
    switch (currentTip.category) {
      case 'urgent': return ADVISOR_MOODS.alarmed;
      case 'warning': return ADVISOR_MOODS.concerned;
      case 'suggestion': return ADVISOR_MOODS.pleased;
      case 'strategic': return ADVISOR_MOODS.strategic;
      default: return ADVISOR_MOODS.calm;
    }
  }, [currentTip]);

  // Typewriter effect
  useEffect(() => {
    if (!currentTip) return;

    setDisplayedText('');
    setIsTyping(true);

    let index = 0;
    const text = currentTip.message;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [currentTip]);

  // Reset tip index when tips change
  useEffect(() => {
    setCurrentTipIndex(0);
  }, [gameState.turn]);

  // Cycle through tips
  const nextTip = () => {
    if (tips.length > 1) {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }
  };

  const prevTip = () => {
    if (tips.length > 1) {
      setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
    }
  };

  if (!currentTip) {
    return (
      <div className="advisor-container minimized">
        <div className="advisor-portrait">
          <PixelPortrait leader={advisorInfo.leader} size={48} />
        </div>
        <span className="advisor-idle">Situation nominal. Awaiting orders...</span>
      </div>
    );
  }

  return (
    <div className={`advisor-container ${isExpanded ? 'expanded' : 'minimized'}`}>
      <div className="advisor-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="advisor-portrait">
          <PixelPortrait leader={advisorInfo.leader} size={48} />
          <span className="advisor-mood" style={{ background: mood.color }}>
            {mood.emoji}
          </span>
        </div>
        <div className="advisor-title">
          <span className="advisor-name">{LEADER_NAMES[advisorInfo.leader]}</span>
          <span className="advisor-role">{advisorInfo.title}</span>
        </div>
        <button className="advisor-toggle">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="advisor-body">
          <div className={`advisor-message ${currentTip.category}`}>
            <span className="tip-category">{currentTip.category.toUpperCase()}</span>
            <p className="tip-text">
              "{displayedText}"
              {isTyping && <span className="cursor">▌</span>}
            </p>
            {currentTip.action && !isTyping && (
              <div className="tip-action">
                <span className="action-label">Recommended:</span>
                <span className="action-text">{currentTip.action}</span>
              </div>
            )}
          </div>

          {tips.length > 1 && (
            <div className="advisor-nav">
              <button onClick={prevTip} className="nav-btn">◀</button>
              <span className="tip-counter">{currentTipIndex + 1} / {tips.length}</span>
              <button onClick={nextTip} className="nav-btn">▶</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Diplomacy Messages Panel
interface DiplomacyMessage {
  id: string;
  from: LeaderId;
  factionId: FactionId;
  type: 'greeting' | 'warning' | 'threat' | 'proposal' | 'complaint' | 'praise';
  message: string;
  turn: number;
  read: boolean;
}

interface DiplomacyPanelProps {
  gameState: GameState;
  onSelectLeader: (leaderId: LeaderId, factionId: FactionId) => void;
}

// Generate diplomatic messages based on game state
const generateDiplomaticMessages = (gameState: GameState): DiplomacyMessage[] => {
  const messages: DiplomacyMessage[] = [];
  const playerRelations = gameState.relations.filter(r => r.factions.includes(gameState.playerFaction));

  const leaderMap: Partial<Record<FactionId, LeaderId>> = {
    usa: 'trump',
    russia: 'putin',
    china: 'xi',
    nato: 'nato_chief',
    canada: 'trudeau',
    norway: 'store',
    denmark: 'frederiksen',
    indigenous: 'indigenous_elder',
  };

  const messageTemplates: Record<string, Record<string, string[]>> = {
    trump: {
      cooperation: ["Great relationship! The best. Let's keep it that way.", "America and your nation - tremendous partnership!"],
      competition: ["We're watching you. America First, remember that.", "Don't try anything funny. We're negotiating, that's all."],
      confrontation: ["This is unacceptable! Very unfair treatment!", "You're making a big mistake. Huge mistake."],
      crisis: ["Back off NOW or face consequences! Serious consequences!", "This is your last warning. Believe me."],
      conflict: ["You wanted a fight? You got one! America will win!", "Total disaster for you. We're going to win bigly!"],
    },
    putin: {
      cooperation: ["Our partnership serves both nations well.", "Russia values stability. Continue this path."],
      competition: ["The Arctic is Russia's destiny. Remember this.", "We observe your moves with... interest."],
      confrontation: ["You test Russian patience. This is unwise.", "Our submarines see everything. Think carefully."],
      crisis: ["One more step and you will regret it deeply.", "Russia does not bluff. Stand down."],
      conflict: ["You have chosen war. Russia never loses.", "The consequences will be severe and permanent."],
    },
    xi: {
      cooperation: ["China-friendship relations benefit global stability.", "Mutual respect leads to mutual prosperity."],
      competition: ["China's interests in the Arctic are legitimate.", "Consider the long-term implications of your actions."],
      confrontation: ["Beijing is concerned by recent provocations.", "The dragon's patience is not infinite."],
      crisis: ["This path leads only to mutual destruction.", "China will defend its core interests. Final warning."],
      conflict: ["You have forced China's hand. History will judge.", "The Middle Kingdom will prevail as always."],
    },
    trudeau: {
      cooperation: ["Canada appreciates the peaceful approach, eh.", "Good neighbors make good partners."],
      competition: ["The Northwest Passage is Canadian. Period.", "Let's talk before this gets out of hand."],
      confrontation: ["This is not the relationship we want.", "Please reconsider your aggressive posture."],
      crisis: ["Canada will defend its Arctic sovereignty!", "You're forcing us to respond."],
      conflict: ["We didn't want this, but we'll fight for our land.", "Canadian Rangers know this terrain. You don't."],
    },
  };

  // Generate messages based on tension levels
  for (const relation of playerRelations) {
    const otherFaction = relation.factions.find(f => f !== gameState.playerFaction) as FactionId;
    if (!otherFaction || !leaderMap[otherFaction]) continue;

    const leader = leaderMap[otherFaction];
    if (!leader) continue;
    const templates = messageTemplates[leader];
    if (!templates) continue;

    const tensionMessages = templates[relation.tensionLevel];
    if (!tensionMessages || tensionMessages.length === 0) continue;

    const messageType: DiplomacyMessage['type'] =
      relation.tensionLevel === 'cooperation' ? 'greeting' :
      relation.tensionLevel === 'competition' ? 'warning' :
      relation.tensionLevel === 'confrontation' ? 'complaint' :
      relation.tensionLevel === 'crisis' ? 'threat' : 'threat';

    messages.push({
      id: `${leader}_${gameState.turn}`,
      from: leader,
      factionId: otherFaction,
      type: messageType,
      message: tensionMessages[Math.floor(Math.random() * tensionMessages.length)],
      turn: gameState.turn,
      read: false,
    });
  }

  return messages;
};

export const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({ gameState, onSelectLeader }) => {
  const [messages, setMessages] = useState<DiplomacyMessage[]>([]);
  const [selectedFaction, setSelectedFaction] = useState<FactionId | null>(null);

  // Generate messages when turn changes
  useEffect(() => {
    const newMessages = generateDiplomaticMessages(gameState);
    setMessages(prev => {
      // Keep old messages, add new ones
      const existingIds = new Set(prev.map(m => m.id));
      const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
      return [...uniqueNew, ...prev].slice(0, 10); // Keep last 10
    });
  }, [gameState.turn]);

  const factionFlags: Partial<Record<FactionId, string>> = {
    usa: '🇺🇸',
    russia: '🇷🇺',
    china: '🇨🇳',
    nato: '🏛️',
    canada: '🇨🇦',
    norway: '🇳🇴',
    denmark: '🇩🇰',
    indigenous: '🏔️',
  };

  const leaderMap: Partial<Record<FactionId, LeaderId>> = {
    usa: 'trump',
    russia: 'putin',
    china: 'xi',
    nato: 'nato_chief',
    canada: 'trudeau',
    norway: 'store',
    denmark: 'frederiksen',
    indigenous: 'indigenous_elder',
  };

  // Get relations for display
  const relations = gameState.relations
    .filter(r => r.factions.includes(gameState.playerFaction))
    .map(r => ({
      faction: r.factions.find(f => f !== gameState.playerFaction) as FactionId,
      tension: r.tensionLevel,
      value: r.tensionValue,
    }))
    .filter(r => r.faction && leaderMap[r.faction]);

  const handleFactionClick = (factionId: FactionId) => {
    setSelectedFaction(selectedFaction === factionId ? null : factionId);
    const leader = leaderMap[factionId];
    if (leader) {
      onSelectLeader(leader, factionId);
    }
  };

  const getTensionColor = (tension: string): string => {
    switch (tension) {
      case 'cooperation': return '#4a8a5c';
      case 'competition': return '#f9a825';
      case 'confrontation': return '#ff9800';
      case 'crisis': return '#f44336';
      case 'conflict': return '#b71c1c';
      default: return '#666';
    }
  };

  return (
    <div className="diplomacy-panel">
      <div className="diplomacy-header">
        <h3>🌍 World Leaders</h3>
      </div>

      <div className="faction-list">
        {relations.map(({ faction, tension, value }) => (
          <div
            key={faction}
            className={`faction-row ${selectedFaction === faction ? 'selected' : ''}`}
            onClick={() => handleFactionClick(faction)}
          >
            <span className="faction-flag">{factionFlags[faction]}</span>
            <div className="faction-info">
              <span className="faction-name">{faction.toUpperCase()}</span>
              <div className="tension-bar">
                <div
                  className="tension-fill"
                  style={{
                    width: `${value}%`,
                    background: getTensionColor(tension),
                  }}
                />
              </div>
              <span className="tension-label" style={{ color: getTensionColor(tension) }}>
                {tension}
              </span>
            </div>
            <div className="faction-portrait">
              {leaderMap[faction] && <PixelPortrait leader={leaderMap[faction]!} size={32} />}
            </div>
          </div>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="recent-messages">
          <h4>Recent Messages</h4>
          {messages.slice(0, 3).map((msg) => (
            <div
              key={msg.id}
              className={`message-item ${msg.type}`}
              onClick={() => handleFactionClick(msg.factionId)}
            >
              <span className="msg-flag">{factionFlags[msg.factionId]}</span>
              <span className="msg-text">"{msg.message.slice(0, 40)}..."</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Advisor;
