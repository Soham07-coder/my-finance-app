// server/routes/alerts.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// @route   GET /api/alerts
// @desc    Get all active alerts for the user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const alerts = [];

        // --- 1. Cash Payment Alert Logic (Conceptual) ---
        // This is a placeholder. The actual logic depends on how the mobile app
        // sends location data and cash transaction flags to the server.
        const cashAlert = await pool.query(
            `SELECT * FROM user_alerts WHERE user_id = $1 AND type = 'cash_payment' AND is_resolved = false`,
            [userId]
        );
        if (cashAlert.rows.length > 0) {
            alerts.push({
                type: 'cash_payment',
                message: 'You have an unrecorded cash payment. Please categorize it.',
                date: cashAlert.rows[0].created_at,
                id: cashAlert.rows[0].id
            });
        }

        // --- 2. Spending Anomaly Alert (Conceptual) ---
        // This is a placeholder for a more complex analytics-based alert.
        const anomalyAlert = await pool.query(
            `SELECT * FROM user_alerts WHERE user_id = $1 AND type = 'spending_anomaly' AND is_resolved = false`,
            [userId]
        );
        if (anomalyAlert.rows.length > 0) {
            alerts.push({
                type: 'spending_anomaly',
                message: `Your spending on a category is unusually high this month.`,
                date: anomalyAlert.rows[0].created_at,
                id: anomalyAlert.rows[0].id
            });
        }

        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;