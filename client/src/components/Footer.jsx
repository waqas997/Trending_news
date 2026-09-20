import React from 'react';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="engine-icon">
            <i className="fa-solid fa-sparkles"></i>
          </div>
          <div className="engine-info">
            <h4>Automated Intelligence Engine</h4>
            <p>Continuous analysis of worldwide journalism sources</p>
          </div>
        </div>
        <div className="footer-right">
          <p><i className="fa-regular fa-clock"></i> Last updated: {new Date().toLocaleString()}</p>
          <p><i className="fa-solid fa-rotate"></i> Next automatic update: Every Monday at 2:00 AM UTC</p>
          <p><i className="fa-solid fa-database"></i> Data from NewsAPI | Summaries curated via Gemini AI</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
