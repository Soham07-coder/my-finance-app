// server/routes/users.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const db = admin.firestore();

// This protects all routes in this file
router.use(authMiddleware);

// @route   PUT /api/user/profile
// @desc    Update a user's profile information
// @access  Private
router.put('/profile', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { username, phone, location } = req.body;
        
        // Find the user document in the Firestore 'users' collection
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // Prepare the data to be updated, only including fields that were provided
        const updatedData = {};
        if (username !== undefined) updatedData.username = username;
        if (phone !== undefined) updatedData.phone = phone;
        if (location !== undefined) updatedData.location = location;

        // Perform the update
        await userRef.update(updatedData);

        // Fetch the updated user document
        const updatedUserDoc = await userRef.get();
        const updatedUser = updatedUserDoc.data();

        // Return the updated user data
        res.status(200).json({ msg: 'Profile updated successfully', user: updatedUser });

    } catch (err) {
        console.error("Error updating user profile:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/user/delete
// @desc    Delete a user's account
// @access  Private
router.delete('/delete', async (req, res) => {
    const userId = req.user.uid;

    try {
        // First, delete the user from Firebase Authentication
        await admin.auth().deleteUser(userId);

        // Then, delete the user's document from Firestore
        await db.collection('users').doc(userId).delete();

        res.json({ msg: 'User and account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;