import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { summarizeArticle } from '@/lib/gemini';

// Check for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Check for Gemini API key
const geminiApiKey = process.env.GEMINI_API_KEY;
const isGeminiConfigured = Boolean(geminiApiKey);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const id = params.id;
    
    // Get the article details
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { message: 'Article not found', error: error.message },
        { status: 404 }
      );
    }
    
    // Generate summary
    const summary = await summarizeArticle(article.title, article.content);
    
    if (!summary) {
      return NextResponse.json(
        { message: 'Failed to generate summary' },
        { status: 500 }
      );
    }
    
    // Update the article with the summary
    const { error: updateError } = await supabase
      .from('articles')
      .update({ summary })
      .eq('id', id);
      
    if (updateError) {
      console.error('Error updating article with summary:', updateError);
    }
    
    return NextResponse.json({ 
      article_id: id,
      title: article.title,
      summary 
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { message: 'Failed to generate summary', error: (error as Error).message },
      { status: 500 }
    );
  }
} 