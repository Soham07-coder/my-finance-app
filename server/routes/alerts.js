// server/routes/alerts.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const db = admin.firestore();

router.use(authMiddleware);

// A simple utility to calculate distance between two lat/lon points
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// @route   GET /api/alerts
// @desc    Get all active alerts for the user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid; // Firebase UID from authMiddleware
        const alertsRef = db.collection('alerts');

        // --- 1. Cash Payment Alert Logic ---
        const cashAlertsSnapshot = await alertsRef
            .where('userId', '==', userId)
            .where('type', '==', 'cash_payment')
            .where('isResolved', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        const alerts = cashAlertsSnapshot.docs.map(doc => ({
            id: doc.id,
            type: doc.data().type,
            message: doc.data().message,
            date: doc.data().createdAt?.toDate(),
        }));

        // --- 2. Spending Anomaly Alert (Conceptual) ---
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

// @route   POST /api/alerts/cash-payment
// @desc    Checks if a cash payment is away from home and creates an alert
// @access  Private
// ** NEW ROUTE **
router.post('/cash-payment', async (req, res) => {
    const { latitude, longitude } = req.body;
    const userId = req.user.uid;

    if (!latitude || !longitude) {
        return res.status(400).json({ msg: 'Latitude and longitude are required.' });
    }

    try {
        // Fetch user's home location from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const userHomeLocation = userData?.location; // Assuming 'location' field stores home location

        // Define a reasonable radius for "home" (e.g., 5km)
        const HOME_RADIUS_KM = 5;
        
        // Example: Geocoding the user's home location to lat/lon (this would be done once upon profile setup)
        // For simplicity, let's assume the user's home location is already in a geocoded format (e.g., lat/lon)
        const userHomeLat = 19.224343; // Example lat for Dombivli
        const userHomeLon = 73.087520; // Example lon for Dombivli
        
        const distance = getDistanceInKm(userHomeLat, userHomeLon, latitude, longitude);
        
        if (distance > HOME_RADIUS_KM) {
            // User is away from home, create a new alert
            const newAlert = {
                userId,
                type: 'cash_payment',
                message: `Cash payment detected at a location away from home.`,
                isResolved: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                location: new admin.firestore.GeoPoint(latitude, longitude)
            };

            await db.collection('alerts').add(newAlert);
            
            // Send a response to the frontend that the alert was created
            return res.status(200).json({ msg: 'Alert created successfully.' });
        }

        // If user is within home radius, no alert is needed
        res.status(200).json({ msg: 'User is within home location, no alert needed.' });

    } catch (err) {
        console.error('Error processing cash payment alert:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to process cash payment alert.' });
    }
});


// @route   PUT /api/alerts/notifications
// @desc    Update the authenticated user's notification preferences
router.put('/notifications', async (req, res) => {
    const { notifications } = req.body;
    const userId = req.user.uid;

    if (!notifications || typeof notifications !== 'object') {
        return res.status(400).json({ msg: 'Invalid notification data provided.' });
    }

    try {
        const userDocRef = db.collection('users').doc(userId);
        
        await userDocRef.update({
            'preferences.notifications': notifications
        });

        res.json({ msg: 'Notification preferences updated successfully.' });
    } catch (err) {
        console.error('Failed to update notifications:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to update notification preferences.' });
    }
});

// @route   POST /api/alerts/get-location
// @desc    Gets the formatted address for a given lat/lng
// @access  Private
// ** NEW ROUTE **
router.post('/get-location', async (req, res) => {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return res.status(400).json({ msg: 'Latitude and longitude are required.' });
    }
    try {
        const apiKey = process.env.VITE_Maps_API_KEY; // Store your API key in a .env file
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        
        const geocodeRes = await axios.get(geocodeUrl);
        console.log('Geocoding API Response:', geocodeRes.data); 
        const location = geocodeRes.data.results[0]?.formatted_address || 'Unknown Location';
        res.status(200).json({ location });

    } catch (err) {
        console.error('Geocoding API failed:', err);
        res.status(500).json({ msg: 'Server error: Failed to get location from Geocoding API.' });
    }
});

module.exports = router;