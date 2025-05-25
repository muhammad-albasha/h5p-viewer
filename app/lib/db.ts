import mysql from 'mysql2/promise';

// Create a connection pool with error handling
let pool: mysql.Pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'h5p',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Test connection on startup
  (async () => {
    try {
      const connection = await pool.getConnection();
      console.log('Database connection established successfully');
      connection.release();
    } catch (error) {
      console.error('Error connecting to database:', error);
    }
  })();
} catch (error) {
  console.error('Failed to create database pool:', error);
}

export { pool };

// Function to initialize the database schema
export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin user exists, create it if not
    const [adminUsers] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (Array.isArray(adminUsers) && adminUsers.length === 0) {
      // Create default admin user with password "admin"
      // In production, use a proper password hashing library like bcrypt
      await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
        ['admin', 'admin', 'admin']);
      console.log('Default admin user created');
    }

    // Create h5p_content table for tracking uploaded content
    await pool.query(`
      CREATE TABLE IF NOT EXISTS h5p_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        file_path VARCHAR(255) NOT NULL,
        content_type VARCHAR(100),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
