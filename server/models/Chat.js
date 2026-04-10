import mongoose from 'mongoose';

// sub-schema for individual messages within a chat
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// each chat belongs to a user and holds an array of messages
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  category: { type: String, enum: ['marketing', 'finance', 'business-ideas'], default: 'marketing' },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);
