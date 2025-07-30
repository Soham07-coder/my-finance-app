// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- Route Files ---
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const familyRoutes = require('./routes/families');

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Use Routes ---
// Connects the URL prefixes to the route files
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/families', familyRoutes);

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
