import React from 'react';

function StatusHeader({ totalCount }) {
  return (
    <div className="sub-header">
      <div className="live-feed-status">
        <span className="status-dot pulse"></span>
        <span>Live Feed Active</span>
        <span className="divider">•</span>
        <span>Refreshes weekly with AI synthesis</span>
        <span className="badge-automated">v2.4 Automated</span>
      </div>
      <div className="stats-right">
        <i className="fa-solid fa-arrow-trend-up"></i>
        <span>{totalCount}</span> Trends Synthesized
        <span className="divider">•</span>
        <span>+34% vs last week</span>
      </div>
    </div>
  );
}

export default StatusHeader;
