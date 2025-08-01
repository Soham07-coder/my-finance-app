// server/routes/categories.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// @route   GET /api/categories
// @desc    Get all relevant categories for a user (default + custom)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const userResult = await pool.query('SELECT family_id FROM users WHERE id = $1', [userId]);
        const familyId = userResult.rows[0]?.family_id;

        // Fetch default categories, user-specific categories, and family-specific categories
        const categories = await pool.query(
            `SELECT * FROM categories 
             WHERE is_default = true 
                OR user_id = $1 
                OR (family_id = $2 AND $2 IS NOT NULL)
             ORDER BY type, name`,
            [userId, familyId]
        );
        res.json(categories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/categories
// @desc    Create a new custom category
router.post('/', async (req, res) => {
    const { name, type, isFamilyCategory } = req.body; // type is 'expense' or 'income'
    const userId = req.user.id;

    if (!name || !type) {
        return res.status(400).json({ msg: 'Name and type are required.' });
    }

    try {
        let familyId = null;
        if (isFamilyCategory) {
            const userResult = await pool.query('SELECT family_id FROM users WHERE id = $1', [userId]);
            familyId = userResult.rows[0]?.family_id;
            if (!familyId) {
                return res.status(400).json({ msg: 'You are not in a family.' });
            }
        }

        const newCategory = await pool.query(
            'INSERT INTO categories (name, type, user_id, family_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, type, familyId ? null : userId, familyId]
        );

        res.status(201).json(newCategory.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ msg: 'A category with this name already exists.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a custom category
router.delete('/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const userId = req.user.id;

        const categoryResult = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Category not found.' });
        }

        const category = categoryResult.rows[0];
        // Users cannot delete default categories
        if (category.is_default) {
            return res.status(403).json({ msg: 'Cannot delete a default category.' });
        }
        // Check if user has permission to delete
        if (category.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized to delete this category.' });
        }

        await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
        res.json({ msg: 'Category removed.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
