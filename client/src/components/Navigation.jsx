import React from 'react';

function Navigation({ onSearch }) {
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <button className="menu-btn"><i className="fa-solid fa-bars"></i></button>
        <div className="logo-container">
          <h1>TRENDING NEWS</h1>
          <p>Updated automatically every week with AI-powered summaries</p>
        </div>
      </div>
      
      <div className="nav-center">
        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            placeholder="Search trending news..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <button className="search-btn">Search</button>
        </div>
      </div>
      
      <div className="nav-right">
        <div className="nav-pills">
          <button className="nav-pill active">Trending</button>
          <button className="nav-pill">Categories</button>
          <button className="nav-pill">Archive</button>
        </div>
        <button className="profile-btn"><i className="fa-regular fa-user"></i></button>
      </div>
    </nav>
  );
}

export default Navigation;
