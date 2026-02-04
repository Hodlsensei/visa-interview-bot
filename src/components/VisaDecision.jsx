import React from 'react';
import './VisaDecision.css';

const VisaDecision = ({ decision, onRestart }) => {
  const getStatusColor = () => {
    switch(decision.decision) {
      case 'GRANTED': return '#22c55e';
      case 'DENIED': return '#ef4444';
      case 'PENDING': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch(decision.decision) {
      case 'GRANTED': return '✓';
      case 'DENIED': return '✗';
      case 'PENDING': return '⏳';
      default: return '?';
    }
  };

  return (
    <div className="visa-decision-container">
      <div className="decision-card">
        <div 
          className="decision-status"
          style={{ backgroundColor: getStatusColor() }}
        >
          <span className="status-icon">{getStatusIcon()}</span>
          <h1 className="status-text">{decision.decision}</h1>
        </div>
        
        <div className="decision-details">
          <div className="score-section">
            <h3>Interview Score</h3>
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ 
                  width: `${decision.score}%`,
                  backgroundColor: getStatusColor()
                }}
              />
            </div>
            <p className="score-value">{decision.score}/100</p>
          </div>

          <div className="reason-section">
            <h3>Decision Reason</h3>
            <p>{decision.reason}</p>
          </div>

          {decision.redFlags && decision.redFlags.length > 0 && (
            <div className="red-flags-section">
              <h3>⚠️ Issues Identified</h3>
              <ul>
                {decision.redFlags.map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {decision.positives && decision.positives.length > 0 && (
            <div className="positives-section">
              <h3>✓ Strengths</h3>
              <ul>
                {decision.positives.map((positive, index) => (
                  <li key={index}>{positive}</li>
                ))}
              </ul>
            </div>
          )}

          {decision.nextSteps && decision.nextSteps.length > 0 && (
            <div className="next-steps-section">
              <h3>Next Steps</h3>
              <ul>
                {decision.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button 
          className="retry-button"
          onClick={onRestart}
        >
          Practice Again
        </button>
      </div>
    </div>
  );
};

export default VisaDecision;