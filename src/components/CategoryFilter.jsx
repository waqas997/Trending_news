import React from 'react';

const CATEGORIES = ['All', 'Technology', 'Business', 'Health', 'Sports', 'Entertainment', 'General'];

function CategoryFilter({ currentFilter, onFilterChange }) {
  return (
    <div className="categories">
      {CATEGORIES.map(category => (
        <button 
          key={category} 
          className={`category-pill ${currentFilter.toLowerCase() === category.toLowerCase() ? 'active' : ''}`}
          onClick={() => onFilterChange(category.toLowerCase())}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
