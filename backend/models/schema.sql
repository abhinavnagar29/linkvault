-- LinkVault Database Schema
-- PostgreSQL Database

CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(10) UNIQUE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('text', 'file')),
    content TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    password_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    max_views INTEGER,
    is_one_time BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);


-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for existing tables (in case table already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'user_id') THEN
        ALTER TABLE links ADD COLUMN user_id INTEGER REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'link_name') THEN
        ALTER TABLE links ADD COLUMN link_name VARCHAR(255);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unique_id ON links(unique_id);
CREATE INDEX IF NOT EXISTS idx_expires_at ON links(expires_at);
CREATE INDEX IF NOT EXISTS idx_deleted_at ON links(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create a function to clean up expired links
CREATE OR REPLACE FUNCTION cleanup_expired_links()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE links
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE expires_at < CURRENT_TIMESTAMP
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
