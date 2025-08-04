// server/routes/transactions.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const db = admin.firestore();

// This protects all routes in this file
router.use(authMiddleware);

// @route   GET /api/transactions/personal
// @desc    Gets ONLY PERSONAL transactions for the logged-in user
router.get('/personal', async (req, res) => {
    try {
        const userId = req.user.uid;
        const transactionsRef = db.collection('transactions');
        const transactionsSnapshot = await transactionsRef
            .where('userId', '==', userId)
            .where('familyId', '==', null)
            .orderBy('date', 'desc')
            .get();

        const transactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Fix: Convert Firestore Timestamp to a reliable ISO date string
                date: data.date ? data.date.toDate().toISOString() : null
            };
        });

        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/transactions/family
// @desc    Gets ALL transactions for the user's FAMILY
router.get('/family', async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;

        if (!familyId) {
            return res.json([]);
        }

        const transactionsRef = db.collection('transactions');
        const transactionsSnapshot = await transactionsRef
            .where('familyId', '==', familyId)
            .orderBy('date', 'desc')
            .get();

        const transactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Fix: Convert Firestore Timestamp to a reliable ISO date string
                date: data.date ? data.date.toDate().toISOString() : null
            };
        });

        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/transactions
// @desc    Adds a new transaction (can be personal OR family)
router.post('/', async (req, res) => {
    const { description, amount, category, type, date, familyId, isCashPayment, location } = req.body;
    const userId = req.user.uid;

    try {
        const newTransaction = {
            userId,
            description,
            amount,
            category,
            type, // 'expense' or 'income'
            date: new Date(date),
            familyId: familyId || null,
            isCashPayment: isCashPayment || false,
            location: location || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const transactionRef = await db.collection('transactions').add(newTransaction);
        res.status(201).json({ id: transactionRef.id, ...newTransaction });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.uid;

    const { description, amount, category, type, date, location, isCashPayment } = req.body;
    try {
        const transactionRef = db.collection('transactions').doc(id);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists || transactionDoc.data().userId !== userId) {
            return res.status(404).json({ msg: 'Transaction not found or user not authorized.' });
        }

        await transactionRef.update({
            description,
            amount,
            category,
            type,
            date: new Date(date),
            isCashPayment,
            location
        });

        const updatedDoc = await transactionRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.uid;

    try {
        const transactionRef = db.collection('transactions').doc(id);
        const transactionDoc = await transactionRef.get();

        if (!transactionDoc.exists || transactionDoc.data().userId !== userId) {
            return res.status(404).json({ msg: 'Transaction not found or user not authorized.' });
        }

        await transactionRef.delete();
        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;