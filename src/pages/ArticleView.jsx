import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function ArticleView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [article, setArticle] = useState(location.state?.article || null);
  const [loading, setLoading] = useState(!location.state?.article);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchArticle = async () => {
      // If we already have the article from router state, we can skip fetching it 
      // but we might still want to fetch related articles
      if (article) {
        setLoading(false);
        try {
          const relatedRes = await fetch(`/api/fetch-news?country=global`);
          const relatedData = await relatedRes.json();
          if (relatedData.success && relatedData.articles) {
            setRelatedArticles(relatedData.articles.filter(a => a.slug !== slug).slice(0, 3));
          }
        } catch (e) {
          console.error(e);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/article?slug=${slug}`);
        const data = await response.json();
        if (data.success && data.article) {
          setArticle(data.article);
          
          // Fetch some related articles
          const relatedRes = await fetch(`/api/fetch-news?country=global`);
          const relatedData = await relatedRes.json();
          if (relatedData.success && relatedData.articles) {
            setRelatedArticles(relatedData.articles.filter(a => a.slug !== slug).slice(0, 3));
          }
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error("Failed to fetch article", err);
        setArticle(null);
      }
      setLoading(false);
    };

    if (slug) fetchArticle();
  }, [slug]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading article...</div>;
  }

  if (!article) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
        <h2>Article not found</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
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
  const domain = import.meta.env.VITE_SITE_URL || window.location.origin;

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
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Trending News AI",
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/favicon.ico`
      }
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": domain },
      { "@type": "ListItem", "position": 2, "name": article.topic || article.category || "News", "item": `${domain}/ai-news` },
      { "@type": "ListItem", "position": 3, "name": article.title }
    ]
  };

  const sourceName = article.source?.name || 'Unknown Source';

  return (
    <>
      <Helmet>
        <title>{article.title} | Trending News</title>
        <meta name="description" content={article.description || article.summary || "Read the latest trending news."} />
        <link rel="canonical" href={`${domain}/article/${article.slug}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description || article.summary} />
        <meta property="og:image" content={article.urlToImage} />
        <meta property="og:url" content={`${domain}/article/${article.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <section className="article-view">
        <div className="article-top-bar">
          <button className="back-btn" onClick={() => navigate('/')}><i className="fa-solid fa-arrow-left"></i> Back to Trending</button>
          <button className="generate-audio-btn desktop-hidden"><i className="fa-solid fa-headphones"></i> Listen</button>
          <div className="breadcrumbs mobile-hidden">
            <Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trending</Link> <i className="fa-solid fa-chevron-right"></i> 
            <span style={{textTransform: 'capitalize'}}> {article.topic || article.category || 'General'}</span> <i className="fa-solid fa-chevron-right"></i> 
            <span> Article</span>
          </div>
          <div className="article-actions">
            <button className="action-btn" title="Save"><i className="fa-regular fa-bookmark"></i></button>
            <button className="action-btn" title="Share" onClick={() => navigator.clipboard.writeText(window.location.href)}><i className="fa-solid fa-share-nodes"></i></button>
          </div>
        </div>

        <div className="article-header-meta">
          <span className="badge-primary">{article.topic || article.category || 'General'}</span>
          <span className="badge-ai"><i className="fa-solid fa-bolt"></i> AI Digest Verified</span>
        </div>

        <h1 className="article-title">{article.title}</h1>
        
        <div className="author-block">
          <div className="author-avatar">{authorInitial}</div>
          <div className="author-info">
            <div className="author-name">{article.author || 'Unknown Author'}</div>
            <div className="article-date">
              Published <span>{formatDate(article.publishedAt)}</span> • <span>4 min read</span> • <a href={article.url} target="_blank" rel="noreferrer">Source: {sourceName}</a>
            </div>
          </div>
        </div>

        <div className="ai-briefing">
          <div className="briefing-header">
            <div className="briefing-title-container">
              <i className="fa-solid fa-wand-magic-sparkles"></i> 
              <span className="briefing-title-text">AI EXECUTIVE BRIEFING</span>
            </div>
            <div className="model-tag">Gemini 2.5 Flash</div>
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
            alt={article.imageAlt || article.title}
            loading="lazy"
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
        
        {/* Dynamic Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="trending-related-section desktop-hidden">
            <div className="trending-related-header">
              <h3><i className="fa-solid fa-arrow-trend-up"></i> Trending in Tech & Markets</h3>
              <button className="view-all-btn" onClick={() => navigate('/')}>View All <i className="fa-solid fa-chevron-right"></i></button>
            </div>
            
            <div className="related-cards">
              {relatedArticles.map((related, idx) => (
                <div className="related-card" key={idx} onClick={() => navigate(`/article/${related.slug}`)} style={{cursor: 'pointer'}}>
                  <img src={related.urlToImage || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'} alt={related.title} loading="lazy" />
                  <div className="related-card-content">
                    <h4>{related.title}</h4>
                    <p>{(related.summary || related.description || '').substring(0, 60)}...</p>
                    <div className="related-card-meta">
                      <span>{formatDate(related.publishedAt)}</span>
                      <span className="read-link">Read Brief <i className="fa-solid fa-chevron-right"></i></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>
    </>
  );
}

export default ArticleView;
