import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cleanup job runs every minute
export function startCleanupJob() {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running cleanup job...');

            // Find expired links
            const query = `
        SELECT unique_id, type, file_name 
        FROM links 
        WHERE expires_at < CURRENT_TIMESTAMP 
        AND deleted_at IS NULL
      `;

            const result = await pool.query(query);

            if (result.rows.length === 0) {
                console.log('No expired links to clean up');
                return;
            }

            console.log(`Found ${result.rows.length} expired links to clean up`);

            // Delete files from Cloudinary and mark as deleted in database
            for (const link of result.rows) {
                // Delete file from Cloudinary if it's a file upload
                if (link.type === 'file' && link.file_name) {
                    try {
                        // Extract public_id from file_name (format: uploads/unique_id/filename)
                        const publicId = `linkvault/${link.unique_id}/${link.file_name}`;
                        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                        console.log(`  Deleted file from Cloudinary: ${publicId}`);
                    } catch (error) {
                        console.error(`  Error deleting file ${link.file_name}:`, error.message);
                    }
                }

                // Mark as deleted in database
                const deleteQuery = `
          UPDATE links 
          SET deleted_at = CURRENT_TIMESTAMP 
          WHERE unique_id = $1
        `;
                await pool.query(deleteQuery, [link.unique_id]);
            }

            console.log(`Cleanup completed: ${result.rows.length} links cleaned up`);

        } catch (error) {
            console.error('Cleanup job error:', error);
        }
    });

    console.log('Cleanup job scheduled (runs every minute)');
}
