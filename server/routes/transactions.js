// server/routes/transactions.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all transactions for the logged-in user
router.post('/list', async (req, res) => {
    try {
        const transactions = await pool.query(
            "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
            [req.user.id]
        );
        res.json(transactions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new transaction
router.post('/', async (req, res) => {
    const { description, amount, category, transaction_type, date } = req.body;
    try {
        const newTransaction = await pool.query(
            "INSERT INTO transactions (user_id, description, amount, category, transaction_type, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [req.user.id, description, amount, category, transaction_type, date]
        );
        res.status(201).json(newTransaction.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a transaction
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

// Delete a transaction
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
