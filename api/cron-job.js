

// Initialize Firebase

import { GoogleGenAI } from '@google/genai';
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

    // Step 1: Fetch news from NewsAPI
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
 * Summarize article description using Gemini API
 */
async function summarizeWithAI(text) {
  if (!text || text.length < 20) return text;
  if (!process.env.GEMINI_API_KEY) return text;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following news article briefly in one or two sentences:\n\n${text.substring(0, 2000)}`,
    });
    
    if (response.text) {
      return response.text;
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
    'AI News': ['ai', 'tech', 'software', 'digital', 'cyber', 'robot'],
    'AI Tools': ['tool', 'app', 'platform', 'framework'],
    'AI Coding': ['code', 'developer', 'software', 'programming'],
    'AI Startups': ['startup', 'founder', 'investment', 'funding'],
    'AI Apps': ['app', 'ios', 'android', 'mobile', 'web'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'General';
}
