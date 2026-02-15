import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import { optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// DELETE /api/delete/:id - Manually delete content
router.delete('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch content to get file info
        const query = `
      SELECT * FROM links 
      WHERE unique_id = $1 AND deleted_at IS NULL
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Content not found or already deleted'
            });
        }

        const link = result.rows[0];

        // Check ownership - only allow deletion if:
        // 1. Link has no owner (anonymous upload), OR
        // 2. User is authenticated and owns the link
        if (link.user_id !== null && link.user_id !== req.userId) {
            return res.status(403).json({
                error: 'You do not have permission to delete this content'
            });
        }

        // Delete file from Firebase if it's a file upload
        if (link.type === 'file' && link.file_url && bucket) {
            try {
                const fileName = `uploads/${id}/${link.file_name}`;
                await bucket.file(fileName).delete();
                console.log(`Deleted file from Firebase: ${fileName}`);
            } catch (error) {
                console.error('Error deleting file from Firebase:', error);
                // Continue with database deletion even if Firebase deletion fails
            }
        }

        // Mark as deleted in database (soft delete)
        const deleteQuery = `
      UPDATE links 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE unique_id = $1
    `;

        await pool.query(deleteQuery, [id]);

        res.json({
            success: true,
            message: 'Content deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            error: 'Failed to delete content',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
