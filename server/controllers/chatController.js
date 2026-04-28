import Chat from '../models/Chat.js';
import Anthropic from '@anthropic-ai/sdk';

let client;

const initClient = () => {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
};

const getSystemPrompt = (category) => {
  const base = `Ты умный бизнес-консультант для малого и среднего бизнеса (МСБ). Работаешь как сильный помощник, который реально понимает бизнес.

ЯЗЫК: Отвечай на том языке, на котором пишет пользователь. Если пишет на русском — отвечай на русском. На казахском — на казахском. На английском — на английском. Никогда не меняй язык без причины.

СТИЛЬ ОБЩЕНИЯ:
- Умный, современный, уверенный, без лишней официальности
- Понимай разговорную речь и сленг: «ок», «норм», «давай быстро», «переделай», «что лучше», «как думаешь»
- На «ок», «понял», «спасибо» — отвечай кратко и дружелюбно (1-2 слова максимум)
- На «сделай быстро», «только главное», «для диплома», «для защиты» — отвечай сжато и сильно
- Не используй шаблонные фразы и заготовки

ПРАВИЛА ОТВЕТОВ:
- Кратко и по делу, без воды и длинных вступлений
- Только конкретные действия, не просто советы
- Если информации мало — задай 1-2 точных вопроса
- Используй markdown: **жирный** для важного, списки для действий

ЗАПРЕЩЕНО:
- Длинные вступления типа "Отличный вопрос!"
- Общие фразы без конкретики
- Теория без практики`;

  const categoryPrompts = {
    marketing: `${base}

СПЕЦИАЛИЗАЦИЯ — МАРКЕТИНГ:
Помогаешь с: контент-планами, email-кампаниями, SEO, целевой аудиторией, воронкой продаж, конверсией, рекламой, брендингом, соцсетями, удержанием клиентов.

СТРУКТУРА ответа на бизнес-вопрос:
**Главный совет:** [1 фраза — суть]
**Действия:**
1. [конкретное действие]
2. [конкретное действие]  
3. [конкретное действие]
**Результат:** [что изменится и когда]`,

    finance: `${base}

СПЕЦИАЛИЗАЦИЯ — ФИНАНСЫ:
Помогаешь с: бюджетированием, денежными потоками, P&L, инвестициями, снижением расходов, юнит-экономикой, ценообразованием, финансовым планированием.

СТРУКТУРА ответа на финансовый вопрос:
**Вывод:** [ключевой вывод в 1 фразе]
**Цифры:**
- [метрика 1]
- [метрика 2]
- [метрика 3]
**Что делать:** [конкретный следующий шаг]`,

    businessIdeas: `${base}

СПЕЦИАЛИЗАЦИЯ — БИЗНЕС-ИДЕИ И СТРАТЕГИЯ:
Помогаешь с: новыми идеями, бизнес-моделями, масштабированием, автоматизацией, новыми каналами продаж, гипотезами роста, анализом конкурентов, стратегией развития.

СТРУКТУРА ответа на стратегический вопрос:
**Идея:** [суть в 1 фразе]
**Почему сработает:**
1. [причина]
2. [причина]
3. [причина]
**Первый шаг:** [что сделать прямо сейчас]`,
  };

  return categoryPrompts[category] || categoryPrompts.marketing;
};

export const guestMessage = async (req, res) => {
  try {
    const { message, history = [], category = 'marketing' } = req.body;
    const apiClient = initClient();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [
      ...history.slice(-6),
      { role: 'user', content: message }
    ];

    const stream = apiClient.messages.stream({
      model: 'claude-opus-4-1',
      max_tokens: 800,
      system: getSystemPrompt(category),
      messages,
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('finalMessage', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error('Guest message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { message, chatId, category } = req.body;
    const userId = req.user._id;
    const apiClient = initClient();

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat || chat.userId.toString() !== userId.toString()) {
        return res.status(404).json({ message: 'Chat not found' });
      }
    } else {
      chat = new Chat({
        userId,
        category: category || 'marketing',
        title: message.substring(0, 40) + '...',
        messages: [],
      });
    }

    chat.messages.push({ role: 'user', content: message });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    const stream = apiClient.messages.stream({
      model: 'claude-opus-4-1',
      max_tokens: 800,
      system: getSystemPrompt(chat.category || category),
      messages: chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    stream.on('text', (text) => {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('finalMessage', async () => {
      chat.messages.push({ role: 'assistant', content: fullResponse });
      await chat.save();
      res.write(`data: ${JSON.stringify({ done: true, chatId: chat._id.toString() })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

export const getChat = async (req, res) => {
  try {
    const id = req.params.id || req.params.chatId;
    const chat = await Chat.findById(id);
    if (!chat || chat.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const id = req.params.id || req.params.chatId;
    console.log('DELETE id:', id);
    console.log('User id:', req.user._id);
    const chat = await Chat.findById(id);
    console.log('Found chat:', chat);
    if (!chat || chat.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    await Chat.findByIdAndDelete(id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};