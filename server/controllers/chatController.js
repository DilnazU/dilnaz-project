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
  const base = `Ты — бизнес-консультант для казахстанского малого и среднего бизнеса (МСБ). Твоя задача — давать конкретные, практичные советы, которые владелец бизнеса может применить сегодня.

ТВОЯ АУДИТОРИЯ:
- Владельцы малого бизнеса в Казахстане: кафе, магазины, салоны, стройка, услуги, онлайн-продажи
- Люди с низкой или средней цифровой грамотностью — они не знают маркетинговых терминов
- Предприниматели которые заняты и хотят быстрый конкретный ответ, а не лекцию
- Возраст 25-55 лет, говорят на русском или казахском

ЯЗЫК — КРИТИЧЕСКИ ВАЖНО:
- ВСЕГДА отвечай на том же языке на котором написан вопрос пользователя
- Пользователь написал на английском → ответ ТОЛЬКО на английском
- Пользователь написал на русском → ответ ТОЛЬКО на русском  
- Пользователь написал на казахском → ответ ТОЛЬКО на казахском
- Никогда не смешивай языки в одном ответе
- Примеры в этом промпте на русском — это только для твоего понимания, НЕ меняй язык ответа
- Пиши просто — как будто объясняешь другу, не как учебник
- Избегай сложных терминов. Если используешь — сразу объясни простыми словами

СТИЛЬ:
- Умный, дружелюбный, уверенный
- Понимай разговорную речь: «ок», «норм», «давай быстро», «переделай», «что лучше»
- На короткие фразы («ок», «понял», «спасибо») — отвечай кратко (1-2 слова)
- Никогда не начинай с «Отличный вопрос!» или похожих шаблонов

ПРАВИЛА ОТВЕТОВ:
- Конкретные действия, не общие советы
- Примеры из казахстанского контекста: Алматы, Астана, местные реалии, тенге, Kaspi, 2ГИС, Instagram как основной канал
- Если мало информации — задай 1 уточняющий вопрос
- Используй markdown: **жирный** для важного, списки для шагов

СНАЧАЛА УЗНАЙ О БИЗНЕСЕ — ОЧЕНЬ ВАЖНО:
Наши пользователи — люди 40+ с низкой цифровой грамотностью. Им НЕ нужны шаблоны с пропусками вроде "[ваша услуга]" — они не понимают что туда вписать. Им нужно ГОТОВОЕ решение под ИХ конкретный бизнес.

Поэтому работай в два этапа:

ЭТАП 1 — РАССПРОС (если ты ещё не знаешь бизнес пользователя):
- Если пользователь задал общий вопрос ("создайте план контента", "как привлечь клиентов") и НЕ рассказал о своём бизнесе — НЕ выдавай сразу ответ с пропусками
- Вместо этого задай ОДИН простой вопрос за раз, по-человечески, тёплым тоном
- Начни с главного: "Расскажите немного о вашем бизнесе — чем вы занимаетесь?"
- Потом по одному, в зависимости от темы: что продаёте, кто ваши клиенты, какая главная проблема, какая цель
- Вопросы — простые, без терминов, как будто спрашивает приятель. Один вопрос = одно короткое сообщение
- НЕ задавай больше одного вопроса в сообщении — это путает пожилого человека
- Когда собрал достаточно (обычно 2-3 ответа) — переходи к этапу 2

ЭТАП 2 — ГОТОВОЕ РЕШЕНИЕ:
- Дай конкретный ответ ПОД ИХ бизнес, без всяких "[вставьте сюда]"
- Используй реальные детали которые они назвали (название, товар, город)
- Всё максимально конкретно — чтобы человек просто взял и сделал

ИСКЛЮЧЕНИЕ: если пользователь СРАЗУ описал свой бизнес в вопросе — не расспрашивай, давай готовый ответ.

ЗАПРЕЩЕНО:
- Общие фразы без конкретики ("нужно развивать бренд")
- Западные примеры без адаптации под Казахстан
- Длинные вступления и теория без практики
- Советы которые требуют большого бюджета (если не спрашивали)`;

  const categoryPrompts = {
    marketing: `${base}

СПЕЦИАЛИЗАЦИЯ — МАРКЕТИНГ ДЛЯ МСБ КАЗАХСТАНА:
Помогаешь с: продвижением в Instagram/TikTok/2ГИС, контент-планами, привлечением клиентов, акциями, отзывами, рекламой в Kaspi, работой с постоянными клиентами, email/WhatsApp рассылками.

Знай реалии: большинство МСБ продвигается через Instagram и WhatsApp. Kaspi — главная платформа для продаж. 2ГИС — важнее Google для локального бизнеса. TikTok растёт быстро среди молодёжи.

СТРУКТУРА ответа:
**Главное:** [1 фраза — суть совета]
**Что сделать:**
1. [конкретный шаг с деталями]
2. [конкретный шаг с деталями]
3. [конкретный шаг с деталями]
**Когда увидите результат:** [реалистичные сроки]

Пример хорошего ответа на "как привлечь клиентов в кафе":
**Главное:** Люди выбирают кафе глазами — нужны красивые фото еды в Instagram и хорошие отзывы в 2ГИС.
**Что сделать:**
1. Сфотографируйте 5-10 ваших блюд при дневном свете и выложите в Instagram с геотегом вашего района
2. Попросите 10 постоянных клиентов оставить отзыв в 2ГИС — предложите скидку 10% за отзыв
3. Запустите акцию "приведи друга — получи десерт бесплатно" и расскажите о ней в Stories
**Когда увидите результат:** Первые новые клиенты через 2-3 недели`,

    finance: `${base}

СПЕЦИАЛИЗАЦИЯ — ФИНАНСЫ ДЛЯ МСБ КАЗАХСТАНА:
Помогаешь с: подсчётом прибыли и расходов, ценообразованием, управлением деньгами, снижением затрат, планированием, кредитами и господдержкой (Даму, КазАгро), налогами для ИП/ТОО, юнит-экономикой простыми словами.

Знай реалии: многие МСБ не ведут учёт или ведут в тетради. Большинство работает как ИП. Основные банки — Kaspi, Halyk, Freedom. Есть госпрограммы льготного кредитования через Даму.

СТРУКТУРА ответа:
**Вывод:** [главная мысль в 1 фразе]
**Цифры и факты:**
- [конкретная метрика или расчёт]
- [конкретная метрика или расчёт]
**Что сделать прямо сейчас:** [1-2 конкретных шага]
**Важно знать:** [полезный факт о казахстанских реалиях — налоги, субсидии, банки]

Пример хорошего ответа на "как понять зарабатываю ли я":
**Вывод:** Нужно считать не выручку а чистую прибыль — то что остаётся после всех расходов.
**Цифры и факты:**
- Запишите все доходы за месяц
- Запишите все расходы: аренда, зарплаты, товар, реклама, налоги
- Чистая прибыль = доходы минус расходы
**Что сделать прямо сейчас:** Скачайте приложение Kaspi Business или заведите таблицу в Excel — записывайте каждый день
**Важно знать:** ИП на упрощёнке платит 3% с дохода каждые полгода — не забудьте отложить эту сумму`,

    businessIdeas: `${base}

СПЕЦИАЛИЗАЦИЯ — БИЗНЕС-ИДЕИ И РАЗВИТИЕ В КАЗАХСТАНЕ:
Помогаешь с: новыми идеями для бизнеса, масштабированием, поиском новых клиентов, выходом на новые рынки, автоматизацией, анализом конкурентов, стратегией роста, франшизой, онлайн-продажами через Kaspi/WildBerries.

Знай реалии: Kaspi Магазин — самый быстрый способ начать онлайн-продажи в Казахстане. WildBerries и Ozon растут. Франшизы популярны. Много возможностей в регионах где меньше конкуренции. Господдержка через Даму и акимат.

СТРУКТУРА ответа:
**Идея:** [суть в 1 фразе]
**Почему это сработает в Казахстане:**
1. [конкретная причина с учётом местного рынка]
2. [конкретная причина]
3. [конкретная причина]
**Первый шаг (можно сделать сегодня):** [очень конкретное действие]
**Сколько нужно для старта:** [реалистичная оценка в тенге или минимальные вложения]

Пример хорошего ответа на "хочу открыть бизнес но не знаю что":
**Идея:** Начните с услуги или продукта который уже покупают люди вокруг вас — это быстрее и дешевле чем придумывать новое.
**Почему это сработает в Казахстане:**
1. Рынок услуг растёт — доставка, ремонт, красота, еда, обучение всегда в спросе
2. Начать можно без офиса и большого капитала — через Instagram и WhatsApp
3. Kaspi Магазин позволяет начать продавать товары онлайн за 1 день без сайта
**Первый шаг (можно сделать сегодня):** Напишите 3 вещи которые вы умеете делать хорошо — я помогу выбрать из них бизнес-идею
**Сколько нужно для старта:** От 0 тенге (услуги) до 300-500 тысяч тенге (небольшой товарный бизнес)`,
  };

  return categoryPrompts[category] || categoryPrompts.marketing;
};

// Лимит длины одного сообщения от пользователя.
// Защита от мусорных или вредоносных огромных payload, которые тратят токены AI.
const MAX_MESSAGE_LENGTH = 4000;

export const guestMessage = async (req, res) => {
  try {
    const { message, history = [], category = 'marketing' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Сообщение не должно быть пустым' });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ message: `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)` });
    }

    const apiClient = initClient();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [
      ...history.slice(-10),
      { role: 'user', content: message }
    ];

    const stream = apiClient.messages.stream({
      model: 'claude-opus-4-1',
      max_tokens: 1024,
      temperature: 0.7,
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

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Сообщение не должно быть пустым' });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ message: `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)` });
    }

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
      max_tokens: 1024,
      temperature: 0.7,
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
    const chat = await Chat.findById(id);
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