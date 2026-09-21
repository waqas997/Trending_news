export const maxDuration = 60;

export default async function handler(req, res) {
  try {
    const dbUrl = process.env.FIREBASE_DATABASE_URL;
    const domain = process.env.VITE_SITE_URL || process.env.DOMAIN || `https://${req.headers.host}`;
    
    // Fetch articles
    const fbResponse = await fetch(`${dbUrl}/trending-news/articles.json`);
    const articlesData = await fbResponse.json();
    
    let articles = [];
    if (articlesData && typeof articlesData === 'object') {
      articles = Object.values(articlesData);
    }
    
    // Filter for articles published in the last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const recentArticles = articles.filter(article => {
      const pubDate = new Date(article.publishedAt);
      return pubDate >= twoDaysAgo;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${recentArticles.map(article => `
  <url>
    <loc>${domain}/article/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Trending News AI</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt || new Date().toISOString()}</news:publication_date>
      <news:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
  </url>
  `).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'max-age=3600');
    return res.status(200).send(sitemap.trim());
  } catch (error) {
    console.error('News Sitemap generation error:', error);
    return res.status(500).end();
  }
}
