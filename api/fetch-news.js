
export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const dbUrl = process.env.FIREBASE_DATABASE_URL;
    const fbResponse = await fetch(`${dbUrl}/trending-news/articles.json');
    const articles = await fbResponse.json() || [];

    if (articles.length === 0) {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${process.env.NEWS_API_KEY}`
      );
      const data = await response.json();

      return res.status(200).json({
        success: true,
        articles: data.articles || [],
        source: 'newsapi',
      });
    }

    return res.status(200).json({
      success: true,
      articles,
      source: 'cached',
      count: articles.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
