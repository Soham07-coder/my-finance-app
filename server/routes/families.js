// server/routes/families.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const db = admin.firestore();

// This line protects all routes in this file.
router.use(authMiddleware);

// @route   POST /api/families/create
// @desc    Create a new family, making the creator the admin.
router.post('/create', async (req, res) => {
    const { name } = req.body;
    const userId = req.user.uid; // Firebase UID from authMiddleware

    try {
        // Check if the user is already in a family
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.data()?.familyId) {
            return res.status(400).json({ msg: 'You are already in a family.' });
        }

        // Create a new family document in Firestore
        const familyRef = db.collection('families').doc(); // Firestore generates a unique ID
        const familyData = {
            id: familyRef.id, // Store the Firestore document ID as an 'id' field
            name: name,
            members: { [userId]: 'admin' }, // Store members as a map: { 'userId': 'role' }
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await familyRef.set(familyData);

        // Update the user's document to link them to the new family
        await db.collection('users').doc(userId).update({ familyId: familyRef.id });

        res.status(201).json(familyData);
    } catch (err) {
        console.error('Error creating family:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/families/my-family
// @desc    Get details of the family the current user belongs to.
router.get('/my-family', async (req, res) => {
    const userId = req.user.uid; // Firebase UID from authMiddleware

    try {
        // Get the user's family ID from their user document
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;

        if (!familyId) {
            return res.json(null); // User is not in a family
        }

        // Fetch the family document
        const familyDoc = await db.collection('families').doc(familyId).get();
        if (!familyDoc.exists) {
            // This case indicates a data inconsistency, user has a familyId but family doc doesn't exist
            console.warn(`User ${userId} has familyId ${familyId} but family document does not exist.`);
            return res.json(null);
        }
        const familyData = familyDoc.data();

        // Fetch details for all members in the family
        const memberUids = Object.keys(familyData.members);
        const membersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', memberUids).get();

        const membersData = membersSnapshot.docs.map(doc => ({
            id: doc.id,
            username: doc.data().username,
            email: doc.data().email,
            role: familyData.members[doc.id] // Get role from the family document's members map
        }));

        res.json({ ...familyData, members: membersData });
    } catch (err) {
        console.error('Error fetching family details:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/families/join
// @desc    Join an existing family using a family ID (previously invite code).
router.post('/join', async (req, res) => {
    const { familyId } = req.body; // Expecting the Firestore family document ID
    const userId = req.user.uid; // Firebase UID from authMiddleware

    try {
        // Check if the user is already in a family
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.data()?.familyId) {
            return res.status(400).json({ msg: 'You are already in a family.' });
        }

        // Check if the family exists
        const familyRef = db.collection('families').doc(familyId);
        const familyDoc = await familyRef.get();
        if (!familyDoc.exists) {
            return res.status(404).json({ msg: 'Invalid family ID.' });
        }

        // Use a Firestore transaction to atomically update both documents
        await db.runTransaction(async (transaction) => {
            const currentFamilyData = (await transaction.get(familyRef)).data();

            // Check if user is already a member of this specific family
            if (currentFamilyData.members && currentFamilyData.members[userId]) {
                throw new Error('You are already a member of this family.');
            }

            // Add the user as a member to the family document
            const updatedMembers = { ...currentFamilyData.members, [userId]: 'member' };
            transaction.update(familyRef, { members: updatedMembers });

            // Update the user's document to link them to the family
            transaction.update(db.collection('users').doc(userId), { familyId: familyId });
        });

        res.json({ msg: 'Successfully joined the family!' });
    } catch (err) {
        if (err.message === 'You are already a member of this family.') {
            return res.status(400).json({ msg: err.message });
        }
        console.error('Error joining family:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;