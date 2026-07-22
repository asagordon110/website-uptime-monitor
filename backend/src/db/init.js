const pool = require("./pool");

async function initializeDatabase() {
  // Stores every website registered for monitoring.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      current_status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_checked_at TIMESTAMP
    );
  `);

  // Stores every uptime check completed for a site.
  await pool.query(`
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

  // Stores structured AI incident analyses.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS incident_analyses (
      id SERIAL PRIMARY KEY,

      site_id INTEGER NOT NULL
        REFERENCES sites(id)
        ON DELETE CASCADE,

      trigger_check_id INTEGER NOT NULL
        REFERENCES checks(id)
        ON DELETE CASCADE,

      summary TEXT NOT NULL,

      severity TEXT NOT NULL
        CHECK (
          severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        ),

      likely_causes JSONB NOT NULL
        DEFAULT '[]'::jsonb,

      recommended_actions JSONB NOT NULL
        DEFAULT '[]'::jsonb,

      evidence JSONB NOT NULL
        DEFAULT '{}'::jsonb,

      confidence INTEGER NOT NULL
        CHECK (
          confidence >= 0
          AND confidence <= 100
        ),

      model_id TEXT NOT NULL,

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (site_id, trigger_check_id)
    );
  `);

  // Improves queries for the newest analysis for a site.
  await pool.query(`
    CREATE INDEX IF NOT EXISTS
      idx_incident_analyses_site_created
    ON incident_analyses (
      site_id,
      created_at DESC
    );
  `);

  console.log("Database schema initialized");
}

module.exports = initializeDatabase;