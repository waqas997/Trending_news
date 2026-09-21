export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const slug = req.query.slug;
    
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Slug parameter is required' });
    }
    
    const dbUrl = process.env.FIREBASE_DATABASE_URL;
    // Because we're storing as an object map, we can fetch exactly one article directly
    const fbResponse = await fetch(`${dbUrl}/trending-news/articles/${slug}.json`);
    const articleData = await fbResponse.json();
    
    if (!articleData) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.setHeader('Cache-Control', 'max-age=3600');
    return res.status(200).json({
      success: true,
      article: articleData
    });
  } catch (error) {
    console.error('Fetch Article Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
