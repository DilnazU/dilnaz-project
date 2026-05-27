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
 
const app = express();
 
app.set('trust proxy', 1);
 
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
 
// Лимиты берутся из .env (можно менять без правки кода).
// Если в .env ничего нет — используются значения по умолчанию.
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;
const ANALYSIS_LIMIT_MAX = parseInt(process.env.ANALYSIS_LIMIT_MAX) || 10;
 
// Не ограничивать запросы с локального компьютера (удобно при разработке/демо)
const skipLocalhost = (req) => {
  const ip = req.ip || '';
  return ip.includes('127.0.0.1') || ip.includes('::1');
};
 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: RATE_LIMIT_MAX,
  message: { error: 'Слишком много запросов. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
});
app.use(limiter);
 
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: ANALYSIS_LIMIT_MAX,
  message: { error: 'Превышен лимит анализа. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
});
 
const allowedOrigins = [
  'http://localhost:5173',
  'https://dilnaz-project.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);
 
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
 
app.use(express.json());
app.use(cookieParser());
 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected:', process.env.MONGODB_URI.split('@')[1]))
  .catch(err => console.error('MongoDB error:', err.message));
 
app.use('/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analysis', analysisLimiter, analysisRoutes);
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});