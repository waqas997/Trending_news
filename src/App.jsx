import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import GridView from './pages/GridView';
import ArticleView from './pages/ArticleView';
import { mockNews } from './data/mockData';

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 10;

  useEffect(() => {
    // Simulate API fetch
    const fetchNews = async () => {
      try {
        // In a real app, you would fetch from your backend here:
        const response = await fetch('/api/fetch-news');
        const data = await response.json();
        setNews(data.articles);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch news', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter, searchQuery]);

  const filteredNews = news.filter(article => {
    const matchesFilter = currentFilter === 'all' || (article.category || '').toLowerCase() === currentFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
                          (article.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (article.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNews.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + CARDS_PER_PAGE);

  return (
    <>
      <Navigation onSearch={setSearchQuery} />
      
      <main className="main-container">
        {selectedArticle ? (
          <ArticleView 
            article={selectedArticle} 
            onBack={() => setSelectedArticle(null)} 
          />
        ) : (
          <GridView 
            news={paginatedNews}
            loading={loading}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            onArticleClick={setSelectedArticle}
            totalCount={filteredNews.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>

      <Footer />
    </>
  );
}

export default App;
