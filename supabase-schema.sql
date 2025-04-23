-- Create feeds table
CREATE TABLE IF NOT EXISTS feeds (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  html_url TEXT NOT NULL,
  category TEXT DEFAULT 'Uncategorized'
);

-- Create articles table with AI fields
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT NOT NULL,
  pub_date TIMESTAMP WITH TIME ZONE NOT NULL,
  fetch_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'favorite')),
  feed_id BIGINT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  
  -- AI-enhanced fields
  summary TEXT, -- AI-generated summary
  categories TEXT[], -- AI-generated categories/tags
  sentiment FLOAT, -- Sentiment score (-1 to 1)
  read_time INTEGER, -- Estimated read time in minutes
  importance_score FLOAT -- Article importance score (0-1)
);

-- User interests table for personalization
CREATE TABLE IF NOT EXISTS user_interests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL,
  interests TEXT[]
);

-- User read history
CREATE TABLE IF NOT EXISTS user_reads (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL,
  article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  read_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, article_id)
);

-- Create some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_category ON feeds(category);
CREATE INDEX IF NOT EXISTS idx_article_pub_date ON articles(pub_date);
CREATE INDEX IF NOT EXISTS idx_article_feed_id ON articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_article_categories ON articles USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_user_interests ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reads ON user_reads(user_id, article_id);

-- Create RLS policies for public access (you may want to restrict this in production)
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reads ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY feeds_select_policy ON feeds 
  FOR SELECT USING (true);
  
CREATE POLICY articles_select_policy ON articles 
  FOR SELECT USING (true);
  
-- Allow authenticated users to insert/update/delete
CREATE POLICY feeds_insert_policy ON feeds 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY feeds_update_policy ON feeds 
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY feeds_delete_policy ON feeds 
  FOR DELETE USING (auth.role() = 'authenticated');
  
CREATE POLICY articles_insert_policy ON articles 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY articles_update_policy ON articles 
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY articles_delete_policy ON articles 
  FOR DELETE USING (auth.role() = 'authenticated');

-- User interest policies
CREATE POLICY user_interests_select_policy ON user_interests 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY user_interests_insert_policy ON user_interests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY user_interests_update_policy ON user_interests 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY user_interests_delete_policy ON user_interests 
  FOR DELETE USING (auth.uid() = user_id);

-- User reads policies
CREATE POLICY user_reads_select_policy ON user_reads 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY user_reads_insert_policy ON user_reads 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY user_reads_update_policy ON user_reads 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY user_reads_delete_policy ON user_reads 
  FOR DELETE USING (auth.uid() = user_id); 