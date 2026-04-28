import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Users, AlertCircle, Target, Upload, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Calendar, ArrowLeft, Download, Shield, ExternalLink, Globe } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { pdf, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { getLanguage, subscribe } from '../context/LanguageStore';
import { useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

const pdfStyles = StyleSheet.create({
  page: { fontFamily: 'Roboto', backgroundColor: '#0f172a', padding: 30 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00ff87', marginBottom: 4 },
  date: { fontSize: 9, color: '#6b7280' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#00ff87', marginVertical: 10 },
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

const t = {
  ru: {
    title: 'Анализ бизнеса', back: 'Назад', analyze: 'Анализировать', analyzing: 'Анализируем...',
    q1: 'Опишите ваш бизнес', q1Placeholder: 'Чем занимается ваша компания?',
    q2: 'Целевая аудитория', q2Placeholder: 'Кто ваши клиенты?',
    q3: 'Основная проблема', q3Placeholder: 'С какой проблемой вы столкнулись?',
    q4: 'Цель на 3-6 месяцев', q4Placeholder: 'Чего вы хотите достичь?',
    q5: 'Загрузите файл (Excel/CSV)',
    summary: 'Резюме', analytics: 'Аналитика', problems: 'Проблемы',
    recommendations: 'Рекомендации', forecast: 'Прогноз',
    downloadPDF: 'Скачать PDF', downloading: 'Создаём PDF...',
    results: 'Результаты анализа', newAnalysis: 'Новый анализ',
    privacy: {
      notice: '🔒 Ваши данные защищены',
      details: 'Файл обрабатывается только в памяти сервера и не сохраняется на диск. Личные данные (телефоны, email, ИИН) автоматически удаляются перед анализом.',
      warning: '⚠️ Не загружайте персональные данные клиентов — только агрегированные цифры.',
      agree: 'Я согласен(на) с условиями обработки данных',
      policy: 'Политика Anthropic',
    },
    metrics: { revenue: 'Общий доход', growth: 'Рост', prob: 'Вероятность роста' },
    charts: { revenue: 'Динамика доходов', forecast: 'Прогноз на 3 недели' },
  },
  en: {
    title: 'Business Analysis', back: 'Back', analyze: 'Analyze', analyzing: 'Analyzing...',
    q1: 'Describe your business', q1Placeholder: 'What does your company do?',
    q2: 'Target audience', q2Placeholder: 'Who are your customers?',
    q3: 'Main problem', q3Placeholder: 'What challenge are you facing?',
    q4: 'Goal for 3-6 months', q4Placeholder: 'What do you want to achieve?',
    q5: 'Upload file (Excel/CSV)',
    summary: 'Summary', analytics: 'Analytics', problems: 'Problems',
    recommendations: 'Recommendations', forecast: 'Forecast',
    downloadPDF: 'Download PDF', downloading: 'Creating PDF...',
    results: 'Analysis Results', newAnalysis: 'New Analysis',
    privacy: {
      notice: '🔒 Your data is protected',
      details: 'The file is processed only in server memory and is not saved to disk. Personal data (phones, emails, IIN) is automatically removed before analysis.',
      warning: '⚠️ Do not upload personal client data — only aggregated figures.',
      agree: 'I agree to the data processing terms',
      policy: 'Anthropic Policy',
    },
    metrics: { revenue: 'Total Revenue', growth: 'Growth', prob: 'Growth Probability' },
    charts: { revenue: 'Revenue Dynamics', forecast: '3-Week Forecast' },
  },
  kk: {
    title: 'Бизнес талдауы', back: 'Артқа', analyze: 'Талдау', analyzing: 'Талдануда...',
    q1: 'Бизнесіңізді сипаттаңыз', q1Placeholder: 'Компанияңыз не істейді?',
    q2: 'Мақсатты аудитория', q2Placeholder: 'Сіздің клиенттеріңіз кім?',
    q3: 'Негізгі мәселе', q3Placeholder: 'Қандай мәселеге тап болдыңыз?',
    q4: '3-6 айға мақсат', q4Placeholder: 'Не қол жеткізгіңіз келеді?',
    q5: 'Файл жүктеңіз (Excel/CSV)',
    summary: 'Қорытынды', analytics: 'Аналитика', problems: 'Мәселелер',
    recommendations: 'Ұсыныстар', forecast: 'Болжам',
    downloadPDF: 'PDF жүктеу', downloading: 'PDF жасалуда...',
    results: 'Талдау нәтижелері', newAnalysis: 'Жаңа талдау',
    privacy: {
      notice: '🔒 Деректеріңіз қорғалған',
      details: 'Файл тек сервер жадында өңделеді және дискіге сақталмайды. Жеке деректер (телефондар, email, ЖСН) талдаудан бұрын автоматты түрде жойылады.',
      warning: '⚠️ Клиенттердің жеке деректерін жүктемеңіз — тек жинақталған сандарды ғана.',
      agree: 'Мен деректерді өңдеу шарттарымен келісемін',
      policy: 'Anthropic саясаты',
    },
    metrics: { revenue: 'Жалпы табыс', growth: 'Өсім', prob: 'Өсу мүмкіндігі' },
    charts: { revenue: 'Табыс динамикасы', forecast: '3 аптаға болжам' },
  },
};

function AnalysisPDF({ formData, results, lang }) {
  const tr = t[lang] || t.ru;
  const metrics = results?.charts?.metrics;
  const metricCards = [
    { label: tr.metrics.revenue, value: `${metrics?.totalRevenue || '—'}`, color: '#00ff87', bg: '#052e16', border: '#065f46' },
    { label: tr.metrics.growth, value: `${metrics?.growth || '—'}%`, color: '#3b82f6', bg: '#0c1a3d', border: '#1e3a8a' },
    { label: 'ROI', value: `${metrics?.roi || '—'}%`, color: '#a855f7', bg: '#1a0533', border: '#581c87' },
    { label: tr.metrics.prob, value: `${Math.round(results?.charts?.growthProbability || 0)}%`, color: '#f97316', bg: '#1c0a00', border: '#7c2d12' },
  ];
  const sections = [
    { key: 'summary', label: tr.summary, color: '#00ff87', border: '#00ff87' },
    { key: 'analytics', label: tr.analytics, color: '#3b82f6', border: '#3b82f6' },
    { key: 'problems', label: tr.problems, color: '#ef4444', border: '#ef4444' },
    { key: 'recommendations', label: tr.recommendations, color: '#22c55e', border: '#22c55e' },
    { key: 'forecast', label: tr.forecast, color: '#eab308', border: '#eab308' },
  ];
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{tr.title}</Text>
          <Text style={pdfStyles.date}>{new Date().toLocaleDateString()}</Text>
        </View>
        <View style={pdfStyles.divider} />
        <View style={{ marginBottom: 10 }}>
          <Text style={pdfStyles.label}>{tr.q1}</Text><Text style={pdfStyles.value}>{formData.business}</Text>
          <Text style={pdfStyles.label}>{tr.q2}</Text><Text style={pdfStyles.value}>{formData.audience}</Text>
          <Text style={pdfStyles.label}>{tr.q3}</Text><Text style={pdfStyles.value}>{formData.problem}</Text>
          <Text style={pdfStyles.label}>{tr.q4}</Text><Text style={pdfStyles.value}>{formData.goal}</Text>
        </View>
        <View style={pdfStyles.divider} />
        <View style={pdfStyles.metricsGrid}>
          {metricCards.map(card => (
            <View key={card.label} style={[pdfStyles.metricCard, { backgroundColor: card.bg, borderColor: card.border }]}>
              <Text style={[pdfStyles.metricLabel, { color: card.color }]}>{card.label}</Text>
              <Text style={pdfStyles.metricValue}>{card.value}</Text>
            </View>
          ))}
        </View>
        <View style={pdfStyles.divider} />
        {sections.map(section => (
          <View key={section.key} style={[pdfStyles.sectionBlock, { borderLeftColor: section.border }]}>
            <Text style={[pdfStyles.sectionTitle, { color: section.color }]}>{section.label}</Text>
            <Text style={pdfStyles.sectionText}>{results?.[section.key] || '—'}</Text>
          </View>
        ))}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>MSB Help — {tr.title} | {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(getLanguage());
  const [langDropdown, setLangDropdown] = useState(false);
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

  const tr = t[lang] || t.ru;
  const pt = tr.privacy;

  useEffect(() => {
    const unsubscribe = subscribe(newLang => setLang(newLang));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const close = () => setLangDropdown(false);
    if (langDropdown) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [langDropdown]);

  const handleAnalyze = async () => {
    if (!formData.business || !formData.audience || !formData.problem || !formData.goal || !file) return;
    if (!agreed) { alert(pt.agree); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('business', formData.business);
      fd.append('audience', formData.audience);
      fd.append('problem', formData.problem);
      fd.append('goal', formData.goal);
      fd.append('file', file);
      const { data } = await axios.post('http://localhost:5000/api/analysis', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setResults(data);
      setStep(2);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!results) return;
    setDownloading(true);
    try {
      const chartImages = {
        revenue: revenueChartRef?.current?.canvas?.toDataURL('image/png') || null,
        forecast: forecastChartRef?.current?.canvas?.toDataURL('image/png') || null,
      };
      const blob = await pdf(<AnalysisPDF formData={formData} results={results} lang={lang} chartImages={chartImages} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `msb-analysis-${Date.now()}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF error: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const fields = [
    { name: 'business', label: tr.q1, placeholder: tr.q1Placeholder, icon: <Building2 size={16} /> },
    { name: 'audience', label: tr.q2, placeholder: tr.q2Placeholder, icon: <Users size={16} /> },
    { name: 'problem', label: tr.q3, placeholder: tr.q3Placeholder, icon: <AlertCircle size={16} /> },
    { name: 'goal', label: tr.q4, placeholder: tr.q4Placeholder, icon: <Target size={16} /> },
  ];

  const metricCards = [
    { label: tr.metrics.revenue, value: `${results?.charts?.metrics?.totalRevenue || '—'}`, color: '#00ff87', bg: 'rgba(0,255,135,0.06)', border: 'rgba(0,255,135,0.2)' },
    { label: tr.metrics.growth, value: `${results?.charts?.metrics?.growth || '—'}%`, color: '#0ea5e9', bg: 'rgba(14,165,233,0.06)', border: 'rgba(14,165,233,0.2)' },
    { label: 'ROI', value: `${results?.charts?.metrics?.roi || '—'}%`, color: '#a855f7', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.2)' },
    { label: tr.metrics.prob, value: `${Math.round(results?.charts?.growthProbability || 0)}%`, color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)' },
  ];

  const resultSections = [
    { key: 'summary', label: tr.summary, icon: <BarChart3 size={16} />, color: '#00ff87' },
    { key: 'analytics', label: tr.analytics, icon: <TrendingUp size={16} />, color: '#0ea5e9' },
    { key: 'problems', label: tr.problems, icon: <AlertTriangle size={16} />, color: '#ef4444' },
    { key: 'recommendations', label: tr.recommendations, icon: <CheckCircle size={16} />, color: '#22c55e' },
    { key: 'forecast', label: tr.forecast, icon: <Calendar size={16} />, color: '#eab308' },
  ];

  const langNames = { ru: 'RU', en: 'EN', kk: 'KK' };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#020817', color: '#f1f5f9' }}>

      <style>{`
        @keyframes meshMove { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(25px,-15px) scale(1.04)} 66%{transform:translate(-15px,25px) scale(0.97)} }
        @keyframes twinkle { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.8)} }
        @keyframes gridPulse { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        .mesh1{animation:meshMove 14s ease-in-out infinite}
        .mesh2{animation:meshMove 18s ease-in-out infinite reverse}
        .grid-pulse{animation:gridPulse 6s ease-in-out infinite}
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="mesh1 absolute" style={{ top: '-15%', left: '-8%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,255,135,0.07) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <div className="mesh2 absolute" style={{ bottom: '-15%', right: '-8%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <div className="grid-pulse absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {[...Array(35)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: i % 2 === 0 ? '#00ff87' : '#0ea5e9', opacity: Math.random() * 0.5 + 0.1, animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />
        ))}
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,255,135,0.08)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/chat')} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
            style={{ color: 'rgba(0,255,135,0.7)', border: '1px solid rgba(0,255,135,0.12)' }}>
            <ArrowLeft size={15} />
            <span className="text-sm hidden sm:inline">{tr.back}</span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/chat')}>
            <svg width="22" height="26" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff87"/><stop offset="100%" stopColor="#0ea5e9"/></linearGradient></defs>
              <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#ng)" strokeWidth="3"/>
              <polygon points="60,24 88,60 60,96 32,60" fill="url(#ng)" fillOpacity="0.12"/>
              <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#ng)" strokeWidth="1.5"/>
              <circle cx="60" cy="4" r="4" fill="#00ff87"/><circle cx="105" cy="60" r="4" fill="#00ff87"/>
              <circle cx="60" cy="116" r="4" fill="#0ea5e9"/><circle cx="15" cy="60" r="4" fill="#0ea5e9"/>
            </svg>
            <span className="font-bold text-sm hidden sm:inline" style={{ background: 'linear-gradient(135deg,#00ff87,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MSB Help</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,255,135,0.05)', border: '1px solid rgba(0,255,135,0.1)' }}>
            <BarChart3 size={15} style={{ color: '#00ff87' }} />
            <span className="text-sm font-semibold hidden sm:inline" style={{ color: '#00ff87' }}>{tr.title}</span>
          </div>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-white/5"
              style={{ color: 'rgba(0,255,135,0.8)', border: '1px solid rgba(0,255,135,0.15)' }}>
              <Globe size={13} />
              {langNames[lang]}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </button>
            {langDropdown && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl overflow-hidden z-50"
                style={{ background: '#020f1a', border: '1px solid rgba(0,255,135,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                {[['ru', 'Русский'], ['en', 'English'], ['kk', 'Қазақша']].map(([l, name]) => (
                  <button key={l} onClick={() => { setLang(l); setLangDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/5 flex justify-between items-center"
                    style={{ color: lang === l ? '#00ff87' : 'rgba(148,163,184,0.6)', borderBottom: '1px solid rgba(0,255,135,0.06)', fontWeight: lang === l ? '600' : '400' }}>
                    <span>{name}</span>
                    {lang === l && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff87' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto px-8 py-12">

        {step === 1 ? (
          <div className="w-full">

            {/* Page title */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-5"
                style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)', color: '#00ff87' }}>
                <BarChart3 size={15} />
                {tr.title}
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                {lang === 'kk' ? 'Бизнес деректерін жүктеңіз' : lang === 'en' ? 'Upload your business data' : 'Загрузите данные бизнеса'}
              </h1>
              <p className="text-base" style={{ color: 'rgba(148,163,184,0.6)' }}>
                {lang === 'kk' ? 'AI деректеріңізді талдайды және кеңестер береді' : lang === 'en' ? 'AI will analyze your data and provide recommendations' : 'AI проанализирует данные и даст рекомендации'}
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={17} style={{ color: '#00ff87' }} />
                <span className="text-base font-semibold" style={{ color: '#00ff87' }}>{pt.notice}</span>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(148,163,184,0.6)' }}>{pt.details}</p>
              <p className="text-sm font-medium mb-3" style={{ color: 'rgba(251,191,36,0.8)' }}>{pt.warning}</p>
              <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm transition-all hover:opacity-80"
                style={{ color: '#00ff87' }}>
                <ExternalLink size={13} /> {pt.policy}
              </a>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {fields.map((field, i) => (
                <div key={field.name} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <label className="flex items-center gap-2 text-base font-semibold mb-3" style={{ color: 'rgba(226,232,240,0.8)' }}>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)', color: '#00ff87' }}>{i + 1}</span>
                    <span style={{ color: '#00ff87' }}>{field.icon}</span>
                    {field.label}
                  </label>
                  <textarea name={field.name} value={formData[field.name]}
                    onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    placeholder={field.placeholder} rows="3"
                    className="w-full px-4 py-3 rounded-xl text-base resize-none outline-none transition-all"
                    style={{ background: 'rgba(0,255,135,0.03)', border: '1px solid rgba(0,255,135,0.1)', color: '#e2e8f0', caretColor: '#00ff87' }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(0,255,135,0.35)'; e.target.style.boxShadow = '0 0 15px rgba(0,255,135,0.06)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(0,255,135,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}

              {/* File upload */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label className="flex items-center gap-2 text-base font-semibold mb-4" style={{ color: 'rgba(226,232,240,0.8)' }}>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'rgba(0,255,135,0.15)', border: '1px solid rgba(0,255,135,0.3)', color: '#00ff87' }}>5</span>
                  <Upload size={16} style={{ color: '#00ff87' }} />
                  {tr.q5}
                </label>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 rounded-xl transition-all flex items-center justify-center gap-3 text-base font-medium"
                  style={file ? { border: '2px dashed rgba(0,255,135,0.5)', background: 'rgba(0,255,135,0.06)', color: '#00ff87' } : { border: '2px dashed rgba(0,255,135,0.15)', background: 'rgba(0,255,135,0.02)', color: 'rgba(0,255,135,0.5)' }}>
                  {file ? <><CheckCircle size={18} /> {file.name}</> : <><Upload size={18} /> {tr.q5}</>}
                </button>
              </div>

              {/* Consent */}
              <div className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all"
                style={{ background: agreed ? 'rgba(0,255,135,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${agreed ? 'rgba(0,255,135,0.25)' : 'rgba(255,255,255,0.06)'}` }}
                onClick={() => setAgreed(!agreed)}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
                  style={{ background: agreed ? '#00ff87' : 'transparent', border: `2px solid ${agreed ? '#00ff87' : 'rgba(0,255,135,0.3)'}` }}>
                  {agreed && <CheckCircle size={13} color="#020817" />}
                </div>
                <span className="text-sm leading-relaxed select-none" style={{ color: 'rgba(148,163,184,0.7)' }}>{pt.agree}</span>
              </div>

              {/* Analyze button */}
              <button onClick={handleAnalyze} disabled={loading || !agreed}
                className="w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-lg tracking-wide hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg,#00ff87,#0ea5e9)', color: '#020817', boxShadow: agreed ? '0 0 40px rgba(0,255,135,0.2)' : 'none' }}>
                {loading
                  ? <><span className="w-5 h-5 border-2 border-[#020817]/30 border-t-[#020817] rounded-full animate-spin" /> {tr.analyzing}</>
                  : <><BarChart3 size={20} /> {tr.analyze}</>}
              </button>
            </div>
          </div>

        ) : (
          <div>
            {/* Results header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{tr.results}</h1>
                <p className="text-base" style={{ color: 'rgba(148,163,184,0.5)' }}>{formData.business}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setResults(null); setFormData({ business: '', audience: '', problem: '', goal: '' }); setFile(null); setAgreed(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
                  style={{ color: 'rgba(0,255,135,0.7)', border: '1px solid rgba(0,255,135,0.15)' }}>
                  <ArrowLeft size={15} /> {tr.newAnalysis}
                </button>
                <button onClick={handleDownloadPDF} disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#00ff87,#0ea5e9)', color: '#020817', boxShadow: '0 0 20px rgba(0,255,135,0.2)' }}>
                  {downloading
                    ? <><span className="w-4 h-4 border-2 border-[#020817]/30 border-t-[#020817] rounded-full animate-spin" /> {tr.downloading}</>
                    : <><Download size={15} /> {tr.downloadPDF}</>}
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {metricCards.map(card => (
                <div key={card.label} className="p-5 rounded-2xl"
                  style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                  <div className="text-sm font-medium mb-2" style={{ color: card.color }}>{card.label}</div>
                  <div className="text-3xl font-bold text-white">{card.value}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {results?.charts?.revenueChart && (
                <div className="p-6 rounded-2xl" style={{ background: 'rgba(0,255,135,0.03)', border: '1px solid rgba(0,255,135,0.1)' }}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#00ff87' }}>
                    <TrendingUp size={16} /> {tr.charts.revenue}
                  </h3>
                  <Line ref={revenueChartRef} data={results.charts.revenueChart} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } } } }} />
                </div>
              )}
              {results?.charts?.forecastChart && (
                <div className="p-6 rounded-2xl" style={{ background: 'rgba(14,165,233,0.03)', border: '1px solid rgba(14,165,233,0.1)' }}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0ea5e9' }}>
                    <Calendar size={16} /> {tr.charts.forecast}
                  </h3>
                  <Line ref={forecastChartRef} data={results.charts.forecastChart} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } } } }} />
                </div>
              )}
            </div>

            {/* Result sections */}
            <div className="space-y-5">
              {resultSections.map(section => (
                <div key={section.key} className="p-6 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `4px solid ${section.color}`, border: `1px solid rgba(255,255,255,0.06)` }}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: section.color }}>
                    {section.icon} {section.label}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: 'rgba(226,232,240,0.7)' }}>{results?.[section.key]}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}