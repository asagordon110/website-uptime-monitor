const pool = require("./pool");

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      current_status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_checked_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS checks (
      id SERIAL PRIMARY KEY,
      site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      status_code INTEGER,
      response_time_ms INTEGER,
      error_message TEXT,
      checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database schema initialized");
}

module.exports = initializeDatabase;