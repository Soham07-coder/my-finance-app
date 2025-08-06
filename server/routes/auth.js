// server/routes/auth.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const db = admin.firestore(); // Get a Firestore instance
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware

// @route   POST /api/auth/verify-token
// @desc    Verify Firebase ID token and fetch/create user in Firestore
// This route will be called by your React frontend after a user signs in
// using Firebase client-side SDK (e.g., Google Sign-In, email/password).
router.post('/verify-token', async (req, res) => {
    const { idToken, name: clientName, phone: clientPhone } = req.body; // Destructure name and phone from req.body

    // Basic validation for the presence of the ID token
    if (!idToken) {
        return res.status(400).json({ msg: 'Firebase ID token is required.' });
    }

    try {
        // Verify the Firebase ID token using the Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid; // The Firebase User ID

        // Check if the user already exists in your Firestore 'users' collection
        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // If the user document does not exist, create a new one in Firestore.
            const { name: decodedName, email, picture } = decodedToken; // Extract useful info from decoded token

            const newUser = {
                username: clientName || decodedName || email.split('@')[0], // Prefer clientName, then decodedName, then part of email
                email: email,
                phone: clientPhone || null, // Store phone if provided from client
                profilePicture: picture || null, // Store profile picture URL if available
                familyId: null, // Initialize familyId as null
                createdAt: admin.firestore.FieldValue.serverTimestamp(), // Firestore timestamp
                lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
            };
            await userDocRef.set(newUser); // Create the new user document
            return res.status(201).json({ id: uid, user: newUser }); // Return the newly created user
        } else {
            // If the user document exists, update their last login time
            await userDocRef.update({
                lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // Return existing user data, ensuring it's nested under 'user' for consistency
            return res.json({ id: uid, user: userDoc.data() });
        }

    } catch (err) {
        // Handle various Firebase authentication errors
        console.error('Firebase ID token verification failed:', err.message);
        // Return a 401 Unauthorized status for invalid tokens
        res.status(401).json({ msg: 'Unauthorized: Invalid or expired token.' });
    }
});


// @route   PUT /api/settings/password
// @desc    Update the authenticated user's password
router.put('/password', authMiddleware, async (req, res) => { // <-- authMiddleware added here
    const { newPassword } = req.body;
    const userId = req.user.uid; // This line now expects req.user to be populated by middleware

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    try {
        // Use Firebase Admin SDK to update the user's password
        await admin.auth().updateUser(userId, {
            password: newPassword
        });

        res.json({ msg: 'Password updated successfully.' });
    } catch (err) {
        console.error('Failed to update password:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to update password.' });
    }
});


module.exports = router;