import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createSlug } from '../utils';

function NewsCard({ article }) {
  const [bookmarked, setBookmarked] = useState(false);
  
  const formatDate = (dateString) => {
    if(!dateString) return 'Just now';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const articleSlug = createSlug(article.title);

  return (
    <Link to={`/article/${articleSlug}`} className="news-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <article>
        <div className="card-image-wrapper">
          <img 
            src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
            alt={article.title} 
            onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}}
          />
          <div className="card-badges">
            <span className="badge-category">{article.category || 'General'}</span>
            <span className="badge-ai-digest"><i className="fa-solid fa-bolt"></i> AI Digest</span>
          </div>
          <button className="bookmark-btn" onClick={handleBookmark}>
            <i className={bookmarked ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} style={{ color: bookmarked ? 'var(--primary-color)' : 'inherit' }}></i>
          </button>
        </div>
        <div className="card-content">
          <h2 className="card-title">{article.title}</h2>
          <p className="card-summary">{article.description || 'Read full article for more details'}</p>
          <div className="card-meta">
            <span>{formatDate(article.publishedAt)}</span> • 
            <span>{article.author || 'Unknown'}</span> • 
            <span>4 min read</span>
          </div>
          <button className="card-read-btn">
            Read Full Article <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </article>
    </Link>
  );
}

export default NewsCard;
