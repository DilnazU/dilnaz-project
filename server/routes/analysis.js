import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import Groq from 'groq-sdk';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { business, audience, problem, goal } = req.body;

    // Парсим Excel файл
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Формируем текст для AI
    const analysisPrompt = `
    Ты эксперт по бизнес-аналитике. Проанализируй данные:

    **Бизнес:** ${business}
    **Аудитория:** ${audience}
    **Проблема:** ${problem}
    **Цель:** ${goal}

    **Данные:**
    ${JSON.stringify(data, null, 2)}

    Дай ответ в формате JSON с полями:
    {
      "summary": "краткий вывод (сильные и слабые стороны)",
      "analytics": "анализ цифр (продажи, клиенты, конверсия, динамика)",
      "problems": "где теряются деньги",
      "recommendations": "что делать (быстрые и стратегические шаги)",
      "forecast": "прогноз результатов"
    }
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: analysisPrompt }],
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content;
    
    // Извлекаем JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const results = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    res.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Ошибка анализа' });
  }
});

export default router;