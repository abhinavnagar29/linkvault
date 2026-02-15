import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
};

// Fallback to individual parameters if DATABASE_URL is not provided (local dev)
if (!process.env.DATABASE_URL) {
    connectionConfig.host = process.env.DB_HOST || 'localhost';
    connectionConfig.port = parseInt(process.env.DB_PORT) || 5432;
    connectionConfig.database = process.env.DB_NAME || 'linkvault';
    connectionConfig.user = process.env.DB_USER || 'postgres';
    connectionConfig.password = process.env.DB_PASSWORD;
}

// Create PostgreSQL connection pool
const pool = new Pool(connectionConfig);

// Test database connection
// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize database schema
export async function initializeDatabase() {
    try {
        const schemaPath = path.join(__dirname, '../models/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schema);
        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

export default pool;
