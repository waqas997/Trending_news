import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import StatusHeader from '../components/StatusHeader';
import CategoryFilter from '../components/CategoryFilter';
import NewsCard from '../components/NewsCard';

function GridView({ news, loading, currentFilter, onFilterChange, totalCount, hasMore, loadMore, seoOverrides }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const pageTitle = seoOverrides?.title || "Trending News | Global AI & Market Updates";
  const pageDescription = seoOverrides?.description || "Discover the latest trending news globally and locally. Stay updated on AI, tech, markets, and more.";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": window.location.href,
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <section id="grid-view">
        {seoOverrides?.h1 && <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>{seoOverrides.h1}</h1>}
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
              <NewsCard key={idx} article={article} />
            ))
          )}
        </div>
        
        {/* Infinite Scroll Loader */}
        {!loading && hasMore && (
          <div ref={loaderRef} className="infinite-scroll-loader" style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px' }}></div>
            <p style={{ marginTop: '10px' }}>Loading more articles...</p>
          </div>
        )}
        
        {!loading && !hasMore && news.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            <p>You have reached the end of the news.</p>
          </div>
        )}
      </section>
    </>
  );
}

export default GridView;
