// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Check if the environment is production
const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    // This is the key change:
    // Use SSL for production environments (like Supabase, Neon, Render).
    // Disable SSL for local development to prevent the error.
    ssl: isProduction ? { rejectUnauthorized: false } : false
};

const pool = new Pool(connectionConfig);

module.exports = pool;
