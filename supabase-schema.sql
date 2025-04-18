-- Create feeds table
CREATE TABLE IF NOT EXISTS feeds (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  html_url TEXT NOT NULL,
  category TEXT DEFAULT 'Uncategorized'
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT NOT NULL,
  pub_date TIMESTAMP WITH TIME ZONE NOT NULL,
  fetch_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'favorite')),
  feed_id BIGINT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE
);

-- Create some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_category ON feeds(category);
CREATE INDEX IF NOT EXISTS idx_article_pub_date ON articles(pub_date);
CREATE INDEX IF NOT EXISTS idx_article_feed_id ON articles(feed_id);

-- Create RLS policies for public access (you may want to restrict this in production)
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

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