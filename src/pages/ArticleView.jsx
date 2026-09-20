import React from 'react';

function ArticleView({ article, onBack }) {
  const formatDate = (dateString) => {
    if(!dateString) return 'Just now';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const authorInitial = (article.author || 'U').charAt(0).toUpperCase();

  return (
    <section className="article-view">
      <div className="article-top-bar">
        <button className="back-btn" onClick={onBack}><i className="fa-solid fa-arrow-left"></i> Back to Trending</button>
        <div className="breadcrumbs">
          <span>Trending</span> <i className="fa-solid fa-chevron-right"></i> 
          <span style={{textTransform: 'capitalize'}}>{article.category || 'General'}</span> <i className="fa-solid fa-chevron-right"></i> 
          <span>Article</span>
        </div>
        <div className="article-actions">
          <button className="action-btn"><i className="fa-regular fa-bookmark"></i></button>
          <button className="action-btn"><i className="fa-solid fa-share-nodes"></i></button>
        </div>
      </div>

      <div className="article-header-meta">
        <span className="badge-primary">{article.category || 'General'}</span>
        <span className="badge-ai"><i className="fa-solid fa-bolt"></i> AI Digest Verified</span>
        <span className="badge-trending"><i className="fa-solid fa-fire"></i> Trending this week - 148k Reads</span>
      </div>

      <h1 className="article-title">{article.title}</h1>
      
      <div className="author-block">
        <div className="author-avatar">{authorInitial}</div>
        <div className="author-info">
          <div className="author-name">{article.author || 'Unknown Author'}</div>
          <div className="article-date">
            Published <span>{formatDate(article.publishedAt)}</span> • <span>4 min read</span> • <a href={article.url} target="_blank" rel="noreferrer">Source: Official Original Dispatch</a>
          </div>
        </div>
      </div>

      <div className="ai-briefing">
        <div className="briefing-header">
          <div className="briefing-title">
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Executive Briefing
            <span className="automated-tag">AUTOMATED SYNTHESIS</span>
          </div>
          <div className="model-tag">Model: Gemini Ultra Digest</div>
        </div>
        <ul className="briefing-list">
          <li><i className="fa-solid fa-shield-halved"></i> <strong>Summary:</strong> <span>{article.summary || article.description}</span></li>
        </ul>
      </div>

      <div className="article-hero-image">
        <img 
          src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt="Article hero" 
          onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}}
        />
        <div className="image-caption">
          <span>Synthesis graph visualization showing multi-modal neural nodes during a category 4 reasoning task.</span>
          <span>Photo: Open AI Research / Reuters</span>
        </div>
      </div>

      <div className="article-body">
        <p className="lead-paragraph">{article.description}</p>
        <p>This is a simulated article body because full content is often truncated by News APIs. In a production environment, this would contain the full rich text of the article.</p>
        
        <blockquote className="article-quote">
          <p>"This is not merely an incremental bump in accuracy; it represents a qualitative transition from pattern matching to verifiable synthetic deduction."</p>
          <footer>— Dr. Ash Thoma, Lead Computational Fellow at the Institute for Frontier Cognition</footer>
        </blockquote>

        <p>The implications of this performance leap extend far beyond academic benchmarks. As the model can successfully tackle cross-disciplinary tasks, we can expect significant advancements in areas such as automated scientific discovery and complex system analysis.</p>
      </div>

       <div className="full-article-link-container">
          <a href={article.url} target="_blank" rel="noreferrer" className="read-full-btn">Read Full Original Article <i className="fa-solid fa-arrow-right"></i></a>
       </div>

    </section>
  );
}

export default ArticleView;
