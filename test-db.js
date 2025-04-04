const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  // Log all environment variables (excluding sensitive ones)
  console.log('\nEnvironment Variables:');
  console.log('----------------------');
  Object.keys(process.env).forEach(key => {
    if (!key.includes('PASSWORD') && !key.includes('SECRET')) {
      console.log(`${key}: ${process.env[key]}`);
    }
  });

  // Get connection details with fallbacks
  const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    user: process.env.DB_USERNAME || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_DATABASE || process.env.MYSQLDATABASE || 'mcp_rss'
  };

  console.log('\nDatabase Configuration:');
  console.log('----------------------');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Port: ${dbConfig.port}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);
  
  try {
    // Test connection without database
    console.log('\n1. Testing connection to MySQL server...');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    console.log('✅ Successfully connected to MySQL server');
    
    // Test database creation
    console.log('\n2. Testing database creation...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' is ready`);
    
    // Test connection to specific database
    console.log('\n3. Testing connection to specific database...');
    await connection.query(`USE ${dbConfig.database}`);
    console.log(`✅ Successfully connected to database '${dbConfig.database}'`);
    
    // Test table creation
    console.log('\n4. Testing table creation...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        link VARCHAR(255) NOT NULL,
        content TEXT,
        pubDate DATETIME,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Articles table is ready');
    
    // Test inserting sample data
    console.log('\n5. Testing data insertion...');
    await connection.query(`
      INSERT INTO articles (title, link, content, pubDate, category)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `, [
      'Test Article',
      'https://example.com',
      'This is a test article',
      new Date(),
      'test'
    ]);
    console.log('✅ Successfully inserted test data');
    
    // Test querying data
    console.log('\n6. Testing data retrieval...');
    const [rows] = await connection.query('SELECT * FROM articles LIMIT 1');
    console.log('✅ Successfully retrieved data:');
    console.log(rows[0]);
    
    // Clean up test data
    console.log('\n7. Cleaning up test data...');
    await connection.query('DELETE FROM articles WHERE title = ?', ['Test Article']);
    console.log('✅ Successfully cleaned up test data');
    
    await connection.end();
    console.log('\n✅ All database tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    process.exit(1);
  }
}

testConnection(); 