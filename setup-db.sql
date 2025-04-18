-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS rssai;
USE rssai;

-- Feed table
CREATE TABLE IF NOT EXISTS Feed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL UNIQUE,
  htmlUrl VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Uncategorized'
);

-- Article table
CREATE TABLE IF NOT EXISTS Article (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link VARCHAR(255) NOT NULL,
  pubDate VARCHAR(100) NOT NULL,
  fetchDate VARCHAR(100) NOT NULL,
  status ENUM('normal', 'favorite') DEFAULT 'normal',
  feed_id INT NOT NULL,
  FOREIGN KEY (feed_id) REFERENCES Feed(id) ON DELETE CASCADE
);

-- Create some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_category ON Feed(category);
CREATE INDEX IF NOT EXISTS idx_article_pubdate ON Article(pubDate);
CREATE INDEX IF NOT EXISTS idx_article_feed ON Article(feed_id); 