import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/content/:id - Retrieve content by unique ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.query;

        // Fetch content from database
        console.log(`Fetching content for ID: ${id}`);
        const query = `
      SELECT * FROM links 
      WHERE unique_id = $1 AND deleted_at IS NULL
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Content not found or has been deleted'
            });
        }

        const link = result.rows[0];

        // Check if expired
        if (new Date(link.expires_at) < new Date()) {
            return res.status(410).json({
                error: 'This link has expired'
            });
        }

        // Check password if protected
        if (link.password_hash) {
            if (!password) {
                return res.status(401).json({
                    error: 'Password required',
                    requiresPassword: true
                });
            }

            const isValid = await bcrypt.compare(password, link.password_hash);
            console.log(`Password validation for ${id}: ${isValid ? 'Success' : 'Failed'}`);
            if (!isValid) {
                return res.status(401).json({
                    error: 'Incorrect password'
                });
            }
        }

        // Check max views limit
        if (link.max_views && link.view_count >= link.max_views) {
            return res.status(410).json({
                error: 'This link has reached its maximum view count'
            });
        }

        // Increment view/download count
        const updateQuery = `
      UPDATE links 
      SET view_count = view_count + 1,
          download_count = CASE WHEN type = 'file' THEN download_count + 1 ELSE download_count END
      WHERE unique_id = $1
    `;
        await pool.query(updateQuery, [id]);

        // If one-time view, mark as deleted
        if (link.is_one_time) {
            const deleteQuery = `
        UPDATE links 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE unique_id = $1
      `;
            await pool.query(deleteQuery, [id]);
        }

        // Return content
        const response = {
            type: link.type,
            expiresAt: link.expires_at,
            viewCount: link.view_count + 1,
            isOneTime: link.is_one_time,
            link_name: link.link_name,
        };

        if (link.type === 'text') {
            response.content = link.content;
        } else {
            response.fileUrl = link.file_url;
            response.fileName = link.file_name;
            response.fileSize = link.file_size;
            response.fileType = link.file_type;
            response.downloadCount = link.download_count + 1;
            console.log('Sending file URL to frontend:', link.file_url);
        }

        res.json(response);

    } catch (error) {
        console.error('Content retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve content',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
