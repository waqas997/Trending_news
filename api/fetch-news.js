
export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const countryParam = (req.query && req.query.country) ? req.query.country.toLowerCase() : 'global';
    
    const dbUrl = process.env.FIREBASE_DATABASE_URL;
    const fbResponse = await fetch(`${dbUrl}/trending-news/articles.json`);
    let globalArticles = await fbResponse.json() || [];
    if (!Array.isArray(globalArticles)) {
        globalArticles = [];
    }

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
          localArticles = localData.articles.map(article => ({...article, isLocal: true, trending: true}));
        }
      } catch (err) {
        console.error('Failed to fetch local news from NewsAPI', err);
      }
    }

    // Merge local news on top of global news
    // Filter out global news that might be duplicates (by title or url)
    const localTitles = new Set(localArticles.map(a => a.title));
    const filteredGlobal = globalArticles.filter(a => !localTitles.has(a.title));
    
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
