// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    // Use SSL in production, but not in development (for local DB)
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

module.exports = pool;