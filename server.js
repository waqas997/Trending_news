import express from 'express';
import dotenv from 'dotenv';
import fetchNewsHandler from './api/fetch-news.js';
import cronJobHandler from './api/cron-job.js';
import articleHandler from './api/article.js';
import sitemapHandler from './api/sitemap.js';
import newsSitemapHandler from './api/news-sitemap.js';

dotenv.config();

const app = express();
app.use(express.json());

// Mocking Vercel's req/res behavior for the serverless functions
app.all('/api/fetch-news', async (req, res) => {
  try {
    await fetchNewsHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.all('/api/cron-job', async (req, res) => {
  try {
    await cronJobHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.all('/api/article', async (req, res) => {
  try {
    await articleHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.all('/api/sitemap', async (req, res) => {
  try {
    await sitemapHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.all('/api/news-sitemap', async (req, res) => {
  try {
    await newsSitemapHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Local API Server running on http://localhost:${PORT}`);
});
