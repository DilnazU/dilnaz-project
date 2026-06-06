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

// Анонимизация — убираем личные данные перед отправкой в API
function anonymizeData(sheets) {
  const phoneRegex = /(\+?[0-9]{10,13})/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const iinRegex = /\b\d{12}\b/g; // ИИН Казахстан

  const anonymized = {};
  for (const [sheetName, data] of Object.entries(sheets)) {
    anonymized[sheetName] = data.map(row => {
      const cleanRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined) {
          cleanRow[key] = value;
          continue;
        }
        // Даты не трогаем — они нужны для анализа периода
        if (value instanceof Date) {
          cleanRow[key] = value;
          continue;
        }
        let str = String(value);
        str = str.replace(phoneRegex, '[ТЕЛЕФОН]');
        str = str.replace(emailRegex, '[EMAIL]');
        str = str.replace(iinRegex, '[ИИН]');
        cleanRow[key] = isNaN(value) ? str : value;
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

// --- Разбор дат: поддержка Date, Excel-серийных чисел и строк (в т.ч. дд.мм.гггг) ---
function parseDateValue(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number') {
    // Excel-серийная дата (эпоха 1899-12-30)
    if (v > 59 && v < 80000) {
      const d = new Date(Math.round((v - 25569) * 86400 * 1000));
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }
  const s = String(v).trim();
  const native = new Date(s);
  if (!isNaN(native.getTime())) return native;
  // дд.мм.гггг / дд/мм/гггг / дд-мм-гггг
  const m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})$/);
  if (m) {
    let [, dd, mm, yy] = m;
    yy = yy.length === 2 ? '20' + yy : yy;
    const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Определяем шаг данных (день / неделя / месяц / квартал / год) по медиане промежутков
function detectCadence(dates) {
  if (dates.length < 2) return { unit: 'период', days: 1 };
  const gaps = [];
  for (let i = 1; i < dates.length; i++) {
    gaps.push((dates[i].getTime() - dates[i - 1].getTime()) / 86400000);
  }
  const g = median(gaps);
  if (g <= 2) return { unit: 'день', days: 1 };
  if (g <= 10) return { unit: 'неделя', days: 7 };
  if (g <= 45) return { unit: 'месяц', days: 30 };
  if (g <= 100) return { unit: 'квартал', days: 90 };
  return { unit: 'год', days: 365 };
}

// Линейный тренд (метод наименьших квадратов) + R² + прогноз на N шагов вперёд
function linearTrend(values, steps) {
  const n = values.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += i; sy += values[i]; sxx += i * i; sxy += i * values[i];
  }
  const denom = (n * sxx - sx * sx) || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;

  const meanY = sy / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const pred = slope * i + intercept;
    ssTot += (values[i] - meanY) ** 2;
    ssRes += (values[i] - pred) ** 2;
  }
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  const forecast = [];
  for (let k = 1; k <= steps; k++) {
    forecast.push(Math.max(0, slope * (n - 1 + k) + intercept));
  }
  return {
    slope,
    intercept,
    r2,
    forecast,
    trendStart: intercept,
    trendEnd: slope * (n - 1) + intercept,
  };
}

const fmtDate = d =>
  `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

function generateChartData(sheets, investment) {
  let revenueData = null;

  for (const [, data] of Object.entries(sheets)) {
    const cols = Object.keys(data[0] || {});
    const dateCol = cols.find(c =>
      /дата|date|день|day|month|месяц|период|period|week|неделя/i.test(String(c))
    );
    const numCols = findNumericColumns(data);

    if (dateCol && numCols.length > 0) {
      // Сначала ищем колонку дохода по названию, иначе берём с максимальной суммой
      const revLike = numCols.find(c =>
        /доход|выручка|revenue|sales|продаж|оборот|сумма|amount|total/i.test(String(c))
      );
      const bestCol = revLike || numCols.reduce((best, col) => {
        const sum = data.reduce((s, r) => s + (parseFloat(r[col]) || 0), 0);
        const bestSum = data.reduce((s, r) => s + (parseFloat(r[best]) || 0), 0);
        return sum > bestSum ? col : best;
      });

      revenueData = data
        .map(row => ({ date: parseDateValue(row[dateCol]), value: parseFloat(row[bestCol]) || 0 }))
        .filter(r => r.date && r.value > 0)
        .sort((a, b) => a.date - b.date);

      if (revenueData.length > 0) break;
    }
  }

  if (!revenueData || revenueData.length === 0) {
    return {
      revenueChart: null,
      forecastChart: null,
      metrics: { totalRevenue: 0, avgPerPeriod: 0, growth: 0, roi: null },
      growthProbability: 0,
      period: null,
    };
  }

  const dates = revenueData.map(r => r.date);
  const values = revenueData.map(r => r.value);
  const n = values.length;
  const totalRevenue = values.reduce((s, v) => s + v, 0);
  const cadence = detectCadence(dates);

  const { r2, forecast, trendStart, trendEnd } = linearTrend(values, 3);

  // Рост — по тренду от начала к концу периода (устойчивее, чем "первая vs последняя точка")
  const growth = trendStart > 0 ? ((trendEnd - trendStart) / trendStart) * 100 : 0;

  // Честный ROI: считаем только если пользователь указал вложения/расходы за период
  const inv = parseFloat(investment);
  let roi = null;
  if (!isNaN(inv) && inv > 0) {
    roi = ((totalRevenue - inv) / inv) * 100;
  }

  // Надёжность прогноза = насколько данные ложатся на тренд (R²),
  // с поправкой на малое число точек (2-3 точки не дают настоящей уверенности)
  const reliability = Math.round(r2 * 100 * Math.min(1, n / 4));

  const periodLabel = `${fmtDate(dates[0])} — ${fmtDate(dates[n - 1])}`;
  const forecastLabels = ['Сейчас', `+1 ${cadence.unit}`, `+2 ${cadence.unit}`, `+3 ${cadence.unit}`];

  return {
    revenueChart: {
      labels: revenueData.map(r => fmtDate(r.date)),
      datasets: [{
        label: 'Доход',
        data: values,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }],
    },
    forecastChart: {
      labels: forecastLabels,
      datasets: [{
        label: 'Прогноз',
        data: [Math.max(0, trendEnd), ...forecast],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }],
    },
    metrics: {
      totalRevenue: totalRevenue.toFixed(0),
      avgPerPeriod: (totalRevenue / n).toFixed(0),
      growth: growth.toFixed(1),
      roi: roi === null ? null : roi.toFixed(1),
    },
    growthProbability: reliability,
    period: { label: periodLabel, cadence: cadence.unit, points: n },
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
        .map(([k, v]) => `${k}: ${v instanceof Date ? fmtDate(v) : v}`)
        .join(' | ')
    ).join('\n');
    lines.push(`Примеры данных:\n${preview}`);
  }
  return lines.join('\n');
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { business, audience, problem, goal, investment } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const apiClient = initClient();
    // cellDates: true — чтобы даты приходили как Date, а не как Excel-числа
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });

    // Явно очищаем буфер после чтения
    req.file.buffer = null;

    const rawSheets = extractAllData(workbook);

    // Анонимизируем данные перед отправкой в API
    const sheets = anonymizeData(rawSheets);

    const chartData = generateChartData(sheets, investment);
    const dataSummary = buildDataSummary(sheets);

    const m = chartData.metrics || {};
    const p = chartData.period;

    const periodLine = p
      ? `ПЕРИОД ДАННЫХ: ${p.label} (${p.points} точек, шаг примерно «${p.cadence}»). Анализируй ИМЕННО этот диапазон. НЕ называй другой период и НЕ пиши «за год», если диапазон не охватывает год.`
      : `ПЕРИОД ДАННЫХ: определить не удалось (в файле нет распознанной колонки с датами). НЕ придумывай период — говори об общих цифрах без привязки к году или месяцу.`;

    const roiLine = (m.roi === null || m.roi === undefined)
      ? `ROI: не рассчитан, потому что пользователь не указал вложения. НЕ выдумывай ROI и не называй конкретный процент окупаемости.`
      : `ROI (рентабельность вложений за период): ${m.roi}%`;

    const forecastUnit = p ? p.cadence : 'период';

    const analysisPrompt = `Ты опытный бизнес-аналитик. Проанализируй реальные данные из файла.

ИНФОРМАЦИЯ О БИЗНЕСЕ:
- Бизнес: ${business}
- Аудитория: ${audience}
- Проблема: ${problem}
- Цель: ${goal}

${periodLine}

УЖЕ ПОСЧИТАННЫЕ ЦИФРЫ (используй их, НЕ противоречь им):
- Общий доход за период: ${m.totalRevenue}
- Изменение по тренду: ${m.growth}%
- ${roiLine}

РЕАЛЬНЫЕ ДАННЫЕ ИЗ EXCEL:
${dataSummary}

ВАЖНО: Используй конкретные числа из данных выше. Не давай общих советов — анализируй именно эти цифры. Все выводы привязывай к указанному периоду данных.

Верни ТОЛЬКО JSON без форматирования markdown:
{
  "summary": "Главный вывод на основе реальных данных за указанный период (2-3 предложения с конкретными числами)",
  "analytics": "Топ-3 метрики с реальными числами из файла",
  "problems": "2 главные проблемы выявленные из данных",
  "recommendations": "3 конкретных действия основанных на данных",
  "forecast": "Прогноз на ближайшие 3 ${forecastUnit} с обоснованием из данных (если ROI не рассчитан — не упоминай конкретный ROI)"
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