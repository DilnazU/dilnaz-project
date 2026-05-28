import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

// Файлы ТОЛЬКО в памяти — никогда на диск
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // максимум 10MB
  fileFilter: (req, file, cb) => {
    // Только Excel и CSV файлы
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (allowed.includes(file.mimetype) ||
        file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы Excel (.xlsx, .xls) и CSV'));
    }
  }
});

let client;
const initClient = () => {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
};

// Анонимизация — убираем личные данные перед отправкой в AI.
// Подход:
//   1. По имени колонки определяем чувствительные поля и маскируем целиком —
//      это надёжнее, чем гадать по виду значения.
//   2. Внутри текстовых значений ищем email, телефоны и ИИН по строгим шаблонам,
//      чтобы случайно не маскировать артикулы, суммы и штрих-коды.

// Регулярки. Email — стандартный. Телефон — с обязательным '+' или '8'/'7'
// в начале, чтобы не сматчить произвольное число. ИИН — 12 цифр в отдельном
// слове (граница \b с обеих сторон).
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_REGEX = /(?<![\d])(?:\+?7|8)[\s()-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}(?![\d])/g;
const IIN_REGEX  = /(?<!\d)\d{12}(?!\d)/g;

// Имена колонок, которые маскируем целиком (без оглядки на содержимое).
// Если в Excel колонка называется "Телефон" — значение точно ПДн, что бы там ни было.
const SENSITIVE_KEYS_RU = ['телефон', 'тел', 'мобильный', 'мобильник', 'phone', 'mobile', 'email', 'эл.почта', 'почта', 'e-mail', 'мейл', 'иин', 'iin', 'паспорт', 'passport', 'удостоверение', 'снилс', 'инн', 'фио', 'имя', 'name', 'фамилия', 'surname', 'отчество', 'адрес', 'address'];

function getKeyMask(key) {
  const k = String(key || '').trim().toLowerCase();
  // "Безопасные" колонки — гарантированно НЕ ПДн, по тексту не чистим:
  if (k.includes('штрих') || k.includes('barcode') || k.includes('артикул') || k === 'sku' || k.includes('код товара') || k.includes('product code')) return 'SKIP';
  if (k.includes('телефон') || k.includes('phone') || k.includes('mobile') || k === 'тел') return '[ТЕЛЕФОН]';
  if (k.includes('email') || k.includes('e-mail') || k.includes('почта') || k.includes('мейл')) return '[EMAIL]';
  if (k.includes('иин') || k === 'iin') return '[ИИН]';
  if (k.includes('паспорт') || k.includes('passport') || k.includes('удостоверение')) return '[ДОКУМЕНТ]';
  if (k.includes('адрес') || k.includes('address')) return '[АДРЕС]';
  if (k === 'фио' || k.includes('имя') || k === 'name' || k.includes('фамилия') || k === 'surname' || k.includes('отчество')) return '[ФИО]';
  return null;
}

function anonymizeString(str) {
  return str
    .replace(EMAIL_REGEX, '[EMAIL]')
    .replace(PHONE_REGEX, '[ТЕЛЕФОН]')
    .replace(IIN_REGEX, '[ИИН]');
}

function anonymizeData(sheets) {
  const anonymized = {};
  for (const [sheetName, data] of Object.entries(sheets)) {
    anonymized[sheetName] = data.map(row => {
      const cleanRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined || value === '') {
          cleanRow[key] = value;
          continue;
        }
        // Шаг 1: если колонка известно-чувствительная — маскируем целиком.
        // SKIP — это "безопасная" колонка (артикул, штрихкод), её не трогаем.
        const mask = getKeyMask(key);
        if (mask === 'SKIP') {
          cleanRow[key] = value;
          continue;
        }
        if (mask) {
          cleanRow[key] = mask;
          continue;
        }
        // Шаг 2: чистим текст по шаблонам, числа оставляем как есть
        if (typeof value === 'number') {
          cleanRow[key] = value;
          continue;
        }
        cleanRow[key] = anonymizeString(String(value));
      }
      return cleanRow;
    });
  }
  return anonymized;
}

function extractAllData(workbook) {
  const sheets = {};
  for (const sheetName of workbook.SheetNames) {
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    if (data.length > 0) sheets[sheetName] = data;
  }
  return sheets;
}

function findNumericColumns(data) {
  if (!data || data.length === 0) return [];
  const cols = Object.keys(data[0]);
  return cols.filter(col => {
    const vals = data.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    return vals.length > data.length * 0.5;
  });
}

function generateChartData(sheets) {
  let revenueData = null;

  for (const [sheetName, data] of Object.entries(sheets)) {
    const cols = Object.keys(data[0] || {});
    const dateCol = cols.find(c =>
      /дата|date|день|day|month|месяц|период|period|week|неделя/i.test(String(c))
    );
    const numCols = findNumericColumns(data);

    if (dateCol && numCols.length > 0) {
      const bestCol = numCols.reduce((best, col) => {
        const sum = data.reduce((s, r) => s + (parseFloat(r[col]) || 0), 0);
        const bestSum = data.reduce((s, r) => s + (parseFloat(r[best]) || 0), 0);
        return sum > bestSum ? col : best;
      });

      revenueData = data.map(row => ({
        date: String(row[dateCol]).substring(0, 10),
        value: parseFloat(row[bestCol]) || 0
      })).filter(r => r.value > 0);

      break;
    }
  }

  if (!revenueData || revenueData.length === 0) {
    return {
      revenueChart: null,
      forecastChart: null,
      metrics: { totalRevenue: 0, avgPerDay: 0, growth: 0, roi: 0 },
      growthProbability: 50
    };
  }

  const totalRevenue = revenueData.reduce((s, r) => s + r.value, 0);
  const avgRevenue = totalRevenue / revenueData.length;
  const growth = revenueData[0].value > 0
    ? ((revenueData[revenueData.length - 1].value - revenueData[0].value) / revenueData[0].value * 100)
    : 0;

  return {
    revenueChart: {
      labels: revenueData.map(r => r.date),
      datasets: [{
        label: 'Доход',
        data: revenueData.map(r => r.value),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }]
    },
    forecastChart: {
      labels: ['Текущая неделя', '+1 неделя', '+2 недели', '+3 недели'],
      datasets: [{
        label: 'Прогноз',
        data: [
          totalRevenue / 4,
          (totalRevenue / 4) * (1 + growth / 100),
          (totalRevenue / 4) * (1 + growth / 200),
          (totalRevenue / 4) * (1 + growth / 300)
        ],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }]
    },
    metrics: {
      totalRevenue: totalRevenue.toFixed(0),
      avgPerDay: avgRevenue.toFixed(0),
      growth: growth.toFixed(1),
      roi: (growth * 2.5).toFixed(1)
    },
    growthProbability: Math.min(100, Math.max(20, 50 + growth / 2))
  };
}

function buildDataSummary(sheets) {
  const lines = [];
  for (const [sheetName, data] of Object.entries(sheets)) {
    lines.push(`\n=== Лист: "${sheetName}" (${data.length} строк) ===`);
    const cols = Object.keys(data[0] || {});
    lines.push(`Колонки: ${cols.join(', ')}`);

    const numCols = findNumericColumns(data);
    for (const col of numCols) {
      const vals = data.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
      const sum = vals.reduce((s, v) => s + v, 0);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const avg = sum / vals.length;
      lines.push(`  ${col}: сумма=${sum.toFixed(0)}, среднее=${avg.toFixed(0)}, мин=${min.toFixed(0)}, макс=${max.toFixed(0)}`);
    }

    const preview = data.slice(0, 3).map(row =>
      Object.entries(row)
        .filter(([, v]) => v !== null && v !== '')
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
    ).join('\n');
    lines.push(`Примеры данных:\n${preview}`);
  }
  return lines.join('\n');
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { business, audience, problem, goal } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const apiClient = initClient();
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

    // Явно очищаем буфер после чтения
    req.file.buffer = null;

    const rawSheets = extractAllData(workbook);

    // Анонимизируем данные перед отправкой в API
    const sheets = anonymizeData(rawSheets);

    const chartData = generateChartData(sheets);
    const dataSummary = buildDataSummary(sheets);

    const analysisPrompt = `Ты опытный бизнес-аналитик. Проанализируй реальные данные из файла.

ИНФОРМАЦИЯ О БИЗНЕСЕ:
- Бизнес: ${business}
- Аудитория: ${audience}
- Проблема: ${problem}
- Цель: ${goal}

РЕАЛЬНЫЕ ДАННЫЕ ИЗ EXCEL:
${dataSummary}

ВАЖНО: Используй конкретные числа из данных выше. Не давай общие советы — анализируй именно эти цифры.

Верни ТОЛЬКО JSON без форматирования markdown:
{
  "summary": "Главный вывод на основе реальных данных (2-3 предложения с конкретными числами)",
  "analytics": "Топ-3 метрики с реальными числами из файла",
  "problems": "2 главные проблемы выявленные из данных",
  "recommendations": "3 конкретных действия основанных на данных",
  "forecast": "Прогноз прибыли на 3 месяца с обоснованием из данных"
}`;

    const completion = await apiClient.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 2000,
      messages: [{ role: 'user', content: analysisPrompt }],
    });

    const responseText = completion.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const results = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      summary: responseText,
      analytics: '',
      problems: '',
      recommendations: '',
      forecast: ''
    };

    results.charts = chartData;
    res.json(results);

  } catch (error) {
    // Не логируем детали данных — безопасность
    console.error('Analysis error:', error.message);
    res.status(500).json({ error: 'Ошибка анализа. Попробуйте ещё раз.' });
  }
});

export default router;