import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { createSlug } from '../utils';

function ArticleView({ news, loading }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Find article by matching the slug
  const article = news.find(a => createSlug(a.title) === slug);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading article...</div>;
  }

  if (!article) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Article not found</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Return Home
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if(!dateString) return 'Just now';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const authorInitial = (article.author || 'U').charAt(0).toUpperCase();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [
      article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    "datePublished": article.publishedAt || new Date().toISOString(),
    "author": [{
        "@type": "Person",
        "name": article.author || "Unknown"
    }]
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Trending News</title>
        <meta name="description" content={article.description || article.summary || "Read the latest trending news."} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <section className="article-view">
        <div className="article-top-bar">
          <button className="back-btn" onClick={() => navigate('/')}><i className="fa-solid fa-arrow-left"></i> Back to Trending</button>
          <button className="generate-audio-btn desktop-hidden"><i className="fa-solid fa-headphones"></i> Generate Audio</button>
          <div className="breadcrumbs mobile-hidden">
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
            <div className="briefing-title-container">
              <i className="fa-solid fa-wand-magic-sparkles"></i> 
              <span className="briefing-title-text">AI EXECUTIVE BRIEFING <br/> (AUTOMATED SYNTHESIS)</span>
            </div>
            <div className="model-tag">Gemini Ultra Custom</div>
          </div>
          <ul className="briefing-list">
            <li>
              <i className="fa-solid fa-shield-halved"></i> 
              <div>
                <strong>Summary:</strong> <span>{article.summary || article.description}</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="article-hero-image">
          <img 
            src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
            alt="Article hero" 
            onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}}
          />
        </div>

        <div className="article-body">
          <p>
            {article.content 
              ? article.content.split('[+')[0] 
              : "Detailed article content is currently unavailable. Please click 'Read Full Original Article' below to continue reading."}
          </p>
        </div>

        <div className="full-article-link-container">
            <a href={article.url} target="_blank" rel="noreferrer" className="read-full-btn">Read Full Original Article <i className="fa-solid fa-arrow-right"></i></a>
        </div>
        
        {/* NEW STATIC SECTIONS FOR MOBILE MOCKUP */}
        <div className="article-benchmarks desktop-hidden">
          <h3 className="benchmarks-title"><i className="fa-solid fa-chart-simple"></i> Standardized Evaluation Benchmarks</h3>
          <div className="benchmarks-subtitle">Assessed via Multi-Agent Protocol 45.2</div>
          
          <div className="benchmark-item">
            <div className="benchmark-header">
              <span className="benchmark-name">MMLU-Pro Reasoning</span>
              <span className="benchmark-score">94.2%</span>
            </div>
            <div className="benchmark-bar-container">
              <div className="benchmark-bar" style={{width: '94.2%', backgroundColor: '#4a5ee0'}}></div>
            </div>
            <div className="benchmark-footer">
              <span>Human Baseline: 89.4%</span>
              <span>Previous Best: 91.3%</span>
            </div>
          </div>

          <div className="benchmark-item">
            <div className="benchmark-header">
              <span className="benchmark-name">CodeBench L5 Execution</span>
              <span className="benchmark-score" style={{color: '#9c27b0'}}>Record High 91.8%</span>
            </div>
            <div className="benchmark-bar-container">
              <div className="benchmark-bar" style={{width: '91.8%', backgroundColor: '#9c27b0'}}></div>
            </div>
            <div className="benchmark-footer">
              <span>Human Expert Average: 81.2%</span>
              <span>Prev Benchmark: 86.4%</span>
            </div>
          </div>
        </div>

        <div className="trending-related-section desktop-hidden">
          <div className="trending-related-header">
            <h3><i className="fa-solid fa-arrow-trend-up"></i> Trending in Tech & Markets</h3>
            <button className="view-all-btn">View All <i className="fa-solid fa-chevron-right"></i></button>
          </div>
          
          <div className="related-cards">
            <div className="related-card">
              <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Tech Stocks" />
              <div className="related-card-content">
                <h4>Global Markets Rally as Tech Giants Post Record Q3 AI Earnings</h4>
                <p>Nvidia and Alphabet obliterate estimates...</p>
                <div className="related-card-meta">
                  <span>9 hours ago</span>
                  <span className="read-link">Read Brief <i className="fa-solid fa-chevron-right"></i></span>
                </div>
              </div>
            </div>
            
            <div className="related-card">
              <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Gene Therapy" />
              <div className="related-card-content">
                <h4>Breakthrough Gene Therapy Treatment Receives Fast Track FDA...</h4>
                <p>Clinical phase three outcomes demonstrate...</p>
                <div className="related-card-meta">
                  <span>12 hours ago</span>
                  <span className="read-link">Read Brief <i className="fa-solid fa-chevron-right"></i></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="refresh-notice">
            <p>Next auto-refresh summary: 12 Hours, 45 Min (EST)</p>
            <p>You can override system Protocol Monday at 10:00 AM EST.</p>
            <div className="refresh-actions">
              <button>MANUAL REFRESH</button>
              <button>SCHEDULE WEEKLY SUMMARY</button>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}

export default ArticleView;
