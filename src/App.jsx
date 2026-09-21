import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import GridView from './pages/GridView';
import ArticleView from './pages/ArticleView';

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
    const matchesFilter = currentFilter === 'all' || (article.category || '').toLowerCase() === currentFilter.toLowerCase();
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
              />
            } 
          />
          <Route 
            path="/article/:slug" 
            element={<ArticleView news={news} loading={loading} />} 
          />
        </Routes>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

export default App;
