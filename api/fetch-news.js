export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const countryParam = (req.query && req.query.country) ? req.query.country.toLowerCase() : 'global';
    
    const dbUrl = process.env.FIREBASE_DATABASE_URL;
    const fbResponse = await fetch(`${dbUrl}/trending-news/articles.json`);
    const articlesData = await fbResponse.json();
    
    // Firebase returns an object map keyed by slug. Convert to array.
    let globalArticles = [];
    if (articlesData && typeof articlesData === 'object') {
      globalArticles = Object.values(articlesData);
    }

    // Sort globally fetched articles by publishedAt descending
    globalArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    let localArticles = [];
    
    // Fetch local news if a specific country is requested
    if (countryParam && countryParam !== 'global' && countryParam !== 'us') {
      const SUPPORTED_COUNTRIES = ['ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz','de','eg','fr','gb','gr','hk','hu','id','ie','il','in','it','jp','kr','lt','lv','ma','mx','my','ng','nl','no','nz','ph','pl','pt','ro','rs','ru','sa','se','sg','si','sk','th','tr','tw','ua','us','ve','za'];
      
      let newsApiUrl = '';
      if (SUPPORTED_COUNTRIES.includes(countryParam)) {
        newsApiUrl = `https://newsapi.org/v2/top-headlines?country=${countryParam}&pageSize=15&apiKey=${process.env.NEWS_API_KEY}`;
      } else {
        // Fallback for unsupported countries like Pakistan (pk)
        const countryNames = { 'pk': 'Pakistan' };
        const queryName = countryNames[countryParam] || countryParam;
        newsApiUrl = `https://newsapi.org/v2/everything?q=${queryName}&sortBy=popularity&pageSize=15&apiKey=${process.env.NEWS_API_KEY}`;
      }
      
      try {
        const localRes = await fetch(newsApiUrl);
        const localData = await localRes.json();
        if (localData && localData.articles) {
          // Add a local flag so frontend can highlight them if needed
          localArticles = localData.articles.map(article => {
             // Create slug for local articles on the fly since they bypass cron
             const slug = (article.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
             return {
                 ...article, 
                 slug,
                 isLocal: true, 
                 trending: true,
                 source: { name: article.source?.name || 'Unknown', url: article.url },
             };
          }).filter(a => a.slug);
        }
      } catch (err) {
        console.error('Failed to fetch local news from NewsAPI', err);
      }
    }

    // Merge local news on top of global news
    // Filter out global news that might be duplicates (by slug)
    const localSlugs = new Set(localArticles.map(a => a.slug));
    const filteredGlobal = globalArticles.filter(a => !localSlugs.has(a.slug));
    
    const finalArticles = [...localArticles, ...filteredGlobal];

    res.setHeader('Cache-Control', 'max-age=3600');
    return res.status(200).json({
      success: true,
      articles: finalArticles,
      source: localArticles.length > 0 ? 'newsapi+cached' : 'cached',
      count: finalArticles.length,
    });
  } catch (error) {
    console.error('Fetch News Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
