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
// @route   PUT /api/settings/notifications
// @desc    Update the authenticated user's notification preferences
router.put('/notifications', async (req, res) => {
    const { notifications } = req.body;
    const userId = req.user.uid;

    if (!notifications || typeof notifications !== 'object') {
        return res.status(400).json({ msg: 'Invalid notification data provided.' });
    }

    try {
        const userDocRef = db.collection('users').doc(userId);
        
        // Update the notifications field in the user's Firestore document
        // This will be a nested object like { budgetAlerts: true, cashPaymentAlerts: false, ... }
        await userDocRef.update({
            'preferences.notifications': notifications
        });

        res.json({ msg: 'Notification preferences updated successfully.' });
    } catch (err) {
        console.error('Failed to update notifications:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to update notification preferences.' });
    }
});
module.exports = router;