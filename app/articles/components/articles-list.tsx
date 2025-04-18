"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  content: string;
  link: string;
  pubDate: string;
  feedTitle: string;
  feedUrl: string;
}

export default function ArticlesList() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";
  const page = searchParams.get("page") || "1";
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        
        // Construct URL with query parameters
        let url = "/api/articles?";
        const params = new URLSearchParams();
        params.set("page", page);
        if (category) params.set("category", category);
        
        const res = await fetch(`/api/articles?${params.toString()}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }
        
        const data = await res.json();
        
        // Client-side filtering for search
        let filteredArticles = data.articles || [];
        if (search) {
          const searchLower = search.toLowerCase();
          filteredArticles = filteredArticles.filter((article: Article) => 
            article.title.toLowerCase().includes(searchLower) || 
            article.content.toLowerCase().includes(searchLower)
          );
        }
        
        // Client-side sorting
        if (sort === "oldest") {
          filteredArticles.sort((a: Article, b: Article) => 
            new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
          );
        } else if (sort === "title") {
          filteredArticles.sort((a: Article, b: Article) => 
            a.title.localeCompare(b.title)
          );
        }
        
        setArticles(filteredArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [search, sort, category, page]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  function truncateContent(content: string, maxLength = 150) {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  }
  
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Articles</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : articles.length === 0 ? (
        <div>
          <h3 className="text-lg font-medium mb-2">No Articles Found</h3>
          <p className="text-muted-foreground">
            Subscribe to feeds to start seeing articles here, or adjust your search filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <article key={article.id} className="border-b pb-6">
              <h3 className="text-lg font-medium mb-1">
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {article.title}
                </a>
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <span className="inline-block bg-primary/10 text-primary rounded px-2 py-0.5 mr-2">
                  {article.feedTitle}
                </span>
                <span>{formatDate(article.pubDate)}</span>
              </div>
              <p className="text-muted-foreground mb-2">
                {truncateContent(article.content.replace(/<[^>]*>/g, ''))}
              </p>
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Read Full Article
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
} 