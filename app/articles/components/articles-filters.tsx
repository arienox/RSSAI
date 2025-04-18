"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ArticlesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct new URL with search params
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort !== "newest") params.set("sort", sort);
    if (category) params.set("category", category);
    
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full px-4 py-2 border rounded-md pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <select 
          className="px-4 py-2 border rounded-md"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            handleSearch(e);
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">By title</option>
        </select>
        
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Filter
        </button>
      </form>
    </div>
  );
} 