import { useState, useEffect } from 'react';
import { PixelPortrait, LeaderId, LEADER_NAMES } from './PixelArt';
import { LEADERS } from '../game/leaders';
import { FactionId } from '../types/game';
import './LeaderPopup.css';

// Popup message types
type PopupType = 'greeting' | 'warning' | 'taunt' | 'compliment' | 'threat' | 'observation' | 'request';

interface LeaderMessage {
  type: PopupType;
  messages: string[];
  condition?: (context: PopupContext) => boolean;
}

interface PopupContext {
  playerFaction: FactionId;
  turn: number;
  playerVP: number;
  globalTension: number;
  recentAction?: string;
}

// Leader-specific messages
const LEADER_MESSAGES: Record<LeaderId, LeaderMessage[]> = {
  trump: [
    { type: 'greeting', messages: [
      "We're going to make the Arctic great again!",
      "Nobody knows the Arctic better than me. Nobody.",
      "I've made some tremendous deals up here. Tremendous."
    ]},
    { type: 'taunt', messages: [
      "Your strategy is a disaster. Total disaster!",
      "Sad! Very sad strategy you've got there.",
      "I've seen better moves from a polar bear!"
    ]},
    { type: 'warning', messages: [
      "Don't even think about touching Greenland. We called dibs.",
      "America First means Arctic First. Remember that.",
      "We have the best military. The best. Don't test us."
    ]},
    { type: 'compliment', messages: [
      "You know what? That was actually a good move. Surprised me.",
      "Maybe you're not as bad as the fake news says.",
    ]},
  ],
  putin: [
    { type: 'greeting', messages: [
      "The Arctic has always been Russian. Always will be.",
      "Welcome to our northern waters, friend.",
      "Mother Russia watches from the permafrost."
    ]},
    { type: 'taunt', messages: [
      "Your icebreakers are... cute.",
      "In Russia, the cold makes us stronger. You? Not so much.",
      "Chess was invented for minds like mine, not yours."
    ]},
    { type: 'warning', messages: [
      "The Northern Sea Route is ours. Tread carefully.",
      "Our submarines see everything under the ice.",
      "Do not mistake patience for weakness."
    ]},
    { type: 'threat', messages: [
      "Perhaps you need a reminder of Russian capabilities.",
      "We have ways of... persuading nations to cooperate.",
    ]},
  ],
  xi: [
    { type: 'greeting', messages: [
      "China's Polar Silk Road extends to all nations.",
      "The Arctic belongs to all humanity. We will ensure it.",
      "Cooperation brings prosperity. Competition brings ruin."
    ]},
    { type: 'taunt', messages: [
      "Your short-term thinking amuses Beijing.",
      "The dragon waits while others exhaust themselves.",
      "History favors the patient. We are very patient."
    ]},
    { type: 'warning', messages: [
      "China has vital interests in the polar regions.",
      "Our investments will outlast your presence here.",
      "Do not underestimate Chinese resolve."
    ]},
    { type: 'observation', messages: [
      "Interesting strategy. We are watching closely.",
      "The balance of power shifts like ice floes.",
    ]},
  ],
  kim: [
    { type: 'greeting', messages: [
      "The Glorious Leader greets you from Pyongyang!",
      "Even the Arctic trembles before our might!",
      "Juche spirit conquers all climates!"
    ]},
    { type: 'taunt', messages: [
      "Your imperialist tactics will fail!",
      "The DPRK laughs at your pathetic strategies!",
      "We have weapons you cannot imagine!"
    ]},
    { type: 'threat', messages: [
      "Threaten us and face TOTAL ANNIHILATION!",
      "Our missiles can reach anywhere. Remember that.",
    ]},
  ],
  trudeau: [
    { type: 'greeting', messages: [
      "Canada welcomes cooperation in the Arctic.",
      "The Northwest Passage is Canadian. But we can talk.",
      "Let's find a peaceful solution, eh?"
    ]},
    { type: 'warning', messages: [
      "Canadian sovereignty is non-negotiable.",
      "Our Arctic Rangers know every inch of this territory.",
      "Please respect international law up here."
    ]},
    { type: 'request', messages: [
      "Perhaps we could discuss environmental protections?",
      "Indigenous rights must be respected. Can we agree on that?",
    ]},
  ],
  frederiksen: [
    { type: 'greeting', messages: [
      "Greenland is not for sale. Let's move on.",
      "Denmark stands with our Arctic partners.",
      "The Nordic countries will work together on this."
    ]},
    { type: 'warning', messages: [
      "Greenland's people will decide Greenland's future.",
      "Do not mistake small nations for weak ones.",
    ]},
    { type: 'observation', messages: [
      "Interesting developments in the region today.",
      "We're monitoring the situation carefully.",
    ]},
  ],
  macron: [
    { type: 'greeting', messages: [
      "France brings European unity to Arctic affairs.",
      "Liberté, égalité, even in the Arctic!",
      "Europe must speak with one voice here."
    ]},
    { type: 'observation', messages: [
      "The climate crisis makes Arctic diplomacy urgent.",
      "We must balance development with preservation.",
    ]},
    { type: 'taunt', messages: [
      "Your approach lacks... how you say... finesse.",
      "Perhaps consider the European perspective?",
    ]},
  ],
  scholz: [
    { type: 'greeting', messages: [
      "Germany seeks stability in all regions.",
      "Economic cooperation benefits everyone.",
      "Let us approach this systematically."
    ]},
    { type: 'observation', messages: [
      "The data suggests a different approach might work.",
      "Have you considered the long-term implications?",
    ]},
    { type: 'warning', messages: [
      "Energy security concerns us all.",
      "Germany cannot accept unilateral changes.",
    ]},
  ],
  starmer: [
    { type: 'greeting', messages: [
      "Britain maintains interests in polar regions.",
      "The Commonwealth has Arctic territories too.",
      "We're committed to rules-based order."
    ]},
    { type: 'observation', messages: [
      "The situation requires careful consideration.",
      "Britain is watching developments closely.",
    ]},
  ],
  nato_chief: [
    { type: 'greeting', messages: [
      "NATO stands ready to defend the North.",
      "Article 5 applies even in the Arctic.",
      "Allied unity is our strength."
    ]},
    { type: 'warning', messages: [
      "Military buildups concern the Alliance.",
      "We will respond to any aggression.",
      "NATO's northern flank is well defended."
    ]},
    { type: 'observation', messages: [
      "The security situation requires vigilance.",
      "We're enhancing Arctic surveillance capabilities.",
    ]},
  ],
  eu_president: [
    { type: 'greeting', messages: [
      "The European Union seeks multilateral solutions.",
      "Environmental protection must come first.",
      "Europe will not be sidelined in Arctic affairs."
    ]},
    { type: 'observation', messages: [
      "Brussels is preparing a comprehensive Arctic strategy.",
      "Climate change affects us all equally.",
    ]},
  ],
  store: [
    { type: 'greeting', messages: [
      "Norway has centuries of Arctic experience.",
      "Svalbard is governed by international treaty.",
      "We know these waters better than anyone."
    ]},
    { type: 'warning', messages: [
      "Norwegian sovereignty is absolute in our waters.",
      "Our Coast Guard is always watching.",
    ]},
  ],
  stubb: [
    { type: 'greeting', messages: [
      "Finland brings Arctic expertise to the table.",
      "We're an Arctic nation through and through.",
      "Cooperation beats confrontation every time."
    ]},
    { type: 'observation', messages: [
      "The situation in the High North is evolving.",
      "Nordic cooperation remains essential.",
    ]},
  ],
  modi: [
    { type: 'greeting', messages: [
      "India's Arctic research program grows stronger!",
      "1.4 billion people have interests in climate change.",
      "The Global South has a voice in Arctic matters."
    ]},
    { type: 'observation', messages: [
      "What happens in the Arctic affects Mumbai.",
      "India seeks observer status and respect.",
    ]},
  ],
  erdogan: [
    { type: 'greeting', messages: [
      "Turkey controls the straits. Remember that.",
      "A new Turkish century dawns, even in the Arctic!",
      "Do not underestimate Ankara's reach."
    ]},
    { type: 'taunt', messages: [
      "Your Western games do not impress us.",
      "Turkey goes its own way, always.",
    ]},
  ],
  indigenous_elder: [
    { type: 'greeting', messages: [
      "Our ancestors walked this ice for millennia.",
      "The land speaks to those who listen.",
      "We are the original Arctic peoples."
    ]},
    { type: 'warning', messages: [
      "You exploit what we have protected for generations.",
      "The spirits of the ice are angry.",
      "This land has a memory longer than your nations."
    ]},
    { type: 'observation', messages: [
      "The ice tells us change is coming.",
      "Your machines disturb the ancient balance.",
      "The caribou migrate differently now. Do you notice?",
    ]},
  ],
};

// Get a random message for a leader
const getRandomMessage = (leaderId: LeaderId, context: PopupContext): { type: PopupType; message: string } | null => {
  const leaderMessages = LEADER_MESSAGES[leaderId];
  if (!leaderMessages || leaderMessages.length === 0) return null;

  // Filter by condition if present
  const validMessages = leaderMessages.filter(m => !m.condition || m.condition(context));
  if (validMessages.length === 0) return null;

  // Pick random message category
  const category = validMessages[Math.floor(Math.random() * validMessages.length)];
  const message = category.messages[Math.floor(Math.random() * category.messages.length)];

  return { type: category.type, message };
};

// Get popup style based on type
const getPopupStyle = (type: PopupType): { borderColor: string; icon: string } => {
  switch (type) {
    case 'greeting': return { borderColor: '#4a8a5c', icon: '👋' };
    case 'warning': return { borderColor: '#ff9800', icon: '⚠️' };
    case 'taunt': return { borderColor: '#9c27b0', icon: '😏' };
    case 'compliment': return { borderColor: '#2196f3', icon: '👍' };
    case 'threat': return { borderColor: '#f44336', icon: '💀' };
    case 'observation': return { borderColor: '#607d8b', icon: '🔍' };
    case 'request': return { borderColor: '#00bcd4', icon: '🤝' };
    default: return { borderColor: '#666', icon: '💬' };
  }
};

interface LeaderPopupProps {
  leaderId: LeaderId;
  context: PopupContext;
  onDismiss: () => void;
}

export const LeaderPopup: React.FC<LeaderPopupProps> = ({ leaderId, context, onDismiss }) => {
  const leader = LEADERS[leaderId];
  const [messageData, setMessageData] = useState<{ type: PopupType; message: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const data = getRandomMessage(leaderId, context);
    setMessageData(data);
    // Slight delay before showing for animation
    setTimeout(() => setVisible(true), 100);
  }, [leaderId, context]);

  // Typewriter effect
  useEffect(() => {
    if (!messageData || typedText.length >= messageData.message.length) return;

    const timer = setTimeout(() => {
      setTypedText(messageData.message.slice(0, typedText.length + 1));
    }, 25);

    return () => clearTimeout(timer);
  }, [typedText, messageData]);

  // Auto dismiss after typing completes
  useEffect(() => {
    if (messageData && typedText.length >= messageData.message.length) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [typedText, messageData, onDismiss]);

  if (!messageData || !leader) return null;

  const style = getPopupStyle(messageData.type);

  return (
    <div className={`leader-popup ${visible ? 'visible' : ''}`} style={{ borderColor: style.borderColor }}>
      <div className="popup-header">
        <span className="popup-icon">{style.icon}</span>
        <span className="popup-type">{messageData.type.toUpperCase()}</span>
        <button className="popup-close" onClick={onDismiss}>×</button>
      </div>
      <div className="popup-body">
        <div className="popup-portrait">
          <PixelPortrait leader={leaderId} size={64} />
        </div>
        <div className="popup-content">
          <div className="popup-leader-name">{LEADER_NAMES[leaderId]}</div>
          <div className="popup-leader-title">{leader.title}</div>
          <p className="popup-message">
            "{typedText}"
            {typedText.length < messageData.message.length && <span className="cursor">▌</span>}
          </p>
        </div>
      </div>
      <div className="popup-actions">
        <button className="popup-btn" onClick={onDismiss}>
          Acknowledge
        </button>
      </div>
    </div>
  );
};

// Manager component for random popups
interface PopupManagerProps {
  context: PopupContext;
  enabled: boolean;
  excludeLeaders?: LeaderId[];
}

export const PopupManager: React.FC<PopupManagerProps> = ({ context, enabled, excludeLeaders = [] }) => {
  const [currentPopup, setCurrentPopup] = useState<LeaderId | null>(null);

  // Randomly trigger popups
  useEffect(() => {
    if (!enabled || currentPopup) return;

    // 15% chance per check, check every 30 seconds
    const checkInterval = setInterval(() => {
      if (Math.random() < 0.15) {
        // Pick a random leader (excluding player faction leaders)
        const allLeaders: LeaderId[] = [
          'trump', 'putin', 'xi', 'kim',
          'trudeau', 'frederiksen', 'macron', 'scholz', 'starmer',
          'nato_chief', 'eu_president', 'store', 'stubb',
          'modi', 'erdogan', 'indigenous_elder'
        ];

        const availableLeaders = allLeaders.filter(l => !excludeLeaders.includes(l));
        if (availableLeaders.length > 0) {
          const randomLeader = availableLeaders[Math.floor(Math.random() * availableLeaders.length)];
          setCurrentPopup(randomLeader);
        }
      }
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [enabled, currentPopup, excludeLeaders]);

  const handleDismiss = () => {
    setCurrentPopup(null);
  };

  if (!currentPopup) return null;

  return (
    <div className="popup-overlay">
      <LeaderPopup
        leaderId={currentPopup}
        context={context}
        onDismiss={handleDismiss}
      />
    </div>
  );
};

// Function to trigger a popup imperatively
export const triggerLeaderPopup = (leaderId: LeaderId): void => {
  // This will be handled by the event system
  window.dispatchEvent(new CustomEvent('leader-popup', { detail: { leaderId } }));
};

export default LeaderPopup;
