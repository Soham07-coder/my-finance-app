// server/middleware/authMiddleware.js
const admin = require('firebase-admin');

module.exports = async function (req, res, next) {
    const idToken = req.header('Authorization')?.split(' ')[1];

    if (!idToken) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Attaching the decoded Firebase token payload to the request
        next();
    } catch (err) {
        console.error('Firebase auth error:', err);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};