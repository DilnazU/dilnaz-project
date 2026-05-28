import { useState, useRef } from 'react';
import axios from 'axios';
import { X, Building2, Users, AlertCircle, Target, Upload, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Calendar, ArrowLeft, Download, Shield, ExternalLink } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import translations from '../locales/translations';
import { pdf, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { fontFamily: 'Roboto', backgroundColor: '#0f172a', padding: 30 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#10b981', marginBottom: 4 },
  date: { fontSize: 9, color: '#6b7280' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#10b981', marginVertical: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  sectionText: { fontSize: 10, color: '#d1d5db', lineHeight: 1.6 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 2 },
  value: { fontSize: 11, color: '#f0f0f0', marginBottom: 6 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  metricCard: { width: '47%', padding: 10, borderRadius: 8, borderWidth: 1 },
  metricLabel: { fontSize: 9, marginBottom: 3 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  sectionBlock: { marginBottom: 10, padding: 10, backgroundColor: '#1e293b', borderRadius: 8, borderLeftWidth: 3 },
  chartImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 10 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#6b7280' },
});

function AnalysisPDF({ formData, results, t, language, chartImages }) {
  const metrics = results?.charts?.metrics;

  const metricCards = [
    { label: language === 'kk' ? 'Жалпы табыс' : language === 'en' ? 'Total Revenue' : 'Общий доход', value: `${metrics?.totalRevenue || '—'}`, color: '#10b981', bg: '#052e16', border: '#065f46' },
    { label: language === 'kk' ? 'Өсім' : language === 'en' ? 'Growth' : 'Рост', value: `${metrics?.growth || '—'}%`, color: '#3b82f6', bg: '#0c1a3d', border: '#1e3a8a' },
    { label: 'ROI', value: `${metrics?.roi || '—'}%`, color: '#a855f7', bg: '#1a0533', border: '#581c87' },
    { label: language === 'kk' ? 'Өсу мүмкіндігі' : language === 'en' ? 'Growth Probability' : 'Вероятность роста', value: `${Math.round(results?.charts?.growthProbability || 0)}%`, color: '#f97316', bg: '#1c0a00', border: '#7c2d12' },
  ];

  const sections = [
    { key: 'summary', label: t.summary, color: '#10b981', border: '#10b981' },
    { key: 'analytics', label: t.analytics, color: '#3b82f6', border: '#3b82f6' },
    { key: 'problems', label: t.problems, color: '#ef4444', border: '#ef4444' },
    { key: 'recommendations', label: t.recommendations, color: '#22c55e', border: '#22c55e' },
    { key: 'forecast', label: t.forecast, color: '#eab308', border: '#eab308' },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>{t.q1}</Text>
          <Text style={styles.value}>{formData.business}</Text>
          <Text style={styles.label}>{t.q2}</Text>
          <Text style={styles.value}>{formData.audience}</Text>
          <Text style={styles.label}>{t.q3}</Text>
          <Text style={styles.value}>{formData.problem}</Text>
          <Text style={styles.label}>{t.q4}</Text>
          <Text style={styles.value}>{formData.goal}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={[styles.sectionTitle, { color: '#ffffff', marginBottom: 8 }]}>
          {language === 'kk' ? 'Негізгі көрсеткіштер' : language === 'en' ? 'Key Metrics' : 'Ключевые метрики'}
        </Text>
        <View style={styles.metricsGrid}>
          {metricCards.map((card) => (
            <View key={card.label} style={[styles.metricCard, { backgroundColor: card.bg, borderColor: card.border }]}>
              <Text style={[styles.metricLabel, { color: card.color }]}>{card.label}</Text>
              <Text style={styles.metricValue}>{card.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.divider} />
        {chartImages.revenue && (
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.sectionTitle, { color: '#10b981', marginBottom: 6 }]}>
              {language === 'kk' ? 'Табыс динамикасы' : language === 'en' ? 'Revenue Dynamics' : 'Динамика доходов'}
            </Text>
            <Image src={chartImages.revenue} style={styles.chartImage} />
          </View>
        )}
        {chartImages.forecast && (
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.sectionTitle, { color: '#3b82f6', marginBottom: 6 }]}>
              {language === 'kk' ? '3 аптаға болжам' : language === 'en' ? '3-Week Forecast' : 'Прогноз на 3 недели'}
            </Text>
            <Image src={chartImages.forecast} style={styles.chartImage} />
          </View>
        )}
        <View style={styles.divider} />
        {sections.map((section) => (
          <View key={section.key} style={[styles.sectionBlock, { borderLeftColor: section.border }]}>
            <Text style={[styles.sectionTitle, { color: section.color }]}>{section.label}</Text>
            <Text style={styles.sectionText}>{results?.[section.key] || '—'}</Text>
          </View>
        ))}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>MSB Help — {t.title} | {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function BusinessAnalysis({ isOpen, onClose, language }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ business: '', audience: '', problem: '', goal: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [results, setResults] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const fileInputRef = useRef(null);
  const revenueChartRef = useRef(null);
  const forecastChartRef = useRef(null);

  const t = translations[language]?.analysis || translations.ru.analysis;

  const privacyText = {
    ru: {
      notice: '🔒 Ваши данные защищены',
      details: 'Файл обрабатывается только в памяти сервера и не сохраняется на диск. Личные данные (телефоны, email, ИИН) автоматически удаляются перед анализом. Данные передаются в Anthropic API только для анализа и не хранятся.',
      warning: '⚠️ Не загружайте персональные данные клиентов — только агрегированные цифры.',
      agree: 'Я согласен(на) с условиями обработки данных',
      policy: 'Политика Anthropic',
    },
    en: {
      notice: '🔒 Your data is protected',
      details: 'The file is processed only in server memory and is not saved to disk. Personal data (phones, emails, IIN) is automatically removed before analysis. Data is sent to Anthropic API only for analysis and is not stored.',
      warning: '⚠️ Do not upload personal client data — only aggregated figures.',
      agree: 'I agree to the data processing terms',
      policy: 'Anthropic Policy',
    },
    kk: {
      notice: '🔒 Деректеріңіз қорғалған',
      details: 'Файл тек сервер жадында өңделеді және дискіге сақталмайды. Жеке деректер (телефондар, email, ЖСН) талдаудан бұрын автоматты түрде жойылады. Деректер тек талдау үшін Anthropic API-ге жіберіледі және сақталмайды.',
      warning: '⚠️ Клиенттердің жеке деректерін жүктемеңіз — тек жинақталған сандарды ғана.',
      agree: 'Мен деректерді өңдеу шарттарымен келісемін',
      policy: 'Anthropic саясаты',
    },
  };

  const pt = privacyText[language] || privacyText.ru;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!formData.business || !formData.audience || !formData.problem || !formData.goal || !file) {
      alert(t.q1 + ' / ' + t.q2);
      return;
    }
    if (!agreed) {
      alert(pt.agree);
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('business', formData.business);
      formDataToSend.append('audience', formData.audience);
      formDataToSend.append('problem', formData.problem);
      formDataToSend.append('goal', formData.goal);
      formDataToSend.append('file', file);

      const { data } = await axios.post('http://localhost:5000/api/analysis', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setResults(data);
      setStep(2);
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getChartImage = (chartRef) => {
    try {
      const canvas = chartRef?.current?.canvas;
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    if (!results) return;
    setDownloading(true);
    try {
      const chartImages = {
        revenue: getChartImage(revenueChartRef),
        forecast: getChartImage(forecastChartRef),
      };
      const blob = await pdf(
        <AnalysisPDF formData={formData} results={results} t={t} language={language} chartImages={chartImages} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `msb-analysis-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Ошибка при создании PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  const fields = [
    { name: 'business', label: t.q1, placeholder: t.q1Placeholder, icon: <Building2 size={16} /> },
    { name: 'audience', label: t.q2, placeholder: t.q2Placeholder, icon: <Users size={16} /> },
    { name: 'problem', label: t.q3, placeholder: t.q3Placeholder, icon: <AlertCircle size={16} /> },
    { name: 'goal', label: t.q4, placeholder: t.q4Placeholder, icon: <Target size={16} /> },
  ];

  const metricCards = [
    { label: language === 'kk' ? 'Жалпы табыс' : language === 'en' ? 'Total Revenue' : 'Общий доход', value: `${results?.charts?.metrics?.totalRevenue || '—'}`, gradient: 'from-emerald-900/40 to-emerald-800/20', border: 'border-emerald-700/50', text: 'text-emerald-400' },
    { label: language === 'kk' ? 'Өсім' : language === 'en' ? 'Growth' : 'Рост', value: `${results?.charts?.metrics?.growth || '—'}%`, gradient: 'from-blue-900/40 to-blue-800/20', border: 'border-blue-700/50', text: 'text-blue-400' },
    { label: 'ROI', value: `${results?.charts?.metrics?.roi || '—'}%`, gradient: 'from-purple-900/40 to-purple-800/20', border: 'border-purple-700/50', text: 'text-purple-400' },
    { label: language === 'kk' ? 'Өсу мүмкіндігі' : language === 'en' ? 'Growth Probability' : 'Вероятность роста', value: `${Math.round(results?.charts?.growthProbability || 0)}%`, gradient: 'from-orange-900/40 to-orange-800/20', border: 'border-orange-700/50', text: 'text-orange-400' },
  ];

  const resultSections = [
    { key: 'summary', label: t.summary, icon: <BarChart3 size={16} />, color: 'text-emerald-400', border: 'border-l-emerald-500' },
    { key: 'analytics', label: t.analytics, icon: <TrendingUp size={16} />, color: 'text-blue-400', border: 'border-l-blue-500' },
    { key: 'problems', label: t.problems, icon: <AlertTriangle size={16} />, color: 'text-red-400', border: 'border-l-red-500' },
    { key: 'recommendations', label: t.recommendations, icon: <CheckCircle size={16} />, color: 'text-green-400', border: 'border-l-green-500' },
    { key: 'forecast', label: t.forecast, icon: <Calendar size={16} />, color: 'text-yellow-400', border: 'border-l-yellow-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ background: '#0d0a12', border: '1px solid rgba(16, 185, 129, 0.25)' }}>

        {/* Header */}
        <div className="px-6 py-5 flex justify-between items-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.1))', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.2))', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <BarChart3 size={20} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight"
                className="gradient-text">
                {t.title}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(16, 185, 129, 0.6)' }}>
                {step === 1
                  ? (language === 'kk' ? '4 өріс + файл' : language === 'en' ? '4 fields + file' : '4 поля + файл')
                  : (language === 'kk' ? 'Талдау нәтижелері' : language === 'en' ? 'Analysis Results' : 'Результаты анализа')}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: 'rgba(16, 185, 129, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {step === 1 ? (
            <div className="space-y-4">

              {/* Privacy Notice */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={15} style={{ color: '#10b981' }} />
                  <span className="text-sm font-semibold" style={{ color: '#10b981' }}>{pt.notice}</span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>
                  {pt.details}
                </p>
                <p className="text-xs font-medium mb-2" style={{ color: 'rgba(251, 191, 36, 0.8)' }}>
                  {pt.warning}
                </p>
                
                 <a href="https://www.anthropic.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs transition-all hover:opacity-80"
                  style={{ color: '#10b981' }}
                >
                  <ExternalLink size={11} />
                  {pt.policy}
                </a>
              </div>

              {fields.map((field, i) => (
                <div key={field.name}>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'rgba(226, 232, 240, 0.8)' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981' }}>
                      {i + 1}
                    </span>
                    <span style={{ color: '#10b981' }}>{field.icon}</span>
                    {field.label}
                  </label>
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
                    style={{
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#e2e8f0',
                      caretColor: '#10b981',
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid rgba(16, 185, 129, 0.5)'; e.target.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.1)'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid rgba(16, 185, 129, 0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'rgba(226, 232, 240, 0.8)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981' }}>5</span>
                  <Upload size={14} style={{ color: '#10b981' }} />
                  {t.q5}
                </label>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  style={file ? {
                    border: '2px dashed rgba(16, 185, 129, 0.6)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                  } : {
                    border: '2px dashed rgba(16, 185, 129, 0.25)',
                    background: 'rgba(16, 185, 129, 0.04)',
                    color: 'rgba(16, 185, 129, 0.6)',
                  }}
                >
                  {file
                    ? <><CheckCircle size={16} style={{ color: '#10b981' }} /> {file.name}</>
                    : <><Upload size={16} /> {t.q5}</>
                  }
                </button>
              </div>

              {/* Чекбокс согласия */}
              <div
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: agreed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.03)', border: `1px solid ${agreed ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.15)'}` }}
                onClick={() => setAgreed(!agreed)}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
                  style={{ background: agreed ? '#10b981' : 'transparent', border: `2px solid ${agreed ? '#10b981' : 'rgba(16, 185, 129, 0.4)'}` }}>
                  {agreed && <CheckCircle size={12} color="white" />}
                </div>
                <span className="text-xs leading-relaxed select-none" style={{ color: 'rgba(226, 232, 240, 0.7)' }}>
                  {pt.agree}
                </span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !agreed}
                className="w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-base tracking-wide hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, #059669, #7c3aed)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
                }}
              >
                {loading
                  ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.analyzing}</>
                  : <><BarChart3 size={18} /> {t.analyze}</>
                }
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {metricCards.map((card) => (
                  <div key={card.label} className={`bg-gradient-to-br ${card.gradient} p-4 rounded-xl border ${card.border}`}>
                    <div className={`text-xs font-medium ${card.text} mb-1`}>{card.label}</div>
                    <div className="text-2xl font-bold text-white">{card.value}</div>
                  </div>
                ))}
              </div>

              {results?.charts?.revenueChart && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#10b981' }}>
                    <TrendingUp size={16} />
                    {language === 'kk' ? 'Табыс динамикасы' : language === 'en' ? 'Revenue Dynamics' : 'Динамика доходов'}
                  </h3>
                  <Line ref={revenueChartRef} data={results.charts.revenueChart} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
              )}

              {results?.charts?.forecastChart && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#3b82f6' }}>
                    <Calendar size={16} />
                    {language === 'kk' ? '3 аптаға болжам' : language === 'en' ? '3-Week Forecast' : 'Прогноз на 3 недели'}
                  </h3>
                  <Line ref={forecastChartRef} data={results.charts.forecastChart} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
              )}

              {resultSections.map((section) => (
                <div key={section.key} className={`p-4 rounded-xl border-l-4 ${section.border}`}
                  style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                  <h3 className={`font-semibold mb-2 flex items-center gap-2 ${section.color}`}>
                    {section.icon}
                    {section.label}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(226, 232, 240, 0.7)' }}>{results?.[section.key]}</p>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => { setStep(1); setResults(null); setFormData({ business: '', audience: '', problem: '', goal: '' }); setFile(null); setAgreed(false); }}
                  className="py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                >
                  <ArrowLeft size={16} /> {t.back}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: 'linear-gradient(135deg, #059669, #7c3aed)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}
                >
                  {downloading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {language === 'kk' ? 'Жүктелуде...' : language === 'en' ? 'Downloading...' : 'Создаём PDF...'}</>
                    : <><Download size={16} /> {language === 'kk' ? 'PDF жүктеу' : language === 'en' ? 'Download PDF' : 'Скачать PDF'}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}