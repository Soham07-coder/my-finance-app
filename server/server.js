// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure you've downloaded the serviceAccountKey.json file and placed it in this directory
const serviceAccount = require('./family-finance-app-61a64-firebase-adminsdk-fbsvc-4c0ad4c737.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// --- Route Files ---
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const familyRoutes = require('./routes/families');
const categoriesRoutes = require('./routes/categories');
const alertsRoutes = require('./routes/alerts');

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Use Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/alerts', alertsRoutes);

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});