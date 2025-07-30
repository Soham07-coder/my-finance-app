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