// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- NEW: Google Sign-In Route ---
// @route   POST /api/auth/google
// @desc    Authenticate user with Google token
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub: google_id } = ticket.getPayload();

        // Check if user already exists
        let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [google_id, email]);
        let user = userResult.rows[0];

        // If user does not exist, create a new user
        if (!user) {
            const newUserResult = await pool.query(
                'INSERT INTO users (username, email, google_id) VALUES ($1, $2, $3) RETURNING *',
                [name, email, google_id]
            );
            user = newUserResult.rows[0];
        }
        // If user exists but google_id is null (i.e., they signed up with email/password first), update their record
        else if (!user.google_id) {
            const updatedUserResult = await pool.query(
                'UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *',
                [google_id, user.id]
            );
            user = updatedUserResult.rows[0];
        }

        // Create JWT payload
        const payload = { user: { id: user.id, username: user.username } };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, appToken) => {
                if (err) throw err;
                res.json({ token: appToken });
            }
        );

    } catch (err) {
        console.error('Google auth error:', err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, password_hash]
        );

        res.status(201).json(newUser.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, username: user.username } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- NEWLY ADDED ROUTE ---
// GET /api/auth/me
// This route uses the middleware to verify the user's token and send back their data.
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // The user's ID is attached to the request object by the middleware (req.user.id)
        const user = await pool.query('SELECT id, username, email, family_id FROM users WHERE id = $1', [
            req.user.id
        ]);
        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;