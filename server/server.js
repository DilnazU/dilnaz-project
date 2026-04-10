process.env.GROQ_API_KEY = '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';
process.env.MONGODB_URI = 'mongodb+srv://Dilnaz:123456diplom@cluster0.7b3gkwf.mongodb.net/dilnaz?retryWrites=true&w=majority';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.PORT = '5000';
process.env.JWT_SECRET = 'mysupersecretkey12345abcdefghijklmnopqrstuvwxyz';
import dotenv from 'dotenv';
dotenv.config();
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import analysisRoutes from './routes/analysis.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analysis", analysisRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});