import { TwitterApi } from 'twitter-api-v2';

// Initialize Firebase

/**
 * Scheduled job that runs every day at 2 AM
 * Fetches news, processes with AI, and updates database
 */
export const maxDuration = 60;

export default async function handler(req, res) {
  // Verify Vercel cron secret for security (Phase 25)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_TOKEN}` && req.query.token !== process.env.CRON_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const dbUrl = process.env.FIREBASE_DATABASE_URL;

  try {
    console.log('🚀 Starting cron job - Fetching trending news...');

    // Step 1: Fetch general top headlines so all categories are populated
    const newsResponse = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&sortBy=popularity&apiKey=${process.env.NEWS_API_KEY}`
    );
    const newsData = await newsResponse.json();

    if (!newsData.articles || newsData.articles.length === 0) {
      return res.status(400).json({ message: 'No articles found from NewsAPI' });
    }

    console.log(`✅ Fetched ${newsData.articles.length} articles from NewsAPI`);

    // Helper to generate a slug
    const createSlug = (title) => {
      if (!title) return '';
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    };

    // Step 2: Process articles with AI (summarize, categorize)
    const processPromises = newsData.articles.map(async (article) => {
      try {
        // Timeout the HF call so we don't crash the whole function
        const summaryPromise = summarizeWithAI(article.description);
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(article.description), 4000));
        const summary = await Promise.race([summaryPromise, timeoutPromise]);
        
        const category = categorizeArticle(article.title, article.description);
        const slug = createSlug(article.title);

        return { 
          ...article, 
          slug,
          summary, 
          category, 
          topic: category, // Phase 11
          source: {
            name: article.source?.name || 'Unknown Source',
            url: article.url
          },
          imageAlt: article.title,
          processedAt: new Date().toISOString(), 
          trending: true 
        };
      } catch (err) {
        return article;
      }
    });
    
    const processedArticles = await Promise.all(processPromises);

    // Filter out articles with no title or slug
    const validArticles = processedArticles.filter(a => a.slug);

    // Create an object map keyed by slug (Phase 22, 23)
    const articlesMap = {};
    validArticles.forEach(article => {
      articlesMap[article.slug] = article;
    });

    // Patch the articles to Firebase (adds/updates without deleting existing)
    await fetch(`${dbUrl}/trending-news/articles.json`, {
      method: 'PATCH',
      body: JSON.stringify(articlesMap)
    });

    await fetch(`${dbUrl}/trending-news/metadata.json`, {
      method: 'PATCH',
      body: JSON.stringify({
        lastUpdate: new Date().toISOString(),
        latestArticlesProcessed: validArticles.length,
        status: 'success',
      })
    });

    // --- TWITTER INTEGRATION ---
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET) {
      try {
        const twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY,
          appSecret: process.env.TWITTER_API_SECRET,
          accessToken: process.env.TWITTER_ACCESS_TOKEN,
          accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });

        const rwClient = twitterClient.readWrite;

        // Take the top most popular article that was just summarized
        if (validArticles.length > 0) {
          const topArticle = validArticles[0];
          // Construct tweet text. Keep it under 280 characters.
          const shortUrl = topArticle.url;
          const tag = `#TrendingNews #${topArticle.category.replace(/[^a-zA-Z]/g, '')}`;
          const safeSummary = topArticle.aiSummary ? topArticle.aiSummary.substring(0, 100) + '...' : '';
          const tweetText = `Trending in ${topArticle.category}: ${topArticle.title}\n\n${safeSummary}\n\nRead more: ${shortUrl} ${tag}`;
          
          await rwClient.v2.tweet(tweetText.substring(0, 280));
          console.log('✅ Successfully posted to Twitter!');
        }
      } catch (twError) {
        console.error('❌ Failed to post to Twitter:', twError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'News updated successfully',
      articlesProcessed: validArticles.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);

    // Log error to database
    await fetch(`${dbUrl}/logs/errors.json`, { method: 'POST', body: JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString(),
    })});

    return res.status(500).json({
      success: false,
      message: 'Cron job failed',
      error: error.message,
    });
  }
}

/**
 * Summarize article description using AWS Bedrock via AI Proxy
 */
async function summarizeWithAI(text) {
  if (!text || text.length < 20) return text;
  
  const token = process.env.AWS_BEARER_TOKEN_BEDROCK;
  if (!token) return text;

  try {
    // If you use a specific gateway for Bedrock, set AI_PROXY_URL in .env
    const baseUrl = process.env.AI_PROXY_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: `Summarize the following news article briefly in one or two sentences:\n\n${text.substring(0, 2000)}` }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    return text;
  } catch (error) {
    console.error('AI summarization failed:', error);
    return text;
  }
}

/**
 * Categorize article based on keywords for standard news categories
 */
function categorizeArticle(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  const categories = {
    'Technology': ['tech', 'software', 'digital', 'cyber', 'robot', 'ai', 'apple', 'google', 'microsoft', 'app', 'code'],
    'Business': ['business', 'market', 'stock', 'economy', 'startup', 'finance', 'ceo', 'company', 'bank'],
    'Sports': ['sport', 'football', 'cricket', 'nba', 'nfl', 'soccer', 'tennis', 'match', 'tournament', 'player', 'coach', 'team', 'champion'],
    'Health': ['health', 'medical', 'disease', 'hospital', 'doctor', 'virus', 'covid', 'vaccine', 'patient', 'study'],
    'Entertainment': ['movie', 'film', 'music', 'actor', 'actress', 'hollywood', 'celebrity', 'song', 'album', 'star', 'cinema'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(text))) {
      return category;
    }
  }

  return 'General';
}
