// server/routes/alerts.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const db = admin.firestore();

router.use(authMiddleware);

// @route   GET /api/alerts
// @desc    Get all active alerts for the user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid; // Firebase UID from authMiddleware
        const alertsRef = db.collection('alerts');

        // --- 1. Cash Payment Alert Logic ---
        // This will now query the 'alerts' collection in Firestore
        const cashAlertsSnapshot = await alertsRef
            .where('userId', '==', userId)
            .where('type', '==', 'cash_payment')
            .where('isResolved', '==', false)
            .orderBy('createdAt', 'desc') // Assuming you have a 'createdAt' field
            .get();

        const alerts = cashAlertsSnapshot.docs.map(doc => ({
            id: doc.id,
            type: doc.data().type,
            message: doc.data().message,
            date: doc.data().createdAt?.toDate(), // Convert Firestore Timestamp to Date object
        }));

        // --- 2. Spending Anomaly Alert (Conceptual) ---
        // This is still a placeholder, but now it queries Firestore
        const anomalyAlertsSnapshot = await alertsRef
            .where('userId', '==', userId)
            .where('type', '==', 'spending_anomaly')
            .where('isResolved', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        anomalyAlertsSnapshot.docs.forEach(doc => {
            alerts.push({
                id: doc.id,
                type: doc.data().type,
                message: doc.data().message,
                date: doc.data().createdAt?.toDate(),
            });
        });

        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;