import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', color: 'white' }}>
      <Helmet>
        <title>404 Not Found | Trending News AI</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
      <p style={{ fontSize: '20px', marginBottom: '40px' }}>Oops! The page or article you're looking for doesn't exist.</p>
      <Link to="/" style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
        Return Home
      </Link>
    </div>
  );
}

export default NotFound;
