import React, { useState } from 'react';
import { GameState, FactionId, TradeDealType, SanctionType } from '../types/game';
import {
  TRADE_DEAL_TEMPLATES,
  SANCTION_TEMPLATES,
  getEconomicSummary,
  getAvailableEconomicActions,
  createTradeDeal,
  imposeSanction,
  cancelTradeDeal,
  liftSanction,
  aiWouldAcceptDeal,
  EconomicState,
  TradeDeal,
  Sanction
} from '../game/economics';
import './EconomicsPanel.css';

interface EconomicsPanelProps {
  state: GameState;
  economicState: EconomicState;
  onDealCreated: (deal: TradeDeal) => void;
  onSanctionImposed: (sanction: Sanction) => void;
  onDealCanceled: (dealId: string) => void;
  onSanctionLifted: (sanctionId: string) => void;
  onClose: () => void;
}

type TabType = 'overview' | 'trade' | 'sanctions' | 'supply';

export const EconomicsPanel: React.FC<EconomicsPanelProps> = ({
  state,
  economicState,
  onDealCreated,
  onSanctionImposed,
  onDealCanceled,
  onSanctionLifted,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedFaction, setSelectedFaction] = useState<FactionId | null>(null);
  const [selectedDealType, setSelectedDealType] = useState<TradeDealType | null>(null);
  const [selectedSanctionType, setSelectedSanctionType] = useState<SanctionType | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const summary = getEconomicSummary(state, economicState, state.playerFaction);
  const actions = getAvailableEconomicActions(state, economicState);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProposeDeal = () => {
    if (!selectedFaction || !selectedDealType) return;

    // Check if AI would accept
    const aiResponse = aiWouldAcceptDeal(state, economicState, state.playerFaction, selectedFaction, selectedDealType);

    if (!aiResponse.accept) {
      showNotification(`${state.factions[selectedFaction].shortName} declined: ${aiResponse.reason}`);
      return;
    }

    const result = createTradeDeal(state, economicState, selectedDealType, selectedFaction);
    if (result.success && result.deal) {
      onDealCreated(result.deal);
      showNotification(`Trade deal signed with ${state.factions[selectedFaction].shortName}!`);
      setSelectedFaction(null);
      setSelectedDealType(null);
    } else {
      showNotification(result.reason || 'Failed to create deal');
    }
  };

  const handleImposeSanction = () => {
    if (!selectedFaction || !selectedSanctionType) return;

    const result = imposeSanction(state, economicState, selectedSanctionType, selectedFaction);
    if (result.success && result.sanction) {
      onSanctionImposed(result.sanction);
      showNotification(`Sanctions imposed on ${state.factions[selectedFaction].shortName}`);
      setSelectedFaction(null);
      setSelectedSanctionType(null);
    } else {
      showNotification(result.reason || 'Failed to impose sanctions');
    }
  };

  const handleCancelDeal = (dealId: string) => {
    const result = cancelTradeDeal(state, economicState, dealId);
    if (result.success) {
      onDealCanceled(dealId);
      showNotification(`Deal canceled. Tension increased by ${result.tensionIncrease}`);
    }
  };

  const handleLiftSanction = (sanctionId: string) => {
    const result = liftSanction(state, economicState, sanctionId);
    if (result.success) {
      onSanctionLifted(sanctionId);
      showNotification('Sanctions lifted');
    }
  };

  const renderOverview = () => (
    <div className="econ-overview">
      <div className="econ-metrics">
        <div className="econ-metric">
          <span className="metric-label">Economic Power</span>
          <span className="metric-value">{summary.economicPower.toFixed(0)}</span>
          <div className="metric-bar">
            <div
              className="metric-fill power"
              style={{ width: `${summary.economicPower}%` }}
            />
          </div>
        </div>
        <div className="econ-metric">
          <span className="metric-label">Vulnerability</span>
          <span className="metric-value">{summary.vulnerabilityScore.toFixed(0)}</span>
          <div className="metric-bar">
            <div
              className="metric-fill vulnerability"
              style={{ width: `${summary.vulnerabilityScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="econ-section">
        <h4>Market Prices</h4>
        <div className="market-prices">
          <div className="price-item">
            <span>Oil</span>
            <span className={economicState.marketPrices.oil > 1.2 ? 'price-high' : economicState.marketPrices.oil < 0.8 ? 'price-low' : ''}>
              {(economicState.marketPrices.oil * 100).toFixed(0)}%
            </span>
          </div>
          <div className="price-item">
            <span>Gas</span>
            <span className={economicState.marketPrices.gas > 1.2 ? 'price-high' : economicState.marketPrices.gas < 0.8 ? 'price-low' : ''}>
              {(economicState.marketPrices.gas * 100).toFixed(0)}%
            </span>
          </div>
          <div className="price-item">
            <span>Minerals</span>
            <span className={economicState.marketPrices.minerals > 1.2 ? 'price-high' : economicState.marketPrices.minerals < 0.8 ? 'price-low' : ''}>
              {(economicState.marketPrices.minerals * 100).toFixed(0)}%
            </span>
          </div>
          <div className="price-item">
            <span>Shipping</span>
            <span className={economicState.marketPrices.shipping > 1.2 ? 'price-high' : economicState.marketPrices.shipping < 0.8 ? 'price-low' : ''}>
              {(economicState.marketPrices.shipping * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="econ-section">
        <h4>Trade Partners ({summary.tradePartners.length})</h4>
        <div className="partner-list">
          {summary.tradePartners.map(partner => (
            <span key={partner} className="partner-tag" style={{ borderColor: state.factions[partner].color }}>
              {state.factions[partner].shortName}
            </span>
          ))}
          {summary.tradePartners.length === 0 && (
            <span className="no-data">No active trade partners</span>
          )}
        </div>
      </div>

      <div className="econ-section">
        <h4>Active Deals ({summary.activeDeals.length})</h4>
        <div className="deal-summary">
          {summary.activeDeals.slice(0, 3).map(deal => (
            <div key={deal.id} className="deal-mini">
              <span>{deal.name}</span>
              {deal.turnsRemaining > 0 && (
                <span className="turns-left">{deal.turnsRemaining}t</span>
              )}
            </div>
          ))}
          {summary.activeDeals.length > 3 && (
            <span className="more-deals">+{summary.activeDeals.length - 3} more</span>
          )}
        </div>
      </div>

      {summary.supplyChainRisks.length > 0 && (
        <div className="econ-section warning">
          <h4>Supply Chain Risks</h4>
          {summary.supplyChainRisks.map((risk, i) => (
            <div key={i} className={`risk-item ${risk.disrupted ? 'disrupted' : ''}`}>
              <span>{risk.type.replace(/_/g, ' ')}</span>
              <span className="risk-level">{risk.vulnerabilityLevel}% vulnerable</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTrade = () => (
    <div className="econ-trade">
      <div className="trade-section">
        <h4>Propose New Deal</h4>
        <div className="deal-form">
          <div className="form-row">
            <label>Partner:</label>
            <select
              value={selectedFaction || ''}
              onChange={e => setSelectedFaction(e.target.value as FactionId || null)}
            >
              <option value="">Select faction...</option>
              {actions.possibleDeals.map(pd => (
                <option key={pd.faction} value={pd.faction}>
                  {state.factions[pd.faction].name}
                </option>
              ))}
            </select>
          </div>

          {selectedFaction && (
            <div className="form-row">
              <label>Deal Type:</label>
              <select
                value={selectedDealType || ''}
                onChange={e => setSelectedDealType(e.target.value as TradeDealType || null)}
              >
                <option value="">Select deal type...</option>
                {actions.possibleDeals
                  .find(pd => pd.faction === selectedFaction)
                  ?.types.map(type => (
                    <option key={type} value={type}>
                      {TRADE_DEAL_TEMPLATES[type].name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {selectedDealType && (
            <div className="deal-preview">
              <p>{TRADE_DEAL_TEMPLATES[selectedDealType].description}</p>
              <p className="deal-cost">
                Cost: {TRADE_DEAL_TEMPLATES[selectedDealType].baseCost} Influence
              </p>
              <p className="deal-duration">
                Duration: {TRADE_DEAL_TEMPLATES[selectedDealType].defaultDuration === -1
                  ? 'Permanent'
                  : `${TRADE_DEAL_TEMPLATES[selectedDealType].defaultDuration} turns`}
              </p>
            </div>
          )}

          <button
            className="propose-btn"
            onClick={handleProposeDeal}
            disabled={!selectedFaction || !selectedDealType}
          >
            Propose Deal
          </button>
        </div>
      </div>

      <div className="trade-section">
        <h4>Active Trade Deals</h4>
        <div className="deals-list">
          {actions.cancelableDeals.map(deal => (
            <div key={deal.id} className="deal-card">
              <div className="deal-header">
                <span className="deal-name">{deal.name}</span>
                <span className={`deal-status ${deal.isActive ? 'active' : 'inactive'}`}>
                  {deal.isActive ? 'Active' : 'Expired'}
                </span>
              </div>
              <p className="deal-desc">{deal.description}</p>
              <div className="deal-meta">
                <span>Signed: Turn {deal.signedOnTurn}</span>
                {deal.turnsRemaining > 0 && (
                  <span>{deal.turnsRemaining} turns remaining</span>
                )}
                {deal.turnsRemaining === -1 && (
                  <span>Permanent</span>
                )}
              </div>
              <button
                className="cancel-btn"
                onClick={() => handleCancelDeal(deal.id)}
              >
                Cancel Deal
              </button>
            </div>
          ))}
          {actions.cancelableDeals.length === 0 && (
            <p className="no-data">No active trade deals</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSanctions = () => (
    <div className="econ-sanctions">
      <div className="sanctions-section">
        <h4>Impose Sanctions</h4>
        <div className="sanction-form">
          <div className="form-row">
            <label>Target:</label>
            <select
              value={selectedFaction || ''}
              onChange={e => setSelectedFaction(e.target.value as FactionId || null)}
            >
              <option value="">Select target...</option>
              {actions.possibleSanctions.map(ps => (
                <option key={ps.faction} value={ps.faction}>
                  {state.factions[ps.faction].name}
                </option>
              ))}
            </select>
          </div>

          {selectedFaction && (
            <div className="form-row">
              <label>Sanction Type:</label>
              <select
                value={selectedSanctionType || ''}
                onChange={e => setSelectedSanctionType(e.target.value as SanctionType || null)}
              >
                <option value="">Select sanction type...</option>
                {actions.possibleSanctions
                  .find(ps => ps.faction === selectedFaction)
                  ?.types.map(type => (
                    <option key={type} value={type}>
                      {SANCTION_TEMPLATES[type].name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {selectedSanctionType && (
            <div className="sanction-preview">
              <p>{SANCTION_TEMPLATES[selectedSanctionType].description}</p>
              <p className="sanction-effect">
                Economic Impact: -{SANCTION_TEMPLATES[selectedSanctionType].effects.economicPenalty}%
              </p>
              <p className="sanction-cost">
                Legitimacy Cost: {SANCTION_TEMPLATES[selectedSanctionType].legitimacyCost}
              </p>
              <p className="sanction-tension">
                Tension Increase: +{SANCTION_TEMPLATES[selectedSanctionType].tensionIncrease}
              </p>
            </div>
          )}

          <button
            className="impose-btn"
            onClick={handleImposeSanction}
            disabled={!selectedFaction || !selectedSanctionType}
          >
            Impose Sanctions
          </button>
        </div>
      </div>

      <div className="sanctions-section">
        <h4>Active Sanctions</h4>
        <div className="sanctions-list">
          {economicState.activeSanctions.map(sanction => {
            const isImposer = sanction.imposedBy.includes(state.playerFaction);
            const isTarget = sanction.targetFaction === state.playerFaction;

            return (
              <div key={sanction.id} className={`sanction-card ${isTarget ? 'against-us' : ''}`}>
                <div className="sanction-header">
                  <span className="sanction-name">{sanction.name}</span>
                  <span className={`world-reaction ${sanction.worldReaction}`}>
                    {sanction.worldReaction}
                  </span>
                </div>
                <p className="sanction-desc">{sanction.description}</p>
                <div className="sanction-meta">
                  <span>Active for {sanction.turnsActive} turns</span>
                  <span>Imposed by: {sanction.imposedBy.map(f => state.factions[f].shortName).join(', ')}</span>
                </div>
                {isImposer && (
                  <button
                    className="lift-btn"
                    onClick={() => handleLiftSanction(sanction.id)}
                  >
                    Lift Sanctions
                  </button>
                )}
                {isTarget && (
                  <div className="sanction-warning">
                    You are under these sanctions
                  </div>
                )}
              </div>
            );
          })}
          {economicState.activeSanctions.length === 0 && (
            <p className="no-data">No active sanctions</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSupplyChains = () => (
    <div className="econ-supply">
      <div className="supply-section">
        <h4>Your Supply Chain Dependencies</h4>
        <div className="chain-list">
          {economicState.supplyChains
            .filter(sc => sc.faction === state.playerFaction)
            .map((chain, i) => (
              <div key={i} className={`chain-card ${chain.disrupted ? 'disrupted' : ''}`}>
                <div className="chain-header">
                  <span className="chain-type">{chain.type.replace(/_/g, ' ')}</span>
                  {chain.disrupted && <span className="disrupted-badge">DISRUPTED</span>}
                </div>
                <div className="chain-deps">
                  <span>Depends on:</span>
                  {chain.dependsOn.map(dep => (
                    <span key={dep} className="dep-tag" style={{ borderColor: state.factions[dep].color }}>
                      {state.factions[dep].shortName}
                    </span>
                  ))}
                </div>
                <div className="chain-metrics">
                  <div className="chain-metric">
                    <span>Vulnerability</span>
                    <div className="mini-bar">
                      <div
                        className="mini-fill vulnerability"
                        style={{ width: `${chain.vulnerabilityLevel}%` }}
                      />
                    </div>
                    <span>{chain.vulnerabilityLevel}%</span>
                  </div>
                  <div className="chain-metric">
                    <span>Impact if disrupted</span>
                    <span className="impact-value">-{chain.economicImpact}% Economy</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="supply-section">
        <h4>Global Supply Chain Status</h4>
        <div className="global-chains">
          {economicState.supplyChains
            .filter(sc => sc.faction !== state.playerFaction)
            .map((chain, i) => (
              <div key={i} className={`chain-mini ${chain.disrupted ? 'disrupted' : ''}`}>
                <span className="faction-name">{state.factions[chain.faction].shortName}</span>
                <span className="chain-type">{chain.type.replace(/_/g, ' ')}</span>
                <span className={`chain-status ${chain.disrupted ? 'red' : 'green'}`}>
                  {chain.disrupted ? 'Disrupted' : 'Active'}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="supply-insight">
        <h4>Strategic Insight</h4>
        <p>
          Supply chain vulnerabilities can be exploited through targeted sanctions or military action.
          Diversifying dependencies through trade deals reduces your vulnerability.
        </p>
      </div>
    </div>
  );

  return (
    <div className="economics-panel">
      <div className="econ-header">
        <h3>Economic Overview</h3>
        <button className="close-btn" onClick={onClose}>x</button>
      </div>

      {notification && (
        <div className="econ-notification">
          {notification}
        </div>
      )}

      <div className="econ-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'trade' ? 'active' : ''}
          onClick={() => setActiveTab('trade')}
        >
          Trade
        </button>
        <button
          className={activeTab === 'sanctions' ? 'active' : ''}
          onClick={() => setActiveTab('sanctions')}
        >
          Sanctions
        </button>
        <button
          className={activeTab === 'supply' ? 'active' : ''}
          onClick={() => setActiveTab('supply')}
        >
          Supply Chains
        </button>
      </div>

      <div className="econ-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'trade' && renderTrade()}
        {activeTab === 'sanctions' && renderSanctions()}
        {activeTab === 'supply' && renderSupplyChains()}
      </div>
    </div>
  );
};

// Mini widget for sidebar
export const EconomicsMini: React.FC<{
  state: GameState;
  economicState: EconomicState;
  onClick: () => void;
}> = ({ state, economicState, onClick }) => {
  const summary = getEconomicSummary(state, economicState, state.playerFaction);

  return (
    <div className="economics-mini" onClick={onClick}>
      <div className="mini-header">
        <span className="mini-title">Economy</span>
        <span className="mini-expand">+</span>
      </div>
      <div className="mini-content">
        <div className="mini-stat">
          <span>Power</span>
          <span className="stat-value">{summary.economicPower.toFixed(0)}</span>
        </div>
        <div className="mini-stat">
          <span>Deals</span>
          <span className="stat-value">{summary.activeDeals.length}</span>
        </div>
        <div className="mini-stat">
          <span>Sanctions</span>
          <span className="stat-value">{summary.affectingSanctions.length}</span>
        </div>
      </div>
      {summary.supplyChainRisks.some(r => r.disrupted) && (
        <div className="mini-warning">Supply Chain Disrupted!</div>
      )}
    </div>
  );
};
