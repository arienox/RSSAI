import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only throw error in browser environment, not during build
const isBrowser = typeof window !== 'undefined';

if (isBrowser && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables');
}

// Create a dummy client for build time, real client for runtime
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

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