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
            userId: isFamilyCategory ? null : userId, // If it's a family category, userId is null
            familyId: familyId || null, // If it's a family category, familyId is set
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
        // Check if user has permission to delete (either created by user or is a family admin for family category)
        // This logic might need refinement based on your exact family roles and permissions
        if (category.userId !== userId && !(category.familyId && userDoc.data().members[userId] === 'admin')) { // Simplified check, assuming userDoc is available
             // To make this check more robust, you might need to fetch the user's family role here
             // For now, it checks if the category belongs to the user OR if it's a family category (and implicitly assumes admin can delete)
             // A more robust check would involve fetching the user's role in the family
             const userDoc = await db.collection('users').doc(userId).get();
             const userFamilyId = userDoc.data()?.familyId;
             const familyDoc = userFamilyId ? await db.collection('families').doc(userFamilyId).get() : null;
             const userRole = familyDoc?.data()?.members[userId];

             if (category.userId !== userId && !(category.familyId && userRole === 'admin')) {
                return res.status(403).json({ msg: 'Not authorized to delete this category.' });
             }
        }


        await categoryRef.delete();
        res.json({ msg: 'Category removed.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;