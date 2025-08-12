// server/routes/transactions.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const db = admin.firestore();
const { Parser } = require('json2csv');
// A library like 'pdfkit' would be needed for PDF generation.
const PDFDocument = require('pdfkit');
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

// @route   GET /api/transactions/all
// @desc    Gets ALL transactions (personal and family) for the logged-in user
// ** NEW ROUTE **
router.get('/all', async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;

        // Firestore does not support OR queries across different fields in a single query.
        // We must perform two separate queries and merge the results.
        const personalTransactionsQuery = db.collection('transactions')
            .where('userId', '==', userId)
            .where('familyId', '==', null);

        let allTransactions = [];

        // Fetch personal transactions
        const personalSnapshot = await personalTransactionsQuery.get();
        const personal = personalSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date ? doc.data().date.toDate().toISOString() : null
        }));
        allTransactions.push(...personal);

        // Fetch family transactions if a familyId exists
        if (familyId) {
            const familyTransactionsQuery = db.collection('transactions')
                .where('familyId', '==', familyId);
            
            const familySnapshot = await familyTransactionsQuery.get();
            const family = familySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date ? doc.data().date.toDate().toISOString() : null
            }));
            allTransactions.push(...family);
        }

        // Sort the combined results by date
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(allTransactions);

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
            type,
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

// @route   POST /api/transactions/export-csv
// @desc    Exports transactions as a CSV. Accepts a 'scope' (personal/family).
// ** NEW ROUTE **
router.post('/export-csv', async (req, res) => {
    const userId = req.user.uid;
    const { scope } = req.body; // 'personal' or 'family'

    try {
        let transactionsSnapshot;
        let queryRef;

        if (scope === 'personal') {
            queryRef = db.collection('transactions')
                .where('userId', '==', userId)
                .where('familyId', '==', null)
                .orderBy('date', 'desc');
        } else if (scope === 'family') {
            const userDoc = await db.collection('users').doc(userId).get();
            const familyId = userDoc.data()?.familyId;
            if (!familyId) {
                return res.status(400).json({ msg: 'You are not in a family.' });
            }
            queryRef = db.collection('transactions')
                .where('familyId', '==', familyId)
                .orderBy('date', 'desc');
        } else {
            return res.status(400).json({ msg: 'Invalid export scope provided.' });
        }

        transactionsSnapshot = await queryRef.get();

        if (transactionsSnapshot.empty) {
            return res.status(404).json({ msg: `No ${scope} transactions found to export.` });
        }

        const transactionsData = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                description: data.description,
                amount: data.amount,
                category: data.category,
                type: data.type,
                date: data.date ? data.date.toDate().toISOString() : null,
                isCashPayment: data.isCashPayment,
                location: data.location
            };
        });

        const json2csv = new Parser();
        const csv = json2csv.parse(transactionsData);
        
        res.header('Content-Type', 'text/csv');
        res.attachment(`${scope}_transactions.csv`);
        res.send(csv);

    } catch (err) {
        console.error('Error exporting data:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to export data.' });
    }
});

// @route   POST /api/transactions/export-pdf
// @desc    Exports transactions as a PDF. Accepts a 'scope' (personal/family).
// ** NEW ROUTE **
router.post('/export-pdf', async (req, res) => {
    const userId = req.user.uid;
    const { scope } = req.body; // 'personal' or 'family'

    try {
        let transactionsSnapshot;
        let queryRef;

        if (scope === 'personal') {
            queryRef = db.collection('transactions')
                .where('userId', '==', userId)
                .where('familyId', '==', null)
                .orderBy('date', 'desc');
        } else if (scope === 'family') {
            const userDoc = await db.collection('users').doc(userId).get();
            const familyId = userDoc.data()?.familyId;
            if (!familyId) {
                return res.status(400).json({ msg: 'You are not in a family.' });
            }
            queryRef = db.collection('transactions')
                .where('familyId', '==', familyId)
                .orderBy('date', 'desc');
        } else {
            return res.status(400).json({ msg: 'Invalid export scope provided.' });
        }

        transactionsSnapshot = await queryRef.get();

        if (transactionsSnapshot.empty) {
            return res.status(404).json({ msg: `No ${scope} transactions found to export.` });
        }

        const transactionsData = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                description: data.description,
                amount: data.amount,
                category: data.category,
                type: data.type,
                date: data.date ? data.date.toDate().toLocaleDateString() : null
            };
        });

        res.json({
            msg: `Conceptual PDF export for ${scope} transactions.`,
            data: transactionsData
        });

    } catch (err) {
        console.error('Error exporting data:', err.message);
        res.status(500).json({ msg: 'Server error: Failed to export data.' });
    }
});

module.exports = router;