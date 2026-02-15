import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log('Running authentication migration...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'models/migration_auth.sql'),
            'utf8'
        );

        await pool.query(migrationSQL);

        console.log('Migration completed successfully!');
        console.log('   - Created users table');
        console.log('   - Added user_id column to links table');
        console.log('   - Created index on user_id');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
