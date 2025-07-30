<<<<<<< HEAD
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
=======
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Import the database connection

// --- Route Files ---
const authRoutes = require('./routes/auth');
// You can add more route files here later, e.g., const transactionRoutes = require('./routes/transactions');

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // for parsing application/json

// --- Use Routes ---
// All routes in auth.js will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// --- Original Transaction Route ---
// This can also be moved to its own file later
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
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
>>>>>>> 5f101164b2105880be0cf787aecd3034db32ddd0
