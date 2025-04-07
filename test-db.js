const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  // Log all environment variables (excluding sensitive ones)
  console.log('\nEnvironment Variables:');
  console.log('----------------------');
  Object.keys(process.env).forEach(key => {
    if (!key.includes('PASSWORD') && !key.includes('SECRET') && !key.includes('URL')) {
      console.log(`${key}: ${process.env[key]}`);
    }
  });

  let connection;
  
  try {
    // Try to use MySQL URL if available
    if (process.env.MYSQL_URL && process.env.MYSQL_URL.startsWith('mysql://')) {
      console.log('\nUsing MySQL URL connection string');
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
      console.log('\nUsing Railway MySQL variables');
      const dbConfig = {
        host: process.env.MYSQLHOST,
        port: parseInt(process.env.MYSQLPORT) || 3306,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_DATABASE || 'mcp_rss',
        connectTimeout: 10000,
        family: 4 // Force IPv4
      };

      console.log('\nDatabase Configuration:');
      console.log('----------------------');
      console.log(`Host: ${dbConfig.host}`);
      console.log(`Port: ${dbConfig.port}`);
      console.log(`User: ${dbConfig.user}`);
      console.log(`Database: ${dbConfig.database}`);

      connection = await mysql.createConnection(dbConfig);
    } else {
      // Fallback to individual connection parameters
      console.log('\nUsing individual connection parameters');
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'mcp_rss',
        connectTimeout: 10000,
        family: 4 // Force IPv4
      };

      console.log('\nDatabase Configuration:');
      console.log('----------------------');
      console.log(`Host: ${dbConfig.host}`);
      console.log(`Port: ${dbConfig.port}`);
      console.log(`User: ${dbConfig.user}`);
      console.log(`Database: ${dbConfig.database}`);

      connection = await mysql.createConnection(dbConfig);
    }
    
    console.log('✅ Successfully connected to MySQL server');
    
    // Test database creation
    console.log('\n2. Testing database creation...');
    const dbName = process.env.MYSQLDATABASE || process.env.DB_DATABASE || 'mcp_rss';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' is ready`);
    
    // Test connection to specific database
    console.log('\n3. Testing connection to specific database...');
    await connection.query(`USE ${dbName}`);
    console.log(`✅ Connected to database '${dbName}'`);
    
    // Test table creation
    console.log('\n4. Testing table creation...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        link VARCHAR(255) NOT NULL,
        description TEXT,
        pubDate DATETIME,
        category VARCHAR(100),
        source VARCHAR(100),
        status ENUM('normal', 'favorite') DEFAULT 'normal'
      )
    `);
    console.log('✅ Articles table created');
    
    // Test data insertion
    console.log('\n5. Testing data insertion...');
    await connection.query(`
      INSERT INTO articles (title, link, description, pubDate, category, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Test Article',
      'https://example.com',
      'This is a test article',
      new Date(),
      'test',
      'test-source',
      'normal'
    ]);
    console.log('✅ Test data inserted');
    
    // Test data retrieval
    console.log('\n6. Testing data retrieval...');
    const [rows] = await connection.query('SELECT * FROM articles');
    console.log('✅ Data retrieved successfully');
    console.log('Retrieved rows:', rows);
    
    await connection.end();
    console.log('\n✅ All database tests completed successfully');
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection(); 