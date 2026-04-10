import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * keeps user logged in with JWT token for a week.
 */
const setTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

// POST /auth/signup register new user
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // create user and set JWT cookie
    const user = await User.create({ name, email, password });
    setTokenCookie(res, user);

    res.status(201).json({ 
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
};

// POST /auth/login authenticate an existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // find user and verify password
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setTokenCookie(res, user);

    res.json({ 
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// GET /auth/me return the currently authenticated user's profile
export const getMe = (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
};

// POST /auth/logout clear the auth cookie to log the user out
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};