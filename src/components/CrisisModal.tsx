// Crisis Event Modal - Urgent decisions that can't wait
import { useState } from 'react';
import { CrisisEvent, CrisisChoice, Achievement, ResourceDiscovery, EnvironmentalEvent, NuclearEscalationEvent } from '../game/drama';
import './CrisisModal.css';

interface CrisisModalProps {
  crisis: CrisisEvent;
  onResolve: (choice: CrisisChoice, success: boolean) => void;
}

export const CrisisModal = ({ crisis, onResolve }: CrisisModalProps) => {
  const [selectedChoice, setSelectedChoice] = useState<CrisisChoice | null>(null);
  const [resolving, setResolving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChoiceSelect = (choice: CrisisChoice) => {
    setSelectedChoice(choice);
  };

  const handleConfirm = () => {
    if (!selectedChoice) return;

    setResolving(true);

    // Calculate success if there's a chance of failure
    const success = selectedChoice.successChance
      ? Math.random() * 100 < selectedChoice.successChance
      : true;

    // Show result briefly before closing
    setResult({
      success,
      message: success
        ? 'Action successful!'
        : 'Action failed! Consequences incoming...',
    });

    setTimeout(() => {
      onResolve(selectedChoice, success);
    }, 1500);
  };

  const urgencyClass = crisis.urgency === 'immediate' ? 'crisis-immediate' :
                       crisis.urgency === 'urgent' ? 'crisis-urgent' : 'crisis-developing';

  return (
    <div className="crisis-overlay">
      <div className={`crisis-modal ${urgencyClass}`}>
        <div className="crisis-header">
          <span className="crisis-urgency-badge">{crisis.urgency.toUpperCase()}</span>
          <h2>{crisis.title}</h2>
          {crisis.turnsToRespond > 0 && (
            <span className="crisis-timer">{crisis.turnsToRespond} turn(s) to respond</span>
          )}
        </div>

        <div className="crisis-body">
          <p className="crisis-description">{crisis.description}</p>

          {crisis.instigator && (
            <p className="crisis-instigator">
              Instigator: <strong>{crisis.instigator.toUpperCase()}</strong>
            </p>
          )}
        </div>

        {!result ? (
          <div className="crisis-choices">
            <h3>Your Response:</h3>
            {crisis.choices.map((choice) => (
              <div
                key={choice.id}
                className={`crisis-choice ${selectedChoice?.id === choice.id ? 'selected' : ''}`}
                onClick={() => handleChoiceSelect(choice)}
              >
                <div className="choice-header">
                  <span className="choice-label">{choice.label}</span>
                  {choice.successChance && choice.successChance < 100 && (
                    <span className="choice-chance">{choice.successChance}% success</span>
                  )}
                </div>
                <p className="choice-description">{choice.description}</p>
                <div className="choice-consequences">
                  {choice.consequences.tensionChange?.map((tc, i) => (
                    <span key={i} className={tc.amount > 0 ? 'negative' : 'positive'}>
                      {tc.amount > 0 ? '+' : ''}{tc.amount} tension with {tc.faction.toUpperCase()}
                    </span>
                  ))}
                  {choice.consequences.legitimacyChange && (
                    <span className={choice.consequences.legitimacyChange > 0 ? 'positive' : 'negative'}>
                      {choice.consequences.legitimacyChange > 0 ? '+' : ''}{choice.consequences.legitimacyChange} legitimacy
                    </span>
                  )}
                  {choice.consequences.economicChange && (
                    <span className={choice.consequences.economicChange > 0 ? 'positive' : 'negative'}>
                      {choice.consequences.economicChange > 0 ? '+' : ''}{choice.consequences.economicChange} EO
                    </span>
                  )}
                  {choice.consequences.influenceChange && (
                    <span className={choice.consequences.influenceChange > 0 ? 'positive' : 'negative'}>
                      {choice.consequences.influenceChange > 0 ? '+' : ''}{choice.consequences.influenceChange} IP
                    </span>
                  )}
                  {choice.consequences.achievementUnlock && (
                    <span className="achievement-hint">May unlock achievement!</span>
                  )}
                </div>
              </div>
            ))}

            <button
              className="crisis-confirm"
              disabled={!selectedChoice || resolving}
              onClick={handleConfirm}
            >
              {resolving ? 'Executing...' : 'Confirm Decision'}
            </button>
          </div>
        ) : (
          <div className={`crisis-result ${result.success ? 'success' : 'failure'}`}>
            <h3>{result.success ? '✓ SUCCESS' : '✗ FAILED'}</h3>
            <p>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Achievement Notification
interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementPopup = ({ achievement, onClose }: AchievementPopupProps) => {
  return (
    <div className="achievement-popup" onClick={onClose}>
      <div className={`achievement-content rarity-${achievement.rarity}`}>
        <div className="achievement-icon">{achievement.icon}</div>
        <div className="achievement-info">
          <span className="achievement-label">ACHIEVEMENT UNLOCKED!</span>
          <h3>{achievement.name}</h3>
          <p>{achievement.description}</p>
          <div className="achievement-rewards">
            {achievement.reward.influencePoints && (
              <span>+{achievement.reward.influencePoints} IP</span>
            )}
            {achievement.reward.economicOutput && (
              <span>+{achievement.reward.economicOutput} EO</span>
            )}
            {achievement.reward.legitimacy && (
              <span>+{achievement.reward.legitimacy} Legitimacy</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Resource Discovery Notification
interface DiscoveryPopupProps {
  discovery: ResourceDiscovery;
  zoneName: string;
  onClose: () => void;
}

export const DiscoveryPopup = ({ discovery, zoneName, onClose }: DiscoveryPopupProps) => {
  return (
    <div className="discovery-popup" onClick={onClose}>
      <div className="discovery-content">
        <h3>DISCOVERY!</h3>
        <h2>{discovery.name}</h2>
        <p>{discovery.description}</p>
        <p className="discovery-location">Location: {zoneName}</p>
        <div className="discovery-bonus">
          {discovery.bonus.oil && <span>+{discovery.bonus.oil} Oil</span>}
          {discovery.bonus.gas && <span>+{discovery.bonus.gas} Gas</span>}
          {discovery.bonus.minerals && <span>+{discovery.bonus.minerals} Minerals</span>}
          {discovery.bonus.shipping && <span>+{discovery.bonus.shipping} Shipping</span>}
          {discovery.economicBonus && <span>+{discovery.economicBonus} EO</span>}
        </div>
      </div>
    </div>
  );
};

// Environmental Event Notification
interface EnvironmentalEventPopupProps {
  event: EnvironmentalEvent;
  onClose: () => void;
}

export const EnvironmentalEventPopup = ({ event, onClose }: EnvironmentalEventPopupProps) => {
  return (
    <div className="environmental-popup" onClick={onClose}>
      <div className="environmental-content">
        <h2>{event.name}</h2>
        <p>{event.description}</p>
        <div className="environmental-effects">
          {event.effects.globalIceMelt && (
            <span>Global ice extent -{event.effects.globalIceMelt}%</span>
          )}
          {event.effects.zoneEffects?.map((ze, i) => (
            <span key={i}>Zone {ze.zoneId} blocked for {ze.turns} turn(s)</span>
          ))}
          {event.effects.unitEffects?.map((ue, i) => (
            <span key={i}>{ue.factionId.toUpperCase()} units -{ue.damagePercent}% strength</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Nuclear Escalation Modal
interface NuclearModalProps {
  event: NuclearEscalationEvent;
  onResolve: (effect: 'escalate' | 'maintain' | 'deescalate') => void;
}

export const NuclearModal = ({ event, onResolve }: NuclearModalProps) => {
  return (
    <div className="nuclear-overlay">
      <div className="nuclear-modal">
        <div className="nuclear-warning">
          <div className="nuclear-icon">☢️</div>
          <h1>{event.title}</h1>
        </div>

        <p className="nuclear-description">{event.description}</p>

        <div className="nuclear-choices">
          {event.choices.map((choice, i) => (
            <button
              key={i}
              className={`nuclear-choice nuclear-${choice.effect}`}
              onClick={() => onResolve(choice.effect)}
            >
              <span className="choice-label">{choice.label}</span>
              <span className="choice-consequence">{choice.consequences}</span>
            </button>
          ))}
        </div>

        <div className="nuclear-readiness">
          <span>Current Readiness: {event.newReadiness.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

// Combat Surprise Display
interface CombatSurpriseProps {
  title: string;
  description: string;
  isPositive: boolean;
}

export const CombatSurpriseDisplay = ({ title, description, isPositive }: CombatSurpriseProps) => {
  return (
    <div className={`combat-surprise ${isPositive ? 'positive' : 'negative'}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
