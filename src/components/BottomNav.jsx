import React from 'react';

function BottomNav() {
  return (
    <div className="bottom-nav">
      <button className="bottom-nav-item active">
        <i className="fa-solid fa-fire"></i>
        <span>Trending</span>
      </button>
      <button className="bottom-nav-item">
        <i className="fa-solid fa-compass"></i>
        <span>Explore</span>
      </button>
      <button className="bottom-nav-item">
        <i className="fa-regular fa-bookmark"></i>
        <span>Saved</span>
      </button>
      <button className="bottom-nav-item">
        <i className="fa-solid fa-gear"></i>
        <span>Preferences</span>
      </button>
    </div>
  );
}

export default BottomNav;
