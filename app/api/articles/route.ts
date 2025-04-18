import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('articles')
      .select(`
        *,
        feeds!inner (
          id,
          title,
          url
        )
      `)
      .order('pub_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add category filter if provided
    if (category) {
      query = query.eq('feeds.category', category);
    }
    
    const { data: articles, error, count } = await query;

    if (error) {
      throw error;
    }
    
    // Format the response
    const formattedArticles = articles?.map(article => {
      const feed = article.feeds;
      delete article.feeds;
      
      return {
        ...article,
        feed_title: feed.title,
        feed_url: feed.url
      };
    });

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { message: 'Failed to fetch articles', error: (error as Error).message },
      { status: 500 }
    );
  }
} 