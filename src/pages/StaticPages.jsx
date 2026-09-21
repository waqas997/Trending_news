import React from 'react';
import { Helmet } from 'react-helmet-async';

function StaticPages({ page }) {
  const contentMap = {
    'about': {
      title: 'About Us | Trending News AI',
      h1: 'About Trending News AI',
      body: 'Trending News AI is your premier source for the latest artificial intelligence developments, tools, and startups. We leverage AI to summarize and categorize news, saving you time while keeping you informed.'
    },
    'contact': {
      title: 'Contact Us | Trending News AI',
      h1: 'Contact Us',
      body: 'Have questions, feedback, or news tips? Reach out to our team at contact@trending-news-ai.com.'
    },
    'privacy-policy': {
      title: 'Privacy Policy | Trending News AI',
      h1: 'Privacy Policy',
      body: 'We value your privacy. We do not sell your personal data. We use standard analytics tools to improve our services.'
    },
    'terms': {
      title: 'Terms of Service | Trending News AI',
      h1: 'Terms of Service',
      body: 'By using this website, you agree to our terms. Content is provided for informational purposes only.'
    }
  };

  const currentContent = contentMap[page] || contentMap['about'];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      <Helmet>
        <title>{currentContent.title}</title>
        <meta name="description" content={currentContent.body} />
      </Helmet>
      <h1>{currentContent.h1}</h1>
      <p style={{ marginTop: '20px', lineHeight: '1.6' }}>{currentContent.body}</p>
    </div>
  );
}

export default StaticPages;
