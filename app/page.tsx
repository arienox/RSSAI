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
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to RSSAI</h1>
      <p className="text-xl">Your RSS feed aggregator is up and running!</p>
    </main>
  )
} 