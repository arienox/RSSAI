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

// Connect to MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'aryan1521',
  database: process.env.DB_DATABASE || 'mcp_rss',
  port: process.env.DB_PORT || 3307,
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
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

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
}); 