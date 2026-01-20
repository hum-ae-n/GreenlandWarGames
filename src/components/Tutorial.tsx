import { useState } from 'react';
import './Tutorial.css';

interface TutorialProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Arctic Dominion',
    content: `You are a superpower vying for control of the Arctic in 2030-2050.

The Arctic ice is melting, revealing vast resources and new shipping routes. Your goal: dominate the region through diplomacy, economics, or military force.`,
    icon: '🌍',
  },
  {
    title: 'The Map',
    content: `The polar map shows the Arctic from above. Each hexagon is a strategic zone.

• Green landmasses show countries (Russia, Canada, Greenland, etc.)
• Zone colors show who controls them
• Stars (★) indicate valuable resources
• Click a zone to see details and take actions`,
    icon: '🗺️',
  },
  {
    title: 'Resources & Victory',
    content: `Build your power through three main resources:

• Influence Points (IP) - Political capital for actions
• Economic Output (EO) - Money for building & operations
• Legitimacy - World opinion of your actions

Control zones, maintain high legitimacy, and accumulate Victory Points to win!`,
    icon: '📊',
  },
  {
    title: 'Actions Tab',
    content: `The right panel lets you take diplomatic, military, and economic actions:

• DIPLOMATIC: Treaties, summits, alliances
• MILITARY: Exercises, patrols, buildups
• ECONOMIC: Investments, sanctions, trade

Each action costs resources and affects tensions with other powers.`,
    icon: '⚡',
  },
  {
    title: 'Military Tab',
    content: `Switch to the Military tab to manage your forces:

• Build units: Ships, submarines, aircraft, troops
• Launch operations: Patrol, blockade, strike, invade
• Select a target zone on the map first!

Warning: Aggressive actions increase tension and risk escalation.`,
    icon: '⚔️',
  },
  {
    title: 'Crises & Events',
    content: `Random events will challenge you:

• Crisis Events demand immediate decisions
• Combat can have surprising outcomes
• Achievements reward smart play
• Environmental events affect the whole Arctic

Watch for popup notifications and respond quickly!`,
    icon: '⚠️',
  },
  {
    title: 'Tension & Escalation',
    content: `Relations with other powers range from Cooperation to Conflict:

Cooperation → Competition → Confrontation → Crisis → Conflict

Push too hard and you risk nuclear war.
De-escalate before it's too late!`,
    icon: '☢️',
  },
  {
    title: 'Tips for Success',
    content: `• Start with diplomacy - build alliances before fighting
• Secure resource-rich zones early
• Watch your legitimacy - the world is watching
• Don't fight on multiple fronts
• Use crises as opportunities

Click "End Turn" when ready to advance time. Good luck!`,
    icon: '💡',
  },
];

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const current = TUTORIAL_STEPS[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <div className="tutorial-header">
          <span className="tutorial-icon">{current.icon}</span>
          <h2>{current.title}</h2>
          <span className="tutorial-progress">{step + 1} / {TUTORIAL_STEPS.length}</span>
        </div>

        <div className="tutorial-content">
          {current.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="tutorial-dots">
          {TUTORIAL_STEPS.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="tutorial-actions">
          <button
            className="tutorial-btn secondary"
            onClick={handleSkip}
          >
            Skip Tutorial
          </button>
          <div className="tutorial-nav">
            <button
              className="tutorial-btn"
              onClick={handlePrev}
              disabled={step === 0}
            >
              ← Back
            </button>
            <button
              className="tutorial-btn primary"
              onClick={handleNext}
            >
              {step === TUTORIAL_STEPS.length - 1 ? 'Start Game' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Help button for accessing tutorial later
interface HelpButtonProps {
  onClick: () => void;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
  return (
    <button className="help-button" onClick={onClick} title="How to Play">
      ?
    </button>
  );
};

export default Tutorial;
