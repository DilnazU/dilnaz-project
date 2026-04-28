import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import analysisRoutes from './routes/analysis.js';
import auth from './middleware/auth.js';

const app = express();

// Безопасность — helmet закрывает XSS, clickjacking и др.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting — максимум 100 запросов за 15 минут с одного IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Слишком много запросов. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Строгий лимит для анализа — 10 запросов за 15 минут
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Превышен лимит анализа. Попробуйте через 15 минут.' },
});

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected:', process.env.MONGODB_URI.split('@')[1]))
  .catch(err => console.error('MongoDB error:', err.message));

// Routes
app.use('/auth', authRoutes);
app.use('/api/chat', auth, chatRoutes);
app.use('/api/analysis', auth, analysisLimiter, analysisRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});