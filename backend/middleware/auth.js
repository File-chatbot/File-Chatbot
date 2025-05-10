import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                error: "User not found"
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({
            error: "Please authenticate",
            message: error.message
        });
    }
};

export default auth; 