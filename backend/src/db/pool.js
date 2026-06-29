// Create connection pool for database
const { Pool } = require('pg')

// Load environment variables
require('dotenv').config();

// Create pool instance
const pool = new Pool ({
    // Add var for host, port, db_name, username, password
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Export the pool so the rest of the application can use it
module.exports = pool;