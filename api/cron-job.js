

// Initialize Firebase




/**
 * Scheduled job that runs every Monday at 2 AM
 * Fetches news, processes with AI, and updates database
 */
export const maxDuration = 60;

export default async function handler(req, res) {
  // Verify Vercel cron secret for security
  if (req.query.token !== process.env.CRON_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const dbUrl = process.env.FIREBASE_DATABASE_URL;

  try {
    console.log('🚀 Starting cron job - Fetching trending news...');

    // Step 1: Fetch news from NewsAPI
    const newsResponse = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&sortBy=popularity&apiKey=${process.env.NEWS_API_KEY}`
    );
    const newsData = await newsResponse.json();

    if (!newsData.articles || newsData.articles.length === 0) {
      return res.status(400).json({ message: 'No articles found from NewsAPI' });
    }

    console.log(`✅ Fetched ${newsData.articles.length} articles from NewsAPI`);

    // Step 2: Process articles with AI (summarize, categorize)
    const processedArticles = [];
    for (const article of newsData.articles) {
      try {
        const summary = await summarizeWithAI(article.description);
        const category = categorizeArticle(article.title, article.description);
        processedArticles.push({ ...article, summary, category, processedAt: new Date().toISOString(), trending: true });
      } catch (err) {
        processedArticles.push(article);
      }
    }

    const rankedArticles = processedArticles.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));

    await fetch(`${dbUrl}/trending-news.json`, {
      method: 'PATCH',
      body: JSON.stringify({
        articles: rankedArticles,
        lastUpdated: new Date().toISOString(),
      })
    });

    await fetch(`${dbUrl}/metadata.json`, {
      method: 'PATCH',
      body: JSON.stringify({
        lastUpdate: new Date().toISOString(),
        articleCount: rankedArticles.length,
        status: 'success',
      })
    });

    return res.status(200).json({
      success: true,
      message: 'News updated successfully',
      articlesProcessed: rankedArticles.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);

    // Log error to database
    await fetch(`${dbUrl}/logs/errors.json`, { method: 'POST', body: JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: 'Cron job failed',
      error: error.message,
    });
  }
}

/**
 * Summarize article description using Hugging Face API
 */
async function summarizeWithAI(text) {
  if (!text || text.length < 20) return text;

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}` },
      method: 'POST',
      body: JSON.stringify({ inputs: text.substring(0, 1024) }), // Limit to 1024 chars
    });

    const result = await response.json();

    if (Array.isArray(result) && result[0]) {
      return result[0].summary_text || text;
    }
    return text;
  } catch (error) {
    console.error('AI summarization failed:', error);
    return text;
  }
}

/**
 * Categorize article based on keywords
 */
function categorizeArticle(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  const categories = {
    technology: ['ai', 'tech', 'software', 'app', 'digital', 'cyber', 'robot', 'code', 'apple', 'google', 'microsoft', 'tesla', 'crypto', 'bitcoin', 'internet', 'web'],
    business: ['business', 'market', 'stock', 'economy', 'trade', 'company', 'sales', 'ceo', 'startup', 'finance', 'wall street', 'bank', 'investor'],
    health: ['health', 'medical', 'hospital', 'disease', 'virus', 'doctor', 'vaccine', 'cancer', 'fda', 'diet', 'nutrition', 'fitness', 'mental'],
    sports: ['sports', 'football', 'basketball', 'soccer', 'game', 'player', 'team', 'ufc', 'mma', 'nfl', 'nba', 'mlb', 'nhl', 'wwe', 'tennis', 'golf', 'olympics', 'championship'],
    entertainment: ['movie', 'music', 'celebrity', 'film', 'actor', 'show', 'award', 'hollywood', 'netflix', 'disney', 'star', 'singer', 'album', 'concert'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'general';
}

/**
 * Calculate trending score based on various factors
 */
function calculateTrendingScore(article) {
  let score = 0;

  // Recency (newer = higher score)
  const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  score += Math.max(0, 100 - hoursOld * 2);

  // Source reliability
  const reliableSources = ['BBC', 'Reuters', 'AP News', 'NPR', 'CNN'];
  if (reliableSources.some(source => article.source?.name?.includes(source))) {
    score += 30;
  }

  // Title length (comprehensive titles = higher score)
  score += Math.min(20, article.title?.length / 5 || 0);

  // Has image
  if (article.urlToImage) {
    score += 15;
  }

  return score;
}
