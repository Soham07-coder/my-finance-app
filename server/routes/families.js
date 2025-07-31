// server/routes/families.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { customAlphabet } = require('nanoid');

// This line protects all routes in this file.
router.use(authMiddleware);

// Helper function to generate a unique, user-friendly invite code.
const generateInviteCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

// @route   POST /api/families/create
// @desc    Create a new family, making the creator the admin.
router.post('/create', async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;
    try {
        const userCheck = await pool.query("SELECT family_id FROM users WHERE id = $1", [userId]);
        if (userCheck.rows[0].family_id) {
            return res.status(400).json({ msg: 'You are already in a family.' });
        }
        const invite_code = generateInviteCode();
        const newFamily = await pool.query(
            "INSERT INTO families (name, invite_code) VALUES ($1, $2) RETURNING id, name, invite_code",
            [name, invite_code]
        );
        const familyId = newFamily.rows[0].id;
        await pool.query(
            "INSERT INTO family_members (user_id, family_id, role) VALUES ($1, $2, $3)",
            [userId, familyId, 'admin']
        );
        await pool.query("UPDATE users SET family_id = $1 WHERE id = $2", [familyId, userId]);
        res.status(201).json(newFamily.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/families/my-family
// @desc    Get details of the family the current user belongs to.
router.get('/my-family', async (req, res) => {
    const userId = req.user.id;
    try {
        const userResult = await pool.query("SELECT family_id FROM users WHERE id = $1", [userId]);
        const familyId = userResult.rows[0]?.family_id;
        if (!familyId) {
            return res.json(null);
        }
        const familyResult = await pool.query("SELECT id, name, invite_code FROM families WHERE id = $1", [familyId]);
        const membersResult = await pool.query(
            "SELECT u.id, u.username, u.email, fm.role FROM users u JOIN family_members fm ON u.id = fm.user_id WHERE fm.family_id = $1",
            [familyId]
        );
        const familyData = { ...familyResult.rows[0], members: membersResult.rows };
        res.json(familyData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/families/join
// @desc    Join an existing family using an invite code.
router.post('/join', async (req, res) => {
    const { invite_code } = req.body;
    const userId = req.user.id;
    try {
        const userCheck = await pool.query("SELECT family_id FROM users WHERE id = $1", [userId]);
        if (userCheck.rows[0].family_id) {
            return res.status(400).json({ msg: 'You are already in a family.' });
        }
        const familyResult = await pool.query("SELECT id FROM families WHERE invite_code = $1", [invite_code.toUpperCase()]);
        if (familyResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Invalid invite code.' });
        }
        const familyId = familyResult.rows[0].id;
        await pool.query(
            "INSERT INTO family_members (user_id, family_id, role) VALUES ($1, $2, $3)",
            [userId, familyId, 'member']
        );
        await pool.query("UPDATE users SET family_id = $1 WHERE id = $2", [familyId, userId]);
        res.json({ msg: 'Successfully joined the family!' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ msg: 'You are already a member of this family.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;