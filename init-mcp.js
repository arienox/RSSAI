const { spawn } = require('child_process');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
    console.log('✅ Database initialized');
    await connection.end();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

async function startMCPRSS() {
  await initializeDatabase();
  
  const mcp = spawn('npx', ['mcp_rss'], {
    env: {
      ...process.env,
      PATH: process.env.PATH
    }
  });

  mcp.stdout.on('data', (data) => {
    console.log(`MCP RSS: ${data}`);
  });

  mcp.stderr.on('data', (data) => {
    console.error(`MCP RSS Error: ${data}`);
  });

  mcp.on('close', (code) => {
    console.log(`MCP RSS process exited with code ${code}`);
  });
}

startMCPRSS(); 