// server/routes/categories.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const db = admin.firestore();

router.use(authMiddleware);

// @route   GET /api/categories
// @desc    Get all relevant categories for a user (default + custom)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        const familyId = userDoc.data()?.familyId;

        const categoriesRef = db.collection('categories');
        const defaultCategoriesSnapshot = await categoriesRef.where('isDefault', '==', true).get();
        const userCategoriesSnapshot = await categoriesRef.where('userId', '==', userId).get();

        let familyCategoriesSnapshot = { docs: [] };
        if (familyId) {
            familyCategoriesSnapshot = await categoriesRef.where('familyId', '==', familyId).get();
        }

        const defaultCategories = defaultCategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const userCategories = userCategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const familyCategories = familyCategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const allCategories = [...defaultCategories, ...userCategories, ...familyCategories];
        res.json(allCategories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/categories
// @desc    Create a new custom category
router.post('/', async (req, res) => {
    const { name, type, isFamilyCategory } = req.body;
    const userId = req.user.uid;

    if (!name || !type) {
        return res.status(400).json({ msg: 'Name and type are required.' });
    }

    try {
        let familyId = null;
        if (isFamilyCategory) {
            const userDoc = await db.collection('users').doc(userId).get();
            familyId = userDoc.data()?.familyId;
            if (!familyId) {
                return res.status(400).json({ msg: 'You are not in a family.' });
            }
        }

        const newCategory = {
            name,
            type,
            userId: isFamilyCategory ? null : userId,
            familyId: familyId || null,
            isDefault: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const categoryRef = await db.collection('categories').add(newCategory);
        res.status(201).json({ id: categoryRef.id, ...newCategory });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a custom category
router.delete('/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const userId = req.user.uid;

        const categoryRef = db.collection('categories').doc(categoryId);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
            return res.status(404).json({ msg: 'Category not found.' });
        }

        const category = categoryDoc.data();
        if (category.isDefault) {
            return res.status(403).json({ msg: 'Cannot delete a default category.' });
        }
        if (category.userId !== userId) {
            return res.status(403).json({ msg: 'Not authorized to delete this category.' });
        }

        await categoryRef.delete();
        res.json({ msg: 'Category removed.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;