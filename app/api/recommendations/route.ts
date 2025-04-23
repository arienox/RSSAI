import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRecommendations } from '@/lib/gemini';

// Check for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Check for Gemini API key
const geminiApiKey = process.env.GEMINI_API_KEY;
const isGeminiConfigured = Boolean(geminiApiKey);

export async function POST(request: Request) {
  try {
    // Return error if not configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { message: 'Supabase is not configured. Please set environment variables.' },
        { status: 503 }
      );
    }

    if (!isGeminiConfigured) {
      return NextResponse.json(
        { message: 'Gemini API is not configured. Please set the GEMINI_API_KEY environment variable.' },
        { status: 503 }
      );
    }

    // Get user interests from request
    const body = await request.json();
    const { interests } = body;
    
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { message: 'Please provide an array of interests' },
        { status: 400 }
      );
    }
    
    // Get recent articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content')
      .order('pub_date', { ascending: false })
      .limit(20);
    
    if (error) {
      throw error;
    }
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({ 
        message: 'No articles available for recommendations',
        recommendations: [] 
      });
    }
    
    // Get recommendations
    const recommendedIds = await getRecommendations(articles, interests);
    
    if (recommendedIds.length === 0) {
      return NextResponse.json({ 
        message: 'No matching recommendations found',
        recommendations: [] 
      });
    }
    
    // Fetch the full recommended articles
    const { data: recommendedArticles, error: recError } = await supabase
      .from('articles')
      .select(`
        *,
        feeds (
          id,
          title,
          url
        )
      `)
      .in('id', recommendedIds);
      
    if (recError) {
      throw recError;
    }
    
    // Format the response
    const formattedArticles = recommendedArticles?.map(article => {
      const feed = article.feeds;
      delete article.feeds;
      
      return {
        ...article,
        feed_title: feed.title,
        feed_url: feed.url
      };
    });
    
    return NextResponse.json({ 
      recommendations: formattedArticles || [],
      interests,
      total: formattedArticles?.length || 0
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { message: 'Failed to generate recommendations', error: (error as Error).message },
      { status: 500 }
    );
  }
} 