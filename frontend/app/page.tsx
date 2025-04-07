'use client';

import { useEffect, useState } from 'react';

interface Article {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  category?: string;
}

interface ApiResponse {
  success: boolean;
  articles?: Article[];
  error?: string;
  details?: string;
}

export default function Home() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data: ApiResponse = await response.json();
        
        if (data.success && data.articles) {
          setNews(data.articles);
        } else {
          setError(data.error || 'Failed to fetch news');
          if (data.details) {
            console.error('Error details:', data.details);
          }
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading news...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">📰 Latest AI & Tech News</h1>
      <div className="max-w-4xl mx-auto">
        {news.length === 0 ? (
          <p className="text-center text-gray-500">No news articles available at the moment.</p>
        ) : (
          news.map((article, index) => (
            <article
              key={index}
              className="mb-8 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h2 className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800">
                  {article.title}
                </h2>
                {article.category && (
                  <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full mb-2">
                    {article.category}
                  </span>
                )}
                <p className="text-gray-600 mb-2">
                  {new Date(article.pubDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{article.content}</p>
              </a>
            </article>
          ))
        )}
      </div>
    </main>
  );
} 