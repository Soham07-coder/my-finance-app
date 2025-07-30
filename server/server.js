// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Correctly import the database pool
const authMiddleware = require('./middleware/authMiddleware'); // Import middleware

// --- Route Files ---
const authRoutes = require('./routes/auth'); // This line is crucial

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Main Route Handler ---
// This tells Express: "For any URL starting with /api/auth, use the rules in authRoutes."
// This is what fixes the 404 error for /api/auth/me.
app.use('/api/auth', authRoutes);

// --- Transactions Route (Protected) ---
app.get('/api/transactions', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
