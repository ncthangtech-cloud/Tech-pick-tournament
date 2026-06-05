'use client';

import React from 'react';

interface RankingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RankingRulesModal: React.FC<RankingRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Decorative Lotus Header */}
        <div className="modal-header">
          <svg className="modal-lotus" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 85C50 85 36 62 36 45C36 30 50 15 50 15C50 15 64 30 64 45C64 62 50 85 50 85Z" fill="currentColor"/>
            <path d="M50 85C50 85 24 68 20 52C16 36 28 28 28 28C28 28 38 45 50 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M50 85C50 85 76 68 80 52C84 36 72 28 72 28C72 28 62 45 50 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <h2 className="modal-title">Club Ranking System Rules</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            Standings are computed using points accumulated by players based on their tournament match wins and stage milestones.
          </p>

          <h3 className="section-title">Point Allocation Table</h3>
          <div className="rules-grid">
            <div className="rule-item">
              <span className="rule-badge win-badge">+100 pts</span>
              <span className="rule-label">Each Match Win</span>
            </div>
            <div className="rule-item">
              <span className="rule-badge champion-badge">+300 pts</span>
              <span className="rule-label">Tournament Champion</span>
            </div>
            <div className="rule-item">
              <span className="rule-badge runnerup-badge">+200 pts</span>
              <span className="rule-label">1st Runner-Up Placement</span>
            </div>
            <div className="rule-item">
              <span className="rule-badge semi-badge">+150 pts</span>
              <span className="rule-label">Semi-Finalist Placement</span>
            </div>
            <div className="rule-item">
              <span className="rule-badge quarter-badge">+100 pts</span>
              <span className="rule-label">Quarter-Finalist Placement</span>
            </div>
          </div>

          <div className="rules-info-banner">
            <strong>⚠️ Cumulative Calculations:</strong>
            <p>
              Points are fully cumulative. A tournament champion progresses through the Quarter-Finals, Semi-Finals, and Final match. Therefore, they accumulate the Champion bonus, the Semi-Finalist bonus, and the Quarter-Finalist bonus alongside points for all their matches won!
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-gold" onClick={onClose}>
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankingRulesModal;
