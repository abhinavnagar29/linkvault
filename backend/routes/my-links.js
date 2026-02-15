import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/my-links - List authenticated user's uploads
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                unique_id, type, content, file_url, file_name, file_size, file_type,
                expires_at, max_views, is_one_time, view_count, download_count, created_at, link_name
            FROM links
            WHERE user_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [req.userId]);

        res.json({
            links: result.rows.map(link => ({
                uniqueId: link.unique_id,
                type: link.type,
                content: link.type === 'text' ? link.content : null,
                fileUrl: link.file_url,
                fileName: link.file_name,
                fileSize: link.file_size,
                fileType: link.file_type,
                expiresAt: link.expires_at,
                maxViews: link.max_views,
                isOneTime: link.is_one_time,
                viewCount: link.view_count,
                downloadCount: link.download_count,
                createdAt: link.created_at,
                link_name: link.link_name,
            })),
        });
    } catch (error) {
        console.error('Get user links error:', error);
        res.status(500).json({
            error: 'Failed to retrieve links',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// PUT /api/my-links/claim - Claim anonymous links
router.put('/claim', authenticateToken, async (req, res) => {
    try {
        const { linkIds } = req.body; // Array of unique_ids

        if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
            return res.json({ message: 'No links to claim' });
        }

        // Update links that match the IDs AND have no user_id (anonymous)
        // We use ANY (array) to match multiple IDs
        const query = `
            UPDATE links 
            SET user_id = $1 
            WHERE unique_id = ANY($2) AND user_id IS NULL
            RETURNING unique_id
        `;

        const result = await pool.query(query, [req.userId, linkIds]);

        res.json({
            message: 'Links claimed successfully',
            claimedCount: result.rowCount,
            claimedIds: result.rows.map(r => r.unique_id)
        });
    } catch (error) {
        console.error('Claim links error:', error);
        res.status(500).json({ error: 'Failed to claim links' });
    }
});

export default router;
