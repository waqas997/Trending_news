import fetch from 'node-fetch';
import admin from 'firebase-admin';

admin.initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

/**
 * API endpoint to fetch news
 * Returns cached trending news from database
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'max-age=3600'); // Cache for 1 hour
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Get news from Firebase
    const snapshot = await db.ref('trending-news/articles').once('value');
    const articles = snapshot.val() || [];

    // If cache is empty, fetch directly from NewsAPI
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
    console.error('Error fetching news:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message,
    });
  }
}
