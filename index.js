const express = require("express");
const axios = require("axios");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Connect to MySQL with retry logic
const createPool = async (retries = 5) => {
  try {
    let pool;
    
    // Try to use MySQL URL if available
    if (process.env.MYSQL_URL && process.env.MYSQL_URL.startsWith('mysql://')) {
      console.log('Using MySQL URL connection string');
      pool = mysql.createPool(process.env.MYSQL_URL);
    } else if (process.env.MYSQLHOST) {
      // Use Railway's default MySQL variables
      console.log('Using Railway MySQL variables');
      pool = mysql.createPool({
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD || '', // Handle missing password
        database: process.env.MYSQLDATABASE || process.env.DB_DATABASE || 'mcp_rss',
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
        port: process.env.DB_PORT,
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

// Fetch latest articles
app.get("/news", async (req, res) => {
  try {
    const [articles] = await db.query(
      "SELECT * FROM articles ORDER BY pubDate DESC LIMIT 10"
    );
    res.json({ success: true, articles });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch articles by category
app.get("/news/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const [articles] = await db.query(
      "SELECT * FROM articles WHERE category = ? ORDER BY pubDate DESC LIMIT 10",
      [category]
    );
    res.json({ success: true, articles });
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