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
      if (process.env.MYSQL_URL && process.env.MYSQL_URL.startsWith('mysql://')) {
        console.log('Using MySQL URL connection string');
        // Force IPv4
        const url = process.env.MYSQL_URL.replace('mysql://', '');
        const [auth, hostPort] = url.split('@');
        const [user, password] = auth.split(':');
        const [host, portDb] = hostPort.split(':');
        const [port, database] = portDb.split('/');

        connection = await mysql.createConnection({
          host,
          port: parseInt(port),
          user,
          password,
          database,
          connectTimeout: 10000,
          family: 4 // Force IPv4
        });
      } else if (process.env.MYSQLHOST && !process.env.MYSQLHOST.includes('${{')) {
        // Use Railway's default MySQL variables
        console.log('Using Railway MySQL variables');
        connection = await mysql.createConnection({
          host: process.env.MYSQLHOST,
          port: parseInt(process.env.MYSQLPORT) || 3306,
          user: process.env.MYSQLUSER,
          password: process.env.MYSQLPASSWORD || '', // Handle missing password
          connectTimeout: 10000,
          family: 4 // Force IPv4
        });
      } else {
        // Fallback to individual connection parameters
        console.log('Using individual connection parameters');
        connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT) || 3306,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          connectTimeout: 10000,
          family: 4 // Force IPv4
        });
      }

      await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQLDATABASE || process.env.DB_DATABASE || 'mcp_rss'}`);
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