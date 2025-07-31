// server/routes/transactions.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Corrected import
const authMiddleware = require('../middleware/authMiddleware');

// This protects all routes in this file
router.use(authMiddleware);

// POST /api/transactions/list (Updated)
// Gets ONLY PERSONAL transactions for the logged-in user
router.post('/list', async (req, res) => {
    try {
        const transactions = await pool.query(
            "SELECT * FROM transactions WHERE user_id = $1 AND family_id IS NULL ORDER BY date DESC",
            [req.user.id]
        );
        res.json(transactions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// NEW ROUTE: POST /api/transactions/family
// Gets ALL transactions for the user's FAMILY
router.post('/family', async (req, res) => {
    try {
        const userFamily = await pool.query("SELECT family_id FROM users WHERE id = $1", [req.user.id]);
        const familyId = userFamily.rows[0]?.family_id;

        if (!familyId) {
            return res.json([]); // Return empty if user is not in a family
        }

        // Fetch all transactions linked to the family, joining with users to see who entered it
        const transactions = await pool.query(
            `SELECT t.*, u.username AS entered_by
             FROM transactions t
             JOIN users u ON t.user_id = u.id
             WHERE t.family_id = $1
             ORDER BY t.date DESC`,
            [familyId]
        );
        res.json(transactions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/transactions (Updated)
// Adds a new transaction (can be personal OR family)
router.post('/', async (req, res) => {
    const { description, amount, category, transaction_type, date, family_id } = req.body;
    try {
        const newTransaction = await pool.query(
            "INSERT INTO transactions (user_id, description, amount, category, transaction_type, date, family_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [req.user.id, description, amount, category, transaction_type, date, family_id]
        );
        res.status(201).json(newTransaction.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount, category, transaction_type, date } = req.body;
    try {
        const updatedTransaction = await pool.query(
            "UPDATE transactions SET description = $1, amount = $2, category = $3, transaction_type = $4, date = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
            [description, amount, category, transaction_type, date, id, req.user.id]
        );

        if (updatedTransaction.rows.length === 0) {
            return res.status(404).json({ msg: 'Transaction not found or user not authorized.' });
        }
        res.json(updatedTransaction.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await pool.query(
            "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );
        if (deleteOp.rows.length === 0) {
            return res.status(404).json({ msg: 'Transaction not found or user not authorized.' });
        }
        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
