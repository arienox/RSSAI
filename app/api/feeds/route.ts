import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Parser from 'rss-parser';

const parser = new Parser();

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

    // Parse feed to get metadata
    let feedData;
    try {
      feedData = await parser.parseURL(body.url);
    } catch (error) {
      return NextResponse.json(
        { message: 'Could not parse feed. Please check the URL and try again.' },
        { status: 400 }
      );
    }

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
      throw feedError;
    }

    // Process and store feed items
    const articlesData = feedData.items?.slice(0, 20).map(item => ({
      title: item.title || 'Untitled Article',
      content: item.content || item.contentSnippet || '',
      link: item.link || '',
      pub_date: item.pubDate || item.isoDate || new Date().toISOString(),
      status: 'normal',
      feed_id: newFeed.id
    }));

    if (articlesData?.length) {
      const { error: articlesError } = await supabase
        .from('articles')
        .insert(articlesData);

      if (articlesError) {
        console.error('Error inserting articles:', articlesError);
      }
    }

    return NextResponse.json({ feed: newFeed });
  } catch (error) {
    console.error('Error adding feed:', error);
    return NextResponse.json(
      { message: 'Failed to add feed', error: (error as Error).message },
      { status: 500 }
    );
  }
} 