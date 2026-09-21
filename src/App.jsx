import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import GridView from './pages/GridView';
import ArticleView from './pages/ArticleView';
import StaticPages from './pages/StaticPages';
import NotFound from './pages/NotFound';

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const CARDS_PER_BATCH = 10;
  const location = useLocation();

  const [selectedCountry, setSelectedCountry] = useState('global');

  useEffect(() => {
    // Detect user country via IP
    const detectCountry = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData && ipData.country_code) {
          const code = ipData.country_code.toLowerCase();
          setSelectedCountry(code);
        }
      } catch (err) {
        console.error('Failed to detect country', err);
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/fetch-news?country=${selectedCountry}`);
        const data = await response.json();
        setNews(data.articles || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch news', error);
        setLoading(false);
      }
    };

    if (selectedCountry) {
      fetchNews();
    }
  }, [selectedCountry]);

  useEffect(() => {
    setVisibleCount(CARDS_PER_BATCH);
  }, [currentFilter, searchQuery, selectedCountry]);

  const filteredNews = news.filter(article => {
    const matchesFilter = currentFilter === 'all' || (article.topic || article.category || '').toLowerCase() === currentFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
                          (article.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (article.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const hasMore = visibleCount < filteredNews.length;
  const visibleNews = filteredNews.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => prev + CARDS_PER_BATCH);
  };

  const isArticlePage = location.pathname.startsWith('/article/');

  // Helper for category routes to enforce topics without clicking the filter bar
  const renderCategoryGrid = (topic, seoOverrides) => (
    <GridView 
      news={news.filter(a => (a.topic || a.category || '').toLowerCase() === topic.toLowerCase()).slice(0, visibleCount)}
      loading={loading}
      currentFilter={topic}
      onFilterChange={(f) => {
        // If a user clicks a filter while on a category page, we just change the state
        setCurrentFilter(f);
      }}
      totalCount={news.filter(a => (a.topic || a.category || '').toLowerCase() === topic.toLowerCase()).length}
      hasMore={visibleCount < news.filter(a => (a.topic || a.category || '').toLowerCase() === topic.toLowerCase()).length}
      loadMore={loadMore}
      seoOverrides={seoOverrides}
    />
  );

  return (
    <>
      <Navigation 
        onSearch={setSearchQuery} 
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
      />
      
      <main className={`main-container ${isArticlePage ? "article-view-container" : ""}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              <GridView 
                news={visibleNews}
                loading={loading}
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
                totalCount={filteredNews.length}
                hasMore={hasMore}
                loadMore={loadMore}
                seoOverrides={{
                  title: 'Trending AI News, Tools & Technology | Trending News AI',
                  description: 'Discover the latest AI news, tools, startups and developer updates, explained clearly and updated daily.',
                  h1: 'Latest Trending News'
                }}
              />
            } 
          />
          <Route path="/ai-news" element={renderCategoryGrid('ai news', {
            title: 'Latest AI News & Updates | Trending News AI',
            description: 'Stay updated with the latest artificial intelligence news, AI model releases, companies, tools and major developments.',
            h1: 'Latest AI News'
          })} />
          <Route path="/ai-tools" element={renderCategoryGrid('ai tools', {
            title: 'Best AI Tools & Platforms | Trending News AI',
            description: 'Discover the top new AI tools, platforms, and frameworks changing the way we work.',
            h1: 'New AI Tools'
          })} />
          <Route path="/ai-coding" element={renderCategoryGrid('ai coding', {
            title: 'AI Coding & Developer Tools | Trending News AI',
            description: 'Explore the latest AI software, developer tools, agents, and programming updates.',
            h1: 'AI for Developers'
          })} />
          <Route path="/ai-startups" element={renderCategoryGrid('ai startups', {
            title: 'AI Startups & Funding News | Trending News AI',
            description: 'The latest news on AI startups, founders, investments, and funding rounds.',
            h1: 'AI Startups & Business'
          })} />
          <Route path="/ai-apps" element={renderCategoryGrid('ai apps', {
            title: 'Top AI Apps for iOS & Android | Trending News AI',
            description: 'Find the best new artificial intelligence apps for mobile and web.',
            h1: 'Best AI Apps'
          })} />

          <Route path="/about" element={<StaticPages page="about" />} />
          <Route path="/contact" element={<StaticPages page="contact" />} />
          <Route path="/privacy-policy" element={<StaticPages page="privacy-policy" />} />
          <Route path="/terms" element={<StaticPages page="terms" />} />

          <Route 
            path="/article/:slug" 
            element={<ArticleView />} 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

export default App;
