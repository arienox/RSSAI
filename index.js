const express = require("express");
const axios = require("axios");
const mysql = require("mysql2/promise");
const Parser = require("rss-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const parser = new Parser();

// Parse JSON request bodies
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Options preflight
app.options("*", (req, res) => {
  res.status(200).end();
});

// Connect to MySQL with retry logic
const createPool = async (retries = 5) => {
  try {
    let pool;
    
    // Try to use MySQL URL if available
    if (process.env.MYSQL_URL && process.env.MYSQL_URL.startsWith('mysql://')) {
      console.log('Using MySQL URL connection string');
      // Force IPv4
      const url = process.env.MYSQL_URL.replace('mysql://', '');
      const [auth, hostPort] = url.split('@');
      const [user, password] = auth.split(':');
      const [host, portDb] = hostPort.split(':');
      const [port, database] = portDb.split('/');

      pool = mysql.createPool({
        host,
        port: parseInt(port),
        user,
        password,
        database,
        connectTimeout: 10000,
        family: 4, // Force IPv4
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } else if (process.env.MYSQLHOST && !process.env.MYSQLHOST.includes('${{')) {
      // Use Railway's default MySQL variables
      console.log('Using Railway MySQL variables');
      pool = mysql.createPool({
        host: process.env.MYSQLHOST,
        port: parseInt(process.env.MYSQLPORT) || 3306,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD || '', // Handle missing password
        database: process.env.MYSQLDATABASE || process.env.DB_DATABASE || 'mcp_rss',
        connectTimeout: 10000,
        family: 4, // Force IPv4
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } else {
      // Fallback to individual connection parameters
      console.log('Using individual connection parameters');
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: parseInt(process.env.DB_PORT) || 3306,
        connectTimeout: 10000,
        family: 4, // Force IPv4
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }

    // Test the connection
    await pool.getConnection();
    console.log('✅ Successfully connected to MySQL');
    return pool;
  } catch (error) {
    if (retries > 0) {
      console.log(`Failed to connect to MySQL, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return createPool(retries - 1);
    }
    throw error;
  }
};

let db;

// Initialize database connection
const initializeDatabase = async () => {
  try {
    db = await createPool();
  } catch (error) {
    console.error('Failed to connect to MySQL after all retries:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    database: db ? "connected" : "disconnected"
  });
});

// Get all feeds
app.get("/feeds", async (req, res) => {
  try {
    const [feeds] = await db.query(
      "SELECT * FROM Feed ORDER BY title ASC"
    );
    res.json({ success: true, feeds });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new feed
app.post("/feeds", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: "Feed URL is required" });
    }
    
    // Parse feed to get metadata
    let feed;
    try {
      feed = await parser.parseURL(url);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: "Could not parse feed. Please check the URL and try again." 
      });
    }
    
    // Check if feed already exists
    const [existingFeeds] = await db.query(
      "SELECT * FROM Feed WHERE url = ?",
      [url]
    );
    
    if (existingFeeds.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "This feed is already in your subscription list." 
      });
    }
    
    // Insert new feed
    const [result] = await db.query(
      "INSERT INTO Feed (title, url, htmlUrl, category) VALUES (?, ?, ?, ?)",
      [feed.title || "Untitled Feed", url, feed.link || url, feed.category || "Uncategorized"]
    );
    
    const feedId = result.insertId;
    
    // Process and store feed items
    for (const item of feed.items.slice(0, 20)) { // Process at most 20 items
      await db.query(
        "INSERT INTO Article (title, content, link, pubDate, fetchDate, status, feed_id) VALUES (?, ?, ?, ?, NOW(), 'normal', ?)",
        [
          item.title || "Untitled Article", 
          item.content || item.contentSnippet || item.summary || "",
          item.link || "",
          item.pubDate || item.isoDate || new Date().toISOString(),
          feedId
        ]
      );
    }
    
    // Return the new feed
    const [newFeed] = await db.query(
      "SELECT * FROM Feed WHERE id = ?",
      [feedId]
    );
    
    res.status(201).json({ success: true, feed: newFeed[0] });
  } catch (error) {
    console.error("Error adding feed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a feed
app.delete("/feeds/:id", async (req, res) => {
  try {
    const feedId = req.params.id;
    
    // Delete related articles first
    await db.query("DELETE FROM Article WHERE feed_id = ?", [feedId]);
    
    // Delete the feed
    const [result] = await db.query("DELETE FROM Feed WHERE id = ?", [feedId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Feed not found" });
    }
    
    res.json({ success: true, message: "Feed deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch latest articles
app.get("/news", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const [articles] = await db.query(
      `SELECT a.*, f.title as feedTitle, f.url as feedUrl 
       FROM Article a
       INNER JOIN Feed f ON a.feed_id = f.id
       ORDER BY a.pubDate DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM Article"
    );
    
    const total = countResult[0].total;
    
    res.json({ 
      success: true, 
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch articles by category
app.get("/news/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const [articles] = await db.query(
      `SELECT a.*, f.title as feedTitle, f.url as feedUrl 
       FROM Article a
       INNER JOIN Feed f ON a.feed_id = f.id
       WHERE f.category = ?
       ORDER BY a.pubDate DESC LIMIT ? OFFSET ?`,
      [category, limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM Article a INNER JOIN Feed f ON a.feed_id = f.id WHERE f.category = ?",
      [category]
    );
    
    const total = countResult[0].total;
    
    res.json({ 
      success: true, 
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ API running on port ${PORT}`);
  });
}); 