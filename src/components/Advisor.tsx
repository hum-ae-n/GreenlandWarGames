import { useState, useEffect, useMemo } from 'react';
import { GameState, FactionId } from '../types/game';
import { PixelPortrait, LeaderId } from './PixelArt';
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
  category: 'urgent' | 'suggestion' | 'info' | 'warning';
}

// Get contextual tips based on game state
const getAdvisorTips = (gameState: GameState, selectedZone: string | null): AdvisorTip[] => {
  const tips: AdvisorTip[] = [];
  const player = gameState.factions[gameState.playerFaction];
  const playerRelations = gameState.relations.filter(r => r.factions.includes(gameState.playerFaction));

  // Turn-based tips
  if (gameState.turn === 1) {
    tips.push({
      id: 'first_turn',
      priority: 100,
      message: "Welcome, Commander! Start by claiming unclaimed Arctic zones to establish your presence.",
      action: "Select a gray zone on the map",
      category: 'info',
    });
  }

  // Resource warnings
  if (player.resources.economicOutput < 20) {
    tips.push({
      id: 'low_economy',
      priority: 90,
      message: "Economic output is critically low! Focus on resource extraction or trade deals.",
      action: "Use 'Economic Investment' action",
      category: 'urgent',
    });
  }

  if (player.resources.influencePoints < 10) {
    tips.push({
      id: 'low_influence',
      priority: 85,
      message: "Influence is running low. Consider diplomatic actions to rebuild soft power.",
      action: "Try 'Diplomatic Outreach'",
      category: 'warning',
    });
  }

  if (player.resources.legitimacy < 30) {
    tips.push({
      id: 'low_legitimacy',
      priority: 95,
      message: "International legitimacy is dangerously low! The world views you as a rogue state.",
      action: "Avoid aggressive actions",
      category: 'urgent',
    });
  }

  // Tension warnings
  const crisisFactions = playerRelations.filter(r => r.tensionLevel === 'crisis' || r.tensionLevel === 'conflict');
  if (crisisFactions.length > 0) {
    const factionNames = crisisFactions.map(r =>
      r.factions.find(f => f !== gameState.playerFaction)?.toUpperCase()
    ).join(', ');
    tips.push({
      id: 'high_tension',
      priority: 92,
      message: `Crisis level tensions with ${factionNames}! War could break out any moment.`,
      action: "Consider de-escalation or prepare military",
      category: 'urgent',
    });
  }

  // Military tips
  const playerUnits = gameState.militaryUnits.filter(u => u.owner === gameState.playerFaction && u.status !== 'destroyed');
  if (playerUnits.length === 0 && gameState.turn > 2) {
    tips.push({
      id: 'no_military',
      priority: 80,
      message: "You have no military units! You're vulnerable to aggression.",
      action: "Build units in the Military tab",
      category: 'warning',
    });
  }

  const damagedUnits = playerUnits.filter(u => u.status === 'damaged');
  if (damagedUnits.length > 0) {
    tips.push({
      id: 'damaged_units',
      priority: 70,
      message: `${damagedUnits.length} unit(s) are damaged and need repairs.`,
      category: 'info',
    });
  }

  // Zone-specific tips
  if (selectedZone) {
    const zone = gameState.zones[selectedZone];
    if (zone) {
      if (!zone.controller) {
        tips.push({
          id: 'unclaimed_zone',
          priority: 75,
          message: `${zone.name} is unclaimed! You could assert sovereignty here.`,
          action: "Use 'Sovereignty Claim' action",
          category: 'suggestion',
        });
      } else if (zone.controller !== gameState.playerFaction) {
        const controllerName = zone.controller.toUpperCase();
        tips.push({
          id: 'enemy_zone',
          priority: 65,
          message: `${zone.name} is controlled by ${controllerName}. Diplomatic or military options available.`,
          category: 'info',
        });
      }

      // Resource opportunities
      if (zone.resources.oil > 70 || zone.resources.gas > 70) {
        tips.push({
          id: 'rich_resources',
          priority: 60,
          message: `${zone.name} has abundant energy resources worth exploiting.`,
          category: 'suggestion',
        });
      }
    }
  }

  // Victory point tips
  const vpLeader = Object.entries(gameState.factions)
    .sort(([, a], [, b]) => b.victoryPoints - a.victoryPoints)[0];

  if (vpLeader[0] !== gameState.playerFaction && vpLeader[1].victoryPoints > player.victoryPoints + 20) {
    tips.push({
      id: 'falling_behind',
      priority: 88,
      message: `${vpLeader[0].toUpperCase()} is pulling ahead! You need to act decisively.`,
      category: 'warning',
    });
  }

  // Late game tips
  if (gameState.turn >= 15) {
    tips.push({
      id: 'late_game',
      priority: 50,
      message: "Final turns approaching. Focus on maximizing victory points!",
      category: 'info',
    });
  }

  // Nuclear readiness
  if (gameState.nuclearReadiness === 'elevated' || gameState.nuclearReadiness === 'defcon2') {
    tips.push({
      id: 'nuclear_tension',
      priority: 98,
      message: "Nuclear tensions are elevated. One wrong move could end everything.",
      action: "Avoid provocative actions",
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
  strategic: { emoji: '🤔', color: '#9c27b0' },
};

export const Advisor: React.FC<AdvisorProps> = ({ gameState, selectedZone }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  const tips = useMemo(() => getAdvisorTips(gameState, selectedZone), [gameState, selectedZone]);
  const currentTip = tips[currentTipIndex] || null;

  // Determine advisor mood
  const mood = useMemo(() => {
    if (!currentTip) return ADVISOR_MOODS.calm;
    switch (currentTip.category) {
      case 'urgent': return ADVISOR_MOODS.alarmed;
      case 'warning': return ADVISOR_MOODS.concerned;
      case 'suggestion': return ADVISOR_MOODS.strategic;
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
          <PixelPortrait leader="indigenous_elder" size={48} />
        </div>
        <span className="advisor-idle">All quiet on the Arctic front...</span>
      </div>
    );
  }

  return (
    <div className={`advisor-container ${isExpanded ? 'expanded' : 'minimized'}`}>
      <div className="advisor-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="advisor-portrait">
          <PixelPortrait leader="indigenous_elder" size={48} />
          <span className="advisor-mood" style={{ background: mood.color }}>
            {mood.emoji}
          </span>
        </div>
        <div className="advisor-title">
          <span className="advisor-name">Strategic Advisor</span>
          <span className="advisor-role">Arctic Intelligence</span>
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
                <span className="action-label">Suggested:</span>
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
      cooperation: ["China-[player] relations benefit global stability.", "Mutual respect leads to mutual prosperity."],
      competition: ["China's interests in the Arctic are legitimate.", "Consider the long-term implications of your actions."],
      confrontation: ["Beijing is concerned by recent provocations.", "The dragon's patience is not infinite."],
      crisis: ["This path leads only to mutual destruction.", "China will defend its core interests. Final warning."],
      conflict: ["You have forced China's hand. History will judge.", "The Middle Kingdom will prevail as always."],
    },
    eu_president: {
      cooperation: ["European Union welcomes your cooperative approach.", "Together we can address Arctic challenges."],
      competition: ["Brussels urges restraint and dialogue.", "Unilateral actions undermine international order."],
      confrontation: ["The EU condemns these provocative actions.", "We call for immediate de-escalation."],
      crisis: ["Europe stands united against aggression.", "Sanctions are being prepared."],
      conflict: ["This war will have consequences for generations.", "Europe will not forget."],
    },
    trudeau: {
      cooperation: ["Canada appreciates the peaceful approach, eh.", "Good neighbors make good partners."],
      competition: ["The Northwest Passage is Canadian. Period.", "Let's talk before this gets out of hand."],
      confrontation: ["This is not the Canada-[player] relationship we want.", "Please reconsider your aggressive posture."],
      crisis: ["Canada will defend its Arctic sovereignty!", "You're forcing us into NATO's arms."],
      conflict: ["We didn't want this, but we'll fight for our land.", "Canadian Rangers know this terrain. You don't."],
    },
  };

  // Generate messages based on tension levels
  for (const relation of playerRelations) {
    const otherFaction = relation.factions.find(f => f !== gameState.playerFaction) as FactionId;
    if (!otherFaction || !leaderMap[otherFaction]) continue;

    const leader = leaderMap[otherFaction];
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
