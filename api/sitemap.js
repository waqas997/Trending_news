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
    
    // Static routes
    const staticRoutes = [
      '',
      '/ai-news',
      '/ai-tools',
      '/ai-coding',
      '/ai-startups',
      '/ai-apps',
      '/about',
      '/contact',
      '/privacy-policy',
      '/terms'
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${domain}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>
  `).join('')}
  ${articles.map(article => `
  <url>
    <loc>${domain}/article/${article.slug}</loc>
    <lastmod>${article.updatedAt || article.publishedAt || new Date().toISOString()}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'max-age=3600');
    return res.status(200).send(sitemap.trim());
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return res.status(500).end();
  }
}
