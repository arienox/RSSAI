"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddFeedForm() {
  const [feedUrl, setFeedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedUrl) {
      setError("Please enter a feed URL");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to add feed");
      }
      
      // Success - clear form and refresh feeds list
      setFeedUrl("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Add New Feed</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter RSS feed URL"
              className="flex-1 px-4 py-2 border rounded-md"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Feed"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
} 