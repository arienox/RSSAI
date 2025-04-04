const { spawn } = require('child_process');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      let connection;
      
      // Try to use MySQL URL if available
      if (process.env.MYSQL_URL) {
        console.log('Using MySQL URL connection string');
        connection = await mysql.createConnection(process.env.MYSQL_URL);
      } else {
        // Fallback to individual connection parameters
        console.log('Using individual connection parameters');
        connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD
        });
      }

      await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE || 'mcp_rss'}`);
      console.log('✅ Database initialized');
      await connection.end();
      return;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
      }
      console.log(`Retrying database initialization... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
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
    if (code !== 0) {
      process.exit(code);
    }
  });
}

startMCPRSS(); 