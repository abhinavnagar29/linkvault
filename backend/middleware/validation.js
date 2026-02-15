import dotenv from 'dotenv';

dotenv.config();

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 52428800; // 50MB default
const MAX_TEXT_LENGTH = 1000000; // 1MB of text

// Validation middleware for upload requests
export function validateUpload(req, res, next) {
    const { type, content, expiresAt, maxViews } = req.body;

    // Validate type
    if (!type || !['text', 'file'].includes(type)) {
        return res.status(400).json({
            error: 'Invalid type. Must be either "text" or "file"'
        });
    }

    // Validate content based on type
    if (type === 'text') {
        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Content is required for text uploads'
            });
        }
        if (content.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({
                error: `Text content exceeds maximum length of ${MAX_TEXT_LENGTH} characters`
            });
        }
    } else if (type === 'file') {
        if (!req.file) {
            return res.status(400).json({
                error: 'File is required for file uploads'
            });
        }
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        }
    }

    // Validate expiry date
    if (expiresAt) {
        const expiryDate = new Date(expiresAt);
        if (isNaN(expiryDate.getTime())) {
            return res.status(400).json({
                error: 'Invalid expiry date format'
            });
        }
        if (expiryDate <= new Date()) {
            return res.status(400).json({
                error: 'Expiry date must be in the future'
            });
        }
    }

    // Validate max views
    if (maxViews !== undefined) {
        const views = parseInt(maxViews);
        if (isNaN(views) || views < 1) {
            return res.status(400).json({
                error: 'Max views must be a positive number'
            });
        }
    }

    next();
}

// Error handling middleware
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Unexpected file field'
        });
    }

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}
