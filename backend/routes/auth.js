import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken } from '../config/jwt.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Create new user account
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            [email.toLowerCase(), passwordHash]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = generateToken(user.id);

        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
        const cookieOptions = {
            httpOnly: true,
            secure: true, // Always secure for cross-site
            sameSite: 'none', // Always none for cross-site
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        // Set cookie
        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            message: 'User registered successfully',
            token, // Return token for client-side storage (fallback for 3rd party cookies)
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Failed to register user',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// POST /api/auth/login - Login and receive JWT token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query(
            'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'No account found with this email address' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
        const cookieOptions = {
            httpOnly: true,
            secure: true, // Always secure for cross-site
            sameSite: 'none', // Always none for cross-site
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        // Set cookie
        res.cookie('token', token, cookieOptions);

        res.json({
            message: 'Logged in successfully',
            token, // Return token for client-side storage (fallback for 3rd party cookies)
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Failed to login',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// POST /api/auth/logout - Clear auth cookie
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        // Don't reveal if email exists (security best practice)
        if (result.rows.length === 0) {
            return res.json({ message: 'If email exists, reset link has been sent' });
        }

        const user = result.rows[0];

        // Generate reset token (32 characters)
        const resetToken = Array.from({ length: 32 }, () =>
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
        ).join('');

        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save token to database
        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [resetToken, expires, user.id]
        );

        // In production: send email with reset link
        // For testing: return token in response
        res.json({
            message: 'If email exists, reset link has been sent',
            resetToken, // Remove in production
            resetLink: `http://localhost:5173/reset-password/${resetToken}` // For testing
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Find user with valid token
        const result = await pool.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = result.rows[0];

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [passwordHash, user.id]
        );

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
