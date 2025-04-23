import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Parser from 'rss-parser';
import { proxyUrl } from '@/lib/utils';

// Create a more flexible parser with higher timeout
const parser = new Parser({
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  customFields: {
    feed: ['category'],
  },
});

// Check for supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isConfigured = Boolean(supabaseUrl && supabaseKey);

export async function GET() {
  try {
    // Return empty response if not configured
    if (!isConfigured) {
      console.warn('Supabase is not configured. Please set environment variables.');
      return NextResponse.json({ feeds: [] });
    }

    const { data: feeds, error } = await supabase
      .from('feeds')
      .select('*')
      .order('title');

    if (error) {
      throw error;
    }

    return NextResponse.json({ feeds });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json(
      { message: 'Failed to fetch feeds', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Return error if not configured
    if (!isConfigured) {
      return NextResponse.json(
        { message: 'Supabase is not configured. Please set environment variables.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { message: 'Feed URL is required' },
        { status: 400 }
      );
    }

    console.log(`Attempting to add feed: ${body.url}`);

    // Check if feed already exists
    const { data: existingFeeds } = await supabase
      .from('feeds')
      .select('*')
      .eq('url', body.url);

    if (existingFeeds && existingFeeds.length > 0) {
      return NextResponse.json(
        { message: 'This feed is already in your subscription list' },
        { status: 400 }
      );
    }

    // Parse feed to get metadata - use a proxy if direct access fails
    let feedData;
    let usedProxy = false;
    try {
      try {
        console.log('Attempting direct RSS fetch...');
        feedData = await parser.parseURL(body.url);
      } catch (directError) {
        console.log('Direct fetch failed, trying proxy...', directError);
        usedProxy = true;
        // Try with a CORS proxy if direct access fails (often needed for cross-origin RSS feeds)
        feedData = await parser.parseURL(proxyUrl(body.url));
      }
    } catch (error) {
      console.error('Feed parsing error:', error);
      return NextResponse.json(
        { 
          message: 'Could not parse feed. Please check the URL and try again.',
          error: (error as Error).message 
        },
        { status: 400 }
      );
    }

    if (!feedData) {
      return NextResponse.json(
        { message: 'Invalid RSS feed format' },
        { status: 400 }
      );
    }

    console.log(`Feed parsed successfully: ${feedData.title}`);

    // Insert new feed
    const { data: newFeed, error: feedError } = await supabase
      .from('feeds')
      .insert([{
        title: feedData.title || 'Untitled Feed',
        url: body.url,
        html_url: feedData.link || body.url,
        category: feedData.category || 'Uncategorized'
      }])
      .select()
      .single();

    if (feedError) {
      console.error('Error inserting feed:', feedError);
      throw feedError;
    }

    console.log(`Feed added to database with ID: ${newFeed.id}`);

    // Process and store feed items
    if (feedData.items && feedData.items.length > 0) {
      console.log(`Processing ${feedData.items.length} articles...`);
      
      const articlesData = feedData.items.slice(0, 20).map(item => ({
        title: item.title || 'Untitled Article',
        content: item.content || item.contentSnippet || '',
        link: item.link || '',
        pub_date: item.pubDate || item.isoDate || new Date().toISOString(),
        status: 'normal',
        feed_id: newFeed.id
      }));

      const { error: articlesError } = await supabase
        .from('articles')
        .insert(articlesData);

      if (articlesError) {
        console.error('Error inserting articles:', articlesError);
      } else {
        console.log(`${articlesData.length} articles inserted successfully`);
      }
    } else {
      console.log('No articles found in feed');
    }

    return NextResponse.json({ 
      feed: newFeed,
      proxy_used: usedProxy,
      articles_count: feedData.items?.length || 0
    });
  } catch (error) {
    console.error('Error adding feed:', error);
    return NextResponse.json(
      { message: 'Failed to add feed', error: (error as Error).message },
      { status: 500 }
    );
  }
} 