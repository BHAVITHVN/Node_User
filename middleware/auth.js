const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {verifyToken,generateRefreshToken,generateAccessToken} = require('../utils/jwt');
const redis = require('../utils/redis');
const cacheMiddleware = require('../middleware/redisMiddleware');



module.exports.authenticate = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).populate({
            path: 'roles',
            populate: { path: 'permissions' },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports.authorize = (requiredPermission) => {
    return (req, res, next) => {
        const userPermissions = req.user.permissions;
        if ((userPermissions & requiredPermission) === requiredPermission) {
            return next();
        }
        res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    };
};


module.exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    try {
        // Verify refresh token
        const decoded = verifyToken(refreshToken);

        // Check if refresh token exists in Redis
        const storedToken = cacheMiddleware(refreshToken);
        if (!storedToken) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(decoded.id);
        const newRefreshToken = generateRefreshToken();
        const userData = (newAccessToken,newRefreshToken);
        // Store new refresh token in Redis and delete old one
        await redis.set(`user:${decoded.id}`,JSON.stringify(userData), 'EX', 7 * 24 * 60 * 60); // 7 days
        await redis.del(`refreshToken:${refreshToken}`);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired refresh token' });
    }
};