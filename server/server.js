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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Слишком много запросов. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Превышен лимит анализа. Попробуйте через 15 минут.' },
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

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected:', process.env.MONGODB_URI.split('@')[1]))
  .catch(err => console.error('MongoDB error:', err.message));

// Корневой роут — чтобы при заходе на адрес сервера была понятная страница, а не ошибка.
app.get('/', (req, res) => {
  res.json({ name: 'MSB Help API', status: 'running' });
});

// Health-check — показывает, жив ли сервер и подключена ли база данных.
// 1 = подключено к MongoDB, иначе — проблема с базой.
app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
  });
});

app.use('/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analysis', analysisLimiter, analysisRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});