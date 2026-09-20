import React from 'react';
import StatusHeader from '../components/StatusHeader';
import CategoryFilter from '../components/CategoryFilter';
import NewsCard from '../components/NewsCard';

function GridView({ news, loading, currentFilter, onFilterChange, onArticleClick, totalCount }) {
  return (
    <section id="grid-view">
      <StatusHeader totalCount={totalCount} />
      <CategoryFilter currentFilter={currentFilter} onFilterChange={onFilterChange} />
      
      <div className="news-grid">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Synthesizing global news trends...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="loading">
            <p>No articles found for this category or search.</p>
          </div>
        ) : (
          news.map((article, idx) => (
            <NewsCard key={idx} article={article} onClick={onArticleClick} />
          ))
        )}
      </div>
    </section>
  );
}

export default GridView;
