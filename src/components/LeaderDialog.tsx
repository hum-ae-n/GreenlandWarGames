import React, { useState, useEffect } from 'react';
import { PixelPortrait, LeaderId, LEADER_NAMES } from './PixelArt';
import { getLeaderReaction, LEADERS } from '../game/leaders';

interface LeaderDialogProps {
  leaderId: LeaderId;
  context: 'greeting' | 'threat' | 'negotiation' | 'victory' | 'defeat' | string;
  onDismiss?: () => void;
  autoClose?: number;  // Auto close after ms
}

export const LeaderDialog: React.FC<LeaderDialogProps> = ({
  leaderId,
  context,
  onDismiss,
  autoClose,
}) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const leader = LEADERS[leaderId];

  useEffect(() => {
    const newMessage = getLeaderReaction(leaderId, context);
    setMessage(newMessage);
    setTypedText('');
    setIsTyping(true);
  }, [leaderId, context]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping || typedText.length >= message.length) {
      setIsTyping(false);
      return;
    }

    const timer = setTimeout(() => {
      setTypedText(message.slice(0, typedText.length + 1));
    }, 30);

    return () => clearTimeout(timer);
  }, [typedText, message, isTyping]);

  // Auto close
  useEffect(() => {
    if (autoClose && !isTyping) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isTyping, onDismiss]);

  if (!visible || !leader) return null;

  return (
    <div className="leader-dialog">
      <div className="leader-portrait-container">
        <PixelPortrait leader={leaderId} size={96} />
        <div className="leader-info">
          <div className="leader-name">{LEADER_NAMES[leaderId]}</div>
          <div className="leader-title">{leader.title}</div>
        </div>
      </div>
      <div className="dialog-bubble">
        <div className="dialog-text">
          {typedText}
          {isTyping && <span className="cursor">▌</span>}
        </div>
      </div>
      {onDismiss && !isTyping && (
        <button className="dismiss-btn" onClick={() => { setVisible(false); onDismiss(); }}>
          Continue
        </button>
      )}
    </div>
  );
};

// Multiple leaders reacting to an event
interface LeaderReactionsProps {
  reactions: { leaderId: LeaderId; context: string }[];
  onComplete?: () => void;
}

export const LeaderReactions: React.FC<LeaderReactionsProps> = ({
  reactions,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDismiss = () => {
    if (currentIndex < reactions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete?.();
    }
  };

  if (currentIndex >= reactions.length) return null;

  const current = reactions[currentIndex];

  return (
    <div className="leader-reactions-overlay">
      <LeaderDialog
        leaderId={current.leaderId}
        context={current.context}
        onDismiss={handleDismiss}
      />
      <div className="reaction-progress">
        {currentIndex + 1} / {reactions.length}
      </div>
    </div>
  );
};

// Mini portrait for dashboard/lists
interface MiniPortraitProps {
  leaderId: LeaderId;
  size?: number;
  showName?: boolean;
  onClick?: () => void;
}

export const MiniPortrait: React.FC<MiniPortraitProps> = ({
  leaderId,
  size = 32,
  showName = false,
  onClick,
}) => {
  return (
    <div
      className={`mini-portrait ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      title={LEADER_NAMES[leaderId]}
    >
      <PixelPortrait leader={leaderId} size={size} />
      {showName && <span className="mini-name">{LEADER_NAMES[leaderId]}</span>}
    </div>
  );
};

// Leader selection grid
interface LeaderGridProps {
  leaders: LeaderId[];
  selectedLeader?: LeaderId;
  onSelect: (leader: LeaderId) => void;
}

export const LeaderGrid: React.FC<LeaderGridProps> = ({
  leaders,
  selectedLeader,
  onSelect,
}) => {
  return (
    <div className="leader-grid">
      {leaders.map(leaderId => (
        <div
          key={leaderId}
          className={`leader-card ${selectedLeader === leaderId ? 'selected' : ''}`}
          onClick={() => onSelect(leaderId)}
        >
          <PixelPortrait leader={leaderId} size={64} />
          <div className="leader-card-name">{LEADER_NAMES[leaderId]}</div>
          <div className="leader-card-faction">
            {LEADERS[leaderId]?.factionId?.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderDialog;
