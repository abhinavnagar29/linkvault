-- Combined migration script for all new features
-- Run this as postgres user: sudo -u postgres psql -d linkvault -f migrations/combined_migration.sql

\c linkvault

-- Migration 1: Add forgot password columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Migration 2: Add link_name column
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS link_name VARCHAR(255);

-- Verify all columns were added
SELECT 'Users table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('reset_token', 'reset_token_expires');

SELECT 'Links table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'links' 
AND column_name = 'link_name';

SELECT 'Migrations completed successfully!' as status;
