import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Feed = {
  id: number;
  created_at?: string;
  title: string;
  url: string;
  html_url: string;
  category: string;
};

export type Article = {
  id: number;
  created_at?: string;
  title: string;
  content: string;
  link: string;
  pub_date: string;
  fetch_date: string;
  status: 'normal' | 'favorite';
  feed_id: number;
  feed_title?: string;
}; 