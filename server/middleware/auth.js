import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * authentication middleware.
 * verifies the JWT from the "token" cookie, looks up the user,
 * and attaches the user document to req.user before calling next().
 * returns 401 if the token is missing, invalid, or the user no longer exists.
 */
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-__v');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default auth;
