import React from 'react';

const CATEGORIES = ['All', 'Technology', 'Business', 'Health', 'Sports', 'Entertainment', 'Science'];

function CategoryFilter({ currentFilter, onFilterChange }) {
  return (
    <div className="categories">
      {CATEGORIES.map(category => (
        <button 
          key={category} 
          className={`category-pill ${currentFilter.toLowerCase() === category.toLowerCase() ? 'active' : ''}`}
          onClick={() => onFilterChange(category.toLowerCase())}
        >
          {category === 'Science' ? 'General / Science' : category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
