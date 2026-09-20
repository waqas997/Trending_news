import React from 'react';
import StatusHeader from '../components/StatusHeader';
import CategoryFilter from '../components/CategoryFilter';
import NewsCard from '../components/NewsCard';

function GridView({ news, loading, currentFilter, onFilterChange, onArticleClick, totalCount, currentPage, totalPages, onPageChange }) {
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
      {totalPages > 1 && !loading && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="pagination-btn" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div>
      )}
    </section>
  );
}

export default GridView;
