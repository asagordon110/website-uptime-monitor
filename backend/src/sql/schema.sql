-- Create sites table, id as primary key, current status default set to 'PENDING.'
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE, -- Unique on url prevents duplicate websites
    current_status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create checks table
CREATE TABLE checks (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE, -- If a site is deleted, check history is deleted too.
    status TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);