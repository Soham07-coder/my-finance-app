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
        const familyRef = db.collection('families').doc(familyId);
        const familyDoc = await familyRef.get();
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

        // Fetch invitation history
        const invitationsSnapshot = await familyRef.collection('invitations').orderBy('sentAt', 'desc').get();
        const invitationsData = invitationsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                sentAt: data.sentAt ? data.sentAt.toDate().toISOString() : null
            }
        });

        res.json({ ...familyData, members: membersData, invitations: invitationsData });
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

// @route   POST /api/families/invite
// @desc    Invite a user to the family by email.
// @access  Private, Admin only
router.post('/invite', async (req, res) => {
    const { email } = req.body;
    const adminId = req.user.uid;

    if (!email) {
        return res.status(400).json({ msg: 'Please provide an email to invite.' });
    }

    try {
        // 1. Get admin's family details
        const adminUserDoc = await db.collection('users').doc(adminId).get();
        const familyId = adminUserDoc.data()?.familyId;

        if (!familyId) {
            return res.status(400).json({ msg: 'You are not in a family to invite members.' });
        }

        // 2. Verify admin role
        const familyRef = db.collection('families').doc(familyId);
        const familyDoc = await familyRef.get();
        if (!familyDoc.exists) {
            return res.status(404).json({ msg: 'Family not found.' });
        }
        const familyData = familyDoc.data();
        if (familyData.members[adminId] !== 'admin') {
            return res.status(403).json({ msg: 'Only family admins can invite members.' });
        }

        // 3. Find the user to invite by email
        const usersRef = db.collection('users');
        const invitedUserQuery = await usersRef.where('email', '==', email).limit(1).get();

        if (invitedUserQuery.empty) {
            return res.status(404).json({ msg: `User with email ${email} not found.` });
        }

        const invitedUserDoc = invitedUserQuery.docs[0];
        const invitedUserId = invitedUserDoc.id;
        const invitedUserData = invitedUserDoc.data();

        // 4. Check if the invited user is already in a family
        if (invitedUserData.familyId) {
            return res.status(400).json({ msg: 'This user is already in a family.' });
        }

        // 5. Check for existing pending invitation
        const invitationsRef = familyRef.collection('invitations');
        const existingInviteQuery = await invitationsRef.where('email', '==', email).where('status', '==', 'pending').get();

        if (!existingInviteQuery.empty) {
            return res.status(400).json({ msg: 'An invitation has already been sent to this email.' });
        }

        // 6. Create the invitation document
        const newInvitation = {
            email: email,
            userId: invitedUserId,
            status: 'pending',
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            invitedBy: adminId,
        };

        await invitationsRef.add(newInvitation);

        res.status(201).json({ msg: `Invitation sent to ${email}.` });

    } catch (err) {
        console.error('Error sending invitation:', err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/families/leave
// @desc    Remove the authenticated user from their current family.
router.post('/leave', async (req, res) => {
    const userId = req.user.uid; // Firebase UID from authMiddleware

    try {
        // Get the user's current family ID
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;

        if (!familyId) {
            return res.status(400).json({ msg: 'You are not currently in a family.' });
        }

        // Use a Firestore transaction to atomically update both documents
        await db.runTransaction(async (transaction) => {
            const familyRef = db.collection('families').doc(familyId);
            const userRef = db.collection('users').doc(userId);

            const familyDoc = await transaction.get(familyRef);
            if (!familyDoc.exists) {
                // Data inconsistency: User has a familyId but family doesn't exist
                throw new Error('Family not found.');
            }

            const familyData = familyDoc.data();
            const members = familyData.members;
            
            // Check if the user is the only member or an admin.
            const memberCount = Object.keys(members).length;
            const userRole = members[userId];

            if (userRole === 'admin' && memberCount > 1) {
                // If the user is an admin and there are other members,
                // you might want to handle this differently (e.g., reassign admin role or disallow leaving).
                // For this example, we'll return an error.
                throw new Error('Family admin cannot leave a family with other members.');
            }

            // Remove the user from the family's members map
            delete members[userId];
            transaction.update(familyRef, { members: members });

            // If the user was the last member, delete the family document
            if (memberCount === 1) {
                transaction.delete(familyRef);
            }

            // Remove the familyId from the user's document
            transaction.update(userRef, { familyId: null });
        });

        res.json({ msg: 'Successfully left the family.' });
    } catch (err) {
        console.error('Error leaving family:', err.message);
        // Handle specific business logic errors
        if (err.message === 'Family admin cannot leave a family with other members.') {
            return res.status(403).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

router.put('/settings/spending-limit', async (req, res) => {
    const { newLimit } = req.body;
    const userId = req.user.uid;

    if (typeof newLimit !== 'number' || newLimit <= 0) {
        return res.status(400).json({ msg: 'Invalid spending limit provided.' });
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;

        if (!familyId) {
            return res.status(400).json({ msg: 'You must be in a family to set a spending limit.' });
        }

        const familyRef = db.collection('families').doc(familyId);
        const familyDoc = await familyRef.get();
        const familyData = familyDoc.data();

        // Check if the user is a family admin
        if (familyData.members[userId] !== 'admin') {
            return res.status(403).json({ msg: 'Only family admins can set a spending limit.' });
        }

        // Update the spending limit in the family document
        await familyRef.update({
            'settings.monthlySpendingLimit': newLimit,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ msg: 'Monthly spending limit updated successfully.' });

    } catch (err) {
        console.error('Error updating spending limit:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to update spending limit.' });
    }
});

// @route   PUT /api/families/members/:memberId/permissions
// @desc    Allows an admin to change the role of another family member.
// @access  Private, Admin only
router.put('/members/:memberId/permissions', async (req, res) => {
    const { memberId } = req.params;
    const { newRole } = req.body;
    const userId = req.user.uid;

    if (!newRole || (newRole !== 'member' && newRole !== 'admin')) {
        return res.status(400).json({ msg: 'Invalid role provided.' });
    }

    if (userId === memberId) {
        return res.status(400).json({ msg: 'You cannot change your own role.' });
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;

        if (!familyId) {
            return res.status(400).json({ msg: 'You are not in a family.' });
        }

        const familyRef = db.collection('families').doc(familyId);
        const familyDoc = await familyRef.get();
        const familyData = familyDoc.data();

        if (familyData.members[userId] !== 'admin') {
            return res.status(403).json({ msg: 'Permission denied. Only family admins can change member roles.' });
        }

        if (!familyData.members[memberId]) {
            return res.status(404).json({ msg: 'Member not found in this family.' });
        }

        const updatedMembers = { ...familyData.members, [memberId]: newRole };
        await familyRef.update({ members: updatedMembers });

        res.json({ msg: 'Member role updated successfully.' });

    } catch (err) {
        console.error('Error updating member permissions:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to update member permissions.' });
    }
});

// @route   GET /api/families/members/:memberId/details
// @desc    Get detailed information for a single family member.
// @access  Private
router.get('/members/:memberId/details', async (req, res) => {
    const { memberId } = req.params;
    const userId = req.user.uid;
    const now = admin.firestore.Timestamp.now();
    const startOfMonth = new Date(now.toDate().getFullYear(), now.toDate().getMonth(), 1);

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;
        
        if (!familyId) {
            return res.status(400).json({ msg: 'You are not in a family.' });
        }
        
        const memberDoc = await db.collection('users').doc(memberId).get();
        if (!memberDoc.exists) {
            return res.status(404).json({ msg: 'Member not found.' });
        }

        const memberTransactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', memberId)
            .where('familyId', '==', familyId)
            .get();

        const transactions = memberTransactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date ? data.date.toDate().toISOString() : null,
            };
        });
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const monthlyTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
        const monthlySpending = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

        const spendingBreakdown = monthlyTransactions.reduce((acc, t) => {
            const existingCategory = acc.find(item => item.category === t.category);
            if (existingCategory) {
                existingCategory.amount += t.amount;
            } else {
                acc.push({ category: t.category, amount: t.amount });
            }
            return acc;
        }, []);

        const details = {
            id: memberDoc.id,
            ...memberDoc.data(),
            monthlySpending,
            spendingBreakdown,
            transactionHistory: transactions
        };

        res.json(details);

    } catch (err) {
        console.error('Error fetching member details:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to fetch member details.' });
    }
});

module.exports = router;