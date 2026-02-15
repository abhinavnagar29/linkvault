import { verifyToken } from '../config/jwt.js';

// Middleware to authenticate requests with JWT
export const authenticateToken = (req, res, next) => {
    // Check cookie first, then Authorization header
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = decoded.userId;
    next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req, res, next) => {
    const token = req.cookies?.token;

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.userId = decoded.userId;
        }
    }

    next();
};
