import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import { validateUpload } from '../middleware/validation.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    },
});

// POST /api/upload - Upload text or file
router.post('/', optionalAuth, upload.single('file'), validateUpload, async (req, res) => {
    try {
        const { type, content, password, expiresAt, maxViews, isOneTime, linkName } = req.body;

        // Generate unique ID (10 characters, URL-safe)
        const uniqueId = nanoid(10);

        // Calculate expiry time
        let expiryDate;
        if (expiresAt) {
            expiryDate = new Date(expiresAt);
        } else {
            // Default: 10 minutes from now
            const defaultMinutes = parseInt(process.env.DEFAULT_EXPIRY_MINUTES) || 10;
            expiryDate = new Date(Date.now() + defaultMinutes * 60 * 1000);
        }

        // Hash password if provided
        let passwordHash = null;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        let fileUrl = null;
        let fileName = null;
        let fileSize = null;
        let fileType = null;

        // Handle file upload to Cloudinary
        if (type === 'file' && req.file) {
            fileName = req.file.originalname;
            fileSize = req.file.size;
            fileType = req.file.mimetype;

            console.log(`Starting file upload to Cloudinary: ${fileName} (${fileSize} bytes)`);

            // Upload to Cloudinary using upload_stream
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `linkvault/${uniqueId}`,
                        public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
                        resource_type: 'raw', // Use 'raw' for all files to enable direct downloads
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                uploadStream.end(req.file.buffer);
            });

            fileUrl = uploadResult.secure_url;
            console.log('File upload to Cloudinary completed. URL:', fileUrl);
        }

        // Insert into database
        const query = `
      INSERT INTO links (
        unique_id, type, content, file_url, file_name, file_size, file_type,
        password_hash, expires_at, max_views, is_one_time, user_id, link_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING unique_id, expires_at
    `;

        const values = [
            uniqueId,
            type,
            type === 'text' ? content : null,
            fileUrl,
            fileName,
            fileSize,
            fileType,
            passwordHash,
            expiryDate,
            maxViews ? parseInt(maxViews) : null,
            isOneTime === 'true' || isOneTime === true,
            req.userId || null, // Associate with user if authenticated
            linkName || null,
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            uniqueId: result.rows[0].unique_id,
            url: `${req.protocol}://${req.get('host')}/view/${result.rows[0].unique_id}`,
            expiresAt: result.rows[0].expires_at,
        });

    } catch (error) {
        console.error('Upload error details:', error);
        if (error.code === 404 || error.message.includes('bucket')) {
            console.error('Firebase Bucket Error: Check FIREBASE_STORAGE_BUCKET in .env');
        }
        res.status(500).json({
            error: 'Failed to upload content',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: error.toString() // Send more details to frontend for debugging
        });
    }
});

export default router;
