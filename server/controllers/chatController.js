import Groq from 'groq-sdk';
import Chat from '../models/Chat.js';

// Init groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// example prompts
const systemPrompts = {
  marketing: `You are a marketing expert AI assistant for small and medium businesses. Help with marketing strategies, social media content, ad copy, branding, SEO, email campaigns, and customer engagement. Give practical, actionable advice tailored to businesses with limited budgets.`,
  finance: `You are a financial advisor AI assistant for small and medium businesses. Help with budgeting, cash flow management, financial planning, tax strategies, pricing, and investment decisions. Provide clear, practical financial guidance without giving specific investment recommendations.`,
  'business-ideas': `You are a creative business strategist AI assistant. Help generate and refine business ideas, create business plans, identify market opportunities, analyze competition, and develop go-to-market strategies. Be encouraging but realistic about challenges.`,
};

// POST /api/chat send a message and get an AI response
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId, category } = req.body;
    const userId = req.user._id;

    let chat;
    if (chatId) {
      // continue an existing chat
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
    } else {
      // create a new chat, using the first 50 chars of the message as the title
      chat = await Chat.create({
        userId,
        category: category || 'marketing',
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
      });
    }

    // Aappend message to chat history
    chat.messages.push({ role: 'user', content: message });

    // select example prompts based on category default value is marketing
    const systemPrompt = systemPrompts[chat.category] || systemPrompts.marketing;

    // call the Groq API with the full conversation history
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chat.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 1024,
    });

    // append AI's reply and keep the updated chat
    const assistantMessage = completion.choices[0].message.content;
    chat.messages.push({ role: 'assistant', content: assistantMessage });

    await chat.save();

    res.json({
      chatId: chat._id,
      message: { role: 'assistant', content: assistantMessage },
      title: chat.title,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
};

// GET /api/chat list all chats for the authenticated user (sorted newest first)
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title category createdAt')
      .sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

// GET /api/chat/:id get a single chat with its full message history
export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
};

// POST /api/chat/guest send a message without authentication (no persistence)
export const guestMessage = async (req, res) => {
  try {
    const { message, history, category } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const systemPrompt = systemPrompts[category] || systemPrompts.marketing;

    // build conversation from client-provided history (capped at 20 messages)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-20).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
    });

    const assistantMessage = completion.choices[0].message.content;

    res.json({
      message: { role: 'assistant', content: assistantMessage },
    });
  } catch (error) {
    console.error('Guest chat error:', error);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
};

// DELETE /api/chat/:id delete a chat belonging to the authenticated user
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};
