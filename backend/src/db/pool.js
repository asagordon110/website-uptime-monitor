// Create connection pool for database
const { Pool } = require("pg");

// Load environment variables
require("dotenv").config();

// Use SSL only when connecting to AWS RDS
const useSSL = process.env.DB_SSL === "true";
console.log("DB SSL enabled:", process.env.DB_SSL);

// Create pool instance
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

module.exports = pool;