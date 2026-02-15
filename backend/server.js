import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import pool, { initializeDatabase } from './config/database.js';
import uploadRouter from './routes/upload.js';
import contentRouter from './routes/content.js';
import deleteRouter from './routes/delete.js';
import authRouter from './routes/auth.js';
import myLinksRouter from './routes/my-links.js';
import profileRouter from './routes/profile.js';
import { errorHandler } from './middleware/validation.js';
import { startCleanupJob } from './jobs/cleanup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // If FRONTEND_URL is set to '*', allow everything
        if (process.env.FRONTEND_URL === '*') {
            return callback(null, true);
        }

        const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');

        // Check if origin is in the allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Allow any Vercel deployment (for previews)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // In development, allow any localhost origin
        if (process.env.NODE_ENV === 'development' && origin.match(/^http:\/\/localhost:\d+$/)) {
            return callback(null, true);
        }

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.use('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/content', contentRouter);
app.use('/api/delete', deleteRouter);
app.use('/api/my-links', myLinksRouter);
app.use('/api/profile', profileRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database schema
        await initializeDatabase();

        // Start cleanup job
        startCleanupJob();

        // Start server
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║                                        ║
║        LinkVault Backend        ║
║                                        ║
║  Server running on port ${PORT}         ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                        ║
║  API Endpoints:                        ║
║  POST   /api/auth/register             ║
║  POST   /api/auth/login                ║
║  POST   /api/upload                    ║
║  GET    /api/content/:id               ║
║  GET    /api/my-links                  ║
║  DELETE /api/delete/:id                ║
║  GET    /health                        ║
║                                        ║
╚════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

startServer();
