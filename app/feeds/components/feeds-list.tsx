"use client";

import { useState, useEffect } from "react";
import { Feed } from "@/lib/supabase";

export default function FeedsList() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/feeds");
        
        if (!res.ok) {
          throw new Error("Failed to fetch feeds");
        }
        
        const data = await res.json();
        setFeeds(data.feeds || []);
      } catch (error) {
        console.error("Error fetching feeds:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  const handleRemoveFeed = async (feedId: number) => {
    try {
      const res = await fetch(`/api/feeds/${feedId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error("Failed to remove feed");
      }
      
      setFeeds(feeds.filter(feed => feed.id !== feedId));
    } catch (error) {
      console.error("Error removing feed:", error);
      setError((error as Error).message);
    }
  };
  
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : feeds.length === 0 ? (
        <p className="text-muted-foreground">
          You don&apos;t have any feeds yet. Add your first feed above to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {feeds.map((feed) => (
            <div key={feed.id} className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">{feed.title}</h3>
                <a 
                  href={feed.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {feed.html_url}
                </a>
                {feed.category && (
                  <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded mt-1">
                    {feed.category}
                  </span>
                )}
              </div>
              <button 
                className="text-sm text-red-500 hover:text-red-700"
                onClick={() => handleRemoveFeed(feed.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 